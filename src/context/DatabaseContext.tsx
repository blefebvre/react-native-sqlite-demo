/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useContext } from "react";
import { Database, sqliteDatabase } from "../database/Database";

// Initialize our Database context.
// Any implementation that matches the Database interface will do. We will go with our
// sqliteDatabase for this app.
const DatabaseContext = React.createContext<Database | undefined>(undefined);

// The provider which enables accessing our database context from it's component tree.
export const DatabaseProvider: React.FunctionComponent = function(props) {
  return <DatabaseContext.Provider value={sqliteDatabase} {...props} />;
};

// Hook to pull our database object from the context and return it.
// Inspired by the Kent C. Dodds approach to using context: https://kentcdodds.com/blog/how-to-use-react-context-effectively
export function useDatabase(): Database {
  const database = useContext(DatabaseContext);
  if (database === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return database;
}
