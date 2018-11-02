import React from "react";
import { Text } from "react-native";
import { List } from "../types/List";

interface Props {
  list: List;
}

export const ListRow = (props: Props) => {
  return <Text>{props.list.title}</Text>;
};
