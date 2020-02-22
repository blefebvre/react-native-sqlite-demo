/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import { Database } from "./Database";
import { List } from "../types/List";
import { ListItem } from "../types/ListItem";

// An in-memory implementation of the Database interface.

async function createList(newListTitle: string) {
  return;
}

async function addListItem(text: string, list: List) {
  return;
}

async function getAllLists(): Promise<List[]> {
  return [];
}

async function getListItems(list: List, doneItemsLast: boolean): Promise<ListItem[]> {
  return [];
}

function updateListItem(listItem: ListItem): Promise<void> {
  return;
}

function deleteList(list: List): Promise<void> {
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
