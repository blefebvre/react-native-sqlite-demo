import React from "react";
import { Text } from "react-native";
import { ListItem } from "../types/ListItem";

interface Props {
  listItem: ListItem;
}

export const ListItems = (props: Props) => {
  const { text, done } = props.listItem;
  return (
    <>
      <Text>List items here</Text>
    </>
  );
};
