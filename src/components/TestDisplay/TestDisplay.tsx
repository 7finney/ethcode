import React from 'react';
import VirtualList from 'react-tiny-virtual-list';
import { useSelector } from 'react-redux';
import './TestDisplay.css';
import Octicon, { Check, X, Checklist } from '@primer/octicons-react';
import { GlobalStore } from 'types';

const TestDisplay: React.FC = () => {
  // UseSelector to extract state elements.
  const { testResult, testResults } = useSelector((state: GlobalStore) => ({
    testResult: state.test.testResult,
    testResults: state.test.testResults,
  }));
  return (
    <div id="remix-tests">
      {testResult && testResults.length > 0 && (
        <div className="test-result">
          <span className="text-error">Total failing: {testResult.totalFailing} </span>
          <span className="text-success">Total passing: {testResult.totalPassing} </span>
          <span className="text-info">Time: {testResult.totalTime}</span>
        </div>
      )}
      <VirtualList
        height="50vh"
        itemCount={testResults.length}
        itemSize={30}
        className="test-result-list-container"
        overscanCount={10}
        renderItem={({ index }) => (
          <div key={index} className="test-result-list-item">
            {testResults[index].type === 'contract' && (
              <span className="status-renamed">
                <Octicon icon={Checklist} />
              </span>
            )}
            {testResults[index].type === 'testPass' && (
              <span className="status-added fa fa-check fa-2x">
                <Octicon icon={Check} />
              </span>
            )}
            {testResults[index].type === 'testFailure' && (
              <span className="status-removed fa fa-times">
                <Octicon icon={X} />
              </span>
            )}
            <span className="padded text-warning">{testResults[index].value}</span>
          </div>
        )}
      />
    </div>
  );
};

export default TestDisplay;
