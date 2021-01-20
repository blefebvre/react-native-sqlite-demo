/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { List } from "../types/List";

interface Props {
  list: List;
  handleListClicked(list: List): void;
}

export const ListRow: React.FunctionComponent<Props> = function(props) {
  const { list, handleListClicked } = props;
  return (
    <TouchableOpacity onPress={() => handleListClicked(list)} style={styles.row} testID={`listButton:${list.title}`}>
      <Text style={styles.text}>{list.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    padding: 15,
    marginTop: 10,
    backgroundColor: "#444",
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  text: {
    color: "#EEE",
  },
});
