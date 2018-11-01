import React from "react";
import { Text, StyleSheet } from "react-native";

interface Props {
  title: string;
}

export const Header = (props: Props) => {
  const { title } = props;
  return <Text style={styles.header}>{title}</Text>;
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    marginBottom: 20,
    marginTop: 20
  }
});
