import React from "react";
import VirtualList from "react-tiny-virtual-list";
import { connect } from "react-redux";
import "./TestDisplay.css";

interface IProps {
  test: any;
}

const TestDisplay = ({ test }: IProps) => {
  return (
    <div id="remix-tests">
      {test.testResult && test.testResults.length > 0 && (
        <div className="test-result">
          <span className="text-error">
            Total failing: {test.testResult.totalFailing}{" "}
          </span>
          <span className="text-success">
            Total passing: {test.testResult.totalPassing}{" "}
          </span>
          <span className="text-info">Time: {test.testResult.totalTime}</span>
        </div>
      )}
      <VirtualList
        height="50vh"
        itemCount={test.testResults.length}
        itemSize={30}
        className="test-result-list-container"
        overscanCount={10}
        renderItem={({ index }) => (
          <div key={index} className="test-result-list-item">
            {test.testResults[index].type === "contract" && (
              <span className="status-renamed .octicon-check" />
            )}
            {test.testResults[index].type === "testPass" && (
              <span className="status-added icon icon-check" />
            )}
            {test.testResults[index].type === "testFailure" && (
              <span className="status-removed icon icon-x" />
            )}
            <span className="padded text-warning">
              {test.testResults[index].value}
            </span>
          </div>
        )}
      />
      {/* <div id="test-error" className="error-container">
        <ErrorView />
      </div> */}
    </div>
  );
};

function mapStateToProps({ test }: any) {
  return {
    test
  };
}

export default connect(mapStateToProps)(TestDisplay);
