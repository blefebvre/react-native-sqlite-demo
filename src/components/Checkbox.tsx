/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { StyleSheet, Text } from "react-native";

interface Props {
  checked: boolean;
}

export const Checkbox: React.FunctionComponent<Props> = function(props) {
  const { checked } = props;
  return (
    <Text accessibilityLabel={`checkbox:${checked ? "checked" : "unchecked"}`} style={styles.check}>
      {checked ? "☑" : "⬜"}
    </Text>
  );
};

const styles = StyleSheet.create({
  check: {
    fontSize: 30,
  },
});
