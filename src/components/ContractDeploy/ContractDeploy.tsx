import React, { Component } from "react";
import "./ContractDeploy.css";
import JSONPretty from 'react-json-pretty';
import { connect } from "react-redux";

interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
  compiled: any;
  error: Error | null;
  gasEstimate: number;
  deployedResult: string;
  compiledResult: object;
  callResult: object;
  deployAccount: string;
  testNetId: string;
}
interface IState {
  constructorInput: object[];
  gasSupply: number;
  error: Error | null;
  deployed: object;
  methodName: string;
  deployedAddress: string;
  methodInputs: string;
  testNetId: string;
}

class ContractDeploy extends Component<IProps, IState> {
  public state: IState = {
    constructorInput: [],
    gasSupply: 0,
    error: null,
    deployed: {},
    methodName: '',
    deployedAddress: '',
    methodInputs: '',
    testNetId: ''
  };
  constructor(props: IProps, state: IState) {
    super(props);
    this.handleDeploy = this.handleDeploy.bind(this);
    this.handleCall = this.handleCall.bind(this);
    this.handleGetGasEstimate = this.handleGetGasEstimate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleConstructorInputChange = this.handleConstructorInputChange.bind(this);
    this.handleMethodnameInput = this.handleMethodnameInput.bind(this);
    this.handleMethodInputs = this.handleMethodInputs.bind(this);
    this.handleContractAddrInput = this.handleContractAddrInput.bind(this);
  }

