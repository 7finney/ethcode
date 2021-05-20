import React, { useState } from 'react';
import './App.css';

import { AppContext } from '../appContext';
import { MainView } from './MainView';
import { CompilationResult } from '../types';

const App: React.FC = () => {
  // Context
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [compiledJSON, setCompiledJSON] = useState<CompilationResult>();
  const [testNetID, setTestNetID] = useState<string>('ganache');

  return (
    <AppContext.Provider
      value={{ compiledJSON, setCompiledJSON, activeFileName, setActiveFileName, testNetID, setTestNetID }}
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
