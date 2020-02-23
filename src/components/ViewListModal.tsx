/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useState } from "react";
import { View, StyleSheet, Modal, Text, SafeAreaView, TouchableOpacity, FlatList, Alert } from "react-native";
import { Header } from "./Header";
import { List } from "../types/List";
import { NewItem } from "./NewItem";
import { ListItem } from "../types/ListItem";
import { ListItemRow } from "./ListItemRow";
import { sharedStyle } from "../style/Shared";
import { useListItems } from "../hooks/useListItems";

interface Props {
  visible: boolean;
  list: List;
  back(): void;
  deleteList(list: List): Promise<void>;
}

// Modal dialog to view and manage the items of a single list
export const ViewListModal: React.FunctionComponent<Props> = function(props) {
  const { visible, list } = props;
  const [newItemText, setNewItemText] = useState("");

  // Use the useListItems hook to manage list items, instead of using the DB object directly
  const { selectedListsItems, updateListItem, addListItem } = useListItems(list);

  async function toggleListItemDoneness(listItem: ListItem) {
    const newDoneState = !listItem.done;
    listItem.done = newDoneState;
    await updateListItem(listItem);
  }

  async function handleAddNewItemToList(): Promise<void> {
    if (newItemText.trim() === "") {
      // Don't create new list items with no text
      return;
    }
    await addListItem(newItemText);
  }

  function promptToDeleteList() {
    Alert.alert("Delete list?", "Are you sure you would like to delete this list?", [
      {
        text: "Yes, delete it",
        style: "destructive",
        onPress: async () => {
          // Delete the list, then head back to the main view
          await props.deleteList(list);
          props.back();
        },
      },
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
      },
    ]);
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
          handleNameChange={(value) => setNewItemText(value)}
          handleCreateNewItem={handleAddNewItemToList}
          placeholderText="Enter a new list item"
          createButtonText="Add item"
        />

        <FlatList
          data={selectedListsItems}
          renderItem={({ item }) => <ListItemRow listItem={item} handleListItemClicked={toggleListItemDoneness} />}
          keyExtractor={(_, index) => `item-${index}`}
          ListFooterComponent={
            <TouchableOpacity style={styles.deleteList} onPress={promptToDeleteList} testID="deleteListButton">
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
