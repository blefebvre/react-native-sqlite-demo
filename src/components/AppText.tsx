/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import * as React from "react";
import { StyleSheet, Text } from "react-native";

interface Props {
  children: React.ReactElement | string;
  style?: object;
  accessibilityLabel?: string;
}

export const AppText: React.FunctionComponent<Props> = function({ children, style, ...props }) {
  let combinedStyle;
  if (Array.isArray(style)) {
    combinedStyle = [styles.appTextStyle, ...style];
  } else {
    combinedStyle = { ...styles.appTextStyle, ...style };
  }

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  appTextStyle: {
    color: "#000",
  },
});
