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
import { DropboxAuthorize } from "../sync/dropbox/DropboxAuthorize";

interface Props {
  visible: boolean;
  back(): void;
}

interface State {
  isDropboxStatusKnown: boolean;
  hasAuthorizedWithDropbox: boolean;
}

export class SettingsModal extends Component<Props, State> {
  private dropboxAuth: DropboxAuthorize;

  constructor(props: Props) {
    super(props);

    this.dropboxAuth = new DropboxAuthorize();
    this.state = {
      isDropboxStatusKnown: false,
      hasAuthorizedWithDropbox: false
    };

    this.modalOnShow = this.modalOnShow.bind(this);
    this.authorizeWithDropbox = this.authorizeWithDropbox.bind(this);
    this.unlinkFromDropbox = this.unlinkFromDropbox.bind(this);
  }

  public render() {
    const { visible } = this.props;
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={() => this.props.back()}
        onShow={this.modalOnShow}
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

          {this.state.isDropboxStatusKnown && this.renderDropboxComponents()}
        </SafeAreaView>
      </Modal>
    );
  }

  private renderDropboxComponents() {
    if (this.state.hasAuthorizedWithDropbox) {
      return (
        <View>
          <Text>
            ✅ You have authorized the app to backup and sync your database file
            using Dropbox! Tap below to unlink.
          </Text>

          <TouchableOpacity
            style={styles.dropboxButton}
            onPress={this.unlinkFromDropbox}
            testID="unlinkButton"
          >
            <Text>Unlink Dropbox</Text>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <Text>
            Tap below to authorize the app to backup and sync your database file
            with Dropbox.
          </Text>

          <TouchableOpacity
            style={styles.dropboxButton}
            onPress={this.authorizeWithDropbox}
            testID="authorizeButton"
          >
            <Text>Authorize with Dropbox</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }

  // Begin authorization flow
  private authorizeWithDropbox() {
    return this.dropboxAuth
      .authorize()
      .then(() => {
        this.setState({
          hasAuthorizedWithDropbox: true
        });
      })
      .catch(reason => {
        Alert.alert(
          "Error",
          `Unable to authorize with Dropbox. Reason: ${reason}`
        );
      });
  }

  private unlinkFromDropbox() {
    Alert.alert(
      "Unlink Dropbox",
      "Are you sure you would like to unlink Dropbox? Your data will remain on this device, but it will no longer be backed up or synced.",
      [
        {
          text: "No",
          onPress: () => {
            // No-op
            return;
          }
        },
        {
          text: "Yes, unlink",
          onPress: () => {
            this.dropboxAuth.revokeAuthorization().then(() => {
              this.setState({
                hasAuthorizedWithDropbox: false
              });
            });
          },
          style: "destructive"
        }
      ]
    );
  }

  private modalOnShow(): void {
    // Check if this user has already authorized with Dropbox
    this.dropboxAuth.hasUserAuthorized().then(hasAuthorizedWithDropbox =>
      this.setState({
        isDropboxStatusKnown: true,
        hasAuthorizedWithDropbox
      })
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10
  },
  dropboxButton: {
    alignItems: "center",
    margin: 10,
    marginTop: 25,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: 1,
    borderRadius: 3
  }
});
