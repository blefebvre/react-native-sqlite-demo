const detoxLocal = require("detox");
const config = require("./package.json").detox;
const adapter = require("detox/runners/jest/adapter");

jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  await detoxLocal.init(config);
});

beforeEach(async () => {
  await adapter.beforeEach();
});

afterAll(async () => {
  await adapter.afterAll();
  await detoxLocal.cleanup();
});
