/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, {Component, useState} from "react";
import {View, StyleSheet, Modal, Text, SafeAreaView, TouchableOpacity, FlatList, Alert} from "react-native";
import {Header} from "./Header";
import {List} from "../types/List";
import {NewItem} from "./NewItem";
import {database} from "../database/Database";
import {ListItem} from "../types/ListItem";
import {ListItemRow} from "./ListItemRow";
import {sharedStyle} from "../style/Shared";

interface Props {
  visible: boolean;
  list?: List;
  listItems: ListItem[];
  back(): void;
  refreshListItems(): Promise<void>;
  deleteList(): Promise<void>;
}

export const ViewListModal: React.FunctionComponent<Props> = function(props) {
  const [newItemText, setNewItemText] = useState("");
  const {visible, list, listItems} = props;

  function toggleListItemDoneness(listItem: ListItem) {
    const newDoneState = !listItem.done;
    listItem.done = newDoneState;
    database.updateListItem(listItem).then(() => props.refreshListItems());
  }

  function handleAddNewItemToList(): Promise<void> {
    if (newItemText === "") {
      // Don't create new list items with no text
      return Promise.resolve();
    }
    if (list === undefined) {
      return Promise.reject(Error("Cannot add new item to undefined list"));
    }
    return database.addListItem(newItemText, list).then(props.refreshListItems);
  }

  function deleteList() {
    Alert.alert("Delete list?", "Are you sure you would like to delete this list?", [
      {
        text: "Yes, delete it",
        style: "destructive",
        onPress: () => {
          // Delete the list, then head back to the main view
          props.deleteList().then(() => props.back());
        },
      },
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
      },
    ]);
  }

  if (list == null) {
    return null;
  }
  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={() => props.back()}>
      <SafeAreaView style={styles.container} testID="viewListModal">
        <View style={sharedStyle.headerWithButton}>
          <Header title={`List: ${list.title}`} />

          <TouchableOpacity style={sharedStyle.headerButton} onPress={() => props.back()}>
            <Text>✖️</Text>
          </TouchableOpacity>
        </View>

        <NewItem
          newItemName={newItemText}
          handleNameChange={value => setNewItemText(value)}
          handleCreateNewItem={handleAddNewItemToList}
          placeholderText="Enter a new list item"
          createButtonText="Add item"
        />

        <FlatList
          data={listItems}
          renderItem={({item}) => <ListItemRow listItem={item} handleListItemClicked={toggleListItemDoneness} />}
          keyExtractor={(item, index) => `item-${index}`}
          ListFooterComponent={
            <TouchableOpacity style={styles.deleteList} onPress={deleteList} testID="deleteListButton">
              <Text>Delete list</Text>
            </TouchableOpacity>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  deleteList: {
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
});
