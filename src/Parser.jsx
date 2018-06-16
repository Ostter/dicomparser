import React, { Component } from "react";
import * as dicomParser from "dicom-parser";

import { dumpDataSet } from "./prs";

export default class Dicom extends Component {
  componentDidMount() {
    fetch("6632_generated.dcm")
      .then(response => response.arrayBuffer())
      .then(arrBuf => this.handleDicom(arrBuf));
  }

  handleDicom(arrBuf) {
    const dataSet = dicomParser.parseDicom(new Uint8Array(arrBuf));
    const result = this.parseDataset(dataSet);
    console.log("result", result);
  }

  parseDataset(dataSet) {
    let output = [];
    dumpDataSet(dataSet, output);
    return output;
  }

  render() {
    return <div />;
  }
}
