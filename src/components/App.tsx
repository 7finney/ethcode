/* eslint-disable no-unused-vars */
// @ts-ignore
import React, { Component, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  clearDeployedResult,
  setCallResult,
  setAccountBalance,
  setCurrAccChange,
  setTestNetId,
} from "../actions";
import "./App.css";

import {
  solidityVersion,
  setSelectorOption,
  setFileSelectorOptions,
  setGanacheAccountsOption,
  setLocalAccountOption,
} from "../helper";

import ContractCompiled from "./ContractCompiled";
import ContractDeploy from "./ContractDeploy";
import { Selector } from "./common/ui";
import TestDisplay from "./TestDisplay";
import DebugDisplay from "./DebugDisplay";
import Deploy from "./Deploy/Deploy";
import "react-tabs/style/react-tabs.css";
import Account from "./Account/Account";
import { IAccount, SolcVersionType } from "../types";

interface IProps {
  // eslint-disable-next-line no-unused-vars
  addTestResults: (result: any) => void;
  // eslint-disable-next-line no-unused-vars
  addFinalResultCallback: (result: any) => void;
  clearFinalResult: () => void;
  // eslint-disable-next-line no-unused-vars
  setDeployedResult: (result: any) => void;
  setCallResult: (result: any) => void;
  setAccountBalance: (accData: any) => void;
  setCurrAccChange: (accData: any) => void;
  setTestNetId: (testNetId: any) => void;
  accountBalance: number;
  accounts: string[];
  currAccount: IAccount;
  testNetId: string;
  // test: any;
}

