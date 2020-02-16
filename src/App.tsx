/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, {useState, useEffect} from "react";
import {AppState, StyleSheet, SafeAreaView, AppStateStatus} from "react-native";
import {database} from "./database/Database";
import {AllLists} from "./components/AllLists";
import {LoadingScreen} from "./components/LoadingScreen";
import {useDatabaseSync} from "./hooks/useDatabaseSync";

// Track the current state of the app as a regular variable (instead of in state), since
// we do not want to re-render when this value changes.
let appState: AppStateStatus;

export const App: React.FunctionComponent = function() {
  // Initialize state
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");
  // Read the initial value of AppState
  appState = AppState.currentState;

  // Set up a callback to fire when AppState changes (when the app goes to/from the background)
  useEffect(function() {
    // The app is currently active, so the "change" event will not fire and we need to
    // call appIsNowRunningInForeground ourselves.
    appIsNowRunningInForeground();
    appState = "active";
    // Listen for app state changes
    AppState.addEventListener("change", handleAppStateChange);

    return function() {
      // Cleanup function
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  // Handle the app going from foreground to background, and vice versa.
  function handleAppStateChange(nextAppState: AppStateStatus) {
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      // App has moved from the background (or inactive) into the foreground
      appIsNowRunningInForeground();
    } else if (appState === "active" && nextAppState.match(/inactive|background/)) {
      // App has moved from the foreground into the background (or become inactive)
      appHasGoneToTheBackground();
    }
    appState = nextAppState;
  }

  // Function to run when the app is brought to the foreground
  async function appIsNowRunningInForeground() {
    console.log("App is now running in the foreground!");

    // Sync the database with Dropbox
    const syncDatabase = useDatabaseSync(prepareForDatabaseUpdate);
    syncDatabase();

    // Do not wait for database sync to complete. Instead, open DB and show app content.
    await database.open();
    setIsDatabaseReady(true);
  }

  // Function to run when the app is sent to the background
  function appHasGoneToTheBackground() {
    console.log("App has gone to the background.");
    database.close();
  }

  // Function to call right before a DB update begins
  function prepareForDatabaseUpdate(): Promise<void> {
    setIsLoading(true);
    setLoadingText("Downloading database...");
    return database.close();
  }

  function isReady() {
    return isDatabaseReady && isLoading === false;
  }

  if (isReady()) {
    // Once the database is ready, render the Lists
    return (
      <SafeAreaView style={styles.container}>
        <AllLists />
      </SafeAreaView>
    );
  } else {
    // Else, show a loading screen
    return <LoadingScreen text={loadingText} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
