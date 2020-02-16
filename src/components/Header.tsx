/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import {Text, StyleSheet} from "react-native";

interface Props {
  title: string;
}

export const Header: React.FunctionComponent<Props> = function(props) {
  const {title} = props;
  return <Text style={styles.header}>{title}</Text>;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20,
  },
});
