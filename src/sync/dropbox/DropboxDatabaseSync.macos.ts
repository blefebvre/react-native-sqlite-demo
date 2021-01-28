/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */

import { DatabaseSync } from "../DatabaseSync";

// Class to mock out Dropbox backup and sync on macOS.
// This was done because the "react-native-fs" plugin does not support the macOS platform.
export class DropboxDatabaseSync implements DatabaseSync {
  // Has the app been configured to sync it's database?
  public hasSynced(): Promise<boolean> {
    // Always return false on macOS, which will prevent the sync process from proceeding
    return Promise.resolve(false);
  }

  public upload(): Promise<void> {
    // Resolve immediately on macOS
    return Promise.resolve();
  }

  public hasRemoteUpdate(): Promise<boolean> {
    throw new Error("Not implemented on macOS");
  }

  public hasLastUploadCompleted(): Promise<boolean> {
    throw new Error("Not implemented on macOS");
  }

  public download(): Promise<void> {
    throw new Error("Not implemented on macOS");
  }
}
