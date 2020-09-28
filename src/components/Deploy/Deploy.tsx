import React, { Component } from 'react';
import JSONPretty from 'react-json-pretty';
import "./deploy.css";
import { connect } from "react-redux";
import { setUnsgTxn, setTestnetCallResult } from "../../actions";
import { IAccount } from 'types';
import { Button } from '../common/ui';

export interface IProps {
  setUnsgTxn: (unsgTxn: any) => void;
  setTestnetCallResult: (result: any) => void;
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
  errors: any;
  compiledResult: object;
  testNetId: string;
  currAccount: IAccount;
  unsignedTx: any;
  testNetCallResult: any;
}

export interface IState {
  showUnsignedTxn: boolean;
  constructorInput: object[];
  error: Error | any;
  deployed: object;
  gasEstimate: number;
  bytecode: any;
  abi: any;
  methodName: string | null;
  methodArray: object;
  methodInputs: string;
  contractAddress: string;
  txtHash: string;
  pvtKey: string;
  msg: string;
  processMessage: string;
  isPayable: boolean;
  payableAmount: any;
  gasEstimateToggle: boolean;
  buildTxToggle: boolean;
  callFunToggle: boolean;
}

class Deploy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      showUnsignedTxn: false,
      constructorInput: [],
      error: null,
      deployed: {},
      gasEstimate: 0,
      bytecode: {},
      abi: {},
      // @ts-ignore
      methodName: null,
      methodArray: {},
      methodInputs: '',
      contractAddress: '',
      txtHash: '',
      pvtKey: '',
      msg: 'initial',
      processMessage: '',
      isPayable: false,
      payableAmount: null,
      gasEstimateToggle: false,
      buildTxToggle: true,
      callFunToggle: true
    };
    this.handleMethodnameInput = this.handleMethodnameInput.bind(this);
    this.handleMethodInputs = this.handleMethodInputs.bind(this);
  }

  componentDidMount() {
    const { abi, bytecode, vscode, currAccount, setUnsgTxn } = this.props;
    this.setState({ abi, bytecode });

    window.addEventListener("message", event => {
      const { data } = event;

      if (data.deployedResult) {
        this.setState({ txtHash: data.deployedResult });
      }
      if (data.gasEstimate) {
        this.setState({ gasEstimate: data.gasEstimate, gasEstimateToggle: false, buildTxToggle: false });
      }
      if (data.buildTxResult) {
        // TODO: fix unsigned tx is not updated after once
        setUnsgTxn(data.buildTxResult);
        this.setState({ buildTxToggle: false });
      }
      if (data.unsignedTx) {
        setUnsgTxn(data.unsignedTx);
      }
      if (data.pvtKey) {
        // TODO: fetching private key process needs fix
        this.setState({ pvtKey: data.pvtKey, processMessage: '' }, () => {
          this.setState({ msg: 'process finshed' });
        });
      }
      if (data.TestnetCallResult) {
        this.props.setTestnetCallResult(data.TestnetCallResult);
        this.setState({ callFunToggle: false });
      }
      if (data.error) {
        this.setState({ error: data.error });
      }
    });
    // get private key for corresponding public key
    if (currAccount.type === 'Local') {
      this.setState({ processMessage: 'Fetching private key...' });
      vscode.postMessage({ command: "get-pvt-key", payload: currAccount.pubAddr ? currAccount.pubAddr : currAccount.value });
    }
    // Extract constructor input from abi and make array of all the methods input field.
    let methodArray: object = {};
    for (let i in abi) {
      if (abi[i].type === 'constructor' && abi[i].inputs.length > 0) {
        const constructorInput = JSON.parse(JSON.stringify(abi[i].inputs));
        for (let j in constructorInput) {
          constructorInput[j]['value'] = "";
        }
        this.setState({ constructorInput: constructorInput });
      } else if(abi[i].type !== 'constructor') {
        // TODO: bellow strategy to extract method names and inputs should be improved
        const methodname: string = abi[i]['name'];
        
        // if we have inputs
        // @ts-ignore
        methodArray[methodname] = {};
        // @ts-ignore
        if(abi[i].inputs && abi[i].inputs.length > 0) {
          // @ts-ignore
          methodArray[methodname]['inputs'] = JSON.parse(JSON.stringify(abi[i]['inputs']));
          // @ts-ignore
          for (let i in methodArray[methodname]['inputs']) {
            // @ts-ignore
            methodArray[methodname]['inputs'][i]['value'] = "";
          }
        } else {
          // @ts-ignore
          methodArray[methodname]['inputs'] = [];
        }
        // @ts-ignore
        methodArray[methodname]['stateMutability'] = abi[i]['stateMutability'];
      }
    }
    this.setState({ methodArray: methodArray });
  }

  private handleConstructorInputChange = (event: any) => {
    const { constructorInput } = this.state;
    if (constructorInput.length > 3) {
      this.setState({ constructorInput: JSON.parse(event.target.value) });
    } else {
      const item = constructorInput[event.target.id];
      // @ts-ignore
      item['value'] = event.target.value;
      constructorInput[event.target.id] = item;
      this.setState({ constructorInput });
    }
  }

  handleBuildTxn = () => {
    const { vscode, bytecode, abi, currAccount, testNetId } = this.props;
    const { constructorInput, gasEstimate } = this.state;
    const publicKey = currAccount.value;
    this.setState({ buildTxToggle: true });
    // create unsigned transaction here
    try {
      vscode.postMessage({
        command: "build-rawtx",
        payload: {
          from: publicKey,
          abi,
          bytecode,
          params: constructorInput ? constructorInput : [],
          gasSupply: gasEstimate ? gasEstimate : 0
        },
        testNetId
      });
    } catch (error) {
      this.setState({ error });
    }
  };

  private getGasEstimate = () => {
    const { vscode, bytecode, abi, currAccount, testNetId } = this.props;
    const { constructorInput } = this.state;
    this.setState({ gasEstimateToggle: true });
    const publicKey = currAccount.value;
    try {
      vscode.postMessage({
        command: "run-get-gas-estimate",
        payload: {
          from: publicKey,
          abi,
          bytecode,
          params: constructorInput
        },
        testNetId
      });
    } catch (err) {
      this.setState({ error: err });
    }
  };

  private handleCall = () => {
    const { vscode, abi, currAccount, testNetId } = this.props;
    const { gasEstimate, methodName, contractAddress, methodInputs, payableAmount } = this.state;
    const publicKey = currAccount.value;
    this.setState({ callFunToggle: true });
    vscode.postMessage({
      command: "contract-method-call",
      payload: {
        from: publicKey,
        abi,
        address: contractAddress,
        methodName: methodName,
        params: JSON.parse(methodInputs),
        gasSupply: gasEstimate,
        value: payableAmount
      },
      testNetId
    });
  }

  private handleMethodnameInput(event: any) {
    const { methodArray } = this.state;
    const methodName: string = event.target.value;
    this.setState({ callFunToggle: false });
    // @ts-ignore
    if(methodName && methodArray.hasOwnProperty(event.target.value)) {
      this.setState({
        methodName,
        // @ts-ignore
        methodInputs: JSON.stringify(methodArray[methodName]['inputs'], null, '\t'),
        // @ts-ignore diptajit please check if this works properly
        isPayable: (methodArray[methodName]['stateMutability'] === "payable") ? true : false
      });
    } else {
      this.setState({
        methodName: null,
        // @ts-ignore
        methodInputs: '',
        // @ts-ignore diptajit please check if this works properly
        isPayable: false
      });
    }
  }
  private handleMethodInputs(event: any) {
    this.setState({ methodInputs: event.target.value, callFunToggle: false });
  }

  signAndDeploy = () => {
    const { vscode, unsignedTx, testNetId } = this.props;
    const { pvtKey } = this.state;
    try {
      vscode.postMessage({
        command: "sign-deploy-tx",
        payload: {
          unsignedTx,
          pvtKey
        },
        testNetId
      });
    } catch (error) {
      this.setState({ error });
    }
  };

  handleChange = (event: any) => {
    const { target: { name, value } } = event;
    // @ts-ignore
    this.setState({ [name]: value });
    if (this.state.gasEstimate > 0) {
      this.setState({ buildTxToggle: false });
    }
  }

  render() {
    const { contractName, currAccount, unsignedTx, testNetCallResult } = this.props;
    const {
      gasEstimate,
      constructorInput,
      bytecode,
      abi,
      txtHash,
      pvtKey,
      processMessage,
      error,
      methodInputs,
      methodName,
      contractAddress,
      isPayable,
      payableAmount,
      gasEstimateToggle,
      buildTxToggle,
      callFunToggle
    } = this.state;
    const publicKey = currAccount.value;
    return (
      <div className="deploy_container">
        {/* Bytecode and Abi */}
        <div>
          <h4 className="tag contract-name inline-block highlight-success">
            Contract Name: <span>{contractName}</span>
          </h4>
          <div className="byte-code" style={{ marginBottom: '15px' }}>
            <input
              className="input custom_input_css"
              style={{ width: '80vw' }}
              type="text"
              name="bytecode"
              onChange={(e) => this.setState({ bytecode: e.target.value })}
              value={bytecode}
              placeholder="byte code"
              disabled />
          </div>
          <div className="abi-definition">
            <input
              className="input custom_input_css"
              style={{ width: '80vw' }}
              type="text"
              name="abi"
              onChange={(e) => this.setState({ abi: JSON.parse(e.target.value) })}
              value={JSON.stringify(abi)}
              placeholder="abi"
              disabled />
          </div>
        </div>
        {/* Constructor */}
        <div>
          <div className="tag form-container">
            {
              (constructorInput && constructorInput.length > 0) &&
              <div>
                {
                  (constructorInput.length <= 3) ?
                    <div>
                      <h4 className="tag contract-name inline-block highlight-success">
                        Constructor:
                     </h4>
                      {
                        constructorInput.map((x: object, index) => {
                          return (
                            <div className="constructorInput input-flex" style={{ marginTop: '10px', marginBottom: '10px' }}>
                              {/* 
                                // @ts-ignore */}
                              <label className="tag label_name">{x.name}:</label>
                              {/* 
                                // @ts-ignore */}
                              <input className="custom_input_css" type={x.type} placeholder={`${x.name} arguments (${x.type})`} id={index} name={x.name} onChange={(e) => this.handleConstructorInputChange(e)} />
                            </div>
                          );
                        })
                      }
                    </div> :
                    <div className="json_input_container">
                      <textarea className="tag json_input custom_input_css" style={{ margin: '10px 0' }} value={JSON.stringify(constructorInput, null, '\t')} onChange={(e) => this.handleConstructorInputChange(e)}>
                      </textarea>
                    </div>
                }
              </div>
            }
          </div>

          {/* Call Function */}
          <div className="tag">
            <form onSubmit={this.handleCall} className="form_align" >
              <input type="text" className="custom_input_css" placeholder='Enter contract address' style={{ marginRight: '5px' }} name="contractAddress" value={contractAddress} onChange={(e) => this.setState({ contractAddress: e.target.value })} />
              <input type="text" className="custom_input_css" placeholder='Enter contract function name' name="methodName" onChange={this.handleMethodnameInput} />
              {
                methodName !== '' && methodInputs !== '' && methodInputs !== '[]' &&
                <div className="json_input_container" style={{ margin: '10px 0' }}>
                  <textarea className="json_input custom_input_css" value={methodInputs} onChange={this.handleMethodInputs}></textarea>
                </div>
              }
              {isPayable &&
              <input type="number" className="custom_input_css" placeholder='Enter payable amount' style={{ margin: '5px' }} name="payableAmount" value={payableAmount} onChange={(e) =>this.handleChange(e)} />
              }
              {/* <input type="submit" style={{ margin: '10px' }} className="custom_button_css" value="Call function" /> */}
              <Button ButtonType="input" disabled={callFunToggle} value="Call function" />
            </form>
          </div>
        </div>

        {/* Call function Result */}
        {Object.entries(testNetCallResult).length > 0 &&
          <div className="tag call-result">
            <span>
              {testNetCallResult ? 'Call result:' : 'Call error:'}
            </span>
            <div>
              {testNetCallResult ?
                <pre className="large-code">
                  {testNetCallResult}
                </pre> :
                <pre className="large-code" style={{ color: 'red' }}>
                  {JSON.stringify(error)}
                </pre>
              }
            </div>
          </div>}

        {/* Get gas estimate */}
        <div className="account_row">
          <div className="input-container">
            <Button disabled={gasEstimateToggle} onClick={this.getGasEstimate}>Get gas estimate</Button>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" name="gasEstimate" onChange={(e) => this.handleChange(e)} type="text" placeholder="gas supply" value={gasEstimate} />
          </div>
        </div>

        <div className="input-container">
          { gasEstimate > 0 ?
            <Button disabled={buildTxToggle} onClick={this.handleBuildTxn}>Build transaction</Button>
            : <Button disabled={true} onClick={this.handleBuildTxn}>Build transaction</Button>
           }
        </div>

        {
          unsignedTx &&
          <div className="tag">
            <h4 className="contract-name inline-block highlight-success">
              Unsigned Transaction:
            </h4>
            <div className="json_input_container" style={{ marginTop: '10px' }}>
              <pre className="large-code">
                <JSONPretty id="json-pretty" data={unsignedTx}></JSONPretty>
              </pre>
              {/* <textarea className="json_input custom_input_css">{unsignedTx}</textarea> */}
            </div>
          </div>
        }

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
            {pvtKey && unsignedTx ?
              <button className="acc-button custom_button_css" onClick={this.signAndDeploy}>Sign & Deploy</button>
              : <button disabled={true} className="acc-button button_disable custom_button_css" onClick={this.signAndDeploy}>Sign & Deploy</button>
            }
          </div>
        </div>

        {/* Final Transaction Hash */}
        {pvtKey &&
          <div className="account_row">
            <div className="tag">
              <h4>Transaction hash</h4>
            </div>
            <div className="input-container">
              <input className="input custom_input_css" type="text" value={txtHash} placeholder="transaction hash" />
            </div>
          </div>}

        {/* Notification */}
        {
          processMessage &&
          <pre className="processMessage">{processMessage}</pre>
        }

        {/* Error Handle */}
        <div className="error_message">
          {
            error &&
            <pre className="large-code" style={{ color: 'red' }}>
              {
                // @ts-ignore
                JSON.stringify(error)
              }
            </pre>
          }
        </div>
      </div>
    );
  }
}

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
    unsignedTx
  };
}

export default connect(mapStateToProps, {
  setUnsgTxn,
  setTestnetCallResult
})(Deploy);