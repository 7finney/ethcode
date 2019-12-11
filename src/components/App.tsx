// @ts-ignore
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  clearDeployedResult
} from "../actions";
import "./App.css";
import ContractCompiled from "./ContractCompiled";
import ContractDeploy from "./ContractDeploy";
import Dropdown from "./Dropdown";
import CompilerVersionSelector from "./CompilerVersionSelector";
import TestDisplay from "./TestDisplay";
import DebugDisplay from "./DebugDisplay";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

interface IProps {
  addTestResults: (result: any) => void;
  addFinalResultCallback: (result: any) => void;
  clearFinalResult: () => void;
  setDeployedResult: (result: any) => void;
  clearDeployedResult: () => void;
  test: any;
}

interface IState {
  message: any[];
  compiled: any;
  error: Error | null;
  fileName: any;
  processMessage: string;
  availableVersions: any;
  gasEstimate: number;
  deployedResult: object;
  txTrace: object;
  tabIndex: number
}
interface IOpt {
  value: string;
  label: string;
}
// @ts-ignore
const vscode = acquireVsCodeApi(); // eslint-disable-line
class App extends Component<IProps, IState> {
  public state: IState;
  constructor(props: IProps) {
    super(props);
    this.state = {
      message: [],
      compiled: "",
      error: null,
      fileName: "",
      processMessage: "",
      availableVersions: "",
      gasEstimate: 0,
      deployedResult: {},
      txTrace: {},
      tabIndex: 1
    };
  }
  public componentDidMount() {
    window.addEventListener("message", event => {
      const { data } = event;

      if (data.compiled) {
        const compiled = JSON.parse(data.compiled);
        const newCompile = JSON.stringify(data.newCompile)

        if (newCompile) {
          this.props.clearDeployedResult()
        }

        const fileName = Object.keys(compiled.sources)[0];

        if (compiled.errors && compiled.errors.length > 0) {
          this.setState({ message: compiled.errors });
        }
        this.setState({ compiled, fileName, processMessage: "" });
      }

      if (data.processMessage) {
        const { processMessage } = data;
        this.setState({
          fileName: "",
          compiled: "",
          processMessage,
          message: []
        });
      }

      if (data.versions) {
        this.setState({
          availableVersions: data.versions.releases,
          processMessage: ""
        });
      }

      if (data.resetTestState === "resetTestState") {
        this.props.clearFinalResult();
      }

      if (data.testPanel === 'test') {
        this.setState({ tabIndex: 2 })
      }

      if (data.testPanel === 'main') {
        this.setState({ tabIndex: 0 })
      }

      if (data._testCallback) {
        const result = data._testCallback;
        this.props.addTestResults(result);
      }
      if (data._finalCallback) {
        const result = data._finalCallback;
        this.props.addFinalResultCallback(result);
        this.setState({
          processMessage: ""
        });
      }
      if (data._importFileCb) {
        return;
      }
      if(data.errors) {
        this.setState({ error: data.errors });
      }
      if(data.gasEstimate) {
        // @ts-ignore
        this.setState({ gasEstimate: data.gasEstimate });
      }
      if(data.deployedResult) {
        const result = data.deployedResult.deployedResult
        this.props.setDeployedResult(result);
        this.setState({ deployedResult: data.deployedResult.deployedResult });
      }
      if (data.txTrace) {
        this.setState({ txTrace: data.txTrace });
      }

      // TODO: handle error message
    });
  }
  public changeFile = (selectedOpt: IOpt) => {
    this.setState({ fileName: selectedOpt.value });
  };

  public getSelectedVersion = (version: any) => {
    vscode.postMessage({
      command: "version",
      version: version.value
    });
  };

