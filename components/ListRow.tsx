import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { List } from "../types/List";

interface Props {
  list: List;
  handleListClicked(list: List): void;
}

export const ListRow = (props: Props) => {
  const { list, handleListClicked } = props;
  return (
    <TouchableOpacity onPress={() => handleListClicked(list)}>
      <Text>{list.title}</Text>
    </TouchableOpacity>
  );
};
