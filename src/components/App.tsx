// @ts-ignore
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  clearDeployedResult,
  setCallResult,
  setAccountBalance,
  setCurrAccChange,
  setTestNetId
} from "../actions";
import "./App.css";

import { solidityVersion, setSelectorOption, setFileSelectorOptions, setLocalAccountOption } from '../helper';

import ContractCompiled from "./ContractCompiled";
import ContractDeploy from "./ContractDeploy";
import Selector from './Selector';
import TestDisplay from "./TestDisplay";
import DebugDisplay from "./DebugDisplay";

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Account from "./Account/Account";

interface IProps {
  addTestResults: (result: any) => void;
  addFinalResultCallback: (result: any) => void;
  clearFinalResult: () => void;
  setDeployedResult: (result: any) => void;
  clearDeployedResult: () => void;
  setCallResult: (result: any) => void;
  setAccountBalance: (accData: any) => void;
  setCurrAccChange: (accData: any) => void;
  setTestNetId: (testNetId: any) => void;
  test: any;
  accountBalance: number,
  accounts: string[],
  currAccount: string,
  testNetId: string
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
  traceError: string;
  accounts: string[];
  currAccount: string;
  balance: number;
  transactionResult: string;
  testNetId: string;
  fileType: string;
  selctorAccounts: any;
  contracts: any;
  files: any;
  accountName: IOpt;
  testNets: object[];
  localAcc: any[],
  testNetAcc: any[]
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
      compiled: '',
      error: null,
      fileName: '',
      contractName: '',
      processMessage: '',
      availableVersions: '',
      gasEstimate: 0,
      deployedResult: '',
      tabIndex: 0,
      txTrace: {},
      accounts: [],
      selctorAccounts: [],
      contracts: [],
      files: [],
      currAccount: '',
      balance: 0,
      transactionResult: '',
      testNetId: '',
      fileType: '',
      traceError: '',
      accountName: {
        label: '',
        value: ''
      },
      localAcc: [],
      testNetAcc: [],
      testNets: [
        { value: 'ganache', label: 'Ganache' },
        { value: '3', label: 'Ropsten' },
        { value: '4', label: 'Rinkeby' },
        { value: '5', label: "Görli" }
      ]
    };
  }
  public componentDidMount() {
    window.addEventListener("message", async event => {
      const { data } = event;

      if (data.fileType) {
        this.setState({
          fileType: data.fileType
        });
      }
      if (data.localAccounts) {
        this.setState({ localAcc: setLocalAccountOption(data.localAccounts) }, () => { this.mergeAccount() });
      }

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
        var contractsArray = setSelectorOption(Object.keys(compiled.contracts[fileName]));
        var files = setFileSelectorOptions(Object.keys(compiled.sources))
        this.setState({
          compiled,
          fileName,
          processMessage: "",
          contractName: Object.keys(compiled.contracts[fileName])[0],
          contracts: contractsArray,
          files
        });
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
        var options = solidityVersion(data.versions.releases)
        this.setState({
          availableVersions: options,
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
      if (data.errors) {
        this.setState({ error: data.errors });
      }
      if (data.gasEstimate) {
        // @ts-ignore
        this.setState({ gasEstimate: data.gasEstimate });
      }
      if (data.deployedResult) {
        const result = data.deployedResult.deployedResult
        this.props.setDeployedResult(result);
        this.setState({ deployedResult: data.deployedResult.deployedResult });
      }
      if (data.txTrace) {
        this.setState({ txTrace: data.txTrace });
      }
      if (data.traceError) {
        this.setState({ traceError: data.traceError });
      }
      if (data.callResult) {
        const result = data.callResult;
        this.props.setCallResult(result);
      }
      if (data.fetchAccounts) {
        const balance = data.fetchAccounts.balance
        const currAccount = data.fetchAccounts.accounts[0]
        const accounts = data.fetchAccounts.accounts
        this.setState({
          testNetAcc: setSelectorOption(accounts)
        }, () => {
          this.mergeAccount();
        })
        const accData = {
          balance,
          currAccount,
          accounts
        }
        await this.props.setAccountBalance(accData)
        this.setState({ accounts: this.props.accounts, currAccount: this.props.currAccount, balance: this.props.accountBalance });
      }
      if (data.transactionResult) {
        this.setState({ transactionResult: data.transactionResult });
      }
      if (data.balance) {
        const accData = {
          balance: data.balance,
          currAccount: this.state.currAccount
        }
        this.props.setCurrAccChange(accData)
        this.setState({ balance: this.props.accountBalance });
      }
    });
    // TODO: handle error message
    // Component mounted start getting gRPC things
    vscode.postMessage({
      command: "run-getAccounts"
    });
    vscode.postMessage({
      command: "get-localAccounts"
    });
  }

  mergeAccount = () => {
    const { localAcc, testNetAcc } = this.state;

    // merge local accounts and test net accounts
    if (localAcc.length > 0 && testNetAcc.length > 0) {
      this.setState({
        selctorAccounts: [
          {
            label: 'Ganache',
            options: testNetAcc
          }, {
            label: 'Local Accounts',
            options: localAcc
          }
        ]
      })
    } else if (localAcc.length > 0) {
      this.setState({
        selctorAccounts: [{
          label: 'Local Accounts',
          options: localAcc
        }]
      })
    } else if (testNetAcc.length > 0) {
      this.setState({
        selctorAccounts: [{
          label: 'Ganache',
          options: testNetAcc
        }]
      })
    } else {
      this.setState({ selctorAccounts: [] })
    }
  }

  componentDidUpdate(_: any) {
    if (this.props.accounts !== this.state.accounts) {
      this.setState({
        accounts: this.props.accounts
      })
    }

    if (this.props.testNetId !== this.state.testNetId) {
      this.setState({
        testNetId: this.props.testNetId
      });
    }
  }

  public changeFile = (selectedOpt: IOpt) => {
    this.setState({ fileName: selectedOpt.value }, () => {
      this.changeContract({
        value: `${Object.keys(this.state.compiled.contracts[this.state.fileName])[0]}`,
        label: `${Object.keys(this.state.compiled.contracts[this.state.fileName])[0]}`
      })
      this.setState((preState: IState) => ({
        contracts: setSelectorOption(Object.keys(preState.compiled.contracts[preState.fileName]))
      }))
    });
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

  public getSelectedNetwork = (testNet: any) => {
    this.setState({ testNetId: testNet.value }, () => {
      this.props.setTestNetId(this.state.testNetId);
    });
  }

  public getSelectedAccount = (account: any) => {
    this.setState({ currAccount: account.value, accountName: account });
    vscode.postMessage({
      command: 'get-balance',
      account: account.label
    });
  }

  public handelChangeFromAddress = (event: any) => {
    this.setState({ currAccount: event.target.value })
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
      traceError,
      currAccount,
      transactionResult,
      accounts,
      balance,
      testNetId,
      fileType,
      selctorAccounts,
      contracts,
      files,
      accountName,
      testNets,
      testNetAcc
    } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        {availableVersions && (fileType === 'solidity') && (
          <Selector
            getSelectedOption={this.getSelectedVersion}
            options={availableVersions}
            placeholder='Select Compiler Version'
            defaultValue={availableVersions[0]}
          />
        )}
        {
          <Selector
            getSelectedOption={this.getSelectedNetwork}
            options={testNets}
            placeholder='Select Network'
            defaultValue={testNets[0]}
          />
        }
        {compiled && Object.keys(compiled.sources).length > 0 && (
          <Selector
            options={files}
            getSelectedOption={this.changeFile}
            placeholder='Select Files'
            defaultValue={files[0]}
          />
        )}
        {
          transactionResult &&
          <div className="tx-info">
            <span>Last transaction:</span><pre>{transactionResult}</pre>
          </div>
        }
        <p>
          <Tabs selectedIndex={tabIndex} onSelect={tabIndex => this.setState({ tabIndex })} selectedTabClassName="react-tabs__tab--selected">
            <TabList className="react-tabs tab-padding">
              <div className="tab-container">
                <Tab>Main</Tab>
                <Tab>Account</Tab>
                <Tab>Debug</Tab>
                <Tab>Test</Tab>
              </div>
            </TabList>
            {/* Main panel */}
            <TabPanel className="react-tab-panel">
              {!compiled ?
                <div className="instructions">
                  <p>
                    <pre className="hot-keys"><b>ctrl+alt+c</b> - Compile contracts</pre>
                  </p>
                  <p>
                    <pre className="hot-keys"><b>ctrl+alt+t</b> - Run unit tests</pre>
                  </p>
                </div> : null
              }
              {accounts.length > 0 && (
                <div className="account-brief">
                  <b>Account: </b><span>{ accountName && accountName.label ? accountName.label : accounts[0] }</span>
                  <br/>
                  <b>Balance: </b><span>{ balance }</span>
                </div>
              )}
              {
                (compiled && fileName) &&
                <div className="container-margin">
                  <div className="contractSelect_container">
                    <Selector
                      options={contracts}
                      getSelectedOption={this.changeContract}
                      placeholder='Select Contract'
                    />
                  </div>
                </div>
              }
              {(compiled && contractName && compiled.contracts[fileName][contractName]) &&
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
                        deployAccount={currAccount}
                        testNetId={testNetId}
                      />
                    }
                  </div>
                </div>}
            </TabPanel>
            {/* Account Panel */}
            <TabPanel>
              <Account
                vscode={vscode}
                defaultValue={(accountName && accountName.label) ? accountName : testNetAcc[0]}
                accounts={selctorAccounts}
                getSelectedAccount={this.getSelectedAccount}
                accBalance={balance}
              />
            </TabPanel>
            {/* Debug panel */}
            <TabPanel className="react-tab-panel">
              <DebugDisplay deployedResult={deployedResult} vscode={vscode} testNetId={testNetId} txTrace={txTrace} traceError={traceError} />
            </TabPanel>
            {/* Test panel */}
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

function mapStateToProps({ test, accountStore, debugStore }: any) {
  const { accountBalance, accounts, currAccount } = accountStore
  const { testNetId } = debugStore
  return {
    accountBalance,
    accounts,
    currAccount,
    test,
    testNetId
  };
}

export default connect(mapStateToProps, {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  setAccountBalance,
  setTestNetId,
  setCurrAccChange,
  clearDeployedResult,
  setCallResult
})(App);