  public render() {
    const {
      compiled,
      message,
      fileName,
      processMessage,
      availableVersions,
      error,
      gasEstimate,
      deployedResult,
      txTrace,
      tabIndex
    } = this.state;
    
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        { !compiled ?
          <div className="instructions">
            <p>
              <pre className="hot-keys"><b>ctrl+alt+c</b> - Compile contracts</pre>
            </p>
            <p>
              <pre className="hot-keys"><b>ctrl+alt+t</b> - Run unit tests</pre>
            </p>
          </div>
          : null
        }
        {availableVersions && (
          <CompilerVersionSelector
            getSelectedVersion={this.getSelectedVersion}
            availableVersions={availableVersions}
          />
        )}
        {compiled && Object.keys(compiled.sources).length > 0 && (
          <Dropdown
            files={Object.keys(compiled.sources)}
            changeFile={this.changeFile}
          />
        )}
        <p>
          {compiled || this.props.test.testResults.length > 0 ?
            <Tabs selectedIndex={tabIndex} onSelect={tabIndex => this.setState({ tabIndex })}>
              <TabList className="react-tabs">
                <Tab>Main</Tab>
                <Tab>Debug</Tab>
                <Tab>Test</Tab>
              </TabList>

              <TabPanel className="react-tab-panel">
                {
                  compiled && fileName && (
                    <div className="compiledOutput">
                      {
                        Object.keys(compiled.contracts[fileName]).map((contractName: string, i: number) => {
                          const bytecode = compiled.contracts[fileName][contractName].evm.bytecode.object;
                          const ContractABI = compiled.contracts[fileName][contractName].abi;
                          return (
                            <div
                              id={contractName}
                              className="contract-container"
                              key={i}
                            >
                              {
                                <ContractCompiled
                                  contractName={contractName}
                                  bytecode={bytecode}
                                  abi={ContractABI}
                                  vscode={vscode}
                                  compiled={compiled}
                                  errors={error}
                                />
                              }
                            </div>
                          )
                        }
                        )}
                    </div>
                  )
                }
                {
                  compiled && fileName && (
                    <div className="compiledOutput">
                      {
                        Object.keys(compiled.contracts[fileName]).map((contractName: string, i: number) => {
                          const bytecode = compiled.contracts[fileName][contractName].evm.bytecode.object;
                          const ContractABI = compiled.contracts[fileName][contractName].abi;
                          return (
                            <div
                              id={contractName}
                              className="contract-container"
                              key={i}
                            >
                              {
                                <ContractDeploy
                                  contractName={contractName}
                                  bytecode={bytecode}
                                  abi={ContractABI}
                                  vscode={vscode}
                                  compiled={compiled}
                                  error={error}
                                  gasEstimate={gasEstimate}
                                  deployedResult={deployedResult}
                                />
                              }
                            </div>
                          );
                        })
                      }
                    </div>
                  )
                }
              </TabPanel>
              <TabPanel className="react-tab-panel">
                {compiled ? <DebugDisplay deployedResult={deployedResult} vscode={vscode} txTrace={txTrace} /> : null}
              </TabPanel>
              <TabPanel className="react-tab-panel">
                {this.props.test.testResults.length > 0 ? <TestDisplay /> : 'No contracts to test'}
              </TabPanel>
            </Tabs>: null }
          <div className="err_warning_container">
            {message.map((m, i) => {
              return (
                <div key={i}>
                  {m.severity === "warning" && (
                    <pre className="error-message yellow-text">
                      {m.formattedMessage}
                    </pre>
                  )}
                  {m.severity === "error" && (
                    <pre className="error-message red-text">
                      {m.formattedMessage}
                    </pre>
                  )}
                  {!m.severity && (
                    <pre className="error-message">{m.formattedMessage}</pre>
                  )}
                </div>
              );
            })}{" "}
          </div>
        </p>
        <pre className="processMessage">{processMessage}</pre>
      </div>
    );
  }
}

function mapStateToProps({ test }: any) {
  return {
    test,
  };
}

export default connect(
  mapStateToProps,
  { addTestResults, addFinalResultCallback, clearFinalResult, setDeployedResult, clearDeployedResult }
)(App);
