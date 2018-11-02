import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { List } from "../types/List";

interface Props {
  list: List;
  handleListClicked(list: List): void;
}

export const ListRow = (props: Props) => {
  const { list, handleListClicked } = props;
  return (
    <TouchableOpacity
      onPress={() => handleListClicked(list)}
      style={styles.row}
    >
      <Text>{list.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    padding: 15,
    marginTop: 10,
    backgroundColor: "#EEE",
    borderRadius: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3
  }
});
