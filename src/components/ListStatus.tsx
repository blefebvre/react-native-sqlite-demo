import React from "react";
import { Text } from "react-native";
import { ListItem } from "../types/ListItem";

interface Props {
  listItems: ListItem[];
}

export const ListStatus = (props: Props) => {
  const { listItems = [] } = props;
  const itemsTodoCount = listItems.filter(item => !item.done).length;

  let status = `You have ${itemsTodoCount} tasks to go!`;

  if (itemsTodoCount === 0) {
    status = "BOOM DONE";
  }

  return <Text style={{ textAlign: "center", marginTop: 20 }}>{status}</Text>;
};
