import React, { Component } from "react";

import { View, StyleSheet } from "react-native";
import { NewList } from "./NewList";
import { Header } from "./Header";

interface State {
  newListTitle: string;
}

export class AllLists extends Component<any, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      newListTitle: ""
    };
    this.handleNewListTitleChange = this.handleNewListTitleChange.bind(this);
  }

  public render() {
    return (
      <View style={styles.container}>
        <Header title="ListApp" />
        <NewList
          newListTitle={this.state.newListTitle}
          handleTitleChange={this.handleNewListTitleChange}
        />
      </View>
    );
  }

  private handleNewListTitleChange(title: string) {
    this.setState({
      newListTitle: title
    });
  }
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    paddingRight: 10
  }
});
