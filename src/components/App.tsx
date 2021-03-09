import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  setCallResult,
  setAccountBalance,
  setCurrAccChange,
  setTestNetId,
  setErrMsg,
  setCompiledResults,
  setAppRegistered,
  setActiveContractName,
  setActiveFileName,
  clearCompiledResults,
} from '../actions';
import './App.css';

import {
  solidityVersion,
  extractContractSelectorOption,
  extractFileSelectorOptions,
  setGanacheAccountsOption,
  setLocalAccountOption,
} from '../helper';

import ContractCompiled from './ContractCompiled';
import ContractDeploy from './ContractDeploy';
import { Selector } from './common/ui';
import TestDisplay from './TestDisplay';
import DebugDisplay from './DebugDisplay';
import Deploy from './Deploy/Deploy';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Account from './Account/Account';
import { IAccStore, SolcVersionType, GroupedSelectorAccounts, CompilationResult, GlobalStore } from '../types';

interface IOpt {
  value: string;
  label: string;
}

// @ts-ignore
const vscode = acquireVsCodeApi(); // eslint-disable-line
const App: React.FC = () => {
  const [message, setMessage] = useState<any[]>([]);
  // const [fileName, setFileName] = useState<string>('');
  const [processMessage, setProcessMessage] = useState('');
  const [availableVersions, setAvailableVersions] = useState<Array<SolcVersionType>>([]);
  const [gasEstimate, setGasEstimate] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [txTrace, setTxTrace] = useState({});
  const [selectorAccounts, setSelectorAccounts] = useState<Array<GroupedSelectorAccounts>>([]);
  const [contractNames, setContractNames] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [transactionResult, setTransactionResult] = useState('');
  const [fileType, setFileType] = useState('');
  const [traceError, setTraceError] = useState('');
  const [localAcc, setLocalAcc] = useState<any[]>([]);
  const [testNetAcc, setTestNetAcc] = useState<any[]>([]);
  const [testNets] = useState([
    { value: 'ganache', label: 'Ganache' },
    // { value: '3', label: 'Ropsten' },
    // { value: '4', label: 'Rinkeby' },
    { value: '5', label: 'Görli' },
  ]);

  // redux
  // UseSelector to extract state elements.
  const {
    registered,
    // compiled,
    sources,
    contracts,
    contractName,
    fileName,
    testNetId,
    accounts,
    currAccount,
    accountBalance,
    testResults,
    error,
  } = useSelector((state: GlobalStore) => ({
    registered: state.debugStore.appRegistered,
    // compiled: state.contractsStore.compiledResult,
    sources: state.contractsStore.compiledResult?.sources,
    contracts: state.contractsStore.compiledResult?.contracts,
    contractName: state.contractsStore.activeContractName,
    fileName: state.contractsStore.activeFileName,
    testNetId: state.debugStore.testNetId,
    accounts: state.accountStore.accounts,
    currAccount: state.accountStore.currAccount,
    accountBalance: state.accountStore.balance,
    testResults: state.test.testResults,
    error: state.debugStore.error,
  }));
  const dispatch = useDispatch();

  const mergeAccount = () => {
    // TODO: update reducer
    // merge local accounts and testnet accounts
    if (localAcc.length > 0 && testNetAcc.length > 0) {
      setSelectorAccounts([
        {
          label: 'Ganache',
          options: testNetAcc,
        },
        {
          label: 'Local Accounts',
          options: localAcc,
        },
      ]);
    } else if (localAcc.length > 0) {
      setSelectorAccounts([...localAcc]);
    } else if (testNetAcc.length > 0) {
      setSelectorAccounts([
        {
          label: 'Ganache',
          options: testNetAcc,
        },
      ]);
    } else {
      setSelectorAccounts([]);
    }
  };

  useEffect(() => {
    mergeAccount();
  }, [localAcc, testNetAcc]);

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const { data } = event;

      if (data.fileType) {
        setFileType(data.fileType);
      }
      // accounts
      if (data.localAccounts) {
        setLocalAcc(setLocalAccountOption(data.localAccounts));
      }
      if (data.fetchAccounts) {
        const { balance, accounts } = data.fetchAccounts;
        setTestNetAcc(setGanacheAccountsOption(accounts));
        const accData: IAccStore = {
          balance,
          currAccount: {
            label: accounts[0],
            value: accounts[0], // TODO: use toChecksumAddress to create checksum address of the given
          },
          accounts,
        };
        dispatch(setAccountBalance(accData));
      }
      if (data.balance) {
        const { balance, account } = data;
        dispatch(setCurrAccChange({ balance, currAccount: account }));
      }
      if (data.registered) {
        dispatch(setAppRegistered(data.registered));
        if (registered !== data.registered) {
          vscode.postMessage({ command: 'auth-updated' });
        }
      }
      // compiled
      if (data.compiled) {
        dispatch(clearCompiledResults());
        try {
          const compiled: CompilationResult = JSON.parse(data.compiled);
          if (compiled.errors && compiled.errors.length > 0) {
            setMessage(compiled.errors);
          } else if (!compiled.errors) {
            setMessage([]);
            setProcessMessage('');
          }
          const fileName: string = Object.keys(compiled.sources)[0];
          const contractNames: string[] = extractContractSelectorOption(Object.keys(compiled.contracts[fileName]));
          const files: string[] = extractFileSelectorOptions(Object.keys(compiled.sources));
          setProcessMessage('');
          setFiles(files);
          setContractNames(contractNames);
          dispatch(setActiveFileName(fileName));
          dispatch(setActiveContractName(Object.keys(compiled.contracts[fileName])[0]));
          dispatch(setCompiledResults(compiled));
        } catch (error) {
          console.log(error);
          setProcessMessage('Error Parsing Compilation result');
        }
      }
      if (data.processMessage) {
        const { processMessage } = data;
        setProcessMessage(processMessage);
      }
      if (data.versions) {
        const options = solidityVersion(data.versions.releases, data.versions.latestRelease);
        setAvailableVersions(options);
        setProcessMessage('');
      }

      if (data.resetTestState === 'resetTestState') {
        dispatch(clearFinalResult());
      }

      if (data.testPanel === 'test') {
        setTabIndex(4);
      }

      if (data.testPanel === 'main') {
        setTabIndex(0);
      }

      if (data._testCallback) {
        const result = data._testCallback;
        dispatch(addTestResults(result));
      }
      if (data._finalCallback) {
        const result = data._finalCallback;
        dispatch(addFinalResultCallback(result));
        setProcessMessage('');
      }
      if (data._importFileCb) {
        return;
      }
      if (data.errors) {
        setErrMsg(data.errors);
      }
      if (data.gasEstimate) {
        setGasEstimate(data.gasEstimate);
      }
      if (data.deployedResult) {
        const result = data.deployedResult.deployedResult;
        dispatch(setDeployedResult(JSON.parse(result)));
      }
      if (data.txTrace) {
        setTxTrace(data.txTrace);
      }
      if (data.traceError) {
        setTraceError(data.traceError);
      }
      if (data.callResult) {
        const result = data.callResult;
        dispatch(setCallResult(result));
      }
      if (data.transactionResult) {
        setTransactionResult(data.transactionResult);
      }
    });
    // Component mounted start getting gRPC things
    vscode.postMessage({ command: 'get-localAccounts' });
    vscode.postMessage({ command: 'run-getAccounts' });
  }, []);

  const switchContract = (selectedOpt: IOpt) => {
    dispatch(setActiveContractName(selectedOpt.value));
  };

  useEffect(() => {
    if (contracts) {
      switchContract({
        value: `${Object.keys(contracts[fileName])[0]}`,
        label: `${Object.keys(contracts[fileName])[0]}`,
      });
      const contractNames: string[] = extractContractSelectorOption(Object.keys(contracts[fileName]));
      setContractNames(contractNames);
    }
  }, [fileName]);

  const switchFile = (selectedOpt: IOpt) => {
    dispatch(setActiveFileName(selectedOpt.value));
  };

  const setSelectedVersion = (version: any) => {
    vscode.postMessage({
      command: 'version',
      version: version.value,
    });
  };

  const setSelectedNetwork = (testNet: any) => {
    const testNetId = testNet.value;
    dispatch(setTestNetId(testNetId));
    vscode.postMessage({
      command: 'get-balance',
      account: currAccount,
      testNetId,
    });
  };

  const handleAppRegister = () => {
    vscode.postMessage({
      command: 'app-register',
    });
  };

  const openAdvanceDeploy = (): void => {
    setTabIndex(2);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">ETHcode</h1>
      </header>
      <div className="selectors">
        <Selector
          onSelect={setSelectedNetwork}
          options={testNets}
          placeholder="Select Network"
          defaultValue={testNets[0]}
        />
        {sources && Object.keys(sources).length > 0 && (
          <Selector options={files} onSelect={switchFile} placeholder="Select Files" defaultValue={files[0]} />
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
              <Tab disabled={!!fileName}>Deploy</Tab>
              <Tab>Debug</Tab>
              <Tab>Test</Tab>
            </div>
          </TabList>
          {/* Main panel */}
          <TabPanel className="react-tab-panel">
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
            {accounts.length > 0 && (
              <div className="account-brief">
                <b>Account: </b>
                <span>{currAccount ? currAccount.checksumAddr || currAccount.pubAddr || currAccount.value : '0x'}</span>
                <br />
                <b>Balance: </b>
                <span>{accountBalance}</span>
              </div>
            )}
            {fileName && (
              <div className="container-margin">
                <div className="contractSelect_container">
                  <Selector options={contractNames} onSelect={switchContract} placeholder="Select Contract" />
                </div>
              </div>
            )}
            {contractName && contracts && contracts[fileName][contractName] && (
              <div className="compiledOutput">
                <div id={contractName} className="contract-container">
                  <ContractCompiled />
                  {currAccount && (
                    <ContractDeploy
                      bytecode={contracts[fileName][contractName].evm.bytecode.object}
                      abi={contracts[fileName][contractName].abi}
                      vscode={vscode}
                      gasEstimate={gasEstimate}
                      openAdvanceDeploy={openAdvanceDeploy}
                    />
                  )}
                </div>
              </div>
            )}
          </TabPanel>
          {/* Account Panel */}
          <TabPanel>
            <Account vscode={vscode} accounts={selectorAccounts} handleAppRegister={handleAppRegister} />
          </TabPanel>
          {/* Advanced Deploy panel */}
          <TabPanel>
            <div className="compiledOutput">
              {contractName && contracts && contracts[fileName][contractName] && (
                <div id={contractName} className="contract-container">
                  <ContractCompiled />
                  <Deploy
                    contractName={contractName}
                    bytecode={contracts[fileName][contractName].evm.bytecode.object}
                    abi={contracts[fileName][contractName].abi}
                    vscode={vscode}
                    errors={error!}
                  />
                </div>
              )}
            </div>
          </TabPanel>
          {/* Debug panel */}
          <TabPanel className="react-tab-panel">
            <DebugDisplay vscode={vscode} testNetId={testNetId} txTrace={txTrace} traceError={traceError} />
          </TabPanel>
          {/* Test panel */}
          <TabPanel className="react-tab-panel">
            {testResults.length > 0 ? <TestDisplay /> : 'No contracts to test'}
          </TabPanel>
        </Tabs>
        <div className="err_warning_container">
          {message.map((m, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={i}>
                {m.severity === 'warning' && <pre className="error-message yellow-text">{m.formattedMessage}</pre>}
                {m.severity === 'error' && <pre className="error-message red-text">{m.formattedMessage}</pre>}
                {!m.severity && <pre className="error-message">{m.formattedMessage}</pre>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="process-msg-container">
        {processMessage && <pre className="processMessage">{processMessage}</pre>}
      </div>
      <div className="error-msg">{error && <pre>{error.message}</pre>}</div>
    </div>
  );
};

export default App;
