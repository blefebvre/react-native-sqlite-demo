/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { AsyncStorage, Linking, NetInfo } from "react-native";
import shittyQs from "shitty-qs";
import RNFS from "react-native-fs";
import RNFetchBlob from "rn-fetch-blob";
import moment, { Moment } from "moment";

import { DROPBOX } from "./DropboxConstants";
import { OAUTH_CONFIG } from "./OAuthConfig";

export interface DatabaseSync {
  // Authorization related
  authorize(): Promise<void>;
  revokeAuthorization(): Promise<void>;
  // Sync related
  queueDatabaseUpload(): Promise<void>;
  downloadDatabase(): Promise<void>;
  // Inspect the state of synchronization
  hasUserAuthorized(): Promise<boolean>;
  hasDatabaseBeenSynced(): Promise<boolean>;
  isRemoteDatabaseNewer(): Promise<boolean>;
  wasLastUploadCompleted(): Promise<boolean>;
}

export enum DatabaseSyncState {
  DOES_NOT_EXIST,
  UP_TO_DATE,
  OUT_OF_DATE,
  CONTAINS_NEW_DATA // Date on the backup is newer than the last updated date on local DB; it has been updated on another device
}

// Class to support Dropbox backup and sync
class DropboxDatabaseSync implements DatabaseSync {
  // True when a backup is already in progress
  private backupIsCurrentlyInProgress = false;

  constructor() {
    this._handleOpenURL = this._handleOpenURL.bind(this);
  }

  // Authorize with Dropbox. Uses the device's browser to work through the Dropbox
  // OAuth 2 process, eventually recording a token and account ID if successful.
  public authorize(): Promise<void> {
    console.log("Authorization starting...");
    // Generate a random string for Dropbox's state param.
    // This helps us be sure a deep link into the app is indeed related to the request
    // we made to Dropbox.
    const stateValue = Math.random().toString();

    // Open the Dropbox authorization page in the device browser
    return Linking.openURL(
      [
        DROPBOX.AUTHORIZE_URL,
        "?response_type=token",
        `&client_id=${OAUTH_CONFIG.OAUTH_CLIENT_ID}`,
        `&redirect_uri=${OAUTH_CONFIG.OAUTH_REDIRECT_URI}`,
        `&state=${stateValue}`
      ].join("")
    )
      .catch(err =>
        console.error(
          "An error occurred trying to open the browser to authorize with Dropbox:",
          err
        )
      )
      .then(() => {
        return new Promise<void>((resolve, reject) => {
          // Callback for when the app is invoked via it's custom URL protocol
          const handleOpenURL = (event: { url: string }) => {
            this._handleOpenURL(event, stateValue)
              .then(() => {
                resolve();
              })
              .catch(reason => {
                reject(reason);
              })
              .then(() => {
                // "Finally" block
                // Remove deep link event listener
                Linking.removeEventListener("url", handleOpenURL);
                return;
              });
          };

          // Add deep link event listener to catch when Dropbox sends the user back to the app.
          Linking.addEventListener("url", handleOpenURL);
        });
      });
  }

