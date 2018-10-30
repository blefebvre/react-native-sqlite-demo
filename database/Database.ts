import SQLite from "react-native-sqlite-storage";
import { DatabaseInitialization } from "./DatabaseInitialization";

export interface Database {
    open(): Promise<void>;
    close(): Promise<void>;
}

class DatabaseImpl implements Database {

    private databaseName = "AppDatabase.db";
    private database: SQLite.SQLiteDatabase | undefined;

    // Open the connection to the database
    public open(): Promise<void> {
        SQLite.DEBUG(true);
        SQLite.enablePromise(true);

        return SQLite.openDatabase({
            name: this.databaseName,
            location: "default"
        }).then((db) => {
            this.database = db;
            console.log("Database open!");

            // Perform any database initialization or updates, if needed
            const databaseInitialization = new DatabaseInitialization();
            return databaseInitialization.updateDatabaseTables(this.database);
        });
    }

    // close the connection to the database
    public close(): Promise<any> {
        if (this.database === undefined) {
            return Promise.reject("Database was not open; unable to close.");
        }
        return this.database.close().then((status) => {
            console.log("Database closed.");
            this.database = undefined;
        });
    }

}

// Export a single instance of DatabaseImpl
export let database: Database = new DatabaseImpl();