  componentDidMount() {
    this.setState({ testNetId: this.props.testNetId })
    this.setState({ deployed: this.props.compiledResult });
    const { abi } = this.props;
    for (var i in abi) {
      if (abi[i].type === 'constructor' && abi[i].inputs.length > 0) {
        const constructorInput = JSON.parse(JSON.stringify(abi[i].inputs));
        for (var j in constructorInput) {
          constructorInput[j]['value'] = "";
        }
        this.setState({ constructorInput: constructorInput });
        break;
      }
    }
  }
  componentDidUpdate(prevProps: any) {
    const { gasEstimate, deployedResult, error, abi } = this.props;
    if (error !== prevProps.error) {
      this.setState({ error: error });
    }
    if (this.props.testNetId !== this.state.testNetId) {
      this.setState({
        testNetId: this.props.testNetId
      })
    }
    else if (deployedResult !== prevProps.deployedResult) {
      const deployedObj = JSON.parse(deployedResult);
      this.setState({ deployed: deployedObj, deployedAddress: deployedObj.contractAddress });
    }
    else if ((this.state.gasSupply === 0 && gasEstimate !== this.state.gasSupply) || gasEstimate !== prevProps.gasEstimate) {
      this.setState({ gasSupply: gasEstimate });
    }

    const length = Object.keys(abi).length
    if (prevProps.abi !== abi) {
      if (abi[length - 1].type === 'constructor' && abi[length - 1].inputs.length > 0) {
        const constructorInput = JSON.parse(JSON.stringify(abi[abi.length - 1].inputs));
        for (let j in constructorInput) {
          constructorInput[j]['value'] = "";
        }
        this.setState({ constructorInput: constructorInput });
      } else {
        this.setState({ constructorInput: [] });
      }
    }
  }
  private handleDeploy() {
    const { vscode, bytecode, abi } = this.props;
    const { gasSupply, constructorInput, testNetId } = this.state;
    this.setState({ error: null, deployed: {} });
    vscode.postMessage({
      command: "run-deploy",
      payload: {
        abi,
        bytecode,
        params: constructorInput,
        gasSupply
      },
      testNetId
    });
  }
  private handleCall() {
    const { vscode, abi, deployAccount } = this.props;
    const { gasSupply, methodName, deployedAddress, methodInputs, testNetId } = this.state;
    this.setState({ error: null });
    vscode.postMessage({
      command: "contract-method-call",
      payload: {
        abi,
        address: deployedAddress,
        methodName: methodName,
        params: JSON.parse(methodInputs),
        gasSupply,
        deployAccount
      },
      testNetId
    });
  }
  private handleGetGasEstimate() {
    const { vscode, bytecode, abi } = this.props;
    const { constructorInput, testNetId } = this.state;
    try {
      vscode.postMessage({
        command: "run-get-gas-estimate",
        payload: {
          abi,
          bytecode,
          params: constructorInput
        },
        testNetId
      });
    } catch (err) {
      this.setState({ error: err });
    }
  }
  private handleChange(event: any) {
    this.setState({ gasSupply: event.target.value });
  }
  private handleConstructorInputChange(event: any) {
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
  private handleContractAddrInput(event: any) {
    this.setState({ deployedAddress: event.target.value });
  }
  private handleMethodnameInput(event: any) {
    const { abi } = this.props;
    for (var obj in abi) {
      // @ts-ignore
      if (abi[obj]['name'] === event.target.value) {
        var funcObj: object = abi[obj];
        this.setState({ methodName: event.target.value });
        // @ts-ignore
        for (var i in funcObj['inputs']) {
          // @ts-ignore
          funcObj['inputs'][i]['value'] = "";
        }
        // @ts-ignore
        this.setState({ methodInputs: JSON.stringify(funcObj['inputs'], null, '\t') });
        break;
      }
    }
  }
  private handleMethodInputs(event: any) {
    this.setState({ methodInputs: event.target.value });
  }
  public render() {
    const { gasSupply, error, constructorInput, deployed, methodName, methodInputs, deployedAddress } = this.state;
    const { callResult } = this.props;
    return (
      <div>
        <div>
          <form onSubmit={this.handleDeploy}>
            <div className="form-container">
              {
                (constructorInput && constructorInput.length > 0) &&
                <div>
                  {
                    (constructorInput.length <= 3) ?
                      <div>
                        {
                          constructorInput.map((x: object, index) => {
                            return (
                              <div className="constructorInput input-flex" style={{ marginTop: '10px', marginBottom: '10px' }}>
                                {/* 
                                // @ts-ignore */}
                                <label className="label_name">{x.name}:</label>
                                {/* 
                                // @ts-ignore */}
                                <input className="custom_input_css" type={x.type} placeholder={x.type} id={index} name={x.name} onChange={(e) => this.handleConstructorInputChange(e)} />
                              </div>
                            )
                          })
                        }
                      </div> :
                      <div className="json_input_container" style={{ marginLeft: '-10px' }}>
                        <textarea className="json_input custom_input_css" value={JSON.stringify(constructorInput, null, '\t')} onChange={(e) => this.handleConstructorInputChange(e)}>
                        </textarea>
                      </div>
                  }
                </div>
              }
            </div>
            <div className="gas_supply">
              <label className="label_name" style={{ marginRight: '10px' }}>Gas Supply:</label>
              {
                (gasSupply > 0) ?
                  <input type="number" className="input custom_input_css" value={gasSupply} id="deployGas" onChange={(e) => this.handleChange(e)} /> :
                  <input type="number" className="input custom_input_css" value="" id="deployGas" onChange={(e) => this.handleChange(e)} />
              }
            </div>
            <div style={{ marginBottom: '5px' }}>
              <input type="submit" className="custom_button_css" value="Deploy" />
            </div>
          </form>
          <div>
            <form onSubmit={this.handleGetGasEstimate}>
              <input type="submit" className="custom_button_css" value="Get gas estimate" />
            </form>
          </div>
          <div>
            <form onSubmit={this.handleCall} className="form_align" >
              <input type="text" className="custom_input_css" style={{ marginRight: '5px' }} name="contractAddress" value={deployedAddress} onChange={this.handleContractAddrInput} />
              <input type="text" className="custom_input_css" name="methodName" onChange={this.handleMethodnameInput} />
              {
                methodName !== '' && methodInputs !== '[]' &&
                <div className="json_input_container" style={{ marginTop: '10px' }}>
                  <textarea className="json_input custom_input_css" value={methodInputs} onChange={this.handleMethodInputs}></textarea>
                </div>
              }
              <input type="submit" style={{ marginLeft: '10px' }} className="custom_button_css" value="Call function" />
            </form>
          </div>
        </div>
        <div className="error_message">
          {
            error &&
            <div>
              <span className="contract-name inline-block highlight-success">
                Error Message:
            </span>
              <div>
                <pre className="large-code-error">{JSON.stringify(error)}</pre>
              </div>
            </div>
          }
        </div>
        {
          // @ts-ignore
          Object.entries(callResult).length > 0 &&
          <div className="call-result">
            <span>
              {/* 
              // @ts-ignore */}
              {callResult && callResult.callResult ? 'Call result:' : 'Call error:'}
            </span>
            <div>
              {/* 
              // @ts-ignore */}
              {callResult && callResult.callResult ?
                <pre className="large-code">
                  {
                    // @ts-ignore
                    callResult.callResult
                  }
                </pre> :
                <pre className="large-code" style={{ color: 'red' }}>
                  {
                    // @ts-ignore
                    JSON.stringify(callResult.error)
                  }
                </pre>
              }
            </div>
          </div>
        }
        {
          Object.entries(deployed).length > 0 &&
          <div className="transaction_receipt">
            <span className="contract-name inline-block highlight-success">
              Transaction Receipt:
            </span>
            <div>
              <pre className="large-code">
                <JSONPretty id="json-pretty" data={deployed}></JSONPretty>
              </pre>
            </div>
          </div>
        }
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  return {
    compiledResult: state.compiledStore.compiledresult,
    callResult: state.compiledStore.callResult
  };
}

export default connect(mapStateToProps, {})(ContractDeploy);
