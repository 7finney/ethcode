import React, { useEffect, useState, useRef } from 'react';
import './ContractDeploy.css';
import JSONPretty from 'react-json-pretty';
import { connect } from 'react-redux';
import { ABIDescription, CompilationResult, ConstructorInput, IAccount } from 'types';
import { setCallResult } from '../../actions';
import { Button, ButtonType } from '../common/ui';
import CallForm from './CallForm';
import DeployForm from './DeployForm';

interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  gasEstimate: number;
  deployedResult: string;
  compiledResult: CompilationResult;
  callResult: any;
  currAccount: IAccount;
  testNetId: string;
  openAdvanceDeploy: () => void;
  // eslint-disable-next-line no-unused-vars
  setCallResult: (result: CompilationResult) => void;
}

const ContractDeploy: React.FC<IProps> = (props: IProps) => {
  const [error, setError] = useState<Error | null>(null);
  const [deployed, setDeployed] = useState({});
  const [testNetId, setTestNetId] = useState<string>('');
  const [disable, setDisable] = useState(true);
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const constructorInputRef = useRef<ConstructorInput | ConstructorInput[] | null>(null);

  useEffect(() => {
    setTestNetId(props.testNetId);
    setDeployed(props.compiledResult);
    window.addEventListener('message', (event) => {
      const { data } = event;

      if (data.ganacheCallResult) {
        props.setCallResult(data.ganacheCallResult);
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
    if (props.testNetId !== testNetId && props.testNetId !== 'ganache') {
      setDisable(true);
    } else if (props.testNetId !== testNetId) {
      setDisable(disable);
      setTestNetId(props.testNetId);
    }
  }, [props.testNetId, testNetId]);

  useEffect(() => {
    if (props.deployedResult !== '') {
      const deployedObj = JSON.parse(props.deployedResult);
      setDeployed(deployedObj);
      setDisable(false);
    }
  }, [props.deployedResult]);

  useEffect(() => {
    setDisable(false);
    setGasEstimateToggle(false);
  }, [props.gasEstimate]);

  const handleGetGasEstimate = () => {
    const { vscode, bytecode, abi, currAccount } = props;
    setGasEstimateToggle(true);
    try {
      vscode.postMessage({
        command: 'run-get-gas-estimate',
        payload: {
          abi,
          bytecode,
          params: constructorInputRef.current,
          from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
        },
        testNetId,
      });
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <div>
        <div>
          <DeployForm
            vscode={props.vscode}
            abi={props.abi}
            bytecode={props.bytecode}
            gasEstimate={props.gasEstimate}
            currAccount={props.currAccount}
            testNetId={props.testNetId}
            constructorInputRef={constructorInputRef}
            openAdvanceDeploy={props.openAdvanceDeploy}
          />
          <form onSubmit={handleGetGasEstimate}>
            <Button buttonType={ButtonType.Input} disabled={gasEstimateToggle}>
              Get gas estimate
            </Button>
          </form>
        </div>
        <div>
          <CallForm
            vscode={props.vscode}
            abi={props.abi}
            currAccount={props.currAccount}
            testNetId={props.testNetId}
            constructorInputRef={constructorInputRef}
            deployedResult={props.deployedResult}
          />
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
      {Object.entries(props.callResult).length > 0 && (
        <div className="call-result">
          <span>
            {/* 
              // @ts-ignore */}
            {props.callResult || (props.callResult && props.callResult.callResult) ? 'Call result:' : 'Call error:'}
          </span>
          <div>
            {/* TODO: add better way to show result and error */}
            {props.callResult && <pre className="large-code">{props.callResult}</pre>}
          </div>
        </div>
      )}
      {Object.entries(deployed).length > 0 && (
        <div className="transaction_receipt">
          <span className="contract-name inline-block highlight-success">Transaction Receipt:</span>
          <div>
            <pre className="large-code">
              <JSONPretty id="json-pretty" data={deployed} />
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

function mapStateToProps({ debugStore, compiledStore, accountStore }: any) {
  const { currAccount } = accountStore;
  const { testNetId } = debugStore;
  const { compiledresult, callResult } = compiledStore;
  return {
    testNetId,
    compiledResult: compiledresult,
    callResult,
    currAccount,
  };
}

export default connect(mapStateToProps, {
  setCallResult,
})(ContractDeploy);
