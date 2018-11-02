import React, { Component } from "react";
import { View, StyleSheet, FlatList } from "react-native";

import { NewList } from "./NewList";
import { Header } from "./Header";
import { List } from "../types/List";
import { ListRow } from "./ListRow";
import { database } from "../database/Database";

interface State {
  newListTitle: string;
  lists: List[];
}

export class AllLists extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      newListTitle: "",
      lists: []
    };
    this.handleNewListTitleChange = this.handleNewListTitleChange.bind(this);
    this.handleCreateList = this.handleCreateList.bind(this);
  }

  public componentDidMount() {
    this.refreshListOfLists();
  }

  public render() {
    return (
      <View style={styles.container}>
        <Header title="Bruce's List App" />
        <NewList
          newListTitle={this.state.newListTitle}
          handleTitleChange={this.handleNewListTitleChange}
          handleCreateList={this.handleCreateList}
        />
        <FlatList
          data={this.state.lists}
          renderItem={({ item }) => <ListRow list={item} />}
          keyExtractor={(item, index) => `${index}`}
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
