// @ts-ignore
import * as vscode from 'vscode';
import { InputBoxOptions, window, commands, workspace } from 'vscode';
import API from './api';
import { ReactPanel } from './reactPanel';

import Logger from './utils/logger';
import {
  IAccountQP,
  INetworkQP,
  IFunctionQP,
  LocalAddressType,
  ABIDescription,
  ABIParameter,
  ConstructorInputValue,
  TxReceipt,
} from './types';
import {
  parseCompiledJSONPayload,
  estimateTransactionGas,
  createAccWorker,
  createWorker,
  ganacheDeploy,
  signDeploy,
  getTransactionInfo,
  getTransactionReceipt,
} from './lib';
import { errors } from './utils';
import { getAbi, getByteCode, CompiledJSONOutput } from './types/output';

// Create logger
const logger = new Logger();
const pwdInpOpt: InputBoxOptions = {
  ignoreFocusOut: true,
  password: true,
  placeHolder: 'Password',
};
const pubkeyInp: InputBoxOptions = {
  ignoreFocusOut: true,
  placeHolder: 'Public key',
};
const unsignedTxInp: InputBoxOptions = {
  ignoreFocusOut: false,
  placeHolder: 'Unsigned transaction JSON',
};
const gasInp: InputBoxOptions = {
  ignoreFocusOut: false,
  placeHolder: 'Enter custom gas',
};

