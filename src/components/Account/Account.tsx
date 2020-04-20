import React, { Component } from 'react';
import { connect } from "react-redux";
import { Selector } from '../common/ui';
import './Account.css';
import { addNewAcc } from '../../actions';
import { IAccount } from '../../types';
import { Button } from '../common/ui';

interface IProps {
  accounts: IAccount[];
  getSelectedAccount: (result: any) => void;
  accountBalance: number;
  accBalance: number;
  vscode: any;
  currAccount: IAccount;
  testNetId: string;
  addNewAcc: (result: any) => void;
}

interface IState {
  balance: number;
  publicAddress: string;
  pvtKey: string;
  showButton: boolean;
  transferAmount: number;
  error: any;
  msg: string;
  sendBtnDisable: boolean;
}

class Account extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      balance: 0,
      publicAddress: '',
      pvtKey: '',
      showButton: false,
      transferAmount: 0,
      error: '',
      msg: '',
      sendBtnDisable: false
    };
    this.handleGenKeyPair = this.handleGenKeyPair.bind(this);
    this.handleTransactionSubmit = this.handleTransactionSubmit.bind(this);
  }

  componentDidUpdate(prevProps: IProps, prevState: IState) {
    const { addNewAcc, accountBalance, vscode, currAccount } = this.props;
    const { balance } = this.state;

    window.addEventListener("message", async event => {
      const { data } = event;
      if (data.newAccount) {
        // TODO: Update account into redux
        const account: IAccount = { label: data.newAccount.pubAddr, value: data.newAccount.checksumAddr };
        addNewAcc(account);
        this.setState({ showButton: false, publicAddress: account.label });
      } else if (data.pvtKey && (data.pvtKey !== this.state.pvtKey)) {
        // TODO: handle pvt key not found errors
        this.setState({ pvtKey: data.pvtKey }, () => {
          this.setState({ msg: 'process finshed' });
        });
      } else if (data.error) {
        this.setState({ error: data.error });
      }
      if (data.transactionResult) {
        this.setState({ sendBtnDisable: false });
      }
    });

    if (accountBalance !== balance) {
      this.setState({ balance: accountBalance });
    }
    if (currAccount !== prevProps.currAccount) {
      // get private key for corresponding public key
      vscode.postMessage({ command: "get-pvt-key", payload: currAccount.pubAddr ? currAccount.pubAddr : currAccount.value });
    }

  }

  getSelectedAccount = (account: IAccount) => {
    this.props.getSelectedAccount(account);
  };
  // generate keypair
  private handleGenKeyPair() {
    const { vscode } = this.props;
    let password = "";
    try {
      vscode.postMessage({
        command: "gen-keypair",
        payload: password
      });
      this.setState({ showButton: true });
    } catch (err) {
      console.error(err);
      this.setState({ showButton: false });
    }
  }
  // delete keypair
  private deleteAccount = () => {
    const { vscode, currAccount } = this.props;

    try {
      vscode.postMessage({
        command: "delete-keyPair",
        payload: currAccount.value
      });
    } catch (err) {
      console.error(err);
    }
  };

  // handle send ether
  private handleTransactionSubmit(event: any) {
    event.preventDefault();
    const { vscode, currAccount, testNetId } = this.props;
    const { pvtKey } = this.state;
    const data = new FormData(event.target);
    this.setState({ sendBtnDisable: true });
    try {
      if (testNetId === "ganache") {
        const transactionInfo = {
          fromAddress: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
          toAddress: data.get("toAddress"),
          amount: data.get("amount")
        };
        vscode.postMessage({
          command: "send-ether",
          payload: transactionInfo,
          testNetId
        });
      } else {
        // Build unsigned transaction
        const transactionInfo = {
          from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
          to: data.get("toAddress"),
          value: data.get("amount")
        };
        vscode.postMessage({
          command: "send-ether-signed",
          payload: { transactionInfo, pvtKey },
          testNetId
        });
      }
    } catch (err) {
      this.setState({ error: err });
    }
  }

  render() {
    const { accounts, currAccount } = this.props;
    const { balance, publicAddress, showButton, error, sendBtnDisable } = this.state;

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
              defaultValue={currAccount}
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
            <label className="header">Transfer Ether </label>
          </div>
        </div>

        <form onSubmit={this.handleTransactionSubmit}>
          <div className="account_row">
            <div className="label-container">
              <label className="label">From </label>
            </div>
            <div className="input-container">
              <input className="input custom_input_css" value={currAccount.label} type="text" placeholder="from" />
            </div>
          </div>

          <div className="account_row">
            <div className="label-container">
              <label className="label">To </label>
            </div>
            <div className="input-container">
              <input className="input custom_input_css" name="toAddress" type="text" placeholder="to" />
            </div>
          </div>

          <div className="account_row">
            <div className="label-container">
              <label className="label">Amount </label>
            </div>
            <div className="input-container">
              <input className="input custom_input_css" type="text" name="amount" placeholder="amount" />
            </div>
          </div>

          <div className="account_row">
            <div className="label-container"></div>
            <div className="input-container">
              <Button ButtonType="input" disabled={sendBtnDisable} style={{ marginLeft: '10px' }} value="Send" />
            </div>
          </div>
        </form>

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
            {/* todo */}
            <Button disabled={showButton} onClick={this.handleGenKeyPair}>Genarate key pair</Button>
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Public key </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" value={publicAddress ? publicAddress : ''} type="text" placeholder="public key" />
          </div>
        </div>

        {/* Error Handle */}
        <div>
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

function mapStateToProps({ debugStore, accountStore }: any) {
  const { testNetId } = debugStore;
  const { currAccount, accountBalance } = accountStore;
  return { testNetId, currAccount, accountBalance };
}

export default connect(mapStateToProps, { addNewAcc })(Account);