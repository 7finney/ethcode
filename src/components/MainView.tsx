import React, { useContext, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactJson, { OnCopyProps } from 'react-json-view';
import {
  addTestResults,
  addFinalResultCallback,
  clearFinalResult,
  setDeployedResult,
  setCallResult,
  setAccountBalance,
  setCurrAccChange,
  setErrMsg,
  setAppRegistered,
  clearCompiledResults,
} from '../actions';
import { setGanacheAccountsOption, setLocalAccountOption } from '../helper';

import { IAccStore, GroupedSelectorAccounts, CompilationResult, GlobalStore, ABIDescription } from '../types';

import ContractDeploy from './ContractDeploy';
import { Selector } from './common/ui';
import TestDisplay from './TestDisplay';
import DebugDisplay from './DebugDisplay';
import Deploy from './Deploy/Deploy';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Account from './Account/Account';
import { OutputJSONForm } from './OutputJSONForm';
import { AppContext } from '../appContext';

// @ts-ignore
const vscode = acquireVsCodeApi(); // eslint-disable-line

export const MainView = () => {
  const [message, setMessage] = useState<any[]>([]);
  const [processMessage, setProcessMessage] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [txTrace, setTxTrace] = useState({});
  const [selectorAccounts, setSelectorAccounts] = useState<Array<GroupedSelectorAccounts>>([]);
  const [transactionResult, setTransactionResult] = useState('');
  const [traceError, setTraceError] = useState('');
  const [localAcc, setLocalAcc] = useState<any[]>([]);
  const [testNetAcc, setTestNetAcc] = useState<any[]>([]);
  const [testNets] = useState([
    { value: 'ganache', label: 'Ganache' },
    // { value: '3', label: 'Ropsten' },
    // { value: '4', label: 'Rinkeby' },
    { value: '5', label: 'Görli' },
  ]);
  const [abi, setAbi] = useState<Array<ABIDescription>>([]);
  const [bytecode, setBytecode] = useState<string>('');
  // Context
  const { compiledJSON, setCompiledJSON, setTestNetID } = useContext(AppContext);
  // redux
  // UseSelector to extract state elements.
  const { registered, accounts, currAccount, accountBalance, testResults, error } = useSelector(
    (state: GlobalStore) => ({
      registered: state.debugStore.appRegistered,
      contracts: state.contractsStore.compiledResult?.contracts,
      contractName: state.contractsStore.activeContractName,
      fileName: state.contractsStore.activeFileName,
      accounts: state.accountStore.accounts,
      currAccount: state.accountStore.currAccount,
      accountBalance: state.accountStore.balance,
      testResults: state.test.testResults,
      error: state.debugStore.error,
    })
  );
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
  const loadCompiledJSON = (data: any) => {
    dispatch(clearCompiledResults());
    try {
      const compiled: CompilationResult = JSON.parse(data.compiled);
      setCompiledJSON(compiled);
      if (compiled.errors && compiled.errors.length > 0) {
        setMessage(compiled.errors);
      } else if (!compiled.errors) {
        setMessage([]);
        setProcessMessage('');
      }
      setProcessMessage('');
    } catch (error) {
      console.error(error);
      setProcessMessage('Error Parsing Compilation result');
    }
  };

  useEffect(() => {
    mergeAccount();
  }, [localAcc, testNetAcc]);

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const { data } = event;
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
        loadCompiledJSON(data);
      }
      if (data.processMessage) {
        const { processMessage } = data;
        setProcessMessage(processMessage);
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

  const setSelectedNetwork = (testNet: any) => {
    const testNetId = testNet.value;
    setTestNetID(testNetId);
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
  const reactJSONViewStyle = {
    // border: 'solid 1px red',
    maxHeight: '30vh',
    maxWidth: '90vw',
    overflow: 'scroll',
    marginLeft: 'auto',
    marginRight: 'auto',
  };
  const handleJSONItemSelect = (select: any) => {
    setBytecode(select.value);
  };
  const handleCopy = (copy: OnCopyProps) => {
    // @ts-ignore
    const abi: Array<ABIDescription> = Object.keys(copy.src).map((key) => copy.src[key]);
    setAbi(abi);
  };
  return (
    <div>
      <div className="selectors">
        <Selector
          onSelect={setSelectedNetwork}
          options={testNets}
          placeholder="Select Network"
          defaultValue={testNets[0]}
        />
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
              <Tab>Deploy</Tab>
              <Tab>Debug</Tab>
              <Tab>Test</Tab>
            </div>
          </TabList>
          {/* Main panel */}
          <TabPanel className="react-tab-panel">
            {accounts.length > 0 && (
              <div className="account-brief">
                <b>Account: </b>
                <span>{currAccount ? currAccount.checksumAddr || currAccount.pubAddr || currAccount.value : '0x'}</span>
                <br />
                <b>Balance: </b>
                <span>{accountBalance}</span>
              </div>
            )}
            <div>
              <OutputJSONForm handleLoad={loadCompiledJSON} />
            </div>
            {compiledJSON && (
              <div className="compiledOutput">
                <ReactJson
                  src={compiledJSON.contracts}
                  name="Contracts"
                  theme="monokai"
                  collapsed
                  style={reactJSONViewStyle}
                  onSelect={handleJSONItemSelect}
                  enableClipboard={handleCopy}
                />
              </div>
            )}
            {currAccount && (Object.keys(abi).length > 0 || bytecode.length > 0) && (
              <div className="contract-container">
                <ContractDeploy bytecode={bytecode} abi={abi} vscode={vscode} openAdvanceDeploy={openAdvanceDeploy} />
              </div>
            )}
          </TabPanel>
          {/* Account Panel */}
          <TabPanel>
            <Account vscode={vscode} accounts={selectorAccounts} handleAppRegister={handleAppRegister} />
          </TabPanel>
          {/* Advanced Deploy panel */}
          <TabPanel>
            {currAccount && (Object.keys(abi).length > 0 || bytecode.length > 0) && (
              <div className="contract-container">
                <Deploy bytecode={bytecode} abi={abi} vscode={vscode} errors={error!} />
              </div>
            )}
          </TabPanel>
          {/* Debug panel */}
          <TabPanel className="react-tab-panel">
            <DebugDisplay vscode={vscode} txTrace={txTrace} traceError={traceError} />
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
