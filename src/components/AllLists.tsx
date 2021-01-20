/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2020 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useState } from "react";
import { View, StyleSheet, FlatList, Text, TouchableOpacity } from "react-native";

import { NewItem } from "./NewItem";
import { Header } from "./Header";
import { List } from "../types/List";
import { ListRow } from "./ListRow";
import { ListDetailsScreen } from "./ListDetailsScreen";
import { useLists } from "../hooks/useLists";

// Main page of the app. This component renders:
// - a header, including a cog icon to open the Settings modal
// - the form to add a new List
// - and a list of all the Lists saved locally in the app's database
export const AllLists: React.FunctionComponent = function() {
  const [newListTitle, setNewListTitle] = useState("");

  // Use the useLists hook to simplify list management.
  const { lists, selectList, selectedList, createList, deleteList } = useLists();

  async function handleListClicked(list: List) {
    console.log(`List clicked! Title: ${list.title}`);
    await selectList(list);
    // Open a modal dialog to view and manage the items of a single list
    //setIsListModalVisible(true);
  }

  return (
    <View style={styles.container} testID="allListsView">
      <View style={styles.headerWithSettings}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => {
            /* setIsSettingsModalVisible(true) */
          }}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
        <Header title="SQLite List App - with Hooks" />
      </View>

      <NewItem
        newItemName={newListTitle}
        handleNameChange={(value) => setNewListTitle(value)}
        handleCreateNewItem={createList}
        placeholderText="Enter a name for your new list"
        createButtonText="Add list"
        buttonTestId="addListButton"
        textInputTestId="newListTextInput"
      />

      <FlatList
        data={lists}
        renderItem={({ item }) => <ListRow list={item} handleListClicked={handleListClicked} />}
        keyExtractor={(item, index) => `${index}`}
      />

      {selectedList !== undefined && (
        <ListDetailsScreen
          list={selectedList}
          back={() => {
            /* setIsListModalVisible(false) */
          }}
          deleteList={deleteList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  headerWithSettings: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  settingsButton: {
    marginTop: 10,
    paddingRight: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  settingsButtonText: {
    fontSize: 20,
  },
});
