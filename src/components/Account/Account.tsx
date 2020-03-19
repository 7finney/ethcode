import React, { Component } from 'react';
import Selector from '../Selector';
import './account.css';

interface IProps {
  accounts: string[],
  getSelectedAccount: any,
  accBalance: number,
  vscode: any,
  defaultValue: any
}

interface IState {
  accounts: string[],
  currAccount: string,
  balance: number,
  publicAddress: string,
  showButton: boolean
}

class Account extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      accounts: [],
      currAccount: '',
      balance: 0,
      publicAddress: '',
      showButton: false
    }
    this.handleGenKeyPair = this.handleGenKeyPair.bind(this);
  }

  componentDidMount() {
    this.setState({ accounts: this.props.accounts })
  }

  componentDidUpdate(prevProps: IProps, preState: IState) {
    const { accounts, balance } = this.state;

    window.addEventListener("message", async event => {
      const { data } = event;
      if (data.publicAdd) {
        this.setState({ publicAddress: data.publicAdd, showButton: false })
      }
    })

    if (this.props.accounts !== accounts) {
      this.setState({ accounts: this.props.accounts })
    }

    if (this.props.accBalance !== balance) {
      this.setState({ balance: this.props.accBalance })
    }
  }

  getSelectedAccount = (account: any) => {
    this.setState({
      currAccount: account.label
    })
    this.props.getSelectedAccount(account)
  }
  // generate keypair
  private handleGenKeyPair() {
    const { vscode } = this.props;
    let password = "qwerty";
    try {
      vscode.postMessage({
        command: "gen-keypair",
        payload: password
      });
      this.setState({ showButton: true })
    } catch (err) {
      console.error(err);
      this.setState({ showButton: false })
    }
  }
  // delete keypair
  private deleteAccount = () => {
    const { vscode } = this.props;
    const { currAccount } = this.state;

    try {
      vscode.postMessage({
        command: "delete-keyPair",
        payload: currAccount
      });
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const { accounts, balance, publicAddress, showButton } = this.state;

    return (
      <div className="account_container">

        {/* Account Selection */}
        <div className="account_row">
          <div className="label-container">
            <label className="label">Select Account </label>
          </div>
          <div className="select-container">
            <Selector
              options={accounts}
              getSelectedOption={this.getSelectedAccount}
              defaultValue={this.props.defaultValue}
              placeholder='Select Accounts' />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Account Balance </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" value={balance} type="text" placeholder="account balance" />
          </div>
        </div>

        {/* Account Delete */}
        <div className="account_row">
          <div className="label-container"></div>
          <div className="input-container">
            <button
              className="acc-button custom_button_css"
              style={{
                background: '#fa4138',
                color: 'white',
                border: '1px solid #fa4138'
              }}
              onClick={this.deleteAccount}>
              Delete Account
            </button>
          </div>
        </div>

        {/* Transfer Section */}
        <div className="account_row">
          <div className="label-container">
            <label className="header">Transfer Token </label>
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">From </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="from" />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">To </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="to" />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Amount </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" placeholder="amount" />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container"></div>
          <div className="input-container">
            <button className="acc-button custom_button_css">Send</button>
          </div>
        </div>

        {/* Account Create */}
        <div className="account_row">
          <div className="label-container">
            <label className="header">Account Creation </label>
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Create New Account </label>
          </div>
          <div className="input-container">
            <button
              className={(showButton ? 'custom_button_css button_disable' : 'acc-button custom_button_css')}
              disabled={showButton}
              onClick={this.handleGenKeyPair}>
              Genarate key pair
            </button>
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Public key </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" value={publicAddress} type="text" placeholder="public key" />
          </div>
        </div>

      </div>
    )
  }
}

export default Account;