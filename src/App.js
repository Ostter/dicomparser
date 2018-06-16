import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import Dicom from './Parser'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Dicom/>
      </div>
    );
  }
}

export default App;
