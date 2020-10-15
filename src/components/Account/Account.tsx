import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Selector, Button } from "../common/ui";
import "./Account.css";
import { addNewAcc } from "../../actions";
import { IAccount } from "../../types";
import { useForm } from "react-hook-form";

interface IProps {
  accounts: IAccount[];
  accountBalance: number;
  // eslint-disable-next-line no-unused-vars
  getSelectedAccount: (account: IAccount) => void;
  vscode: any;
  currAccount: IAccount;
  testNetId: string;
  appRegistered: boolean;
  // eslint-disable-next-line no-unused-vars
  addNewAcc: (result: IAccount) => void;
  handleAppRegister: () => void;
}

type FormInputs = {
  accountFromAddress: string;
  accountToAddress: string;
  amount: number;
};

const Account = (props: IProps) => {
  const [balance, setBalance] = useState(0);
  const [publicAddress, setPublicAddress] = useState("");
  const [pvtKey, setPvtKey] = useState("");
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState("");
  const [sendBtnDisable, setSendBtnDisable] = useState(false);

  const { register, handleSubmit } = useForm<FormInputs>();
  const { addNewAcc, accountBalance, vscode, currAccount, accounts, appRegistered } = props;

  useEffect(() => {
    window.addEventListener("message", async (event) => {
      const { data } = event;
      if (data.newAccount) {
        // TODO: Update account into redux
        const account: IAccount = { label: data.newAccount.pubAddr, value: data.newAccount.checksumAddr };
        addNewAcc(account);
        setShowButton(false);
        setPublicAddress(account.label);
      } else if (data.pvtKey && data.pvtKey !== pvtKey) {
        // TODO: handle pvt key not found errors
        setPvtKey(data.pvtKey);
      } else if (data.error) {
        setError(data.error);
      }
      if (data.transactionResult) {
        setSendBtnDisable(false);
      }
    });
  }, []);

  useEffect(() => {
    if (accountBalance !== balance) {
      setBalance(accountBalance);
    }
  }, [accountBalance]);

  useEffect(() => {
    vscode.postMessage({
      command: "get-pvt-key",
      payload: currAccount.pubAddr ? currAccount.pubAddr : currAccount.value,
    });
  }, [currAccount]);

  const getSelectedAccount = (account: IAccount) => {
    props.getSelectedAccount(account);
  };
  // generate keypair
  const handleGenKeyPair = () => {
    const { vscode } = props;
    const password = "";
    try {
      vscode.postMessage({
        command: "gen-keypair",
        payload: password,
      });
      setShowButton(true);
    } catch (err) {
      setShowButton(false);
    }
  };

  // delete keypair
  const deleteAccount = () => {
    const { vscode, currAccount } = props;

    try {
      vscode.postMessage({
        command: "delete-keyPair",
        payload: currAccount.value,
      });
    } catch (err) {
      setError(err);
    }
  };

  // handle send ether
  const handleTransactionSubmit = (formData: FormInputs) => {
    const { vscode, currAccount, testNetId } = props;
    setSendBtnDisable(true);
    try {
      if (testNetId === "ganache") {
        const transactionInfo = {
          fromAddress: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
          toAddress: formData.accountToAddress,
          amount: formData.amount,
        };
        vscode.postMessage({
          command: "send-ether",
          payload: transactionInfo,
          testNetId,
        });
      } else {
        // Build unsigned transaction
        const transactionInfo = {
          from: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
          to: formData.accountToAddress,
          value: formData.amount,
        };
        vscode.postMessage({
          command: "send-ether-signed",
          payload: { transactionInfo, pvtKey },
          testNetId,
        });
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="account_container">
      <div className="account_row">
        <div className="label-container">
          <label className="label">App Status: {appRegistered ? "Verified" : "Not Verified"}</label>
        </div>
        <div className="input-container">
          <Button disabled={appRegistered} onClick={props.handleAppRegister}>
            Register App
          </Button>
        </div>
      </div>

      {/* Account Selection */}
      <div className="account_row">
        <div className="label-container">
          <label className="label">Select Account </label>
        </div>
        <div className="select-container">
          <Selector
            options={accounts}
            getSelectedOption={getSelectedAccount}
            defaultValue={currAccount}
            placeholder="Select Accounts"
          />
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
        <div className="label-container" />
        <div className="input-container">
          <button
            className="acc-button custom_button_css"
            style={{
              background: "#fa4138",
              color: "white",
              border: "1px solid #fa4138",
            }}
            onClick={deleteAccount}
          >
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

      <form onSubmit={handleSubmit(handleTransactionSubmit)}>
        <div className="account_row">
          <div className="label-container">
            <label className="label">From </label>
          </div>
          <div className="input-container">
            <input
              name="accountFromAddress"
              className="input custom_input_css"
              value={currAccount.label}
              type="text"
              placeholder="from"
              ref={register}
            />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">To </label>
          </div>
          <div className="input-container">
            <input
              name="accountToAddress"
              className="input custom_input_css"
              type="text"
              placeholder="to"
              ref={register}
            />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Amount </label>
          </div>
          <div className="input-container">
            <input className="input custom_input_css" type="text" name="amount" placeholder="amount" ref={register} />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container" />
          <div className="input-container">
            <Button ButtonType="input" disabled={sendBtnDisable} style={{ marginLeft: "10px" }} value="Send" />
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
          <Button disabled={showButton} onClick={handleGenKeyPair}>
            Genarate key pair
          </Button>
        </div>
      </div>

      <div className="account_row">
        <div className="label-container">
          <label className="label">Public key </label>
        </div>
        <div className="input-container">
          <input className="input custom_input_css" value={publicAddress || ""} type="text" placeholder="public key" />
        </div>
      </div>

      {/* Error Handle */}
      <div>
        {error && (
          <pre className="large-code" style={{ color: "red" }}>
            {
              // @ts-ignore
              JSON.stringify(error)
            }
          </pre>
        )}
      </div>
    </div>
  );
};

function mapStateToProps({ debugStore, accountStore }: any) {
  const { testNetId } = debugStore;
  const { currAccount, accountBalance } = accountStore;
  return { testNetId, currAccount, accountBalance };
}

export default connect(mapStateToProps, { addNewAcc })(Account);
