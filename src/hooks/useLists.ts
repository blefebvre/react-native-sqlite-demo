/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { useEffect } from "react";
import { List } from "../types/List";
import { useDatabase, useListsContext, useSetListsContext } from "../context/DatabaseContext";

// Hook for managing and accessing lists (CRUD)
export function useLists() {
  // Get the lists array and setter from context
  const lists: List[] = useListsContext();
  const setLists: (lists: List[]) => void = useSetListsContext();
  const database = useDatabase();

  useEffect(() => {
    refreshLists();
  }, []);

  function refreshLists() {
    // Query all lists from the DB, then store them as state
    return database.getAllLists().then(setLists);
  }

  function createList(newListTitle: string): Promise<void> {
    return database.createList(newListTitle).then(refreshLists);
  }

  function deleteList(listToDelete: List): Promise<void> {
    if (listToDelete !== undefined) {
      return database.deleteList(listToDelete).then(refreshLists);
    }
    // otherwise:
    return Promise.reject(Error("Could not delete an undefined list"));
  }

  return {
    lists,
    createList,
    deleteList,
    refreshLists,
  };
}
