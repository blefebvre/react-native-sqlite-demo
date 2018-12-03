/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import SQLite from "react-native-sqlite-storage";
import { DatabaseInitialization } from "./DatabaseInitialization";
import { List } from "../types/List";
import { ListItem } from "../types/ListItem";
import { DATABASE } from "./Constants";
import { DropboxDatabaseSync } from "../sync/dropbox/DropboxDatabaseSync";

export interface Database {
  open(): Promise<SQLite.SQLiteDatabase>;
  close(): Promise<void>;
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

class DatabaseImpl implements Database {
  private database: SQLite.SQLiteDatabase | undefined;
  private databaseSync: DropboxDatabaseSync;

  constructor() {
    this.databaseSync = new DropboxDatabaseSync();
  }

  // Open the connection to the database
  public open(): Promise<SQLite.SQLiteDatabase> {
    SQLite.DEBUG(true);
    SQLite.enablePromise(true);
    let databaseInstance: SQLite.SQLiteDatabase;

    return SQLite.openDatabase({
      name: DATABASE.FILE_NAME,
      location: "default"
    })
      .then(db => {
        databaseInstance = db;
        console.log("[db] Database open!");

        // Perform any database initialization or updates, if needed
        const databaseInitialization = new DatabaseInitialization();
        return databaseInitialization.updateDatabaseTables(databaseInstance);
      })
      .then(() => {
        this.database = databaseInstance;
        return databaseInstance;
      });
  }

  // Close the connection to the database
  public close(): Promise<void> {
    if (this.database === undefined) {
      return Promise.reject("[db] Database was not open; unable to close.");
    }
    return this.database.close().then(status => {
      console.log("[db] Database closed.");
      this.database = undefined;
    });
  }

  // Insert a new list into the database
  public createList(newListTitle: string): Promise<void> {
    return this.getDatabase()
      .then(db =>
        db.executeSql("INSERT INTO List (title) VALUES (?);", [newListTitle])
      )
      .then(([results]) => {
        const { insertId } = results;
        console.log(
          `[db] Added list with title: "${newListTitle}"! InsertId: ${insertId}`
        );

        // Queue database upload
        return this.databaseSync.queueDatabaseUpload();
      });
  }

  // Get an array of all the lists in the database
  public getAllLists(): Promise<List[]> {
    console.log("[db] Fetching lists from the db...");
    return this.getDatabase()
      .then(db =>
        // Get all the lists, ordered by newest lists first
        db.executeSql("SELECT list_id as id, title FROM List ORDER BY id DESC;")
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const lists: List[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { title, id } = row;
          console.log(`[db] List title: ${title}, id: ${id}`);
          lists.push({ id, title });
        }
        return lists;
      });
  }

  public addListItem(text: string, list: List): Promise<void> {
    if (list === undefined) {
      return Promise.reject(Error(`Could not add item to undefined list.`));
    }
    return this.getDatabase()
      .then(db =>
        db.executeSql("INSERT INTO ListItem (text, list_id) VALUES (?, ?);", [
          text,
          list.id
        ])
      )
      .then(([results]) => {
        console.log(
          `[db] ListItem with "${text}" created successfully with id: ${
            results.insertId
          }`
        );

        // Queue database upload
        return this.databaseSync.queueDatabaseUpload();
      });
  }

  public getListItems(list: List, orderByDone = false): Promise<ListItem[]> {
    if (list === undefined) {
      return Promise.resolve([]);
    }
    return this.getDatabase()
      .then(db =>
        db.executeSql(
          `SELECT item_id as id, text, done FROM ListItem WHERE list_id = ? ${
            orderByDone ? "ORDER BY done" : ""
          };`,
          [list.id]
        )
      )
      .then(([results]) => {
        if (results === undefined) {
          return [];
        }
        const count = results.rows.length;
        const listItems: ListItem[] = [];
        for (let i = 0; i < count; i++) {
          const row = results.rows.item(i);
          const { text, done: doneNumber, id } = row;
          const done = doneNumber === 1 ? true : false;

          console.log(`[db] List item text: ${text}, done? ${done} id: ${id}`);
          listItems.push({ id, text, done });
        }
        console.log(`[db] List items for list "${list.title}":`, listItems);
        return listItems;
      });
  }

  public updateListItem(listItem: ListItem): Promise<void> {
    const doneNumber = listItem.done ? 1 : 0;
    return this.getDatabase()
      .then(db =>
        db.executeSql(
          "UPDATE ListItem SET text = ?, done = ? WHERE item_id = ?;",
          [listItem.text, doneNumber, listItem.id]
        )
      )
      .then(([results]) => {
        console.log(`[db] List item with id: ${listItem.id} updated.`);

        // Queue database upload
        return this.databaseSync.queueDatabaseUpload();
      });
  }

  public deleteList(list: List): Promise<void> {
    console.log(
      `[db] Deleting list titled: "${list.title}" with id: ${list.id}`
    );
    return this.getDatabase()
      .then(db => {
        // Delete list items first, then delete the list itself
        return db
          .executeSql("DELETE FROM ListItem WHERE list_id = ?;", [list.id])
          .then(() => db);
      })
      .then(db =>
        db.executeSql("DELETE FROM List WHERE list_id = ?;", [list.id])
      )
      .then(() => {
        console.log(`[db] Deleted list titled: "${list.title}"!`);

        // Queue database upload
        return this.databaseSync.queueDatabaseUpload();
      });
  }

  private getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (this.database !== undefined) {
      return Promise.resolve(this.database);
    }
    // otherwise: open the database first
    return this.open();
  }
}

// Export a single instance of DatabaseImpl
export const database: Database = new DatabaseImpl();
