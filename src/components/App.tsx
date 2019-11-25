// @ts-ignore
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult
} from "../actions";
import "./App.css";
import ContractCompiled from "./ContractCompiled";
import Dropdown from "./Dropdown";
import CompilerVersionSelector from "./CompilerVersionSelector";
import TestDisplay from "./TestDisplay";

interface IProps {
  addTestResults: (result: any) => void;
  addFinalResultCallback: (result: any) => void;
  clearFinalResult: () => void;
  test: any;
}

interface IState {
  message: any[];
  compiled: any;
  error: Error | null;
  fileName: any;
  processMessage: string;
  availableVersions: any;
}
interface IOpt {
  value: string;
  label: string;
}
// @ts-ignore
const vscode = acquireVsCodeApi(); // eslint-disable-line
class App extends Component<IProps, IState> {
  public state: IState;
  // public props: IProps;

  constructor(props: IProps) {
    super(props);
    this.state = {
      message: [],
      compiled: "",
      error: null,
      fileName: "",
      processMessage: "",
      availableVersions: ""
    };
  }
  public componentDidMount() {
    window.addEventListener("message", event => {
      const { data } = event;

      if (data.compiled) {
        const compiled = JSON.parse(data.compiled);
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
        const result = data.result;
      }
      if(data.errors) {
        this.setState({ error: data.errors });
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
      error
    } = this.state;
    
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        <div className="instructions">
          <p>
            <pre className="hot-keys">ctrl+alt+c</pre> - Compile contracts
          </p>
          <p>
            <pre className="hot-keys">ctrl+alt+t</pre> - Run unit tests
          </p>
        </div>
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
        {this.props.test.testResults.length > 0 && <TestDisplay />}
        <p>
          {compiled && fileName && (
            <div className="compiledOutput">
              {Object.keys(compiled.contracts[fileName]).map(
                (contractName: string, i: number) => {
                  const bytecode =
                    compiled.contracts[fileName][contractName].evm.bytecode
                      .object;
                  const ContractABI =
                    compiled.contracts[fileName][contractName].abi;
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
                  );
                }
              )}
            </div>
          )}
        </p>
        <pre className="processMessage">{processMessage}</pre>
      </div>
    );
  }
}

function mapStateToProps({ test }: any) {
  return {
    test
  };
}

export default connect(
  mapStateToProps,
  { addTestResults, addFinalResultCallback, clearFinalResult }
)(App);
