import React, { useEffect, useState, useRef } from 'react';
import './ContractDeploy.css';
import JSONPretty from 'react-json-pretty';
import { useSelector, useDispatch } from 'react-redux';
import { ABIDescription, ConstructorInput, GlobalStore } from 'types';
import { setCallResult, setTestNetId } from '../../actions';
import { Button, ButtonType } from '../common/ui';
import CallForm from './CallForm';
import DeployForm from './DeployForm';

interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  gasEstimate: number;
  openAdvanceDeploy: () => void;
}

const ContractDeploy: React.FC<IProps> = (props: IProps) => {
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const constructorInputRef = useRef<ConstructorInput | ConstructorInput[] | null>(null);

  // redux
  // UseSelector to extract state elements.
  const { testNetId, callResult, deployedResult, currAccount } = useSelector((state: GlobalStore) => ({
    testNetId: state.debugStore.testNetId,
    deployedResult: state.contractsStore.deployedResult,
    callResult: state.contractsStore.callResult,
    currAccount: state.accountStore.currAccount,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTestNetId(testNetId));
    window.addEventListener('message', (event) => {
      const { data } = event;

      if (data.ganacheCallResult) {
        dispatch(setCallResult(data.ganacheCallResult));
      }
      if (data.error) {
        setError(data.error);
      }
    });
  }, []);

  useEffect(() => {
    setError(error);
  }, [error]);

  useEffect(() => {
    setGasEstimateToggle(false);
  }, [props.gasEstimate]);

  const handleGetGasEstimate = () => {
    const { vscode, bytecode, abi } = props;
    setGasEstimateToggle(true);
    try {
      vscode.postMessage({
        command: 'run-get-gas-estimate',
        payload: {
          abi,
          bytecode,
          params: constructorInputRef.current,
          from: currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x',
        },
        testNetId,
      });
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <div className="deploy_container">
        <div>
          <div>
            {currAccount && (
              <DeployForm
                vscode={props.vscode}
                abi={props.abi}
                bytecode={props.bytecode}
                gasEstimate={props.gasEstimate}
                currAccount={currAccount}
                testNetId={testNetId}
                constructorInputRef={constructorInputRef}
                openAdvanceDeploy={props.openAdvanceDeploy}
              />
            )}
            <form onSubmit={handleGetGasEstimate}>
              <Button buttonType={ButtonType.Input} disabled={gasEstimateToggle}>
                Get gas estimate
              </Button>
            </form>
          </div>
          <div>
            {deployedResult && currAccount && (
              <CallForm
                vscode={props.vscode}
                abi={props.abi}
                currAccount={currAccount}
                testNetId={testNetId}
                constructorInputRef={constructorInputRef}
                deployedResult={deployedResult}
              />
            )}
          </div>
        </div>
        <div className="error_message">
          {error && (
            <div>
              <span className="contract-name inline-block highlight-success">Error Message:</span>
              <div>
                <pre className="large-code-error">{JSON.stringify(error)}</pre>
              </div>
            </div>
          )}
        </div>
        {callResult && Object.entries(callResult).length > 0 && (
          <div className="call-result">
            <span>
              {/* 
              // @ts-ignore */}
              {callResult || (callResult && callResult.callResult) ? 'Call result:' : 'Call error:'}
            </span>
            <div>
              {/* TODO: add better way to show result and error */}
              {callResult && <pre className="large-code">{callResult}</pre>}
            </div>
          </div>
        )}
      </div>
      {deployedResult && Object.entries(deployedResult).length > 0 && (
        <div className="transaction_receipt">
          <span className="contract-name inline-block highlight-success">Transaction Receipt:</span>
          <div>
            <pre className="large-code">
              <JSONPretty id="json-pretty" data={deployedResult} />
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDeploy;
