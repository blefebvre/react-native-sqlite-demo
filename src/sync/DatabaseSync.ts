/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */

export interface DatabaseSync {
  upload(): Promise<void>;
  download(): Promise<void>;
  hasSynced(): Promise<boolean>;
  hasRemoteUpdate(): Promise<boolean>;
  hasLastUploadCompleted(): Promise<boolean>;
}
