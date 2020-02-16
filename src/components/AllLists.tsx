/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, {useState, useEffect} from "react";
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from "react-native";

import {NewItem} from "./NewItem";
import {Header} from "./Header";
import {List} from "../types/List";
import {ListRow} from "./ListRow";
import {database} from "../database/Database";
import {ViewListModal} from "./ViewListModal";
import {ListItem} from "../types/ListItem";
import {SettingsModal} from "./SettingsModal";

// Main page of the app. This component renders:
// - a header, including a cog icon to open the Settings modal
// - the form to add a new List
// - and a list of all the Lists saved locally in the app's database
export const AllLists: React.FunctionComponent = function() {
  const [newListTitle, setNewListTitle] = useState("");
  const [lists, setLists] = useState([] as List[]);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [selectedList, setSelectedList] = useState<List>();
  const [selectedListsItems, setSelectedListsItems] = useState([] as ListItem[]);

  useEffect(function() {
    refreshListOfLists();
  }, []); // no dependecies - only run effecton initial render

  function refreshListOfLists() {
    // Query all lists from the DB, and set them into the `lists` state variable
    return database.getAllLists().then(lists => setLists(lists));
  }

  function handleCreateList(): Promise<void> {
    return database.createList(newListTitle).then(() => {
      // Refresh the list of lists
      refreshListOfLists();
    });
  }

  function handleListClicked(list: List) {
    console.log(`List clicked! Title: ${list.title}`);
    refreshListsItems(list).then(() => {
      setSelectedList(list);
      setIsListModalVisible(true);
    });
  }

  function refreshListsItems(listToRefresh = selectedList, doneItemsLast = false): Promise<void> {
    console.log(`Refreshing list items for list: ${listToRefresh && listToRefresh.title}`);

    if (listToRefresh !== undefined) {
      return database
        .getListItems(listToRefresh, doneItemsLast)
        .then(selectedListsItems => setSelectedListsItems(selectedListsItems));
    }
    // otherwise, listToRefresh is undefined
    return Promise.reject(Error("Could not refresh an undefined list's items"));
  }

  function deleteList(listToDelete = selectedList): Promise<void> {
    if (listToDelete !== undefined) {
      return database.deleteList(listToDelete).then(() => refreshListOfLists());
    }
    // otherwise:
    return Promise.reject(Error("Could not delete an undefined list"));
  }

  return (
    <View style={styles.container} testID="allListsView">
      <View style={styles.headerWithSettings}>
        <TouchableOpacity style={styles.settingsButton} onPress={() => setIsSettingsModalVisible(true)}>
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </TouchableOpacity>
        <Header title="SQLite List App - with Hooks" />
      </View>

      <NewItem
        newItemName={newListTitle}
        handleNameChange={value => setNewListTitle(value)}
        handleCreateNewItem={handleCreateList}
        placeholderText="Enter a name for your new list"
        createButtonText="Add list"
        buttonTestId="addListButton"
        textInputTestId="newListTextInput"
      />

      <FlatList
        data={lists}
        renderItem={({item}) => <ListRow list={item} handleListClicked={handleListClicked} />}
        keyExtractor={(item, index) => `${index}`}
      />

      <ViewListModal
        visible={isListModalVisible}
        list={selectedList}
        back={() => setIsListModalVisible(false)}
        listItems={selectedListsItems}
        refreshListItems={refreshListsItems}
        deleteList={deleteList}
      />

      <SettingsModal visible={isSettingsModalVisible} back={() => setIsSettingsModalVisible(false)} />
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
