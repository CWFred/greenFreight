import React, { Component } from "react";
import { Provider } from "react-redux";
import logo from "./logo.svg";
import "./App.css";
import store from "./store";
import ActionPane from "./components/ActionPane/actionPane";

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-title">GreenFreight</h1>
          </header>
          <ActionPane />
        </div>
      </Provider>
    );
  }
}

export default App;
