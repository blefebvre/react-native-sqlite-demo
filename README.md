# React Native SQLite + Dropbox sync demo

This project is a basic List application that demonstrates building an offline first app with SQLite and React Native (featuring TypeScript and CocoaPods under the hood). Once authorized, the database can be synced between multiple iOS devices using Dropbox. 

These instructions cover iOS and macOS usage at this time.


## Install JS dependencies

    npm install


## Install iOS dependencies (requires [Cocoapods](https://cocoapods.org/))

    pushd ios/
    pod install
    popd


## Install macOS dependencies

    pushd macos/
    pod install
    popd


## Start the React Native Metro Bundler

    npm run start:macos


## Run (and debug) on the iOS simulator

With the "React Native Tools" VSCode extension installed, open the Debug tab and press the "Play" button with "Debug iOS" selected in the dropdown.

When the simulator opens, press Command-D to open the developer menu. Tap "Debug JS Remotely" to connect VSCode to the app and enable debugging.

Alternatively: 

    open ios/RNSQLiteDemo.xcworkspace

Select a simulator of your choice. Press the "run" button.

## Run on the macOS simulator

Open the macOS Xcode project:

    open macos/RNSQLiteDemo.xcworkspace/

Select `My Mac` as the "active scheme". Press the "Build and then run" (Play) button.


## Types and testing

### Compile TypeScript source in watch mode

    npm run tsc -- -w


### Run the Jest unit tests

    npm test


### E2E Testing with Detox on iOS

End-to-end testing happens from within the `e2e/` directory:

    cd e2e/
    npm install


#### Build E2E tests

    npm run test:e2e:build


#### Run E2E tests

    npm run test:e2e


#### Run tests without reinstalling onto the Simulator

Details on this workflow can be [found here](https://github.com/wix/Detox/blob/master/docs/Guide.DevelopingWhileWritingTests.md):

    npm run test:e2e:reuse


## Troubleshooting

#### Run Metro Bundler and clear it's cache

    npm start -- --reset-cache
