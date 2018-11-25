describe("Add new list test", () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should have 'all lists' view visible", async () => {
    await expect(element(by.id("allListsView"))).toBeVisible();
  });
});
