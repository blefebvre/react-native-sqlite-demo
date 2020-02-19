import {expect, element, by} from "detox";

describe("Add new list test", () => {
  const newListTitle = `Test list (time ${Date.now()})`;

  it("should have 'all lists' view visible", async () => {
    await expect(element(by.id("allListsView"))).toBeVisible();
  });

  it("should support creating a new list", async () => {
    await element(by.id("newListTextInput")).typeText(newListTitle);
    await element(by.id("addListButton")).tap();

    // Check that our new list was created
    await expect(element(by.text(newListTitle).withAncestor(by.id("allListsView")))).toBeVisible();
  });

  it("should support adding items to the new list", async () => {
    // Open the new list
    await element(by.id(`listButton:${newListTitle}`)).tap();

    await expect(element(by.id("viewListModal"))).toBeVisible();

    // Add a few items to the list
    await element(by.id("newItemTextInput")).typeText("Bacon");
    await element(by.id("newItemButton")).tap();

    await element(by.id("newItemTextInput")).typeText("Bread");
    await element(by.id("newItemButton")).tap();

    await element(by.id("newItemTextInput")).typeText("Eggs");
    await element(by.id("newItemButton")).tap();

    // Ensure each item has been added to the list
    await expect(element(by.id("listItem:Bacon"))).toBeVisible();
    await expect(element(by.id("listItem:Bread"))).toBeVisible();
    await expect(element(by.id("listItem:Eggs"))).toBeVisible();
    await expect(element(by.id("listItem:Something else"))).toBeNotVisible();
  });

  it("should mark an item as done", async () => {
    await element(by.id("listItem:Bread")).tap();
    // Check for the checkbox:checked accessibility label
    await expect(element(by.label("checkbox:checked").withAncestor(by.id("listItem:Bread")))).toBeVisible();
  });

  it("should delete the new list", async () => {
    await element(by.id("deleteListButton")).tap();
    await element(by.text("Yes, delete it")).tap();
  });

  it("should go back to the main list view, and the test list should be gone", async () => {
    await expect(element(by.id("allListsView"))).toBeVisible();

    await expect(element(by.text(newListTitle).withAncestor(by.id("allListsView")))).toNotExist();
  });
});
