/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { Database, sqliteDatabase } from "../database/Database";

// Initialize our Database context.
// Any implementation that matches the Database interface will do. We will go with our
// sqliteDatabase for this app.
export const DatabaseContext = React.createContext<Database>(sqliteDatabase);

export const DatabaseProvider: React.FunctionComponent = function(props) {
  return <DatabaseContext.Provider value={sqliteDatabase} {...props} />;
};
