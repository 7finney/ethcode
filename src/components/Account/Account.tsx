import React, { Component } from 'react';
import Selector from '../Selector';
import './account.css';

interface IProps {
  accounts: string[],
  getSelectedAccount: any,
  accBalance: number,
  vscode: any
}

interface IState {
  accounts: string[],
  currAccount: string,
  balance: number
}

class Account extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      accounts: [],
      currAccount: '',
      balance: 0
    }
    this.handleGenKeyPair = this.handleGenKeyPair.bind(this);
  }

  componentDidMount() {
    this.setState({ accounts: this.props.accounts })
  }

  componentDidUpdate(prevProps: IProps) {
    const { accounts, balance } = this.state;

    if (this.props.accounts !== accounts) {
      this.setState({ accounts: this.props.accounts })
    }

    if (this.props.accBalance !== balance) {
      this.setState({ balance: this.props.accBalance })
    }
  }

  getSelectedAccount = (account: any) => {
    this.props.getSelectedAccount(account)
  }
  // generate keypair
  private handleGenKeyPair() {
    const { vscode } = this.props;
    let password = "";
    try {
      vscode.postMessage({
        command: "gen-keypair",
        payload: password
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const { accounts, balance } = this.state;

    console.log("into render");
    console.log(JSON.stringify(accounts[0]));

    return (
      <div className="account_container">

        {/* Account Selection */}
        <div className="row">
          <div className="label-container">
            <label className="label">Select Account </label>
          </div>
          <div className="select-container">
            <Selector
              options={accounts}
              getSelectedOption={this.getSelectedAccount}
              defaultValue={accounts[0]}
              placeholder='Select Accounts' />
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">Account Balance </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" value={balance} type="text" placeholder="account balance" />
          </div>
        </div>

        {/* Transfer Section */}
        <div className="row">
          <div className="label-container">
            <label className="header">Transfer Token </label>
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">From </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="from" />
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">To </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="to" />
          </div>
        </div>

        <div className="row">
          <div className="label-container"></div>
          <div className="input-container">
            <button className="acc-button custom_button_css">Send</button>
          </div>
        </div>

        {/* Account Create */}
        <div className="row">
          <div className="label-container">
            <label className="header">Account Creation </label>
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">Create New Account </label>
          </div>
          <div className="input-container">
            <button className="acc-button custom_button_css" onClick={this.handleGenKeyPair}>Genarate key pair</button>
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">Public key </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="public key" />
          </div>
        </div>

      </div>
    )
  }
}

export default Account;