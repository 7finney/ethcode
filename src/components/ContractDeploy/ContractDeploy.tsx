import React, { useEffect, useState } from "react";
import "./ContractDeploy.css";
import JSONPretty from "react-json-pretty";
import { connect } from "react-redux";
import { ABIDescription, CompilationResult, ConstructorInput, IAccount } from "types";
import { setCallResult } from "../../actions";
import { Button, ButtonType } from "../common/ui";
import { useForm } from "react-hook-form";

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
  openAdvanceDeploy: any;
  // eslint-disable-next-line no-unused-vars
  setCallResult: (result: CompilationResult) => void;
}

type FormDeploy = {
  gasSupply: number;
};

type FormContract = {
  contractAddress: string;
  methodName: string;
  payableAmount: number;
};

const ContractDeploy = (props: IProps) => {
  const [constructorInput, setConstructorInput] = useState<ConstructorInput | ConstructorInput[]>([]);
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

  // TODO WIll refactor this with proper types
  const { register: registerDeploy, handleSubmit: handleDeploySubmit } = useForm<FormDeploy>();
  const { register: registerContract, handleSubmit: handleContractSubmit } = useForm<FormContract>();

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
      if (abi[i].type === "constructor" && abi[i].inputs!.length > 0) {
        try {
          const constructorInput: ConstructorInput[] = JSON.parse(JSON.stringify(abi[i].inputs));
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const j in constructorInput) {
            constructorInput[j].value = "";
          }
          setConstructorInput(constructorInput);
        } catch (error) {
          console.error("Error In abi constructor parsing: ", error);
        }
      } else if (abi[i].type !== "constructor") {
        try {
          // TODO: bellow strategy to extract method names and inputs should be improved
          const methodname: string = abi[i].name! ? abi[i].name! : "fallback";
          // if we have inputs
          // @ts-ignore
          methodArray[methodname] = {};
          // @ts-ignore
          if (abi[i].inputs && abi[i].inputs.length > 0) {
            // @ts-ignore
            // methodArray[methodname].inputs = JSON.parse(JSON.stringify(abi[i].inputs));
            // @ts-ignore
            // eslint-disable-next-line no-restricted-syntax, guard-for-in
            for (const i in methodArray[methodname].inputs) {
              methodArray[methodname].inputs[i].value = "";
            }
          } else {
            // @ts-ignore
            methodArray[methodname].inputs = [];
          }
          // @ts-ignore
          methodArray[methodname].stateMutability = abi[i].stateMutability;
        } catch (error) {
          console.error("Error In abi parsing: ", error);
        }
      }
    }
    setmethodArray(methodArray);
  }, []);

  useEffect(() => {
    setError(error);
  }, [error]);

  useEffect(() => {
    if (props.testNetId !== testNetId && props.testNetId !== "ganache") {
      setDisable(true);
    } else if (props.testNetId !== testNetId) {
      setDisable(disable);
      setTestNetId(props.testNetId);
    }
  }, [props.testNetId, testNetId]);

  useEffect(() => {
    if (props.deployedResult !== "") {
      const deployedObj = JSON.parse(props.deployedResult);
      setDeployed(deployedObj);
      setDeployedAddress(deployedObj.contractAddress);
      setDisable(false);
    }
  }, [props.deployedResult]);

  useEffect(() => {
    if (gasSupply === 0 && props.gasEstimate !== gasSupply) {
      setGasSupply(props.gasEstimate);
      setDisable(false);
      setGasEstimateToggle(false);
    }
  }, [props.gasEstimate]);

  const handleDeploy = (formDeployData: FormDeploy) => {
    setGasSupply(formDeployData.gasSupply);
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

  const handleCall = (FormContractData: FormContract) => {
    setDeployedAddress(FormContractData.contractAddress);
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
    } catch (error) {
      setError(error);
    }
  };

  const handleConstructorInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConstructorInput(JSON.parse(event.target.value));
  };

  const handleMethodnameInput = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
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

  const handleMethodInputs = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setMethodInputs(event.target.value);
  };

  return (
    <div>
      <div>
        <form onSubmit={handleDeploySubmit(handleDeploy)}>
          <div className="form-container">
            {constructorInput && (
              <div className="json_input_container" style={{ marginLeft: "-10px" }}>
                <textarea
                  className="json_input custom_input_css"
                  value={JSON.stringify(constructorInput, null, "\t")}
                  onChange={(e) => handleConstructorInputChange(e)}
                />
              </div>
            )}
          </div>
          <div className="gas_supply">
            <label className="label_name" style={{ marginRight: "10px" }}>
              Gas Supply:
            </label>
            <input
              type="number"
              placeholder='click on "get gas estimate" '
              className="input custom_input_css"
              value={gasSupply > 0 ? gasSupply : ""}
              id="deployGas"
              ref={registerDeploy}
              name="gasSupply"
            />
          </div>
          <div style={{ marginBottom: "5px" }}>
            {testNetId !== "ganache" ? (
              <Button buttonType={ButtonType.Input} onClick={props.openAdvanceDeploy}>
                Advance Deploy
              </Button>
            ) : (
              <Button buttonType={ButtonType.Input} disabled={gasSupply > 0 ? disable : true}>
                Deploy
              </Button>
            )}
          </div>
        </form>
        <div>
          <form onSubmit={handleGetGasEstimate}>
            <Button buttonType={ButtonType.Input} disabled={gasEstimateToggle}>
              Get gas estimate
            </Button>
          </form>
        </div>
        <div>
          <form onSubmit={handleContractSubmit(handleCall)} className="form_align">
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract address"
              style={{ marginRight: "5px" }}
              name="contractAddress"
              defaultValue={deployedAddress}
              ref={registerContract}
            />
            <input
              type="text"
              className="custom_input_css"
              placeholder="Enter contract function name"
              name="methodName"
              ref={registerContract}
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
                ref={registerContract}
                defaultValue={payableAmount}
              />
            )}
            <Button buttonType={ButtonType.Input} disabled={callFunctionToggle}>
              Call function
            </Button>
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
            {props.callResult || (props.callResult && props.callResult.callResult) ? "Call result:" : "Call error:"}
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
