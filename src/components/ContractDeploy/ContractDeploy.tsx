import React, { useEffect, useState } from "react";
import "./ContractDeploy.css";
import JSONPretty from "react-json-pretty";
import { connect } from "react-redux";
import { IAccount } from "types";
import { setCallResult } from "../../actions";
import { Button } from "../common/ui";

interface IProps {
  bytecode: any;
  abi: any;
  vscode: any;
  gasEstimate: number;
  deployedResult: string;
  compiledResult: any;
  callResult: any;
  currAccount: IAccount;
  testNetId: string;
  openAdvanceDeploy: any;
  // eslint-disable-next-line no-unused-vars
  setCallResult: (result: any) => void;
}

const ContractDeploy = (props: IProps) => {
  const [constructorInput, setConstructorInput] = useState([]);
  const [gasSupply, setGasSupply] = useState(0);
  const [error, setError] = useState(null);
  const [deployed, setDeployed] = useState({});
  const [methodName, setMethodName] = useState<string>("");
  const [deployedAddress, setDeployedAddress] = useState("");
  const [methodArray, setmethodArray] = useState({});
  const [methodInputs, setMethodInputs] = useState("");
  const [testNetId, setTestNetId] = useState("");
  const [isPayable, setIsPayable] = useState(false);
  const [payableAmount] = useState<number>(0);
  const [disable, setDisable] = useState(true);
  const [gasEstimateToggle, setGasEstimateToggle] = useState(false);
  const [callFunctionToggle, setCallFunctionToggle] = useState(true);

  useEffect(() => {
    setTestNetId(props.testNetId);
    setDeployed(props.compiledResult);
    window.addEventListener("message", (event) => {
      const { data } = event;

      if (data.ganacheCallResult) {
        props.setCallResult(data.ganacheCallResult);
        setCallFunctionToggle(false);
      }
      if (data.error) {
        setError(data.error);
      }
    });
    const { abi } = props;

    const methodArray: any = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const i in abi) {
      if (abi[i].type === "constructor" && abi[i].inputs.length > 0) {
        const constructorInput = JSON.parse(JSON.stringify(abi[i].inputs));
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const j in constructorInput) {
          constructorInput[j].value = "";
        }
        setConstructorInput(constructorInput);
      } else if (abi[i].type !== "constructor") {
        // TODO: bellow strategy to extract method names and inputs should be improved
        const methodname: string = abi[i].name ? abi[i].name : "fallback";

        // if we have inputs
        // @ts-ignore
        methodArray[methodname] = {};
        // @ts-ignore
        if (abi[i].inputs && abi[i].inputs.length > 0) {
          // @ts-ignore
          methodArray[methodname].inputs = JSON.parse(JSON.stringify(abi[i].inputs));
          // @ts-ignore
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const i in methodArray[methodname].inputs) {
            // @ts-ignore
            methodArray[methodname].inputs[i].value = "";
          }
        } else {
          // @ts-ignore
          methodArray[methodname].inputs = [];
        }
        // @ts-ignore
        methodArray[methodname].stateMutability = abi[i].stateMutability;
      }
    }
    setmethodArray(methodArray);
  }, [props]);

  useEffect(() => {
    setError(error);
  }, [error]);

  useEffect(() => {
    if (props.testNetId !== testNetId && props.testNetId !== "ganache") {
      setDisable(true);
    } else if (props.testNetId !== testNetId) {
      setDisable(disable);
    }

    if (props.testNetId !== testNetId) {
      setTestNetId(props.testNetId);
    }
    const deployedObj = JSON.parse(props.deployedResult);
    setDeployed(deployedObj);
    setDeployedAddress(deployedObj.contractAddress);
    setDisable(false);

    if (gasSupply === 0 && props.gasEstimate !== gasSupply) {
      setGasSupply(props.gasEstimate);
      setDisable(false);
      setGasEstimateToggle(false);
    }
  }, [disable, gasSupply, props.deployedResult, props.gasEstimate, props.testNetId, testNetId]);

  const handleDeploy = () => {
    const { vscode, bytecode, abi, currAccount } = props;
    setError(null);
    setDeployed({});
    setDisable(true);
    vscode.postMessage({
      command: "run-deploy",
      payload: {
        abi,
        bytecode,
        params: constructorInput,
        gasSupply,
        from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
      },
      testNetId,
    });
  };

  const handleCall = () => {
    const { vscode, abi, currAccount } = props;
    setError(null);
    setCallFunctionToggle(true);
    vscode.postMessage({
      command: "ganache-contract-method-call",
      payload: {
        abi,
        address: deployedAddress,
        methodName,
        params: JSON.parse(methodInputs),
        gasSupply,
        // TODO: add value supply in case of payable functions
        value: payableAmount,
        from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
      },
      testNetId,
    });
  };

  const handleGetGasEstimate = () => {
    const { vscode, bytecode, abi, currAccount } = props;
    setGasEstimateToggle(true);
    try {
      vscode.postMessage({
        command: "run-get-gas-estimate",
        payload: {
          abi,
          bytecode,
          params: constructorInput,
          from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
        },
        testNetId,
      });
    } catch (err) {
      setError(error);
    }
  };

  const handleChange = (event: any) => {
    // const {
    //   target: { name, value },
    // } = event;
    console.log(event);
    // @ts-ignore
    // this.setState({ [name]: value });

    if (gasSupply > 0) {
      setDisable(false);
    }
  };

  const handleConstructorInputChange = (event: any) => {
    if (constructorInput.length > 3) {
      setConstructorInput(JSON.parse(event.target.value));
    } else {
      const item = constructorInput[event.target.id];
      // @ts-ignore
      item.value = event.target.value;
      constructorInput[event.target.id] = item;
      setConstructorInput(constructorInput);
    }
  };

  const handleContractAddrInput = (event: any) => {
    setDeployedAddress(event.target.value);
  };

  const handleMethodnameInput = (event: any) => {
    setCallFunctionToggle(false);
    const methodName: string = event.target.value;
    // eslint-disable-next-line no-prototype-builtins
    if (methodName && methodArray.hasOwnProperty(methodName)) {
      setMethodName(methodName);
      // @ts-ignore
      setMethodInputs(JSON.stringify(methodArray[methodName].inputs, null, "\t"));
      // @ts-ignore
      setIsPayable(methodArray[methodName].stateMutability === "payable");
    } else {
      setMethodName("");
      setMethodInputs("");
      setIsPayable(false);
    }
  };

  const handleMethodInputs = (event: any) => {
    setMethodInputs(event.target.value);
  };

  return (
    <div>
      <div>
        <form onSubmit={handleDeploy}>
          <div className="form-container">
            {constructorInput && constructorInput.length > 0 && (
              <div>
                {constructorInput.length <= 3 ? (
                  <div>
                    {constructorInput.map((x: any, index) => {
                      return (
                        <div
                          className="constructorInput input-flex"
                          style={{ marginTop: "10px", marginBottom: "10px" }}
                        >
                          {/* 
                                // @ts-ignore */}
                          <label className="label_name">{x.name}:</label>
                          {/* 
                                // @ts-ignore */}
                          <input
                            className="custom_input_css"
                            type={x.type}
                            placeholder={`${x.name} arguments (${x.type})`}
                            id={index.toString()}
                            name={x.name}
                            onChange={(e) => handleConstructorInputChange(e)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="json_input_container" style={{ marginLeft: "-10px" }}>
                    <textarea
                      className="json_input custom_input_css"
                      value={JSON.stringify(constructorInput, null, "\t")}
                      onChange={(e) => handleConstructorInputChange(e)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="gas_supply">
            <label className="label_name" style={{ marginRight: "10px" }}>
              Gas Supply:
            </label>
            {gasSupply > 0 ? (
              <input
                type="number"
                placeholder='click on "get gas estimate" '
                className="input custom_input_css"
                value={gasSupply}
                id="deployGas"
                name="gasSupply"
                onChange={(e) => handleChange(e)}
              />
            ) : (
              <input
                type="number"
                placeholder='click on "get gas estimate" '
                className="input custom_input_css"
                value=""
                id="deployGas"
                name="gasSupply"
                onChange={(e) => handleChange(e)}
              />
            )}
          </div>
          <div style={{ marginBottom: "5px" }}>
            {testNetId !== "ganache" ? (
              <Button onClick={props.openAdvanceDeploy}>Advance Deploy</Button>
            ) : gasSupply > 0 ? (
              <Button ButtonType="input" disabled={disable} value="Deploy" />
            ) : (
              <Button ButtonType="input" disabled value="Deploy" />
            )}
          </div>
        </form>
        <div>
          <form onSubmit={handleGetGasEstimate}>
            <Button ButtonType="input" disabled={gasEstimateToggle} value="Get gas estimate" />
          </form>
        </div>
        <div>
          <form onSubmit={handleCall} className="form_align">
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract address"
              style={{ marginRight: "5px" }}
              name="contractAddress"
              value={deployedAddress}
              onChange={handleContractAddrInput}
            />
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract function name"
              name="methodName"
              onChange={handleMethodnameInput}
            />
            {methodName !== "" && methodInputs !== "" && methodInputs !== "[]" && (
              <div className="json_input_container" style={{ marginTop: "10px" }}>
                <textarea className="json_input custom_input_css" value={methodInputs} onChange={handleMethodInputs} />
              </div>
            )}
            {isPayable && (
              <input
                type="number"
                className="custom_input_css"
                placeholder="Enter payable amount"
                style={{ margin: "5px" }}
                name="payableAmount"
                value={payableAmount}
                onChange={(e) => handleChange(e)}
              />
            )}
            <Button ButtonType="input" disabled={callFunctionToggle} value="Call function" />
          </form>
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
            {callResult || (callResult && callResult.callResult) ? "Call result:" : "Call error:"}
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
