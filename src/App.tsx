import React, { useState } from 'react';
import './App.css';

import { AppContext } from './appContext';
import { MainView } from './views/MainView';
import { CompilationResult, IAccount, GroupedSelectorAccounts, TransactionResult } from './types';

const App: React.FC = () => {
  // Context
  const [unsignedTx, setUnsgTxn] = useState<string>();
  const [pvtKey, setPvtKey] = useState<string>();
  const [currAccount, setAccount] = useState<IAccount>();
  const [accounts, setSelectorAccounts] = useState<Array<GroupedSelectorAccounts>>();
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [compiledJSON, setCompiledJSON] = useState<CompilationResult>();
  const [testNetID, setTestNetID] = useState<string>('ganache');
  const [accountBalance, setAccountBalance] = useState<number>(0);
  const [callResult, setCallResult] = useState<any>();
  const [deployedResult, setDeployedResult] = useState<TransactionResult>();
  const [error, setError] = useState<Error>();

  return (
    <AppContext.Provider
      value={{
        unsignedTx,
        setUnsgTxn,
        pvtKey,
        setPvtKey,
        currAccount,
        setAccount,
        accountBalance,
        setAccountBalance,
        accounts,
        setSelectorAccounts,
        compiledJSON,
        setCompiledJSON,
        activeFileName,
        setActiveFileName,
        testNetID,
        setTestNetID,
        deployedResult,
        setDeployedResult,
        callResult,
        setCallResult,
        error,
        setError,
      }}
    >
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">ETHcode</h1>
        </header>
        <MainView />
      </div>
    </AppContext.Provider>
  );
};

export default App;
