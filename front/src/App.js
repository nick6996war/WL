import React, { Component } from "react";
import "./App.css";
import Upload from "./upload/Upload";
import Search from './search/Search'
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="Card">
          <Upload />
        </div>
        <div className="Search">
          <Search />
        </div>
       
      </div>
    );
  }
}

export default App;
