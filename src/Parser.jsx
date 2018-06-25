import React, { Component } from "react";
import * as dicomParser from "dicom-parser";

import { dumpDataSet } from "./prs";
import {coordToMatrixB,mmToPixels} from "./matrix"

export default class Dicom extends Component {
  componentDidMount() {
    fetch("RTSS.dcm")
      .then(response => response.arrayBuffer())
      .then(arrBuf => this.handleDicom(arrBuf));
  }

  handleDicom(arrBuf) {
    const dataSet = dicomParser.parseDicom(new Uint8Array(arrBuf));
    const result = this.parseDataset(dataSet);
    //test
    let index = this.getIndex(result, "1.2.840.113619.2.312.4120.8418826.10238.1389246409.981");
    let coordsContours = result[index+3].payload;
    console.log("coordsContours", coordsContours);

    let coordsContoursPixels = coordsContours.map(([x,y,z]) => {
      return mmToPixels(coordToMatrixB(x,y,z));
    });
    console.log("coordsContoursPixels", coordsContoursPixels);

  }

  parseDataset(dataSet) {
    let output = [];
    dumpDataSet(dataSet, output);
    return output;
  }

  render() {
    return <div />;
  }

  getIndex(array, search) {
    let index = 0;
    array.forEach(function(item){
      let payload = item.payload;
      if (!Array.isArray(payload)) {
        payload = payload.replace(/['"]/g, "");
        if (payload === search) {
          index =  array.indexOf(item)
        }
      }
    })
    return index
  };

}
