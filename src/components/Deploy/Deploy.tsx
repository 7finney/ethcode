import React, { useEffect, useState, useRef, useContext } from 'react';
import JSONPretty from 'react-json-pretty';
import './Deploy.css';
import { useDispatch, useSelector } from 'react-redux';
import { ABIDescription, ConstructorInput, GlobalStore } from 'types';
import { setUnsgTxn, setCallResult } from '../../actions';
import { Button, ButtonType } from '../common/ui';
import DeployForm from './DeployForm';
import CallForm from './CallForm';
import { AppContext } from '../../appContext';

export interface IProps {
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  errors: Error;
}

const Deploy: React.FC<IProps> = ({ abi, bytecode, vscode }: IProps) => {
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const [gasEstimate, setGasEstimate] = useState(0);
  const [txtHash, setTxtHash] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const constructorInputRef = useRef<ConstructorInput[] | null>(null);

  // Context
  const { testNetID } = useContext(AppContext);

  // redux
  // UseSelector to extract state elements.
  const { currAccount, unsignedTx, deployedResult, callResult, pvtKey } = useSelector((state: GlobalStore) => ({
    currAccount: state.accountStore.currAccount,
    deployedResult: state.contractsStore.deployedResult,
    callResult: state.contractsStore.callResult,
    unsignedTx: state.txStore.unsignedTx,
    pvtKey: state.accountStore.privateKey,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;

      if (data.deployedResult) {
        setTxtHash(data.deployedResult);
      }
      if (data.gasEstimate) {
        setGasEstimateToggle(false);
        setGasEstimate(data.gasEstimate);
      }
      if (data.buildTxResult) {
        // TODO: fix unsigned tx is not updated after once
        dispatch(setUnsgTxn(data.buildTxResult));
      }
      if (data.unsignedTx) {
        dispatch(setUnsgTxn(data.unsignedTx));
      }
      if (data.callResult) {
        dispatch(setCallResult(data.callResult));
      }
      if (data.error) {
        setError(data.error);
      }
    });
  }, []);

  const handleGetGasEstimate = () => {
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
        testNetId: testNetID,
      });
    } catch (err) {
      setError(err);
    }
  };

  const publicKey = currAccount && currAccount.value ? currAccount.value : '';
  return (
    <div>
      <div className="deploy_container">
        <div className="byte-code">
          <pre className="large-code">{JSON.stringify(bytecode)}</pre>
        </div>
        <div className="abi-definition">
          <pre className="large-code">{JSON.stringify(abi)}</pre>
        </div>
        <div>
          {currAccount && (
            <DeployForm
              vscode={vscode}
              bytecode={bytecode}
              abi={abi}
              gasEstimate={gasEstimate}
              constructorInputRef={constructorInputRef}
            />
          )}
          <Button buttonType={ButtonType.Button} onClick={handleGetGasEstimate} disabled={gasEstimateToggle}>
            Get gas estimate
          </Button>
        </div>
        {/* Call Function */}
        <div>
          {currAccount && (
            <CallForm
              vscode={vscode}
              abi={abi}
              currAccount={currAccount}
              testNetId={testNetID}
              deployedResult={deployedResult}
            />
          )}
        </div>

        {/* Call function Result */}
        {Object.entries(callResult).length > 0 && (
          <div className="tag call-result">
            <span>{callResult ? 'Call result:' : 'Call error:'}</span>
            <div>
              {callResult ? (
                <pre className="large-code">{callResult}</pre>
              ) : (
                <pre className="large-code" style={{ color: 'red' }}>
                  {JSON.stringify(error)}
                </pre>
              )}
            </div>
          </div>
        )}

        {unsignedTx && (
          <div className="tag">
            <h4 className="contract-name inline-block highlight-success">Unsigned Transaction:</h4>
            <div className="json_input_container" style={{ marginTop: '10px' }}>
              <pre className="large-code">
                <JSONPretty id="json-pretty" data={unsignedTx} />
              </pre>
            </div>
          </div>
        )}

        <div className="account_row">
          <div className="tag">
            <h4>Public key</h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" value={publicKey} placeholder="public key" />
          </div>
        </div>

        <div className="account_row">
          <div className="tag">
            <h4>Private key</h4>
          </div>
          <div className="input-container">
            <input
              className="input custom_input_css"
              type="text"
              disabled
              placeholder="private key"
              value={pvtKey || ''}
            />
          </div>
        </div>

        {/* Error Handle */}
        <div className="error_message">
          {error && (
            <pre className="large-code" style={{ color: 'red' }}>
              {
                // @ts-ignore
                JSON.stringify(error)
              }
            </pre>
          )}
        </div>
      </div>
      {/* Final Transaction Hash */}
      {pvtKey && (
        <div className="account_row">
          <div className="tag">
            <h4>Transaction hash</h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" value={txtHash} placeholder="transaction hash" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Deploy;
