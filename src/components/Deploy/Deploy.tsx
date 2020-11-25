import React, { useEffect, useState } from "react";
import JSONPretty from "react-json-pretty";
import "./deploy.css";
import { connect } from "react-redux";
import { ABIDescription, CompilationResult, ConstructorInput, IAccount } from "types";
import { setUnsgTxn, setTestnetCallResult } from "../../actions";
import { Button } from "../common/ui";
import { useForm } from "react-hook-form";

export interface IProps {
  // eslint-disable-next-line no-unused-vars
  setUnsgTxn: (unsgTxn: any) => void;
  // eslint-disable-next-line no-unused-vars
  setTestnetCallResult: (result: any) => void;
  contractName: string;
  bytecode: string;
  abi: Array<ABIDescription>;
  vscode: any;
  errors: Error;
  compiledResult: CompilationResult;
  testNetId: string;
  currAccount: IAccount;
  unsignedTx: any;
  testNetCallResult: any;
}

type FormInputs = {
  contractAddress: string;
  methodName: string;
  amount: number;
  methodInputs: string;
};

const Deploy = (props: IProps) => {
  const [constructorInput, setConstructorInput] = useState<ConstructorInput | ConstructorInput[]>();
  const [error, setError] = useState<Error | string>();
  const [gasEstimate, setGasEstimate] = useState(0);
  const [byteCode, setByteCode] = useState<string>();
  const [abi, setAbi] = useState({});
  const [methodName, setMethodName] = useState<string>("");
  const [methodArray, setMethodArray] = useState({});
  const [methodInputs, setMethodInputs] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [txtHash, setTxtHash] = useState("");
  const [pvtKey, setPvtKey] = useState("");
  const [, setMsg] = useState("initial");
  const [processMessage, setProcessMessage] = useState("");
  const [isPayable, setIsPayable] = useState(false);
  const [payableAmount, setPayableAmount] = useState<number>(0);
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const [buildTxToggle, setBuildTxToggle] = useState(true);
  const [callFunToggle, setCallFunToggle] = useState(true);

  const { register, handleSubmit } = useForm<FormInputs>();

  useEffect(() => {
    setAbi(props.abi);
    setByteCode(props.bytecode);

    window.addEventListener("message", (event) => {
      const { data } = event;

      if (data.deployedResult) {
        setTxtHash(data.deployedResult);
        // this.setState({ txtHash: data.deployedResult });
      }
      if (data.gasEstimate) {
        setGasEstimate(data.gasEstimate);
        setGasEstimateToggle(false);
        setBuildTxToggle(false);
      }
      if (data.buildTxResult) {
        // TODO: fix unsigned tx is not updated after once
        props.setUnsgTxn(data.buildTxResult);
        setBuildTxToggle(false);
      }
      if (data.unsignedTx) {
        props.setUnsgTxn(data.unsignedTx);
      }
      if (data.pvtKey) {
        // TODO: fetching private key process needs fix
        setPvtKey(data.pvtKey);
        setProcessMessage("");
        setMsg("process Finished");
      }
      if (data.TestnetCallResult) {
        props.setTestnetCallResult(data.TestnetCallResult);
        setCallFunToggle(true);
      }
      if (data.error) {
        setError(data.error);
      }
    });

    // get private key for corresponding public key
    if (props.currAccount && props.currAccount.type === "Local") {
      setProcessMessage("Fetching private key...");
      props.vscode.postMessage({
        command: "get-pvt-key",
        payload: props.currAccount.pubAddr ? props.currAccount.pubAddr : props.currAccount.value,
      });
    }

    // Extract constructor input from abi and make array of all the methods input field.
    const methodArray: any = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const i in props.abi) {
      if (props.abi[i].type === "constructor" && props.abi[i].inputs!.length > 0) {
        try {
          const constructorInput: ConstructorInput[] = JSON.parse(JSON.stringify(props.abi[i].inputs));
          // eslint-disable-next-line guard-for-in, no-restricted-syntax
          for (const j in constructorInput) {
            j.value = "";
          }
          setConstructorInput(constructorInput);
        } catch (error) {
          setError("Error Setting/Parsing ABI type constructor");
        }
      } else if (props.abi[i].type !== "constructor") {
        try {
          // TODO: bellow strategy to extract method names and inputs should be improved
          // eslint-disable-next-line @typescript-eslint/dot-notation
          const methodname: string | undefined = props.abi[i]["name"];
          // if we have inputs
          // @ts-ignore
          methodArray[methodname] = {};
          // @ts-ignore
          if (props.abi[i].inputs && props.abi[i].inputs.length > 0) {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/dot-notation
            methodArray[methodname]["inputs"] = JSON.parse(JSON.stringify(props.abi[i]["inputs"]));
            // @ts-ignore
            // eslint-disable-next-line guard-for-in, no-restricted-syntax
            for (const i in methodArray[methodname].inputs) {
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/dot-notation
              methodArray[methodname]["inputs"][i].value = "";
            }
          } else {
            // @ts-ignore
            methodArray[methodname].inputs = [];
          }
          // @ts-ignore
          methodArray[methodname].stateMutprops.ability = props.abi[i].stateMutability;
        } catch (error) {
          setError(`Error Setting/Parsing ABI ${error}`);
        }
      }
    }
    setMethodArray(methodArray);
  }, []);

  const handleConstructorInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConstructorInput(JSON.parse(event.target.value));
  };

  const handleBuildTxn = () => {
    const { vscode, bytecode, abi, currAccount, testNetId } = props;
    const publicKey = currAccount.value;
    setBuildTxToggle(true);
    // create unsigned transaction here
    try {
      vscode.postMessage({
        command: "build-rawtx",
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
      setError(error);
    }
  };

  const getGasEstimate = () => {
    const { vscode, bytecode, abi, currAccount, testNetId } = props;
    setGasEstimateToggle(true);
    const publicKey = currAccount.value;
    try {
      vscode.postMessage({
        command: "run-get-gas-estimate",
        payload: {
          from: publicKey,
          abi,
          bytecode,
          params: constructorInput,
        },
        testNetId,
      });
    } catch (err) {
      setError(err);
    }
  };

  const handleCall = (formData: FormInputs) => {
    const { vscode, abi, currAccount, testNetId } = props;
    setPayableAmount(formData.amount);
    setContractAddress(formData.contractAddress);
    setMethodName(formData.methodName);
    setMethodInputs(formData.methodInputs);
    const publicKey = currAccount.value;
    setCallFunToggle(true);
    vscode.postMessage({
      command: "contract-method-call",
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
      setMethodArray(JSON.stringify(methodArray[methodName].inputs, null, "\t"));
      // @ts-ignore
      setIsPayable(methodArray[methodName].stateMutability === "payable");
    } else {
      setMethodName("");
      // @ts-ignore
      setMethodArray("");
      // @ts-ignore
      setIsPayable(false);
    }
  };

  const signAndDeploy = () => {
    const { vscode, unsignedTx, testNetId } = props;
    try {
      vscode.postMessage({
        command: "sign-deploy-tx",
        payload: {
          unsignedTx,
          pvtKey,
        },
        testNetId,
      });
    } catch (error) {
      setError(error);
    }
  };

  const handleGasEstimateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGasEstimate(parseInt(event.target.value, 10));
    if (gasEstimate > 0) {
      setBuildTxToggle(false);
    }
  };

  const { contractName, currAccount, unsignedTx, testNetCallResult } = props;

  const publicKey = currAccount && currAccount.value ? currAccount.value : "";
  return (
    <div className="deploy_container">
      {/* Bytecode and Abi */}
      <div>
        <h4 className="tag contract-name inline-block highlight-success">
          Contract Name: <span>{contractName}</span>
        </h4>
        <div className="byte-code" style={{ marginBottom: "15px" }}>
          <input
            className="input custom_input_css"
            style={{ width: "80vw" }}
            type="text"
            name="bytecode"
            onChange={(e) => setByteCode(e.target.value)}
            value={byteCode}
            placeholder="byte code"
            disabled
          />
        </div>
        <div className="abi-definition">
          <input
            className="input custom_input_css"
            style={{ width: "80vw" }}
            type="text"
            name="abi"
            onChange={(e) => setAbi(JSON.parse(e.target.value))}
            value={JSON.stringify(abi)}
            placeholder="abi"
            disabled
          />
        </div>
      </div>
      {/* Constructor */}
      <div>
        <div className="tag form-container">
          {constructorInput && (
            <div className="json_input_container">
              <textarea
                className="tag json_input custom_input_css"
                style={{ margin: "10px 0" }}
                value={JSON.stringify(constructorInput, null, "\t")}
                onChange={(e) => handleConstructorInputChange(e)}
              />
            </div>
          )}
        </div>

        {/* Call Function */}
        <div className="tag">
          <form onSubmit={handleSubmit(handleCall)} className="form_align">
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract address"
              style={{ marginRight: "5px" }}
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
            {methodName !== "" && methodInputs !== "" && methodInputs !== "[]" && (
              <div className="json_input_container" style={{ margin: "10px 0" }}>
                <textarea name="methodInputs" className="json_input custom_input_css" ref={register} />
              </div>
            )}
            {isPayable && (
              <input
                type="number"
                className="custom_input_css"
                placeholder="Enter payable amount"
                style={{ margin: "5px" }}
                name="payableAmount"
              />
            )}
            {/* <input type="submit" style={{ margin: '10px' }} className="custom_button_css" value="Call function" /> */}
            <Button ButtonType="input" disabled={callFunToggle} value="Call function" />
          </form>
        </div>
      </div>

      {/* Call function Result */}
      {Object.entries(testNetCallResult).length > 0 && (
        <div className="tag call-result">
          <span>{testNetCallResult ? "Call result:" : "Call error:"}</span>
          <div>
            {testNetCallResult ? (
              <pre className="large-code">{testNetCallResult}</pre>
            ) : (
              <pre className="large-code" style={{ color: "red" }}>
                {JSON.stringify(error)}
              </pre>
            )}
          </div>
        </div>
      )}

      {/* Get gas estimate */}
      <div className="account_row">
        <div className="input-container">
          <Button disabled={gasEstimateToggle} onClick={getGasEstimate}>
            Get gas estimate
          </Button>
        </div>
        <div className="input-container">
          <input
            className="input custom_input_css"
            name="gasEstimate"
            onChange={(e) => handleGasEstimateChange(e)}
            type="text"
            placeholder="gas supply"
            value={gasEstimate}
          />
        </div>
      </div>

      <div className="input-container">
        {gasEstimate > 0 ? (
          <Button disabled={buildTxToggle} onClick={handleBuildTxn}>
            Build transaction
          </Button>
        ) : (
          <Button disabled onClick={handleBuildTxn}>
            Build transaction
          </Button>
        )}
      </div>

      {unsignedTx && (
        <div className="tag">
          <h4 className="contract-name inline-block highlight-success">Unsigned Transaction:</h4>
          <div className="json_input_container" style={{ marginTop: "10px" }}>
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

      <div className="account_row">
        <div className="tag">
          {pvtKey && unsignedTx ? (
            <button className="acc-button custom_button_css" onClick={signAndDeploy}>
              Sign & Deploy
            </button>
          ) : (
            <button disabled className="acc-button button_disable custom_button_css" onClick={signAndDeploy}>
              Sign & Deploy
            </button>
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

      {/* Notification */}
      {processMessage && <pre className="processMessage">{processMessage}</pre>}

      {/* Error Handle */}
      <div className="error_message">
        {error && (
          <pre className="large-code" style={{ color: "red" }}>
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

function mapStateToProps({ compiledStore, debugStore, accountStore, txStore }: any) {
  const { compiledResult, testNetCallResult } = compiledStore;
  const { testNetId } = debugStore;
  const { currAccount } = accountStore;
  const { unsignedTx } = txStore;
  return {
    compiledResult,
    testNetCallResult,
    testNetId,
    currAccount,
    unsignedTx,
  };
}

export default connect(mapStateToProps, {
  setUnsgTxn,
  setTestnetCallResult,
})(Deploy);
