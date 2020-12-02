import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Selector, Button, ButtonType } from '../common/ui';
import './Account.css';
import { addNewAcc, setCurrAccChange } from '../../actions';
import { IAccount, GroupedSelectorAccounts, GlobalStore } from '../../types';
import { useForm } from 'react-hook-form';

type IProps = {
  accounts: Array<GroupedSelectorAccounts>;
  vscode: any;
  appRegistered: boolean;
  handleAppRegister: () => void;
};

type FormInputs = {
  accountFromAddress: string;
  accountToAddress: string;
  amount: number;
};

const Account: React.FC<IProps> = ({ vscode, accounts, appRegistered, handleAppRegister }: IProps) => {
  const [publicAddress, setPublicAddress] = useState('');
  const [pvtKey, setPvtKey] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [error, setError] = useState('');
  const [sendBtnDisable, setSendBtnDisable] = useState(false);
  const [msg, setMsg] = useState('');
  const { register, handleSubmit } = useForm<FormInputs>();

  // UseSelector to extract state elements.
  const { testNetId, currAccount, accountBalance } = useSelector((state: GlobalStore) => ({
    testNetId: state.debugStore.testNetId,
    currAccount: state.accountStore.currAccount,
    accountBalance: state.accountStore.accountBalance,
  }));

  // dispatch function to be called with the action
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const { data } = event;
      if (data.newAccount) {
        // TODO: Update account into redux
        const account: IAccount = {
          label: data.newAccount.pubAddr,
          value: data.newAccount.checksumAddr,
        };
        // calling addNewAcc inside dispatch
        dispatch(addNewAcc(account));
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
      if (data.balance) {
        const { balance, account } = data;
        dispatch(setCurrAccChange({ balance, currAccount: account }));
      }
    });
  }, []);

  useEffect(() => {
    setMsg('Success! Read privatekey.');
  }, [pvtKey]);

  useEffect(() => {
    vscode.postMessage({
      command: 'get-pvt-key',
      payload: currAccount ? (currAccount.pubAddr ? currAccount.pubAddr : currAccount.value) : null,
    });
  }, [currAccount]);

  // generate keypair
  const handleGenKeyPair = () => {
    const password = '';
    try {
      vscode.postMessage({
        command: 'gen-keypair',
        payload: password,
      });
      setShowButton(true);
    } catch (err) {
      setShowButton(false);
    }
  };

  // delete keypair
  const deleteAccount = () => {
    try {
      vscode.postMessage({
        command: 'delete-keyPair',
        payload: currAccount.value,
      });
    } catch (err) {
      setError(err);
    }
  };

  // handle send ether
  const handleTransactionSubmit = (formData: FormInputs) => {
    setSendBtnDisable(true);
    try {
      if (testNetId === 'ganache') {
        const transactionInfo = {
          fromAddress: currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value,
          toAddress: formData.accountToAddress,
          amount: formData.amount,
        };
        vscode.postMessage({
          command: 'send-ether',
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
          command: 'send-ether-signed',
          payload: { transactionInfo, pvtKey },
          testNetId,
        });
      }
    } catch (err) {
      setError(err);
    }
  };

  const handleSelect = (account: IAccount) => {
    vscode.postMessage({
      command: 'get-balance',
      account,
      testNetId,
    });
  };

  const formatGroupLabel = (data: any) => (
    <div className="group-styles">
      <span>{data.label}</span>
      <span className="group-badge-style">{data.options.length}</span>
    </div>
  );

  return (
    <div className="account_container">
      <div className="account_row">
        <div className="label-container">
          <label className="label">App Status: {appRegistered ? 'Verified' : 'Not Verified'}</label>
        </div>
        <div className="input-container">
          <Button buttonType={ButtonType.Input} disabled={appRegistered} onClick={handleAppRegister}>
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
            onSelect={handleSelect}
            defaultValue={currAccount}
            formatGroupLabel={formatGroupLabel}
            placeholder="Select Accounts"
          />
        </div>
      </div>

      <div className="account_row">
        <div className="label-container">
          <label className="label">Account Balance </label>
        </div>
        <div className="input-container">
          <input
            className="input custom_input_css"
            value={accountBalance}
            type="text"
            placeholder="account balance"
            disabled
          />
        </div>
      </div>

      {/* Account Delete */}
      <div className="account_row">
        <div className="label-container" />
        <div className="input-container">
          <Button
            buttonType={ButtonType.Input}
            style={{
              background: '#fa4138',
              color: 'white',
              border: '1px solid #fa4138',
            }}
            onClick={deleteAccount}
          >
            Delete Account
          </Button>
        </div>
      </div>

      {/* Transfer Section */}
      <div className="account_row">
        <div className="label-container">
          <label className="header">Transfer Ether</label>
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
              value={currAccount ? currAccount.value : '0x'}
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
            <Button buttonType={ButtonType.Input} disabled={sendBtnDisable} style={{ marginLeft: '10px' }}>
              Send
            </Button>
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
          <Button buttonType={ButtonType.Input} disabled={showButton} onClick={handleGenKeyPair}>
            Genarate key pair
          </Button>
        </div>
      </div>

      <div className="account_row">
        <div className="label-container">
          <label className="label">Public key </label>
        </div>
        <div className="input-container">
          <input className="input custom_input_css" value={publicAddress || ''} type="text" placeholder="public key" />
        </div>
      </div>

      {/* Error Handle */}
      <div>
        {error && (
          <pre className="large-code" style={{ color: 'red' }}>
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

export default Account;
