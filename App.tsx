/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/emin93/react-native-template-typescript
 *
 */

import React, { Component } from "react";

import { AppState, Platform, StyleSheet, Text, View } from "react-native";
import { database } from "./database/Database";

const instructions = Platform.select({
  ios: "Press Cmd+R to reload,\n" + "Cmd+D or shake for dev menu",
  android:
    "Double tap R on your keyboard to reload,\n" +
    "Shake or press menu button for dev menu"
});

interface State {
  appState: string;
  databaseIsReady: boolean;
}

export default class App extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      appState: AppState.currentState,
      databaseIsReady: false
    };
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
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>Welcome to React Native!</Text>
        <Text style={styles.instructions}>To get started, edit App.tsx</Text>
        <Text style={styles.instructions}>{instructions}</Text>
      </View>
    );
  }

  // Handle the app going from foreground to background, and vice versa.
  private handleAppStateChange = (nextAppState: string) => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      this.appIsNowRunningInForeground();
    } else if (
      this.state.appState === "active" &&
      nextAppState.match(/inactive|background/)
    ) {
      this.appHasGoneToTheBackground();
    }
    this.setState({ appState: nextAppState });
  };

  // Code to run when app is brought to the foreground
  private appIsNowRunningInForeground() {
    console.log("App is now running in the foreground!");

    // Open the database
    return database.open().then(() =>
      this.setState({
        databaseIsReady: true
      })
    );
  }

  // Code to run when app is sent to the background
  private appHasGoneToTheBackground() {
    console.log("App has gone to the background.");
    database.close();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
