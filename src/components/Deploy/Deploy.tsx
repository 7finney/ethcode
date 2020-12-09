import React, { useEffect, useState, useRef } from 'react';
import JSONPretty from 'react-json-pretty';
import './Deploy.css';
import { useDispatch, useSelector } from 'react-redux';
import { ABIDescription, ConstructorInput, GlobalStore } from 'types';
import { setUnsgTxn, setTestnetCallResult, setErrMsg } from '../../actions';
import { Button, ButtonType } from '../common/ui';
import { useForm } from 'react-hook-form';
import DeployForm from './DeployForm';

export interface IProps {
  contractName: string;
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  errors: Error;
}

type FormInputs = {
  contractAddress: string;
  methodName: string;
  amount: number;
  methodInputs: string;
};

const Deploy: React.FC<IProps> = (props: IProps) => {
  const [constructorInput, setConstructorInput] = useState<ConstructorInput | ConstructorInput[]>();
  const [gasEstimate, setGasEstimate] = useState(0);
  const [byteCode, setByteCode] = useState<string>();
  const [abi, setAbi] = useState<Array<ABIDescription>>([]);
  const [methodName, setMethodName] = useState<string>('');
  const [methodArray, setMethodArray] = useState({});
  const [methodInputs, setMethodInputs] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [txtHash, setTxtHash] = useState('');
  const [pvtKey, setPvtKey] = useState('');
  const [, setMsg] = useState('initial');
  const [processMessage, setProcessMessage] = useState('');
  const [isPayable, setIsPayable] = useState(false);
  const [payableAmount, setPayableAmount] = useState<number>(0);
  const [callFunToggle, setCallFunToggle] = useState(true);
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);

  const { register, handleSubmit } = useForm<FormInputs>();
  const constructorInputRef = useRef<ConstructorInput | ConstructorInput[] | null>(null);

  // redux
  // UseSelector to extract state elements.
  const { testNetId, currAccount, unsignedTx, testNetCallResult, error } = useSelector((state: GlobalStore) => ({
    testNetId: state.debugStore.testNetId,
    currAccount: state.accountStore.currAccount,
    testNetCallResult: state.contractsStore.testNetCallResult,
    unsignedTx: state.txStore.unsignedTx,
    error: state.debugStore.error,
  }));
  const dispatch = useDispatch();

  useEffect(() => {
    setAbi(props.abi);
    setByteCode(props.bytecode);

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
      if (data.pvtKey) {
        // TODO: fetching private key process needs fix
        setPvtKey(data.pvtKey);
        setProcessMessage('');
        setMsg('process Finished');
      }
      if (data.TestnetCallResult) {
        dispatch(setTestnetCallResult(data.TestnetCallResult));
        setCallFunToggle(true);
      }
      if (data.error) {
        dispatch(setErrMsg(data.error));
      }
    });
  }, []);

  const handleBuildTxn = () => {
    const { vscode, bytecode, abi } = props;
    const publicKey = currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x';
    // create unsigned transaction here
    try {
      vscode.postMessage({
        command: 'build-rawtx',
        payload: {
          from: publicKey,
          abi,
          bytecode,
          params: constructorInput || [],
          gasSupply: gasEstimate || 0,
        },
        testNetId,
      });
    } catch (error) {
      dispatch(setErrMsg(error));
    }
  };

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

  const handleCall = (formData: FormInputs) => {
    const { vscode, abi } = props;
    setPayableAmount(formData.amount);
    setContractAddress(formData.contractAddress);
    setMethodName(formData.methodName);
    setMethodInputs(formData.methodInputs);
    const publicKey = currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x';
    setCallFunToggle(true);
    vscode.postMessage({
      command: 'contract-method-call',
      payload: {
        from: publicKey,
        abi,
        address: contractAddress,
        methodName,
        params: JSON.parse(methodInputs),
        gasSupply: gasEstimate,
        value: payableAmount,
      },
      testNetId,
    });
  };

  const handleMethodnameInput = (event: any) => {
    const methodName: string = event.target.value;
    setCallFunToggle(false);
    if (methodName && Object.prototype.hasOwnProperty.call(methodArray, event.target.value)) {
      setMethodName(methodName);
      // @ts-ignore
      setMethodArray(JSON.stringify(methodArray[methodName].inputs, null, '\t'));
      // @ts-ignore
      setIsPayable(methodArray[methodName].stateMutability === 'payable');
    } else {
      setMethodName('');
      // @ts-ignore
      setMethodArray('');
      // @ts-ignore
      setIsPayable(false);
    }
  };

  const signAndDeploy = () => {
    const { vscode } = props;
    try {
      vscode.postMessage({
        command: 'sign-deploy-tx',
        payload: {
          unsignedTx,
          pvtKey,
        },
        testNetId,
      });
    } catch (error) {
      dispatch(setErrMsg(error));
    }
  };

  const publicKey = currAccount && currAccount.value ? currAccount.value : '';
  return (
    <div className="deploy_container">
      <div>
        <div>
          <DeployForm
            abi={abi}
            gasEstimate={gasEstimate}
            handleDeploy={signAndDeploy}
            handleBuildTxn={handleBuildTxn}
            pvtKey={pvtKey}
            unsignedTx={unsignedTx}
            constructorInputRef={constructorInputRef}
          />
          <form onSubmit={getGasEstimate}>
            <Button buttonType={ButtonType.Input} disabled={gasEstimateToggle}>
              Get gas estimate
            </Button>
          </form>
        </div>
      </div>
      {/* Constructor */}
      <div>
        {/* Call Function */}
        <div className="tag">
          <form onSubmit={handleSubmit(handleCall)} className="form_align">
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract address"
              style={{ marginRight: '5px' }}
              name="contractAddress"
              ref={register}
            />
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract function name"
              name="methodName"
              ref={register}
              onChange={handleMethodnameInput}
            />
            {methodName !== '' && methodInputs !== '' && methodInputs !== '[]' && (
              <div className="json_input_container" style={{ margin: '10px 0' }}>
                <textarea name="methodInputs" className="json_input custom_input_css" ref={register} />
              </div>
            )}
            {isPayable && (
              <input
                type="number"
                className="custom_input_css"
                placeholder="Enter payable amount"
                style={{ margin: '5px' }}
                name="payableAmount"
              />
            )}
            <Button buttonType={ButtonType.Input} disabled={callFunToggle}>
              Call function
            </Button>
          </form>
        </div>
      </div>

      {/* Call function Result */}
      {Object.entries(testNetCallResult).length > 0 && (
        <div className="tag call-result">
          <span>{testNetCallResult ? 'Call result:' : 'Call error:'}</span>
          <div>
            {testNetCallResult ? (
              <pre className="large-code">{testNetCallResult}</pre>
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
          <input className="input custom_input_css" type="text" disabled placeholder="private key" value={pvtKey} />
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
  );
};

export default Deploy;
