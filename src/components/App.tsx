// @ts-ignore
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  clearDeployedResult,
  setCallResult
} from "../actions";
import "./App.css";
import ContractCompiled from "./ContractCompiled";
import ContractDeploy from "./ContractDeploy";
import Dropdown from "./Dropdown";
import CompilerVersionSelector from "./CompilerVersionSelector";
import ContractSelector from "./ContractSelector";
import TestDisplay from "./TestDisplay";
import DebugDisplay from "./DebugDisplay";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import AccountsSelector from "./AccountsSelector";

interface IProps {
  addTestResults: (result: any) => void;
  addFinalResultCallback: (result: any) => void;
  clearFinalResult: () => void;
  setDeployedResult: (result: any) => void;
  clearDeployedResult: () => void;
  setCallResult: (result: any) => void;
  test: any;
}

interface IState {
  message: any[];
  compiled: any;
  error: Error | null;
  fileName: any;
  contractName: any;
  processMessage: string;
  availableVersions: any;
  gasEstimate: number;
  deployedResult: string;
  tabIndex: number,
  txTrace: object;
  accounts: string[];
  currAccount: string;
  balance: number;
  transactionResult: string;
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
      contractName: "",
      processMessage: "",
      availableVersions: "",
      gasEstimate: 0,
      deployedResult: "",
      tabIndex: 0,
      txTrace: {},
      accounts: [],
      currAccount: "",
      balance: 0,
      transactionResult: ""
    };
    this.handleTransactionSubmit = this.handleTransactionSubmit.bind(this);
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
      if(data.callResult) {
        const result = data.callResult;
        this.props.setCallResult(result);
      }
      if (data.fetchAccounts) {
        console.log("fetchAcc:")
        console.dir(JSON.stringify(data.fetchAccounts));
        console.log("currAcc:")
        console.dir(JSON.stringify(data.fetchAccounts.accounts[0]));
        console.log("balance:")
        console.dir(JSON.stringify(data.fetchAccounts.balance));
        this.setState({ accounts: data.fetchAccounts.accounts, currAccount: data.fetchAccounts.accounts[0], balance: data.fetchAccounts.balance });
      }
      if(data.transactionResult) {
        this.setState({ transactionResult: data.transactionResult });
      }
      if(data.balance) {
        this.setState({ balance: data.balance });
      }

      // TODO: handle error message
    });
  }
  private handleTransactionSubmit(event: any) {
    event.preventDefault();
    const { currAccount } = this.state;
    const data = new FormData(event.target);
    const transactionInfo = {
      fromAddress: currAccount,
      toAddress: data.get("toAddress"),
      amount: data.get("amount")
    };
    try {
     vscode.postMessage({
      command: "send-ether",
      payload: transactionInfo
     });
    } catch (err) {
     this.setState({ error: err });
    }
  }
  public changeFile = (selectedOpt: IOpt) => {
    this.setState({ fileName: selectedOpt.value });
  };

  public changeContract = (selectedOpt: IOpt) => {
    this.setState({ contractName: selectedOpt.value })
  }

  public getSelectedVersion = (version: any) => {
    vscode.postMessage({
      command: "version",
      version: version.value
    });
  };
  
  public getSelectedAccount = (account: any) => {
    this.setState({ currAccount: account });
    vscode.postMessage({
      command: 'get-balance',
      account: account
    });
  }

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
      tabIndex,
      contractName,
      txTrace,
      currAccount,
      transactionResult,
      accounts,
      balance
    } = this.state;

    console.log("currAccount");
    console.log(JSON.stringify(currAccount));

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        {availableVersions && (
          <CompilerVersionSelector
            getSelectedVersion={this.getSelectedVersion}
            availableVersions={availableVersions}
          />
        )}
        {accounts && (
          <div>
            <AccountsSelector
              availableAccounts={accounts}
              getSelectedAccount={this.getSelectedAccount}
            />
            <div className="account_balance">
              <label>Account Balance:</label>
              <pre>{balance}</pre>
            </div>
          </div>
        )}
        {compiled && Object.keys(compiled.sources).length > 0 && (
          <Dropdown
            files={Object.keys(compiled.sources)}
            changeFile={this.changeFile}
          />
        )}
        {
          <form onSubmit={this.handleTransactionSubmit}>
            <input type="text" name="fromAddress" value={currAccount} placeholder="fromAddress"/>
            <input type="text" name="toAddress" placeholder="toAddress"/>
            <input type="text" name="amount" placeholder="wei_value"/>
            <input type="submit" value="Send"/>
          </form>
        }
        {
          transactionResult &&
          <div>
            <pre>{transactionResult}</pre>
          </div>
        }
        <p>
          <Tabs selectedIndex={tabIndex} onSelect={tabIndex => this.setState({ tabIndex })} selectedTabClassName="react-tabs__tab--selected">
            <TabList className="react-tabs tab-padding">
              <div className="tab-container">
                <Tab>Main</Tab>
                <Tab>Debug</Tab>
                <Tab>Test</Tab>
              </div>
            </TabList>

            <TabPanel className="react-tab-panel">
              {
                !compiled ?
                <div className="instructions">
                  <p>
                    <pre className="hot-keys"><b>ctrl+alt+c</b> - Compile contracts</pre>
                  </p>
                  <p>
                    <pre className="hot-keys"><b>ctrl+alt+t</b> - Run unit tests</pre>
                  </p>
                </div> : null
              }
              {
                (compiled && fileName) &&
                <div className="container-margin">
                  <div className="contractSelect_container">
                    <ContractSelector
                      contractName={Object.keys(compiled.contracts[fileName]).map((contractName: string) => contractName)}
                      changeContract={this.changeContract}
                    />
                  </div>
                </div>
              }
              { contractName &&
                <div className="compiledOutput">
                  <div id={contractName} className="contract-container">
                    {
                      <ContractCompiled
                        contractName={contractName}
                        bytecode={compiled.contracts[fileName][contractName].evm.bytecode.object}
                        abi={compiled.contracts[fileName][contractName].abi}
                        vscode={vscode}
                        compiled={compiled}
                        errors={error}
                      />
                    }
                    {
                      <ContractDeploy
                        contractName={contractName}
                        bytecode={compiled.contracts[fileName][contractName].evm.bytecode.object}
                        abi={compiled.contracts[fileName][contractName].abi}
                        vscode={vscode}
                        compiled={compiled}
                        error={error}
                        gasEstimate={gasEstimate}
                        deployedResult={deployedResult}
                      />
                    }
                  </div>
                </div>  }
            </TabPanel>
            <TabPanel className="react-tab-panel">
              <DebugDisplay deployedResult={deployedResult} vscode={vscode} txTrace={txTrace} />
            </TabPanel>
            <TabPanel className="react-tab-panel">
              {this.props.test.testResults.length > 0 ? <TestDisplay /> : 'No contracts to test'}
            </TabPanel>
          </Tabs>
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
        {
          processMessage &&
          <pre className="processMessage">{processMessage}</pre>
        }
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
  { addTestResults, addFinalResultCallback, clearFinalResult, setDeployedResult, clearDeployedResult, setCallResult }
)(App);
