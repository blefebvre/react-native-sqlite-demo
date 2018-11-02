import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableHighlight
} from "react-native";
import { Header } from "./Header";
import { ListItems } from "./ListItems";
import { List } from "../types/List";

interface Props {
  visible: boolean;
  list: List;
}

export const ViewList = (props: Props) => {
  const { visible, list } = props;
  if (list == null) {
    return null;
  }
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={() => {
        // TODO: call parent
      }}
    >
      <View style={styles.container}>
        <View>
          <Header title={list.title} />

          <TouchableHighlight
            onPress={() => {
              // TODO: call parent
            }}
          >
            <Text>Hide Modal</Text>
          </TouchableHighlight>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {}
});
