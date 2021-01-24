/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { StyleSheet } from "react-native";
import { AppText } from "./AppText";

interface Props {
  checked: boolean;
}

export const Checkbox: React.FunctionComponent<Props> = function(props) {
  const { checked } = props;
  return (
    <AppText accessibilityLabel={`checkbox:${checked ? "checked" : "unchecked"}`} style={styles.check}>
      {checked ? "☑" : "⬜"}
    </AppText>
  );
};

const styles = StyleSheet.create({
  check: {
    fontSize: 30,
  },
});
