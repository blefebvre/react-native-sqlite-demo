import React, { Component } from "react";
import { Checkbox } from "../src/components/Checkbox";

export default class CheckboxTest extends Component {
  public render() {
    return <Checkbox checked={false} />;
  }
}
