import React, { Component } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { NewItem } from "./NewItem";
import { Header } from "./Header";
import { List } from "../types/List";
import { ListRow } from "./ListRow";
import { database } from "../database/Database";
import { ViewListModal } from "./ViewListModal";

interface State {
  newListTitle: string;
  lists: List[];
  listModalVisible: boolean;
  selectedList?: List;
}

export class AllLists extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      newListTitle: "",
      lists: [],
      listModalVisible: false
    };
    this.handleNewListTitleChange = this.handleNewListTitleChange.bind(this);
    this.handleCreateList = this.handleCreateList.bind(this);
    this.handleListClicked = this.handleListClicked.bind(this);
  }

  public componentDidMount() {
    this.refreshListOfLists();
  }

  public render() {
    return (
      <View style={styles.container}>
        <Header title="SQLite List App" />
        <NewItem
          newItemName={this.state.newListTitle}
          handleNameChange={this.handleNewListTitleChange}
          handleCreateNewItem={this.handleCreateList}
          placeholderText="Enter a name for your new list"
          createButtonText="Add list"
        />
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) => (
            <ListRow list={item} handleListClicked={this.handleListClicked} />
          )}
          keyExtractor={(item, index) => `${index}`}
        />
        <ViewListModal
          visible={this.state.listModalVisible}
          list={this.state.selectedList}
          back={() => this.setState({ listModalVisible: false })}
        />
      </View>
    );
  }

  private handleNewListTitleChange(title: string) {
    this.setState({
      newListTitle: title
    });
  }

  private handleCreateList(): Promise<void> {
    const { newListTitle } = this.state;
    return database.createList(newListTitle).then(() => {
      // Refresh the list of lists
      this.refreshListOfLists();
    });
  }

  private handleListClicked(list: List) {
    console.log(`List clicked! Title: ${list.title}`);
    this.setState({
      selectedList: list,
      listModalVisible: true
    });
  }

  private refreshListOfLists() {
    return database.getAllLists().then(lists => this.setState({ lists }));
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10,
    flex: 1
  }
});
