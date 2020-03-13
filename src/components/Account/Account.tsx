import React, { Component } from 'react';
import Selector from '../Selector';
import './account.css';

interface IProps {
  accounts: string[],
  getSelectedAccount: any,
  accBalance: number,
}

interface IState {
  accounts: string[],
  currAccount: string,
  balance: number
}

class Account extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    this.state = {
      accounts: [],
      currAccount: '',
      balance: 0
    }
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

  render() {
    const { accounts, balance } = this.state;

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
            <input className="custom_input_css" value={balance} type="text" placeholder="dummy 2" />
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
            <input className="custom_input_css" type="text" placeholder="dummy 2" />
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">To </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="dummy 2" />
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
            <button className="acc-button custom_button_css">Genarate key pair</button>
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">Public key </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="dummy 2" />
          </div>
        </div>

        <div className="row">
          <div className="label-container">
            <label className="label">Private key </label>
          </div>
          <div className="input-container">
            <input className="custom_input_css" type="text" placeholder="dummy 2" />
          </div>
        </div>

      </div>
    )
  }
}

export default Account;