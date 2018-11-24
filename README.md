# React Native SQLite Demo

This project is a basic List application that demonstrates building an offline first app with SQLite and React Native (featuring TypeScript and CocoaPods under the hood). These instructions only cover iOS usage at this time.

## Install dependencies

    npm install

## Compile TypeScript source in watch mode

    npm run tsc -- -w

## Run the Jest tests in watch mode

    npm test -- --watch

## Open the source in VS Code

    code .

## Open the Xcode project

    open ios/RNSQLiteDemo.xcworkspace/

## Run it on an iOS sim

Press "Play" button in Xcode.


## E2E Testing with Detox

#### Build tests

    npm run test:e2e:build

#### Run tests

    npm run test:e2e

#### Run tests without reinstalling onto the Simulator

Details on this workflow can be [found here](https://github.com/wix/Detox/blob/master/docs/Guide.DevelopingWhileWritingTests.md):

    npm run test:e2e:reuse

## Troubleshooting

#### Run Metro Bundler and clear it's cache

    npm start -- --reset-cache
