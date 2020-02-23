/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { useState, useEffect } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { List } from "../types/List";
import { ListItem } from "../types/ListItem";

export function useListItems(selectedList: List) {
  const database = useDatabase();
  const [selectedListsItems, setSelectedListsItems] = useState<ListItem[]>([]);

  useEffect(() => {
    refreshListsItems(selectedList);
  }, [selectedList]); // Note! Run this effect whenever the selectedList changes.

  async function refreshListsItems(listToRefresh: List, doneItemsLast = false): Promise<void> {
    console.log(`Refreshing list items for list: ${listToRefresh && listToRefresh.title}`);

    if (listToRefresh !== undefined) {
      const selectedListsItems = await database.getListItems(listToRefresh, doneItemsLast);
      setSelectedListsItems(selectedListsItems);
    } else {
      // otherwise, listToRefresh is undefined
      return Promise.reject("Could not refresh an undefined list's items");
    }
  }

  async function updateListItem(listItem: ListItem): Promise<void> {
    await database.updateListItem(listItem);
    await refreshListsItems(selectedList);
  }

  async function addListItem(newItemText: string): Promise<void> {
    await database.addListItem(newItemText, selectedList);
    await refreshListsItems(selectedList);
  }

  return {
    selectedListsItems,
    addListItem,
    updateListItem,
  };
}
