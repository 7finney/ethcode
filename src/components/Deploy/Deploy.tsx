import React, { useEffect, useState, useRef } from 'react';
import JSONPretty from 'react-json-pretty';
import './Deploy.css';
import { useDispatch, useSelector } from 'react-redux';
import { ABIDescription, ConstructorInput, GlobalStore } from 'types';
import { setUnsgTxn, setCallResult, setErrMsg } from '../../actions';
import { Button, ButtonType } from '../common/ui';
import DeployForm from './DeployForm';
import CallForm from './CallForm';

export interface IProps {
  contractName: string;
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  errors: Error;
}

const Deploy: React.FC<IProps> = (props: IProps) => {
  const [gasEstimate, setGasEstimate] = useState(0);
  const [txtHash, setTxtHash] = useState('');
  const [processMessage, setProcessMessage] = useState('');
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const constructorInputRef = useRef<ConstructorInput[] | null>(null);

  // redux
  // UseSelector to extract state elements.
  const { testNetId, currAccount, unsignedTx, deployedResult, callResult, pvtKey, error } = useSelector(
    (state: GlobalStore) => ({
      testNetId: state.debugStore.testNetId,
      currAccount: state.accountStore.currAccount,
      deployedResult: state.contractsStore.deployedResult,
      callResult: state.contractsStore.callResult,
      unsignedTx: state.txStore.unsignedTx,
      pvtKey: state.accountStore.privateKey,
      error: state.debugStore.error,
    })
  );
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('message', (event) => {
      const { data } = event;

      if (data.deployedResult) {
        setTxtHash(data.deployedResult);
      }
      if (data.gasEstimate) {
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
        dispatch(setErrMsg(data.error));
      }
    });
  }, []);

  const getGasEstimate = () => {
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
    } catch (err) {
      dispatch(setErrMsg(err));
    }
  };

  const publicKey = currAccount && currAccount.value ? currAccount.value : '';
  const { abi, bytecode, vscode } = props;
  return (
    <div>
      <div className="deploy_container">
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
          <form onSubmit={getGasEstimate}>
            <Button buttonType={ButtonType.Input} disabled={gasEstimateToggle}>
              Get gas estimate
            </Button>
          </form>
        </div>
        {/* Call Function */}
        <div>
          {currAccount && (
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
        {/* Notification */}
        {processMessage && <pre className="processMessage">{processMessage}</pre>}

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
