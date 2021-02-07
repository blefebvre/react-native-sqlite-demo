/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useContext, useState } from "react";
import { Database, sqliteDatabase } from "../database/Database";
import { inMemoryDatabase } from "../database/InMemoryDatabase"; // optional: see comments below
import { List } from "../types/List";

// Initialize our Database context.
// Any implementation that matches the Database interface will do. We will go with our
// sqliteDatabase for this app.
const DatabaseContext = React.createContext<Database | undefined>(undefined);

// Store the List state in context as well
const ListsContext = React.createContext<List[] | undefined>(undefined);
type SetLists = (lists: List[]) => void;
const SetListsContext = React.createContext<SetLists | undefined>(undefined);

// The provider which enables accessing our list context from it's component tree.
export const ListContextProvider: React.FunctionComponent = function({ children }) {
  const [lists, setLists] = useState<List[]>([]); // Init with empty list of Lists

  return (
    <DatabaseContext.Provider value={sqliteDatabase}>
      <ListsContext.Provider value={lists}>
        <SetListsContext.Provider value={setLists}>{children}</SetListsContext.Provider>
      </ListsContext.Provider>
    </DatabaseContext.Provider>
  );

  // Alternatively, try the InMemoryDatabase instead by replacing `sqliteDatabase` above
  // with `inMemoryDatabase`.
};

// Hook to pull our database object from the context and return it.
// Inspired by the Kent C. Dodds approach to using context: https://kentcdodds.com/blog/how-to-use-react-context-effectively
export function useDatabase(): Database {
  const database = useContext(DatabaseContext);
  if (database === undefined) {
    throw new Error("useDatabase must be used within a ListContextProvider");
  }
  return database;
}

export function useListsContext(): List[] {
  const listsContext = useContext(ListsContext);
  if (listsContext === undefined) {
    throw new Error("useListsContext must be used within a ListContextProvider");
  }
  return listsContext;
}

export function useSetListsContext(): SetLists {
  const listsUpdateContext = useContext(SetListsContext);
  if (listsUpdateContext === undefined) {
    throw new Error("useSetListsContext must be used within a ListContextProvider");
  }
  return listsUpdateContext;
}
