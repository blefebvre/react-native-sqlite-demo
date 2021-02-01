/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

interface Props {
  text?: string;
}

// Component that shows a spinner, and some text below it
export const LoadingScreen: React.FunctionComponent<Props> = function(props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00FF00" />
      <AppText style={styles.text}>{props.text || "Loading..."}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  text: {
    textAlign: "center",
    paddingTop: 10,
  },
});
