/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { NewItem } from "./NewItem";
import { List } from "../types/List";
import { ListRow } from "./ListRow";

interface Props {
  lists: List[];
  openList(list: List): void;
  createList(newListTitle: string): Promise<void>;
}

// Main page of the app. This component renders:
// - a header, including a cog icon to open the Settings modal
// - the form to add a new List
// - and a list of all the Lists saved locally in the app's database
export const AllLists: React.FunctionComponent<Props> = function({ openList, createList, lists }) {
  const [newListTitle, setNewListTitle] = useState("");

  return (
    <View style={styles.container} testID="allListsView">
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
        keyboardShouldPersistTaps={"never"}
        renderItem={({ item }) => (
          <ListRow
            list={item}
            handleListClicked={(list: List) => {
              openList(list);
            }}
          />
        )}
        keyExtractor={(item, index) => `${index}`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1,
  },
  newItemField: {},
});
