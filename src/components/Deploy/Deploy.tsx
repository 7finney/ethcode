import React, { Component } from 'react';
import "./deploy.css";
import { connect } from "react-redux";
import { setUnsgTxn } from "../../actions";
import { IAccount } from 'types';

export interface IProps {
  setUnsgTxn: (unsgTxn: any) => void;
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
  errors: any;
  compiledResult: object;
  testNetId: string;
  currAccount: IAccount;
  unsignedTx: any;
}

export interface IState {
  showUnsignedTxn: boolean;
  constructorInput: object[];
  error: string;
  deployed: object;
  gasEstimate: number;
  bytecode: any;
  abi: any;
  txtHash: string;
  pvtKey: string;
}

class Deploy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showUnsignedTxn: false,
      constructorInput: [],
      error: '',
      deployed: {},
      gasEstimate: 0,
      bytecode: {},
      abi: {},
      txtHash: '',
      pvtKey: ''
    };
    this.handleBuildTxn = this.handleBuildTxn.bind(this);
    this.getGasEstimate = this.getGasEstimate.bind(this);
  }

  componentDidUpdate() {
    const { unsignedTx, currAccount } = this.props;
    // const publicKey = currAccount.value;
    // console.log(JSON.stringify(unsignedTx));
    console.log(JSON.stringify(currAccount));
    
  }
  componentDidMount() {
    const { abi, bytecode, vscode, currAccount } = this.props;
    console.log("currAccount");
    
    console.log(currAccount);
    this.setState({ abi, bytecode });

    window.addEventListener("message", async event => {
      const { data } = event;

      if(data.gasEstimate) {
        this.setState({ gasEstimate: data.gasEstimate });
      }
      if(data.buildTxResult) {
        console.log("setting unsigned transaction");
        console.log(JSON.stringify(data.buildTxResult));
        this.props.setUnsgTxn(data.buildTxResult);
      }
      if(data.pvtKey) {
        console.log("Setting active private key");
        console.log(data.pvtKey);
        this.setState({ pvtKey: data.pvtKey });
      }
    })
    // get private key for corresponding public key
    vscode.postMessage({ command: "get-pvt-key", payload: currAccount.pubAddr ? currAccount.pubAddr : currAccount.value });

    // this.setState({ deployed: this.props.compiledResult });
    // for (let i in abi) {
    //   if (abi[i].type === 'constructor' && abi[i].inputs.length > 0) {
    //     const constructorInput = JSON.parse(JSON.stringify(abi[i].inputs));
    //     for (let j in constructorInput) {
    //       constructorInput[j]['value'] = "";
    //     }
    //     this.setState({ constructorInput: constructorInput });
    //     break;
    //   }
    // }
  }

  handleBuildTxn = () => {
    const { vscode, bytecode, abi, currAccount, testNetId } = this.props;
    const { constructorInput, gasEstimate } = this.state;
    const publicKey = currAccount.value;
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
  }

  getGasEstimate = () => {
    const { vscode, bytecode, abi, testNetId } = this.props;
    const { constructorInput } = this.state;

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

  signAndDeploy = () => {
    const { vscode, unsignedTx, testNetId } = this.props;
    try {
      // get private key for corresponding public key
      vscode.postMessage({
        command: "sign-deploy-tx",
        payload: {
          unsignedTx,
          // need to pass private Key
        },
        testNetId
      });
    } catch (error) {
      this.setState({ error });
    }
  }

  render() {
    const { contractName, currAccount, unsignedTx, errors } = this.props;
    const { gasEstimate, bytecode, abi, txtHash, pvtKey } = this.state;
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
              placeholder="byte code" />
          </div>
          <div className="abi-definition">
            <input
              className="input custom_input_css"
              style={{ width: '80vw' }}
              type="text"
              name="abi"
              onChange={(e) => this.setState({ abi: e.target.value })}
              value={abi}
              placeholder="abi" />
          </div>
          <div>
            {
              errors &&
              <div>
                {errors}
              </div>
            }
          </div>
        </div>
        {/* Constructor */}
        <div>
          <h4 className="tag contract-name inline-block highlight-success">
            Constructor:
          </h4>
          <div className="json_input_container" style={{ marginTop: '10px' }}>
            <textarea className="json_input custom_input_css"></textarea>
          </div>
        </div>
        {/* Get gas estimate */}
        <div className="account_row">
          <div className="input-container">
            <button className="acc-button custom_button_css" onClick={this.getGasEstimate}>Get gas estimate</button>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" disabled type="text" placeholder="gas supply" value={gasEstimate} />
          </div>
        </div>

        <div className="input-container">
          <button className="acc-button custom_button_css" onClick={this.handleBuildTxn}>Build transaction</button>
        </div>

        {unsignedTx &&
          (<div>
            <h6 className="contract-name inline-block highlight-success">
              Unsigned Transaction:
            </h6>
            <div className="json_input_container" style={{ marginTop: '10px' }}>
              <textarea className="json_input custom_input_css">{JSON.stringify(unsignedTx)}</textarea>
            </div>
          </div>)}

        <div className="account_row">
          <div className="tag">
            <h4>Public key </h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" value={publicKey} placeholder="public key" />
          </div>
        </div>

        <div className="account_row">
          <div className="tag">
            <h4>Private key </h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="private key" value={pvtKey} />
          </div>
        </div>

        <div className="account_row">
          <div className="tag">
            <button className="acc-button custom_button_css" onClick={this.signAndDeploy}>Sign & Deploy</button>
          </div>
        </div>

        {/* Final Transaction Hash */}
        <div className="account_row">
          <div className="tag">
            <h4>Transaction hash </h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" value={txtHash} placeholder="transaction hash" />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ compiledStore, debugStore, accountStore, txStore }: any) {
  const { compiledResult, callResult } = compiledStore;
  const { testNetId } = debugStore;
  const { currAccount } = accountStore;
  const { unsignedTx } = txStore;
  return {
    compiledResult,
    callResult,
    testNetId,
    currAccount,
    unsignedTx
  };
}

export default connect(mapStateToProps, {
  setUnsgTxn
})(Deploy);