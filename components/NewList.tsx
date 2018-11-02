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
  handleCreateList(): Promise<void>;
}

export const NewList = (props: Props) => {
  const { handleTitleChange, newListTitle, handleCreateList } = props;
  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder="Enter a new list name"
        onChangeText={handleTitleChange}
        value={newListTitle}
        style={styles.textInput}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (newListTitle !== "") {
            handleCreateList().then(() => {
              // Reset the text input
              handleTitleChange("");
            });
          }
        }}
      >
        <Text>Add List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    padding: 5,
    flex: 4
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center"
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 5,
    paddingBottom: 5
  }
});
