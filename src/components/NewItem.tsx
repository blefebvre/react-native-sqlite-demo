/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React from "react";
import { Keyboard, View, TextInput, StyleSheet, TouchableOpacity, Text } from "react-native";

interface Props {
  newItemName: string; // Prop that the TextInput is controlled by
  placeholderText: string;
  createButtonText: string;
  buttonTestId?: string;
  textInputTestId?: string;
  handleNameChange(title: string): void;
  handleCreateNewItem(title: string): Promise<void>;
}

export const NewItem: React.FunctionComponent<Props> = function(props) {
  const { newItemName, placeholderText, createButtonText, handleNameChange, handleCreateNewItem } = props;

  const createNewItem = () => {
    if (newItemName !== "") {
      handleCreateNewItem(newItemName).then(() => {
        // Reset the text input
        handleNameChange("");
        // Dismiss keyboard
        Keyboard.dismiss();
      });
    }
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        placeholder={placeholderText}
        onChangeText={handleNameChange}
        value={newItemName}
        style={styles.textInput}
        testID={props.textInputTestId || "newItemTextInput"}
        onSubmitEditing={createNewItem}
      />
      <TouchableOpacity style={styles.button} onPress={createNewItem} testID={props.buttonTestId || "newItemButton"}>
        <Text>{createButtonText}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    color: "black",
    borderWidth: 1,
    padding: 5,
    flex: 4,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 5,
    paddingBottom: 5,
  },
});