// eslint-disable-next-line import/prefer-default-export
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // Create new account with password
    commands.registerCommand('ethcode.account.create', async () => {
      try {
        const password = await window.showInputBox(pwdInpOpt);
        const accWorker = createAccWorker();
        accWorker.on('message', (m: any) => {
          if (m.account) {
            logger.success('Account created!');
            logger.log(JSON.stringify(m.account));
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({ command: 'create-account', pswd: password, ksPath: context.extensionPath });
      } catch (error) {
        logger.error(error);
      }
    }),
    // Delete selected account with password
    commands.registerCommand('ethcode.account.delete', async () => {
      try {
        const publicKey = await window.showInputBox(pubkeyInp);
        const accWorker = createAccWorker();
        accWorker.on('message', (m: any) => {
          if (m.resp) {
            logger.log('Account deleted!');
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({ command: 'delete-keyPair', address: publicKey, keyStorePath: context.extensionPath });
      } catch (error) {
        logger.error(error);
      }
    }),
    // Sign & deploy a transaction
    commands.registerCommand('ethcode.account.sign-deploy', async () => {
      const testNetId = context.workspaceState.get('networkId');
      if (testNetId === 'ganache') {
        return ganacheDeploy(context);
      }
      return signDeploy(context);
    }),
    // Set Network
    commands.registerCommand('ethcode.network.set', () => {
      const quickPick = window.createQuickPick<INetworkQP>();
      const options: Array<INetworkQP> = [
        { label: 'Main', networkId: 1 },
        // { label: 'Ropsten', networkId: 3 },
        // { label: 'Rinkeby', networkId: 4 },
        { label: 'Goerli', networkId: 5 },
        { label: 'Ganache', networkId: 'ganache' },
      ];
      quickPick.items = options.map((network) => ({ label: network.label, networkId: network.networkId }));
      quickPick.placeholder = 'Select network';
      quickPick.onDidChangeActive((selection: Array<INetworkQP>) => {
        quickPick.value = selection[0].label;
      });
      quickPick.onDidChangeSelection((selection: Array<INetworkQP>) => {
        if (selection[0]) {
          const { networkId } = selection[0];
          context.workspaceState.update('networkId', networkId);
          quickPick.dispose();
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }),
    // Set Account
    commands.registerCommand('ethcode.account.set', () => {
      const quickPick = window.createQuickPick<IAccountQP>();
      const addresses: Array<LocalAddressType> | undefined = context.workspaceState.get('addresses');
      const ganacheAddresses: Array<string> | undefined = context.workspaceState.get('ganache-addresses');
      if (addresses && ganacheAddresses) {
        let options: Array<IAccountQP> = addresses.map(
          (account) =>
            <IAccountQP>{
              label: account.pubAddress,
              description: 'Local account',
              checksumAddr: account.checksumAddress,
            }
        );
        const gOpts: Array<IAccountQP> = ganacheAddresses.map(
          (addr) => <IAccountQP>{ label: addr, description: 'Ganache account', checksumAddr: addr }
        );
        options = [...options, ...gOpts];
        quickPick.items = options.map((account) => ({
          label: account.checksumAddr,
          description: account.description,
          checksumAddr: account.checksumAddr,
        }));
      }
      quickPick.placeholder = 'Select account';
      quickPick.onDidChangeActive((selection: Array<IAccountQP>) => {
        quickPick.value = selection[0].label;
      });
      quickPick.onDidChangeSelection((selection: Array<IAccountQP>) => {
        if (selection[0]) {
          const { checksumAddr } = selection[0];
          context.workspaceState.update('account', checksumAddr);
          quickPick.dispose();
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }),
    // List Accounts
    commands.registerCommand('ethcode.account.list', () => {
      const accWorker = createAccWorker();
      accWorker.on('message', (m) => {
        if (m.localAddresses) {
          context.workspaceState.update('addresses', <Array<LocalAddressType>>m.localAddresses);
          logger.log(JSON.stringify(m.localAddresses));
        }
      });
      accWorker.send({
        command: 'get-localAccounts',
        keyStorePath: context.extensionPath,
      });
    }),
    // List Ganache accounts
    commands.registerCommand('ethcode.account.ganache.list', () => {
      const accountsWorker = createWorker();
      accountsWorker.on('message', (m: any) => {
        logger.log(`Account worker message: ${JSON.stringify(m)}`);
        if (m.error) {
          logger.error(m.error.details);
        }
        context.workspaceState.update('ganache-addresses', <Array<string>>m.accounts);
        logger.log(JSON.stringify(m.accounts));
      });
      accountsWorker.send({ command: 'get-accounts', testnetId: 'ganache' });
    }),
    // Get account balance
    commands.registerCommand('ethcode.account.balance', () => {
      const testNetId = context.workspaceState.get('networkId');
      const account: string | undefined = context.workspaceState.get('account');
      const balanceWorker = createWorker();
      balanceWorker.on('message', (m: any) => {
        logger.log(`Balance worker message: ${JSON.stringify(m)}`);
        context.workspaceState.update('balance', m.balance);
      });
      const payload = {
        command: 'get-balance',
        account,
        testnetId: testNetId,
      };
      if (account && account.length > 0) balanceWorker.send(payload);
    }),
    // Set unsigned transaction
    commands.registerCommand('ethcode.transaction.set', async (tx) => {
      const unsignedTx = tx || (await window.showInputBox(unsignedTxInp));
      context.workspaceState.update('unsignedTx', unsignedTx);
    }),
    // Create unsigned transaction
    commands.registerCommand('ethcode.transaction.build', async () => {
      const networkId = context.workspaceState.get('networkId');
      const account: string | undefined = context.workspaceState.get('account');
      const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
      const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
      const gas: number | undefined = context.workspaceState.get('gasEstimate');

      const txWorker = createWorker();
      txWorker.on('message', (m: any) => {
        logger.log(`Transaction worker message: ${JSON.stringify(m)}`);
        if (m.error) {
          logger.error(m.error);
        } else {
          context.workspaceState.update('unsignedTx', m.buildTxResult);
          logger.log(m.buildTxResult);
        }
      });

      const payload = {
        abi: getAbi(contract),
        bytecode: getByteCode(contract),
        params: params || [],
        gasSupply: gas || 0,
        from: account,
      };
      txWorker.send({
        command: 'build-rawtx',
        payload,
        testnetId: networkId,
      });
    }),
    // Get gas estimate
    commands.registerCommand('ethcode.transaction.gas.get', async () => {
      return estimateTransactionGas(context);
    }),
    // Get transaction info
    commands.registerCommand('ethcode.transaction.get', async () => {
      return getTransactionInfo(context);
    }),
    // Get transaction receipt
    commands.registerCommand('ethcode.transaction.receipt.get', async () => {
      return getTransactionReceipt(context);
    }),
    // Load combined JSON output
    commands.registerCommand('ethcode.compiled-json.load', () => {
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      parseCompiledJSONPayload(context, editorContent);
    }),
    // Create Input JSON
    commands.registerCommand('ethcode.contract.input.create', () => {
      const contract = context.workspaceState.get('contract') as CompiledJSONOutput;

      if (contract == undefined || contract == null || workspace.workspaceFolders == undefined) {
        logger.error(errors.ContractNotFound);
        return;
      }
      
      const constructor = getAbi(contract)?.filter((i: ABIDescription) => i.type === 'constructor');
      if (constructor == undefined) {
        logger.log("Abi doesn't exist on the loaded contract");
        return;
      }

      if (constructor.length == 0) {
        logger.log("This abi doesn't have any constructor");
        return;
      }

      const constInps: Array<ABIParameter> = <Array<ABIParameter>>constructor[0].inputs;
      if (constInps && constInps.length > 0) {
        const inputs: Array<ConstructorInputValue> = constInps.map(
          (inp: ABIParameter) => <ConstructorInputValue>{ ...inp, value: '' }
        );

        const fileWorker = createWorker();
        fileWorker.on('message', (m: any) => {
          logger.log(JSON.stringify(m));
        });

        fileWorker.send({
          command: 'create-input-file',
          payload: {
            path: workspace.workspaceFolders[0].uri.fsPath,
            inputs,
          },
        });
      }
    }),
    // Load constructor inputs from JSON
    commands.registerCommand('ethcode.contract.input.load', async () => {
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      if (editorContent) {
        const constructorInputs: Array<ConstructorInputValue> = JSON.parse(editorContent);
        context.workspaceState.update('constructor-inputs', constructorInputs);
        logger.log(`Constructor inputs loaded!`);
      }
    }),
    // Create call input for method
    commands.registerCommand('ethcode.contract.call.input.create', () => {
      const contract = context.workspaceState.get('contract') as CompiledJSONOutput;

      const quickPick = window.createQuickPick<IFunctionQP>();
      if (contract) {
        const functions = getAbi(contract)?.filter((i: ABIDescription) => i.type === 'constructor');
        if (functions == undefined) {
          logger.log("Abi doesn't exist on the loaded contract");
          return;
        }

        if (functions.length == 0) {
          logger.log("This abi doesn't have any constructor");
          return;
        }

        quickPick.items = functions.map((f) => ({
          label: f.name || '',
          functionKey: f.name || '',
        }));
        quickPick.placeholder = 'Select function';
        quickPick.onDidChangeActive((selection: Array<IFunctionQP>) => {
          quickPick.value = selection[0].label;
        });
        quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
          if (selection[0] && workspace.workspaceFolders) {
            const { functionKey } = selection[0];
            quickPick.dispose();
            const abiItem = functions.filter((i: ABIDescription) => i.name === functionKey);
            const fileWorker = createWorker();
            fileWorker.send({
              command: 'create-function-input',
              payload: {
                path: workspace.workspaceFolders[0].uri.path,
                abiItem,
              },
            });
          }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
      } else {
        logger.error(errors.ContractNotFound);
      }
    }),
    // Load call inputs from JSON
    // Call contract method
    commands.registerCommand('ethcode.contract.call', async () => {
      const networkId = context.workspaceState.get('networkId');
      const account: string | undefined = context.workspaceState.get('account');
      const contract = await context.workspaceState.get('contract') as CompiledJSONOutput;
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      const txReceipt: TxReceipt | undefined = context.workspaceState.get('transaction-receipt');
      if (editorContent && contract && txReceipt) {
        const abiItem: ABIDescription = JSON.parse(editorContent)[0];
        const contractWorker = createWorker();
        contractWorker.on('message', (m: any) => {
          if (m.error) {
            logger.error(m.error);
          } else {
            console.log(m.callResult);
            logger.log(m.callResult);
          }
        });
        contractWorker.send({
          command: 'contract-method-call',
          payload: {
            from: account,
            abi: getAbi(contract),
            address: txReceipt.contractAddress,
            methodName: abiItem.name,
            params: abiItem.inputs,
            gasSupply: 0,
            value: 0,
          },
          testnetId: networkId,
        });
      }
    }),
    // Set custom gas estimate
    commands.registerCommand('ethcode.transaction.gas.set', async () => {
      const gas = await window.showInputBox(gasInp);
      context.workspaceState.update('gasEstimate', gas);
    }),
    commands.registerCommand('ethcode.show', async () => {
      ReactPanel.createOrShow(context.extensionPath, context.workspaceState);
    }),
    // Activate
    commands.registerCommand('ethcode.activate', async () => {
      commands.executeCommand('ethcode.account.list');
      logger.success('Welcome to Ethcode!');
    })
  );
  const api = new API();
  return api;
}
