import {cleanup, init} from "detox";
import * as adapter from "detox/runners/jest/adapter";

const config = require("./package.json").detox;

jest.setTimeout(120000);
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
  await init(config, {initGlobals: false});
});

afterAll(async () => {
  await cleanup();
});
