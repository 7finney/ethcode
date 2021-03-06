import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Selector, Button, ButtonType } from '../common/ui';
import './Account.css';
import { addNewAcc, setCurrAccChange, setPvtKey, setErrMsg } from '../../actions';
import { IAccount, GroupedSelectorAccounts, GlobalStore } from '../../types';
import { useForm } from 'react-hook-form';

type IProps = {
  accounts: Array<GroupedSelectorAccounts>;
  vscode: any;
  handleAppRegister: () => void;
};

type FormInputs = {
  accountFromAddress: string;
  accountToAddress: string;
  amount: number;
};

const Account: React.FC<IProps> = ({ vscode, accounts, handleAppRegister }: IProps) => {
  const [publicAddress, setPublicAddress] = useState('');
  const { register, handleSubmit, formState } = useForm<FormInputs>({ mode: 'onChange' });

  // UseSelector to extract state elements.
  const { testNetId, currAccount, accountBalance, defaultAccounts, pvtKey, appRegistered, error } = useSelector(
    (state: GlobalStore) => ({
      testNetId: state.debugStore.testNetId,
      currAccount: state.accountStore.currAccount,
      accountBalance: state.accountStore.balance,
      defaultAccounts: state.accountStore.accounts,
      pvtKey: state.accountStore.privateKey,
      appRegistered: state.debugStore.appRegistered,
      error: state.debugStore.error,
    })
  );

  // dispatch function to be called with the action
  const dispatch = useDispatch();

  useEffect(() => {
    window.addEventListener('message', async (event) => {
      const { data } = event;
      if (data.newAccount) {
        const account: IAccount = {
          label: data.newAccount.pubAddr,
          value: data.newAccount.checksumAddr,
        };
        dispatch(addNewAcc(account));
        setPublicAddress(account.label);
      }
      if (data.pvtKey) {
        // TODO: handle pvt key not found errors
        // setPvtKey(data.pvtKey);
        dispatch(
          setPvtKey({ currAccount, balance: accountBalance, accounts: defaultAccounts, privateKey: data.pvtKey })
        );
      }
      if (data.error) {
        dispatch(setErrMsg(data.error));
      }
      if (data.balance) {
        const { balance, account } = data;
        dispatch(setCurrAccChange({ balance, currAccount: account }));
      }
    });
  }, []);

  useEffect(() => {
    vscode.postMessage({
      command: 'get-pvt-key',
      payload: currAccount ? (currAccount.pubAddr ? currAccount.pubAddr : currAccount.value) : null,
    });
  }, [currAccount]);

  // generate keypair
  const handleGenKeyPair = () => {
    const password = '';
    vscode.postMessage({
      command: 'gen-keypair',
      payload: password,
    });
  };

  // delete keypair
  const deleteAccount = () => {
    try {
      vscode.postMessage({
        command: 'delete-keyPair',
        payload: currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x',
      });
    } catch (err) {
      dispatch(setErrMsg(err));
    }
  };

  // handle send ether
  const handleTransactionSubmit = (formData: FormInputs) => {
    try {
      if (testNetId === 'ganache') {
        const transactionInfo = {
          fromAddress: currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x',
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
          from: currAccount ? (currAccount.checksumAddr ? currAccount.checksumAddr : currAccount.value) : '0x',
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
      dispatch(setErrMsg(err));
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
          <label className="label">App Status:</label>
        </div>
        <div className="input-container">
          <Button buttonType={ButtonType.Input} disabled={appRegistered} onClick={handleAppRegister}>
            {appRegistered ? (
              'Authenticated'
            ) : (
              <a style={{ textDecoration: 'none' }} href="https://auth.ethcode.dev/">
                Register App
              </a>
            )}
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
            disabled={!pvtKey}
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
              ref={register({ required: true })}
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
              ref={register({ required: true })}
            />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container">
            <label className="label">Amount </label>
          </div>
          <div className="input-container">
            <input
              className="input custom_input_css"
              type="text"
              name="amount"
              placeholder="amount"
              ref={register({ required: true })}
            />
          </div>
        </div>

        <div className="account_row">
          <div className="label-container" />
          <div className="input-container">
            <Button buttonType={ButtonType.Input} disabled={!formState.isValid} style={{ marginLeft: '10px' }}>
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
          <Button buttonType={ButtonType.Input} onClick={handleGenKeyPair}>
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
        <div className="label-container">
          <label className="label">Private key </label>
        </div>
        <div className="input-container">
          <input
            className="input custom_input_css"
            value={pvtKey || ''}
            type="text"
            placeholder="private key"
            disabled
          />
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
