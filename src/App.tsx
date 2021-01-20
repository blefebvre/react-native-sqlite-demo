/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useState, useEffect } from "react";
import { AppState, StyleSheet, AppStateStatus } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { LoadingScreen } from "./components/LoadingScreen";
import { useDatabaseSync } from "./hooks/useDatabaseSync";
import { HomeScreen } from "./components/HomeScreen";
import { SettingsScreen } from "./components/SettingsScreen";
import { ListDetailsScreen } from "./components/ListDetailsScreen";

// Track the current state of the app as a regular variable (instead of in state), since
// we do not want to re-render when this value changes.
let appState: AppStateStatus;

// React Navigation stack navigator
const Stack = createStackNavigator();

export const App: React.FunctionComponent = function() {
  // Initialize state
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
    }
    appState = nextAppState;
  }

  // Function to run when the app is brought to the foreground
  async function appIsNowRunningInForeground() {
    console.log("App is now running in the foreground!");

    // Sync the database with Dropbox
    const syncDatabase = useDatabaseSync(prepareForDatabaseUpdate);
    syncDatabase();
  }

  // Function to call right before a DB update begins
  async function prepareForDatabaseUpdate() {
    setIsLoading(true);
    setLoadingText("Downloading database...");
  }

  function isReady() {
    return isLoading === false;
  }

  if (isReady()) {
    // Once the database is ready, render the Lists
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="SQLite List App" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="List Details" component={ListDetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
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
