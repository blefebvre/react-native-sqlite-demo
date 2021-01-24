/**
 * React Native SQLite Demo
 * Copyright (c) 2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { useEffect, useState } from "react";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../App";
import { List } from "../types/List";
import { useLists } from "../hooks/useLists";
import { StyleSheet, View } from "react-native";
import { NewItem } from "./NewItem";
import { FlatList } from "react-native-gesture-handler";
import { ListRow } from "./ListRow";

interface Props {
  navigation: StackNavigationProp<RootStackParamList, "HomeScreen">;
}

// Main page of the app. This component renders:
// - a header, including a cog icon to open the Settings modal
// - the form to add a new List
// - and a list of all the Lists saved locally in the app's database
export const HomeScreen: React.FunctionComponent<Props> = function({ navigation }) {
  const [newListTitle, setNewListTitle] = useState("");

  // Use the useLists hook to simplify list management.
  const { lists, createList } = useLists();

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // do something
    });

    return unsubscribe;
  }, [navigation]);

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
              navigation.navigate("List Details", { list });
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
