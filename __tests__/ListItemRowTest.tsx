import React from "react";
import renderer from "react-test-renderer";
import { ListItemRow } from "../src/components/ListItemRow";
import { ListItem } from "../src/types/ListItem";

test("ListItemRow renders correctly", () => {
  const listItem: ListItem = {
    text: "Test list item text",
    done: false,
    id: 1
  };
  const tree = renderer
    .create(
      <ListItemRow
        listItem={listItem}
        handleListItemClicked={() => console.log("List clicked!")}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
