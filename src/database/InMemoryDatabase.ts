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
let listIndex = 0;
// Map where each key represents a list ID, and the value is an array of list items.
let listItemsMap: { [key: number]: ListItem[] } = {};
let listItemIndex = 0;

async function createList(newListTitle: string) {
  const newList: List = { title: newListTitle, id: listIndex++ };
  listItemsMap = { ...listItemsMap, [newList.id]: [] };
  lists = [...lists, newList];
}

async function addListItem(text: string, list: List) {
  const listItemsForList = listItemsMap[list.id];
  const newListItem: ListItem = { text, done: false, id: listItemIndex++ };
  const updatedListItemsForList = [...listItemsForList, newListItem];
  listItemsMap = { ...listItemsMap, [list.id]: updatedListItemsForList };
}

async function getAllLists(): Promise<List[]> {
  return lists;
}

async function getListItems(list: List, doneItemsLast: boolean): Promise<ListItem[]> {
  return listItemsMap[list.id];
}

async function updateListItem(listItem: ListItem): Promise<void> {
  return;
}

async function deleteList(list: List): Promise<void> {
  return;
}

export const inMemoryDatabase: Database = {
  createList,
  addListItem,
  getAllLists,
  getListItems,
  updateListItem,
  deleteList,
};
