/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { Database } from "./Database";
import { List } from "../types/List";
import { ListItem } from "../types/ListItem";

// A (naive!) in-memory implementation of the Database interface.
let lists = [] as List[];
let listIdIndex = 0;

// A Map where each key represents a list ID, and the value is an array of list items.
type ListItemMap = { [key: number]: ListItem[] };
let listItemsMap: ListItemMap = {};
let listItemIdIndex = 0;

async function createList(newListTitle: string) {
  const newList: List = { title: newListTitle, id: listIdIndex++ };
  listItemsMap = { ...listItemsMap, [newList.id]: [] };
  lists = [...lists, newList];
}

async function addListItem(text: string, list: List) {
  const newListItem: ListItem = { text, done: false, id: listItemIdIndex++, listId: list.id };
  const listItemsForList = listItemsMap[list.id];
  const updatedListItemsForList = [...listItemsForList, newListItem];
  listItemsMap = { ...listItemsMap, [list.id]: updatedListItemsForList };
}

async function getAllLists(): Promise<List[]> {
  return lists;
}

async function getListItems(list: List, doneItemsLast: boolean): Promise<ListItem[]> {
  console.log("List:", list, "List items:", listItemsMap[list.id]);
  return listItemsMap[list.id];
}

async function updateListItem(listItem: ListItem): Promise<void> {
  if (listItem.listId !== undefined) {
    const listItemsForList = listItemsMap[listItem.listId];
    const updatedListItemsForList = listItemsForList.map((currentItem) => {
      if (currentItem.id === listItem.id) {
        return listItem;
      } else {
        return currentItem;
      }
    });
    // Update state
    listItemsMap = { ...listItemsMap, [listItem.listId]: updatedListItemsForList };
  }
}

async function deleteList(listToDelete: List): Promise<void> {
  lists = lists.filter((list) => list.id !== listToDelete.id);
}

export const inMemoryDatabase: Database = {
  createList,
  addListItem,
  getAllLists,
  getListItems,
  updateListItem,
  deleteList,
};
