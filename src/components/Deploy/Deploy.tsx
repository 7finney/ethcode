import React, { Component } from 'react';
import "./deploy.css";

export interface IProps {
  contractName: string;
  bytecode: any;
  abi: any;
  // vscode: any;
  errors: any;
}

export interface IState {
  showUnsignedTxn: boolean;
}

class Deploy extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      showUnsignedTxn: false
    }
  }

  handlerToggle = () => {
    this.setState({ showUnsignedTxn: true })
  }

  render() {
    const { contractName, bytecode, abi, errors } = this.props;
    const { showUnsignedTxn } = this.state;

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
            <button className="acc-button custom_button_css">Get gas estimate</button>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="gas supply" />
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

export default Deploy;