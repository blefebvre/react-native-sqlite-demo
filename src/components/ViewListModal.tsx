import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  SafeAreaView,
  TouchableOpacity,
  FlatList
} from "react-native";
import { Header } from "./Header";
import { List } from "../types/List";
import { NewItem } from "./NewItem";
import { database } from "../database/Database";
import { ListItem } from "../types/ListItem";
import { ListItemRow } from "./ListItemRow";

interface Props {
  visible: boolean;
  list?: List;
  back(): void;
}

interface State {
  newItemText: string;
  listItems: ListItem[];
}

export class ViewListModal extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      newItemText: "",
      listItems: []
    };
    this.handleNewItemNameChange = this.handleNewItemNameChange.bind(this);
    this.handleAddNewItemToList = this.handleAddNewItemToList.bind(this);
    this.refreshListItems = this.refreshListItems.bind(this);
    this.toggleListItemDoneness = this.toggleListItemDoneness.bind(this);
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
        onShow={this.refreshListItems}
        onDismiss={() => this.setState({ listItems: [] })}
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
            newItemName={this.state.newItemText}
            handleNameChange={this.handleNewItemNameChange}
            handleCreateNewItem={this.handleAddNewItemToList}
            placeholderText="Enter a new list item"
            createButtonText="Add item"
          />

          <FlatList
            data={this.state.listItems}
            renderItem={({ item }) => (
              <ListItemRow
                listItem={item}
                handleListItemClicked={this.toggleListItemDoneness}
              />
            )}
            keyExtractor={(item, index) => `item-${index}`}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  private refreshListItems() {
    console.log(
      `Refreshing list items for list: ${this.props.list &&
        this.props.list.title}`
    );
    if (this.props.list !== undefined) {
      database
        .getListItems(this.props.list)
        .then(listItems => this.setState({ listItems }));
    }
  }

  private toggleListItemDoneness(listItem: ListItem) {
    const newDoneState = !listItem.done;
    listItem.done = newDoneState;
    database.updateListItem(listItem).then(() => this.refreshListItems());
  }

  private handleNewItemNameChange(newItemText: string) {
    this.setState({ newItemText });
  }

  private handleAddNewItemToList(): Promise<void> {
    const { newItemText } = this.state;
    if (newItemText === "") {
      // Don't create new list items with no text
      return Promise.resolve();
    }
    if (this.props.list === undefined) {
      return Promise.reject(Error("Cannot add new item to undefined list"));
    }
    return database
      .addListItem(newItemText, this.props.list)
      .then(this.refreshListItems);
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
