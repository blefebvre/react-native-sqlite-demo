/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */

export interface DatabaseSync {
  queueDatabaseUpload(): Promise<void>;
  downloadDatabase(): Promise<void>;
  hasDatabaseBeenSynced(): Promise<boolean>;
  isRemoteDatabaseNewer(): Promise<boolean>;
  wasLastUploadCompleted(): Promise<boolean>;
}
