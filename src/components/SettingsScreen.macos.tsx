/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import * as React from "react";
import { StyleSheet, SafeAreaView } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { AppText } from "./AppText";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "Settings">;
}

export const SettingsScreen: React.FunctionComponent<Props> = function({ navigation }) {
  return (
    <SafeAreaView style={styles.container} testID="settingsModal">
      <AppText>Dropbox sync is not currently available for macOS.</AppText>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
  },
});
