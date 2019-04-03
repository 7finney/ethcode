// @ts-ignore
import React, { Component } from 'react';
import './App.css';

import logo from './logo.svg';

type IProps = any
// @ts-ignore
const vscode = acquireVsCodeApi();
class App extends Component<IProps> {
  constructor(props: IProps) {
    super(props)
  }
  public componentDidMount() {
    window.addEventListener('message', event => {
      const message = event.data;
      console.log(JSON.stringify(message));
    });
  }
  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to ETHcode</h1>
        </header>
        <p className="App-intro">
          Your compiled contracts should appear here.
        </p>
      </div>
    );
  }
}

export default App;
