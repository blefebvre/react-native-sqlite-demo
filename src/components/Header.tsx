/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { StyleSheet } from "react-native";
import { AppText } from "./AppText";

interface Props {
  title: string;
}

export const Header: React.FunctionComponent<Props> = function(props) {
  const { title } = props;
  return <AppText style={styles.header}>{title}</AppText>;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
});
