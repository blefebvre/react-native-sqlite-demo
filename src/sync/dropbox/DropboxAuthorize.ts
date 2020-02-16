/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import {Linking} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import shittyQs from "shitty-qs";

import {DROPBOX} from "./DropboxConstants";
import {OAUTH_CONFIG} from "./OAuthConfig";
import {Authorize} from "../Authorize";

// Class to support authorizing for database synchronization via Dropbox
export class DropboxAuthorize implements Authorize {
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
        `&state=${stateValue}`,
      ].join(""),
    )
      .catch(err => console.error("An error occurred trying to open the browser to authorize with Dropbox:", err))
      .then(() => {
        return new Promise<void>((resolve, reject) => {
          // Callback for when the app is invoked via it's custom URL protocol
          const handleOpenURL = (event: {url: string}) => {
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

  public hasUserAuthorized(): Promise<boolean> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY).then(accessToken => {
      if (accessToken !== null) {
        // We have an access token!
        return true;
      } // otherwise
      return false;
    });
  }

  public revokeAuthorization(): Promise<void> {
    return AsyncStorage.getItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY)
      .then(accessToken => {
        if (accessToken === null) {
          throw new Error("Cannot unlink without an access token");
        }

        return fetch(DROPBOX.REVOKE_TOKEN_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      })
      .then(response => {
        console.log("Unlink response:", response);
        // "Success"
        if (response.status === 200) {
          return;
        }
        // otherwise
        throw new Error(
          `Failed to revoke Dropbox token. status: ${response.status} and response: ${JSON.stringify(response)}`,
        );
      })
      .then(() => AsyncStorage.removeItem(DROPBOX.ACCESS_TOKEN_STORAGE_KEY))
      .then(() => AsyncStorage.removeItem(DROPBOX.LAST_UPDATE_STATUS_KEY))
      .then(() => AsyncStorage.removeItem(DROPBOX.MOST_RECENT_BACKUP_TIMESTAMP_KEY));
  }

  // Private helpers

  private _handleOpenURL(event: {url: string}, stateValue: string): Promise<void> {
    console.log("Deep link event!", event);

    const queryStringResult = event.url.match(/\#(.*)/);
    if (queryStringResult === null || queryStringResult.length < 2) {
      return Promise.reject("Did not receive a query string as part of this deep link!");
    }

    const [, queryString] = queryStringResult;
    const parsedQueryString = shittyQs(queryString);
    if (parsedQueryString.error) {
      // There was an error!
      const errorCode = parsedQueryString.error;
      const errorDescription = parsedQueryString.error_description;

      console.error("Dropbox OAuth error! code:", errorCode);
      console.error("Error description:", errorDescription);

      return Promise.reject(`Could not authorize with Dropbox. Code: ${errorCode}`);
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
        console.log("Dropbox OAuth authorization success! Account ID:", accountId);
        return;
      });
  }
}