interface IOpt {
  value: string;
  label: string;
}
// @ts-ignore
const vscode = acquireVsCodeApi(); // eslint-disable-line
const App = (props: IProps) => {
  const [message, setMessage] = useState<any[]>([]);
  const [compiled, setCompiled] = useState<any>({});
  const [error, setError] = useState<Error | null>(null);
  const [fileName, setFileName] = useState<any>("");
  const [contractName, setContractName] = useState<any>("");
  const [processMessage, setProcessMessage] = useState("");
  const [availableVersions, setAvailableVersions] = useState<SolcVersionType[]>([]);
  const [gasEstimate, setGasEstimate] = useState(0);
  const [deployedResult, setDeployedResult] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [txTrace, setTxTrace] = useState({});
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selctorAccounts, setSelctorAccounts] = useState<IAccount[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [currAccount, setCurrAccount] = useState<IAccount>();
  const [balance, setBalance] = useState(0);
  const [transactionResult, setTransactionResult] = useState("");
  const [testNetId, setTestNetId] = useState("");
  const [fileType, setFileType] = useState("");
  const [traceError, setTraceError] = useState("");
  const [accountName, setAccountName] = useState<IAccount>({
    label: "",
    value: [""],
  });
  const [localAcc, setLocalAcc] = useState<any[]>([]);
  const [testNetAcc, setTestNetAcc] = useState<any[]>([]);
  const [testNets, setTestNets] = useState([
    { value: "ganache", label: "Ganache" },
    // { value: '3', label: 'Ropsten' },
    // { value: '4', label: 'Rinkeby' },
    { value: "5", label: "Görli" },
  ]);
  const [appRegistered, setAppRegistered] = useState(false);

  const mergeAccount = () => {
    // merge and set accounts store
    // TODO: update reducer
    // merge local accounts and test net accounts
    if (localAcc.length > 0 && testNetAcc.length > 0) {
      setSelctorAccounts([
        {
          label: "Ganache",
          value: testNetAcc,
        },
        {
          label: "Local Accounts",
          value: localAcc,
        },
      ]);
    } else if (localAcc.length > 0) {
      setSelctorAccounts([
        {
          label: "Local Accounts",
          value: localAcc,
        },
      ]);
    } else if (testNetAcc.length > 0) {
      setSelctorAccounts([
        {
          label: "Ganache",
          value: testNetAcc,
        },
      ]);
    } else {
      setSelctorAccounts([]);
    }
  };

  useEffect(() => {
    window.addEventListener("message", async (event) => {
      const { data } = event;

      if (data.fileType) {
        setFileType(data.fileType);
      }
      if (data.localAccounts) {
        setLocalAcc(setLocalAccountOption(data.localAccounts));
        mergeAccount();
      }
      if (data.compiled) {
        const compiled = JSON.parse(data.compiled);
        if (compiled.errors && compiled.errors.length > 0) {
          setMessage(compiled.errors);
        } else if (!compiled.errors) {
          setMessage([]);
          setProcessMessage("");
        }
        const fileName = Object.keys(compiled.sources)[0];
        const contractsArray = setSelectorOption(Object.keys(compiled.contracts[fileName]));
        const files = setFileSelectorOptions(Object.keys(compiled.sources));
        setCompiled(compiled);
        setFileName(fileName);
        setProcessMessage("");
        setContractName(Object.keys(compiled.contracts[fileName])[0]);
        setContracts(contractsArray);
        setFiles(files);
      }
      if (data.processMessage) {
        const { processMessage } = data;
        setProcessMessage(processMessage);
      }
      if (data.versions) {
        const options = solidityVersion(data.versions.releases, data.versions.latestRelease);
        setAvailableVersions(options);
        setProcessMessage("");
      }

      if (data.resetTestState === "resetTestState") {
        props.clearFinalResult();
      }

      if (data.testPanel === "test") {
        setTabIndex(4);
      }

      if (data.testPanel === "main") {
        setTabIndex(0);
      }

      if (data._testCallback) {
        const result = data._testCallback;
        props.addTestResults(result);
      }
      if (data._finalCallback) {
        const result = data._finalCallback;
        props.addFinalResultCallback(result);
        setProcessMessage("");
      }
      if (data._importFileCb) {
        return;
      }
      if (data.errors) {
        setError(data.errors);
      }
      if (data.gasEstimate) {
        setGasEstimate(data.gasEstimate);
      }
      if (data.deployedResult) {
        const result = data.deployedResult.deployedResult;
        props.setDeployedResult(result);
        setDeployedResult(data.deployedResult.deployedResult);
      }
      if (data.txTrace) {
        setTxTrace(data.txTrace);
      }
      if (data.traceError) {
        setTraceError(data.traceError);
      }
      if (data.callResult) {
        const result = data.callResult;
        props.setCallResult(result);
      }
      if (data.fetchAccounts) {
        const { balance } = data.fetchAccounts;
        const { accounts } = data.fetchAccounts;
        setTestNetAcc(setGanacheAccountsOption(accounts));
        mergeAccount();
        const accData = {
          balance,
          currAccount: testNetAcc[0],
          accounts,
        };
        await props.setAccountBalance(accData);
        setAccounts(props.accounts);
        setCurrAccount(props.currAccount);
        setBalance(props.accountBalance);
      }
      if (data.transactionResult) {
        setTransactionResult(data.transactionResult);
      }
      if (data.balance) {
        const { balance, account } = data;
        props.setCurrAccChange({ balance, currAccount: account });
        setBalance(props.accountBalance);
      }
      if (data.registered) {
        setAppRegistered(data.registered);
      }
    });
    // Component mounted start getting gRPC things
    vscode.postMessage({ command: "run-getAccounts" });
    vscode.postMessage({ command: "get-localAccounts" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useState(() => {
    if (props.accounts !== accounts) {
      setAccounts(props.accounts);
    }

    if (props.testNetId !== testNetId) {
      setTestNetId(props.testNetId);
    }
  });

  const changeContract = (selectedOpt: IOpt) => {
    setContractName(selectedOpt.value);
  };

  const changeFile = (selectedOpt: IOpt) => {
    setFileName(selectedOpt.value);
    changeContract({
      value: `${Object.keys(compiled.contracts[fileName])[0]}`,
      label: `${Object.keys(compiled.contracts[fileName])[0]}`,
    });
    setContracts(setSelectorOption(Object.keys(compiled.contracts[fileName])));
  };

  const getSelectedVersion = (version: any) => {
    vscode.postMessage({
      command: "version",
      version: version.value,
    });
  };

  const getSelectedNetwork = (testNet: any) => {
    setTestNetId(testNet.value);

    props.setTestNetId(testNetId);
    // TODO: Fetch Account Balance
    vscode.postMessage({
      command: "get-balance",
      account: currAccount,
      testNetId,
    });
  };

  const getSelectedAccount = (account: IAccount) => {
    setCurrAccount(account);
    setAccountName(account);
    vscode.postMessage({
      command: "get-balance",
      account,
      testNetId,
    });
  };

  const handelChangeFromAddress = (event: any) => {
    setCurrAccount(event.target.value);
  };

  const handleAppRegister = () => {
    vscode.postMessage({
      command: "app-register",
    });
  };

  const openAdvanceDeploy = () => {
    setTabIndex(2);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">ETHcode</h1>
      </header>
      <div className="selectors">
        {/* quick fix solidity version selector bug */}
        {availableVersions && fileType !== "vyper" && (
          <Selector
            getSelectedOption={getSelectedVersion}
            options={availableVersions}
            placeholder="Select Compiler Version"
            defaultValue={availableVersions[0]}
          />
        )}
        <Selector
          getSelectedOption={getSelectedNetwork}
          options={testNets}
          placeholder="Select Network"
          defaultValue={testNets[0]}
        />
        {compiled && Object.keys(compiled.sources).length > 0 && (
          <Selector options={files} getSelectedOption={changeFile} placeholder="Select Files" defaultValue={files[0]} />
        )}
      </div>
      {transactionResult && (
        <div className="tx-info">
          <span>Last transaction:</span>
          <pre>{transactionResult}</pre>
        </div>
      )}
      <div className="tabs-container">
        <Tabs
          selectedIndex={tabIndex}
          onSelect={(tabIndex) => setTabIndex(tabIndex)}
          selectedTabClassName="react-tabs__tab--selected"
        >
          <TabList className="react-tabs tab-padding">
            <div className="tab-container">
              <Tab>Main</Tab>
              <Tab>Account</Tab>
              {compiled && fileName ? <Tab>Deploy</Tab> : <Tab disabled>Deploy</Tab>}
              <Tab>Debug</Tab>
              <Tab>Test</Tab>
            </div>
          </TabList>
          {/* Main panel */}
          <TabPanel className="react-tab-panel">
            {!compiled ? (
              <div className="instructions">
                <p>
                  <pre className="hot-keys">
                    <b>ctrl+alt+c</b> - Compile contracts
                  </pre>
                </p>
                <p>
                  <pre className="hot-keys">
                    <b>ctrl+alt+t</b> - Run unit tests
                  </pre>
                </p>
              </div>
            ) : null}
            {accounts.length > 0 && (
              <div className="account-brief">
                <b>Account: </b>
                <span>{accountName && accountName.label ? accountName.label : accounts[0]}</span>
                <br />
                <b>Balance: </b>
                <span>{balance}</span>
              </div>
            )}
            {compiled && fileName && (
              <div className="container-margin">
                <div className="contractSelect_container">
                  <Selector options={contracts} getSelectedOption={changeContract} placeholder="Select Contract" />
                </div>
              </div>
            )}
            {compiled && contractName && compiled.contracts[fileName][contractName] && (
              <div className="compiledOutput">
                <div id={contractName} className="contract-container">
                  <ContractCompiled
                    contractName={contractName}
                    bytecode={compiled.contracts[fileName][contractName].evm.bytecode.object}
                    abi={compiled.contracts[fileName][contractName].abi}
                  />
                  {currAccount && (
                    <ContractDeploy
                      bytecode={compiled.contracts[fileName][contractName].evm.bytecode.object}
                      abi={compiled.contracts[fileName][contractName].abi}
                      vscode={vscode}
                      gasEstimate={gasEstimate}
                      deployedResult={deployedResult}
                      openAdvanceDeploy={openAdvanceDeploy}
                    />
                  )}
                </div>
              </div>
            )}
          </TabPanel>
          {/* Account Panel */}
          <TabPanel>
            <Account
              vscode={vscode}
              accounts={selctorAccounts}
              getSelectedAccount={getSelectedAccount}
              appRegistered={appRegistered}
              handleAppRegister={handleAppRegister}
            />
          </TabPanel>
          <TabPanel>
            {compiled && contractName && compiled.contracts[fileName][contractName] && (
              <Deploy
                contractName={contractName}
                bytecode={compiled.contracts[fileName][contractName].evm.bytecode.object}
                abi={compiled.contracts[fileName][contractName].abi}
                vscode={vscode}
                errors={error!}
              />
            )}
          </TabPanel>
          {/* Debug panel */}
          <TabPanel className="react-tab-panel">
            <DebugDisplay vscode={vscode} testNetId={testNetId} txTrace={txTrace} traceError={traceError} />
          </TabPanel>
          {/* Test panel */}
          <TabPanel className="react-tab-panel">
            {props.test.testResults.length > 0 ? <TestDisplay /> : "No contracts to test"}
          </TabPanel>
        </Tabs>
        <div className="err_warning_container">
          {message.map((m, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i}>
                {m.severity === "warning" && <pre className="error-message yellow-text">{m.formattedMessage}</pre>}
                {m.severity === "error" && <pre className="error-message red-text">{m.formattedMessage}</pre>}
                {!m.severity && <pre className="error-message">{m.formattedMessage}</pre>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="process-msg-container">
        {processMessage && <pre className="processMessage">{processMessage}</pre>}
      </div>
    </div>
  );
};

function mapStateToProps({ test, accountStore, debugStore }: any) {
  const { accountBalance, accounts, currAccount } = accountStore;
  const { testNetId } = debugStore;
  return {
    accountBalance,
    accounts,
    currAccount,
    test,
    testNetId,
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
  setCallResult,
})(App);
