# React Native SQLite Demo

This project is a basic List application that demonstrates building an offline first app with SQLite and React Native (featuring TypeScript and CocoaPods under the hood). These instructions only cover iOS usage at this time.


## Install JS dependencies

    npm install


## Install iOS dependencies (requires [Cocoapods](https://cocoapods.org/))

    pushd ios/
    pod install
    popd


## Compile TypeScript source in watch mode

    npm run tsc -- -w


## Run the Jest tests in watch mode

    npm test -- --watch


## Open the source in VS Code

    code .


## Run (and debug) on an iOS simulator

With the "React Native Tools" VSCode extension installed, open the Debug tab and press the "Play" button with "Debug iOS" selected in the dropdown.

When the simulator opens, press Command-D to open the developer menu. Tap "Debug JS Remotely" to connect VSCode to the app and enable debugging.


## E2E Testing with Detox

End-to-end testing happens from within the `e2e/` directory:

    cd e2e/
    npm install


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
