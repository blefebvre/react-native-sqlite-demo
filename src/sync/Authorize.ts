/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */

export interface Authorize {
  authorize(): Promise<void>;
  revokeAuthorization(): Promise<void>;
  hasUserAuthorized(): Promise<boolean>;
}
