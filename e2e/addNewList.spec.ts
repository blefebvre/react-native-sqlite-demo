describe("Add new list test", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should have 'all lists' view visible", async () => {
    const newListTitle = `Test list (time ${Date.now()})`;

    await expect(element(by.id("allListsView"))).toBeVisible();
    await element(by.id("newItemTextInput")).typeText(newListTitle);
    await element(by.id("addListButton")).tap();

    // Check that our new list was created
    await expect(
      element(by.text(newListTitle).withAncestor(by.id("allListsView")))
    ).toBeVisible();
  });
});
