/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import SQLite from "react-native-sqlite-storage";
import {DatabaseInitialization} from "./DatabaseInitialization";
import {List} from "../types/List";
import {ListItem} from "../types/ListItem";
import {DATABASE} from "./Constants";
import {DropboxDatabaseSync} from "../sync/dropbox/DropboxDatabaseSync";
import {AppState, AppStateStatus} from "react-native";

export interface Database {
  // Create
  createList(newListTitle: string): Promise<void>;
  addListItem(text: string, list: List): Promise<void>;
  // Read
  getAllLists(): Promise<List[]>;
  getListItems(list: List, doneItemsLast: boolean): Promise<ListItem[]>;
  // Update
  updateListItem(listItem: ListItem): Promise<void>;
  // Delete
  deleteList(list: List): Promise<void>;
}

let databaseInstance: SQLite.SQLiteDatabase | undefined;
const databaseSync: DropboxDatabaseSync = new DropboxDatabaseSync();

// Insert a new list into the database
async function createList(newListTitle: string): Promise<void> {
  return getDatabase()
    .then(db => db.executeSql("INSERT INTO List (title) VALUES (?);", [newListTitle]))
    .then(([results]) => {
      const {insertId} = results;
      console.log(`[db] Added list with title: "${newListTitle}"! InsertId: ${insertId}`);

      // Queue database upload
      return databaseSync.upload();
    });
}

// Get an array of all the lists in the database
async function getAllLists(): Promise<List[]> {
  console.log("[db] Fetching lists from the db...");
  return getDatabase()
    .then(db =>
      // Get all the lists, ordered by newest lists first
      db.executeSql("SELECT list_id as id, title FROM List ORDER BY id DESC;"),
    )
    .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const lists: List[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const {title, id} = row;
        console.log(`[db] List title: ${title}, id: ${id}`);
        lists.push({id, title});
      }
      return lists;
    });
}

async function addListItem(text: string, list: List): Promise<void> {
  if (list === undefined) {
    return Promise.reject(Error(`Could not add item to undefined list.`));
  }
  return getDatabase()
    .then(db => db.executeSql("INSERT INTO ListItem (text, list_id) VALUES (?, ?);", [text, list.id]))
    .then(([results]) => {
      console.log(`[db] ListItem with "${text}" created successfully with id: ${results.insertId}`);

      // Queue database upload
      return databaseSync.upload();
    });
}

async function getListItems(list: List, orderByDone = false): Promise<ListItem[]> {
  if (list === undefined) {
    return Promise.resolve([]);
  }
  return getDatabase()
    .then(db =>
      db.executeSql(
        `SELECT item_id as id, text, done FROM ListItem WHERE list_id = ? ${orderByDone ? "ORDER BY done" : ""};`,
        [list.id],
      ),
    )
    .then(([results]) => {
      if (results === undefined) {
        return [];
      }
      const count = results.rows.length;
      const listItems: ListItem[] = [];
      for (let i = 0; i < count; i++) {
        const row = results.rows.item(i);
        const {text, done: doneNumber, id} = row;
        const done = doneNumber === 1 ? true : false;

        console.log(`[db] List item text: ${text}, done? ${done} id: ${id}`);
        listItems.push({id, text, done});
      }
      console.log(`[db] List items for list "${list.title}":`, listItems);
      return listItems;
    });
}

async function updateListItem(listItem: ListItem): Promise<void> {
  const doneNumber = listItem.done ? 1 : 0;
  return getDatabase()
    .then(db =>
      db.executeSql("UPDATE ListItem SET text = ?, done = ? WHERE item_id = ?;", [
        listItem.text,
        doneNumber,
        listItem.id,
      ]),
    )
    .then(([results]) => {
      console.log(`[db] List item with id: ${listItem.id} updated.`);

      // Queue database upload
      return databaseSync.upload();
    });
}

async function deleteList(list: List): Promise<void> {
  console.log(`[db] Deleting list titled: "${list.title}" with id: ${list.id}`);
  return getDatabase()
    .then(db => {
      // Delete list items first, then delete the list itself
      return db.executeSql("DELETE FROM ListItem WHERE list_id = ?;", [list.id]).then(() => db);
    })
    .then(db => db.executeSql("DELETE FROM List WHERE list_id = ?;", [list.id]))
    .then(() => {
      console.log(`[db] Deleted list titled: "${list.title}"!`);

      // Queue database upload
      return databaseSync.upload();
    });
}

// "Private" helpers

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (databaseInstance !== undefined) {
    return Promise.resolve(databaseInstance);
  }
  // otherwise: open the database first
  return open();
}

// Open a connection to the database
async function open(): Promise<SQLite.SQLiteDatabase> {
  SQLite.DEBUG(true);
  SQLite.enablePromise(true);

  if (databaseInstance) {
    console.log("[db] Database is already open: returning the existing instance");
    return databaseInstance;
  }

  // Otherwise, create a new instance
  const db = await SQLite.openDatabase({
    name: DATABASE.FILE_NAME,
    location: "default",
  });
  console.log("[db] Database open!");

  // Perform any database initialization or updates, if needed
  const databaseInitialization = new DatabaseInitialization();
  await databaseInitialization.updateDatabaseTables(db);

  databaseInstance = db;
  return db;
}

// Close the connection to the database
async function close(): Promise<void> {
  if (databaseInstance === undefined) {
    console.log("[db] No need to close DB again - it's already closed");
    return;
  }
  const status = await databaseInstance.close();
  console.log("[db] Database closed.");
  databaseInstance = undefined;
}

// Listen to app state changes. Close the database when the app is put into the background (or enters the "inactive" state)
let appState = "active";
console.log("[db] Adding listener to handle app state changes");
AppState.addEventListener("change", handleAppStateChange);

// Handle the app going from foreground to background, and vice versa.
function handleAppStateChange(nextAppState: AppStateStatus) {
  if (appState === "active" && nextAppState.match(/inactive|background/)) {
    // App has moved from the foreground into the background (or become inactive)
    console.log("[db] App has gone to the background - closing DB connection.");
    close();
  }
  appState = nextAppState;
}

// Export the functions which fulfill the Database interface contract
export const database: Database = {
  createList,
  addListItem,
  getAllLists,
  getListItems,
  updateListItem,
  deleteList,
};
