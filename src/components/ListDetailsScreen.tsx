/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useState } from "react";
import { View, StyleSheet, Text, SafeAreaView, TouchableOpacity, FlatList, Alert } from "react-native";
import { Header } from "./Header";
import { NewItem } from "./NewItem";
import { ListItem } from "../types/ListItem";
import { ListItemRow } from "./ListItemRow";
import { sharedStyle } from "../style/Shared";
import { useListItems } from "../hooks/useListItems";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";
import { useLists } from "../hooks/useLists";
import { AppText } from "./AppText";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "List Details">;
  route: RouteProp<RootStackParamList, "List Details">;
}

// Modal dialog to view and manage the items of a single list
export const ListDetailsScreen: React.FunctionComponent<Props> = function(props) {
  const { navigation, route } = props;
  const { list } = route.params;
  const [newItemText, setNewItemText] = useState("");

  // Use the useListItems hook to manage list items, instead of using the DB object directly
  const { selectedListsItems, updateListItem, addListItem } = useListItems(list);
  // Use the useLists hook to simplify list management
  const { deleteList } = useLists();

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
          await deleteList(list);
          navigation.goBack();
        },
      },
      {
        text: "No",
        onPress: () => console.log("Cancel Pressed"),
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} testID="viewListModal">
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
            <AppText>Delete list</AppText>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
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