  // Creates a copy of the database file and queues it for backup.
  // Promise is resolved once COPY is complete.
  // Backup to dropbox will occur in the background later on.
  public queueDatabaseUpload(): Promise<void> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY)
      .then(accessToken => {
        if (accessToken === null) {
          throw new Error("Cannot perform backup without an access token");
        }

        // If a backup is already in progress, this will currently be a no-op
        if (this.backupIsCurrentlyInProgress === true) {
          throw new Error("[Dropbox backup] backup already in progress!");
        }

        console.log("[Dropbox backup] begin!");
        this.backupIsCurrentlyInProgress = true;

        // Record that a backup has started
        return AsyncStorage.setItem(
          DROPBOX.LAST_UPDATE_STATUS_KEY,
          DROPBOX.UPDATE_STATUS_STARTED
        );
      })
      .then(() => {
        // Create a copy of the DB first to the backup file
        return this.copyDBToBackupFile();
      })
      .then(() => {
        console.log("[Dropbox backup] DB copy complete!");
        // The copy is complete, so we'll end the Promise chain here.
        // Kick off the remote backup to Dropbox.
        this.performBackup().then(() => {
          // "Finally"
          console.log(
            '[Dropbox backup] "Finally" block. setting backupIsCurrentlyInProgress = false.'
          );
          this.backupIsCurrentlyInProgress = false;
          console.log("[Dropbox backup] BACKUP COMPLETE.");
        });

        // We don't wait for the remote backup to complete: just return
        return;
      })
      .catch(reason => {
        // Could not backup!
        console.log("[Dropbox backup] Failed prepping for backup!", reason);
        this.backupIsCurrentlyInProgress = false;
      });
  }

  // Check if the backup file on Dropbox is newer than our local database file.
  public isRemoteDatabaseNewer(): Promise<boolean> {
    // Is this device online?
    return NetInfo.isConnected.fetch().then(isConnected => {
      if (isConnected === false) {
        // Not connected to the internet; won't be able to check for an update
        console.log(
          "[Dropbox backup] no internet connection; can't check for update"
        );
        return false;
      }

      // Otherwise, we are connected
      return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY).then(
        accessToken => {
          if (accessToken === null) {
            // Not wired up to Dropbox, so there cannot be a remote DB update
            console.log(
              "[Dropbox backup] no Dropbox access token; can't check for update"
            );
            return false;
          }

          let lastLocalBackupTimestamp: Moment;
          let lastDropboxBackupTimestamp: Moment;
          return this.getDatabaseFileMetadataFromDropbox(
            this.getDropboxFolder() + this.getDatabaseBackupName(),
            accessToken
          ).then(dropboxMetadataResponse => {
            if (dropboxMetadataResponse.status === 200) {
              // We have a valid response.
              // Get the client modified date from the response to compare with our local value
              return dropboxMetadataResponse
                .json()
                .then(responseJson => {
                  const clientModifiedString =
                    responseJson[DROPBOX.CLIENT_MODIFIED_TIMESTAMP_KEY];
                  console.log(
                    "[Dropbox backup] Client modified timestamp FROM DROPBOX: " +
                      clientModifiedString
                  );
                  lastDropboxBackupTimestamp = moment(clientModifiedString);

                  return AsyncStorage.getItem(
                    DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY
                  );
                })
                .then(lastLocalBackupTimestampString => {
                  console.log(
                    "[Dropbox backup] Last recorded LOCAL backup timestamp: " +
                      lastLocalBackupTimestampString
                  );

                  if (lastLocalBackupTimestampString === null) {
                    // This app hasn't been backed up yet.
                    // Since we received a 200 response above, this is likely a 2nd device that a user is syncing via Dropbox.
                    // Therefor, we'll return true indicating that an update exists.
                    console.log(
                      "[Dropbox backup] lastLocalBackupTimestamp is null, and a DB update exists on Dropbox!"
                    );
                    return true;
                  }

                  lastLocalBackupTimestamp = moment(
                    lastLocalBackupTimestampString
                  );
                  // If the local backup timestamp is BEFORE the Dropbox timestamp, we should overwrite our local DB
                  if (
                    lastLocalBackupTimestamp.isBefore(
                      lastDropboxBackupTimestamp
                    )
                  ) {
                    // Dropbox DB has been updated more recently - it is newer
                    console.log(
                      "[Dropbox backup] DB update exists on Dropbox!"
                    );
                    return true;
                  } else {
                    // Otherwise, we are up to date with Dropbox
                    console.log(
                      "[Dropbox backup] Local and Dropbox DBs are up to date!"
                    );
                    return false;
                  }
                });
            } else if (dropboxMetadataResponse.status === 409) {
              // We have a valid response, but this means "path not found", so the file does not exist on Dropbox yet
              console.log(
                "[Dropbox backup] no Dropbox DB file yet; so no update."
              );
              return false;
            } else {
              throw new Error(
                "[Dropbox backup] unknown response from Dropbox. HTTP status: " +
                  dropboxMetadataResponse.status
              );
            }
          });
        }
      );
    });
  }

  // This function indicates if the last backup to Dropbox had completed successfully.
  public wasLastUploadCompleted(): Promise<boolean> {
    return AsyncStorage.getItem(DROPBOX.LAST_UPDATE_STATUS_KEY).then(
      lastUpdateStatus => {
        if (lastUpdateStatus === null) {
          console.log(
            "[Dropbox backup] No previous update; wasLastUploadCompleted = true"
          );
          return true;
        } else if (lastUpdateStatus === DROPBOX.UPDATE_STATUS_FINISHED) {
          console.log(
            "[Dropbox backup] Previous update finished; wasLastUploadCompleted = true"
          );
          return true;
        } else {
          console.log(
            `[Dropbox backup] Previous update status !== finished (it was: ${lastUpdateStatus}); wasLastUploadCompleted = false`
          );
          return false;
        }
      }
    );
  }

  // WARNING! Overwrites the existing DB with what is contained in Dropbox.
  // This function assumes the user has already agreed to overwrite the existing local DB.
  public downloadDatabase(): Promise<void> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY)
      .then(accessToken => {
        if (accessToken === null) {
          // Not wired up to Dropbox, so there cannot be a remote DB update
          throw new Error(
            "[Dropbox backup] no Dropbox access token; can't download update"
          );
        }

        console.log(
          "[Dropbox backup] DOWNLOADING and applying DB from Dropbox: beginning."
        );

        // Download the backup file, replacing the existing database
        return RNFetchBlob.config({
          // DB data will be saved to this path
          path: this.getLocalDBFilePath()
        }).fetch("POST", DROPBOX.DOWNLOAD_URL, {
          Authorization: `Bearer ${accessToken}`,
          "Dropbox-API-Arg": JSON.stringify({
            path: this.getDropboxFolder() + this.getDatabaseBackupName()
          })
        });
      })
      .then(response => {
        console.log("[Dropbox backup] DOWNLOAD from Dropbox complete!");
        // Pull client_modified from the Dropbox-API-Result header and store it
        if (
          response.respInfo &&
          response.respInfo.headers &&
          response.respInfo.headers[DROPBOX.API_RESULT_HEADER_NAME]
        ) {
          const apiResult = JSON.parse(
            response.respInfo.headers[DROPBOX.API_RESULT_HEADER_NAME]
          );
          const clientModifiedString =
            apiResult[DROPBOX.CLIENT_MODIFIED_TIMESTAMP_KEY];
          console.log(
            "[Dropbox backup] client_modified timestamp: " +
              clientModifiedString
          );

          // Store client modified value
          return AsyncStorage.setItem(
            DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY,
            clientModifiedString
          ).then(() => {
            // Indicate that the last update has finished
            return AsyncStorage.setItem(
              DROPBOX.LAST_UPDATE_STATUS_KEY,
              DROPBOX.UPDATE_STATUS_FINISHED
            );
          });
        } else {
          console.error(
            "[Dropbox backup] client_modified timestamp missing. Response:",
            response
          );
          return;
        }
      });
  }

  public hasUserAuthorized(): Promise<boolean> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY).then(
      accessToken => {
        if (accessToken !== null) {
          // We have an access token!
          return true;
        } // otherwise
        return false;
      }
    );
  }

  public revokeAuthorization(): Promise<void> {
    return AsyncStorage.removeItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY)
      .then(() => {
        return AsyncStorage.removeItem(DROPBOX.LAST_UPDATE_STATUS_KEY);
      })
      .then(() => {
        return AsyncStorage.removeItem(
          DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY
        );
      });
  }

  public hasDatabaseBeenSynced(): Promise<boolean> {
    return AsyncStorage.getItem(DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY).then(
      result => {
        if (result === null) {
          return false;
        } // Otherwise
        return true;
      }
    );
  }

  // Private helpers

  private performBackup(): Promise<void> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY)
      .then(accessToken => {
        if (accessToken === null) {
          throw new Error(
            "[Dropbox backup] cannot perform backup without an access token"
          );
        }
        // Otherwise, we have an access token!
        console.log("[Dropbox backup] We have a dropbox access token!");

        // Upload DATABASE BACKUP file to Dropbox
        return this.uploadDBToDropbox(
          this.getLocalDBBackupFilePath(),
          this.getDropboxFolder() + this.getDatabaseBackupName(),
          accessToken
        );
      })
      .then(() => {
        console.log("[Dropbox backup] DROPBOX UPLOAD COMPLETE!");
        console.log(
          "[Dropbox backup] Setting LAST_UPDATE_STATUS_KEY to UPDATE_STATUS_FINISHED"
        );
        // Record that a backup has finished
        return AsyncStorage.setItem(
          DROPBOX.LAST_UPDATE_STATUS_KEY,
          DROPBOX.UPDATE_STATUS_FINISHED
        );
      })
      .catch(error => {
        console.error("[Dropbox backup] DROPBOX UPLOAD ERROR!", error);
      });
  }

  private copyDBToBackupFile(): Promise<void> {
    const databaseBackupFilePath = this.getLocalDBBackupFilePath();
    // Is there currently a backup file already?
    return RNFS.stat(databaseBackupFilePath)
      .then(statResult => {
        console.log("RNFS statResult:", statResult);
        // There is a file here already! Delete it.
        return RNFS.unlink(databaseBackupFilePath);
      })
      .catch(reason => {
        if (
          reason &&
          reason.toString().includes(DROPBOX.NO_SUCH_FILE_ERROR_SUBSTRING)
        ) {
          // The file doesn't exist yet! This is good.
          return;
        }
        // Otherwise: it's a different error
        console.error("[Dropbox backup] Stat reject reason", reason);
        throw new Error(reason);
      })
      .then(() => {
        // Copy the database to the backup location
        console.log(
          "[Dropbox backup] DB backup file is now gone; continue with backup."
        );
        return RNFS.copyFile(this.getLocalDBFilePath(), databaseBackupFilePath);
      })
      .then(() => {
        console.log("[Dropbox backup] Backup file created successfully!");
        return;
      });
  }

  private getDatabaseFileMetadataFromDropbox(
    dropboxFilePath: string,
    dropboxAccessToken: string
  ): Promise<Response> {
    return fetch(DROPBOX.GET_METADATA_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dropboxAccessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        path: dropboxFilePath
      })
    }).then(response => {
      console.log("[Dropbox backup] response!", response);
      // "Success" || "path not found"
      if (response.status === 200 || response.status === 409) {
        return response;
      }
      // otherwise
      throw new Error(
        `[Dropbox backup] failed to get metadata from dropbox for file ${dropboxFilePath}. status: ${
          response.status
        } and response: ${JSON.stringify(response)}`
      );
    });
  }

  private uploadDBToDropbox(
    localFilePath: string,
    dropboxFilePath: string,
    dropboxAccessToken: string
  ): Promise<void> {
    console.log(
      `[Dropbox backup] UPLOADING local file [${localFilePath}] to remote file [${dropboxFilePath}]!`
    );
    return RNFetchBlob.fetch(
      "POST",
      DROPBOX.UPLOAD_URL,
      {
        Authorization: `Bearer ${dropboxAccessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path: dropboxFilePath,
          mode: "overwrite"
        })
      },
      RNFetchBlob.wrap(localFilePath)
    ).then(fetchBlobResponse => {
      console.log("[Dropbox backup] UPLOAD response!", fetchBlobResponse);
      // Ensure we have `data` and a 200 response
      if (
        fetchBlobResponse.data &&
        fetchBlobResponse.respInfo &&
        fetchBlobResponse.respInfo.status === 200
      ) {
        console.log("[Dropbox backup] UPLOAD SUCCESS!");
        // Record `client_modified` timestamp
        const responseData = JSON.parse(fetchBlobResponse.data);
        const clientModifiedTimestamp =
          responseData[DROPBOX.CLIENT_MODIFIED_TIMESTAMP_KEY];
        console.log(
          "[Dropbox backup] logging most recent backup timestamp as: " +
            clientModifiedTimestamp
        );

        return AsyncStorage.setItem(
          DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY,
          clientModifiedTimestamp
        );
      } else {
        throw new Error(
          "[Dropbox backup] Upload failure! HTTP status: " +
            fetchBlobResponse.respInfo.status
        );
      }
    });
  }

  private _handleOpenURL(
    event: { url: string },
    stateValue: string
  ): Promise<void> {
    console.log("Deep link event!", event);

    const queryStringResult = event.url.match(/\#(.*)/);
    if (queryStringResult === null || queryStringResult.length < 2) {
      return Promise.reject(
        "Did not receive a query string as part of this deep link!"
      );
    }

    const [, queryString] = queryStringResult;
    const parsedQueryString = shittyQs(queryString);
    if (parsedQueryString.error) {
      // There was an error!
      const errorCode = parsedQueryString.error;
      const errorDescription = parsedQueryString.error_description;

      console.error("Dropbox OAuth error! code:", errorCode);
      console.error("Error description:", errorDescription);

      return Promise.reject(
        `Could not authorize with Dropbox. Code: ${errorCode}`
      );
    }

    if (stateValue !== parsedQueryString.state) {
      // This value must match! This is a security feature of Dropbox's OAuth impl
      return Promise.reject("State parameter DID NOT MATCH!");
    }

    // Otherwise: not an error!
    const accessToken = parsedQueryString.access_token;
    const accountId = parsedQueryString.account_id;

    // Persist accessToken and accountId
    return AsyncStorage.setItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY, accessToken)
      .then(() => {
        return AsyncStorage.setItem(DROPBOX.ACCOUNT_ID_STORAGE_KEY, accountId);
      })
      .then(() => {
        console.log(
          "Dropbox OAuth authorization success! Account ID:",
          accountId
        );
        return;
      });
  }

  private getDatabaseName(): string {
    return "AppDatabase.db";
  }

  private getDatabaseBackupName(): string {
    return "AppDatabase_Backup.db";
  }

  private getDropboxFolder(): string {
    return "/";
  }

  private getLocalDBFilePath(): string {
    return (
      RNFS.LibraryDirectoryPath + "/LocalDatabase/" + this.getDatabaseName()
    );
  }

  private getLocalDBBackupFilePath(): string {
    return (
      RNFS.LibraryDirectoryPath +
      "/LocalDatabase/" +
      this.getDatabaseBackupName()
    );
  }
}

// Export a single instance of DropboxDatabaseSync
export let dropboxSync: DatabaseSync = new DropboxDatabaseSync();
