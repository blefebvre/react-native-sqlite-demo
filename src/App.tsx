/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { Component } from "react";
import { AppState, StyleSheet, SafeAreaView } from "react-native";
import { database } from "./database/Database";
import { AllLists } from "./components/AllLists";
import { DatabaseSynchronizer } from "./database/DatabaseSynchronizer";
import { LoadingScreen } from "./components/LoadingScreen";

interface State {
  appState: string;
  databaseIsReady: boolean;
  loading: boolean;
  loadingText: string;
}

export default class App extends Component<object, State> {
  private databaseSynchronizer: DatabaseSynchronizer;

  constructor(props: any) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      databaseIsReady: false,
      loading: false,
      loadingText: "Loading..."
    };
    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.prepareForDatabaseUpdate = this.prepareForDatabaseUpdate.bind(this);
    this.databaseSynchronizer = new DatabaseSynchronizer(
      this.prepareForDatabaseUpdate
    );
  }

  public componentDidMount() {
    // App is starting up
    this.appIsNowRunningInForeground();
    this.setState({
      appState: "active"
    });
    // Listen for app state changes
    AppState.addEventListener("change", this.handleAppStateChange);
  }

  public componentWillUnmount() {
    // Remove app state change listener
    AppState.removeEventListener("change", this.handleAppStateChange);
  }

  public render() {
    // Once the database is ready, show the Lists
    if (this.state.databaseIsReady && this.state.loading === false) {
      return (
        <SafeAreaView style={styles.container}>
          <AllLists />
        </SafeAreaView>
      );
    } else {
      // Else, show a loading screen
      return <LoadingScreen text={this.state.loadingText} />;
    }
  }

  // Handle the app going from foreground to background, and vice versa.
  private handleAppStateChange(nextAppState: string) {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      // App has moved from the background (or inactive) into the foreground
      this.appIsNowRunningInForeground();
    } else if (
      this.state.appState === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      // App has moved from the foreground into the background (or become inactive)
      this.appHasGoneToTheBackground();
    }
    this.setState({ appState: nextAppState });
  }

  // Function to run when the app is brought to the foreground
  private appIsNowRunningInForeground() {
    console.log("App is now running in the foreground!");

    // Check for an update to the database
    this.databaseSynchronizer.syncDatabase();

    // Do not wait for database sync to complete. Instead, open DB and show app content.
    return database.open().then(() =>
      this.setState({
        databaseIsReady: true
      })
    );
  }

  // Function to run when the app is sent to the background
  private appHasGoneToTheBackground() {
    console.log("App has gone to the background.");
    database.close();
  }

  private prepareForDatabaseUpdate(): Promise<void> {
    this.setState({
      loading: true,
      loadingText: "Downloading database..."
    });
    return database.close();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
