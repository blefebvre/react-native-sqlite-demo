import React from "react";
import { Text, StyleSheet, View } from "react-native";
import { ListItem } from "../types/ListItem";

interface Props {
  listItem: ListItem;
}

export const ListItemRow = (props: Props) => {
  const { listItem } = props;
  return (
    <View style={styles.row}>
      <Text>{listItem.text}</Text>
    </View>
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
