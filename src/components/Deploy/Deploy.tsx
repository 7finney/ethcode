import React, { Component } from 'react';
import "./deploy.css";
import { connect } from "react-redux";

export interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  vscode: any;
  errors: any;
  compiledResult: object;
  testNetId: string
}

export interface IState {
  showUnsignedTxn: boolean;
  constructorInput: object[];
  error: string;
  deployed: object;
  gasEstimate: number;
}

class Deploy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showUnsignedTxn: false,
      constructorInput: [],
      error: '',
      deployed: {},
      gasEstimate: 0
    }
  }

  componentDidMount() {

    window.addEventListener("message", async event => {
      const { data } = event;

      if(data.gasEstimate) {
        this.setState({ gasEstimate: data.gasEstimate })
      }
    })

    // this.setState({ deployed: this.props.compiledResult });
    const { abi } = this.props;
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

  handlerToggle = () => {
    this.setState({ showUnsignedTxn: true })
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

  render() {
    const { contractName, bytecode, abi, errors } = this.props;
    const { showUnsignedTxn, gasEstimate } = this.state;

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
              value={JSON.stringify(bytecode)}
              placeholder="byte code" />
          </div>
          <div className="abi-definition">
            <input
              className="input custom_input_css"
              style={{ width: '80vw' }}
              type="text"
              value={JSON.stringify(abi)}
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
            <input className="input custom_input_css" type="text" placeholder="gas supply" value={gasEstimate} />
          </div>
        </div>

        <div className="input-container">
          <button className="acc-button custom_button_css" onClick={this.handlerToggle}>Create unsigned txn</button>
        </div>

        {showUnsignedTxn &&
          (<div>
            <h6 className="contract-name inline-block highlight-success">
              Unsigned Transaction:
          </h6>
            <div className="json_input_container" style={{ marginTop: '10px' }}>
              <textarea className="json_input custom_input_css"></textarea>
            </div>
          </div>)}

        <div className="account_row">
          <div className="tag">
            <h4>Public key </h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="public key" />
          </div>
        </div>

        <div className="account_row">
          <div className="tag">
            <h4>Private key </h4>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="private key" />
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: any) {
  return {
    compiledResult: state.compiledStore.compiledresult,
    callResult: state.compiledStore.callResult,
    testNetId: state.debugStore.testNetId
  };
}

export default connect(mapStateToProps, {})(Deploy);