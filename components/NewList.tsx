import React from "react";

import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from "react-native";

interface Props {
  newListTitle: string;
  handleTitleChange(title: string): void;
}

export const NewList = (props: Props) => {
  const { handleTitleChange, newListTitle } = props;
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="Enter a new list name"
        onChangeText={handleTitleChange}
        value={newListTitle}
        style={styles.textInput}
      />
      <TouchableOpacity style={styles.button}>
        <Text>Add List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    flex: 4
  },
  wrapper: {
    flexDirection: "row"
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  }
});
