/**
 * React Native SQLite Demo
 * Copyright (c) 2018-2021 Bruce Lefebvre <bruce@brucelefebvre.com>
 * https://github.com/blefebvre/react-native-sqlite-demo/blob/master/LICENSE
 */
import * as React from "react";
import { DatabaseProvider } from "../context/DatabaseContext";
import { AllLists } from "./AllLists";

// The home screen of the app, containing all the user created lists
export function HomeScreen() {
  return (
    <DatabaseProvider>
      <AllLists />
    </DatabaseProvider>
  );
}
