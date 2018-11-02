import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  SafeAreaView,
  TouchableOpacity
} from "react-native";
import { Header } from "./Header";
import { List } from "../types/List";
import { NewItem } from "./NewItem";

interface Props {
  visible: boolean;
  list?: List;
  back(): void;
}

interface State {
  newItemName: string;
}

export class ViewListModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newItemName: ""
    };
    this.handleNewItemNameChange = this.handleNewItemNameChange.bind(this);
    this.handleAddNewItemToList = this.handleAddNewItemToList.bind(this);
  }

  public render() {
    const { visible, list } = this.props;
    if (list == null) {
      return null;
    }
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => this.props.back()}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.headerAndClose}>
            <Header title={`List: ${list.title}`} />

            <TouchableOpacity
              style={styles.headerClose}
              onPress={() => this.props.back()}
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>

          <NewItem
            newItemName={this.state.newItemName}
            handleNameChange={this.handleNewItemNameChange}
            handleCreateNewItem={this.handleAddNewItemToList}
            placeholderText="Enter a new list item"
            createButtonText="Add item"
          />
        </SafeAreaView>
      </Modal>
    );
  }

  private handleNewItemNameChange(newItemName: string) {
    this.setState({ newItemName });
  }

  private handleAddNewItemToList(): Promise<void> {
    return Promise.reject();
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10
  },
  headerAndClose: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  headerClose: {
    justifyContent: "center",
    padding: 5
  }
});
