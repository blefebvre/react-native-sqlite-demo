/**
 * React Native SQLite Demo
 * Copyright (c) 2018 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import React, { Component } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert
} from "react-native";
import { Header } from "./Header";
import { sharedStyle } from "../style/Shared";

interface Props {
  visible: boolean;
  back(): void;
}

export class SettingsModal extends Component<Props, {}> {
  public render() {
    const { visible } = this.props;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => this.props.back()}
      >
        <SafeAreaView style={styles.container} testID="settingsModal">
          <View style={sharedStyle.headerWithButton}>
            <Header title={`Settings`} />

            <TouchableOpacity
              style={sharedStyle.headerButton}
              onPress={() => this.props.back()}
            >
              <Text>✖️</Text>
            </TouchableOpacity>
          </View>

          <Text>Settings!!!</Text>
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10
  }
});
