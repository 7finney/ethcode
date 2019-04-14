// @ts-ignore
import React, { Component } from 'react';
import './App.css';

import logo from './logo.svg';

type IProps = any
interface IState {
  message: string
}
// @ts-ignore
const vscode = acquireVsCodeApi();
class App extends Component<IProps, IState> {
  public state: IState
  public props: IProps

  constructor(props: IProps) {
    super(props)
    this.state = {
      message: ''
    }
  }
  public componentDidMount() {
    window.addEventListener('message', event => {
      const message = event.data;
      this.setState({ message: JSON.stringify(message) })
    });
  }
  public render() {
    const { message } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to ETHcode</h1>
        </header>
        <p className="App-intro">
          Your compiled contracts should appear here.
        </p>
        <pre>
          {
            message
          }
        </pre>
      </div>
    );
  }
}

export default App;
