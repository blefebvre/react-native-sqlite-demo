import React from "react";
import renderer from "react-test-renderer";
import { NewItem } from "../src/components/NewItem";

test("ListItemRow renders correctly", () => {
  const tree = renderer
    .create(
      <NewItem
        newItemName="Test new item"
        createButtonText="create"
        placeholderText="Enter new item text here"
        handleCreateNewItem={() => Promise.resolve(console.log("create!"))}
        handleNameChange={name => console.log(`name: ${name}`)}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
