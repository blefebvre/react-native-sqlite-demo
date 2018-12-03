/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface Props {
  text?: string;
}

// Component that shows a spinner, and some text below it
export const LoadingScreen = (props: Props) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00FF00" />
      <Text style={styles.text}>{props.text || "Loading..."}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  text: {
    textAlign: "center",
    paddingTop: 10
  }
});
