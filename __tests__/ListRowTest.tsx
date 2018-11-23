import React from "react";
import renderer from "react-test-renderer";
import { ListRow } from "../src/components/ListRow";
import { List } from "../src/types/List";

test("ListRow renders correctly", () => {
  const list: List = { title: "Test list title", id: 1 };
  const tree = renderer
    .create(
      <ListRow
        list={list}
        handleListClicked={() => console.log("List clicked!")}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
