import React from "react";
import { StyleSheet, Text } from "react-native";

interface Props {
  checked: boolean;
}

export const Checkbox = (props: Props) => {
  const { checked } = props;
  return <Text style={styles.check}>{checked ? "☑" : "⬜"}</Text>;
};

const styles = StyleSheet.create({
  check: {
    fontSize: 30
  }
});
