// @ts-ignore
import * as vscode from 'vscode';
import * as path from 'path';
import { InputBoxOptions, window, commands, workspace } from 'vscode';
import { fork, ChildProcess } from 'child_process';
import API from './api';
import { ReactPanel } from './reactPanel';

import Logger from './utils/logger';
import {
  IAccountQP,
  INetworkQP,
  LocalAddressType,
  CombinedJSONOutput,
  ICombinedJSONContractsQP,
  StandardCompiledContract,
  CombinedCompiledContract,
  isStdContract,
  isComContract,
  ABIDescription,
  ABIParameter,
  ConstructorInputValue,
  isStdJSONOutput,
} from './types';
import { parseCombinedJSONPayload, parseJSONPayload } from './lib';
import { errors } from './utils';

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

const createAccWorker = (): ChildProcess => {
  // return fork(path.join(__dirname, 'accWorker.js'), [], {
  //   execArgv: [`--inspect=${process.debugPort + 1}`],
  // });
  return fork(path.join(__dirname, 'accWorker.js'));
};
const createWorker = (): ChildProcess => {
  // return fork(path.join(__dirname, 'accWorker.js'), [], {
  //   execArgv: [`--inspect=${process.debugPort + 1}`],
  // });
  return fork(path.join(__dirname, 'worker.js'));
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
            logger.success(JSON.stringify(m.account));
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
            logger.success('Account deleted!');
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
      try {
        const testNetId = context.workspaceState.get('networkId');
        const account = context.workspaceState.get('account');
        const unsignedTx = context.workspaceState.get('unsignedTx');
        const password = await window.showInputBox(pwdInpOpt);
        const accWorker = createAccWorker();
        const signedDeployWorker = createWorker();
        accWorker.on('message', (m: any) => {
          if (m.privateKey) {
            const { privateKey } = m;
            signedDeployWorker.on('message', (m: any) => {
              logger.log(`SignDeploy worker message: ${JSON.stringify(m)}`);
              if (m.error) {
                logger.error(m.error);
              } else if (m.transactionResult) {
                logger.success('Contract transaction submitted!');
              }
            });
            signedDeployWorker.send({
              command: 'sign-deploy',
              payload: {
                unsignedTx,
                pvtKey: privateKey,
              },
              testnetId: testNetId,
            });
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({
          command: 'extract-privateKey',
          address: account,
          keyStorePath: context.extensionPath,
          password: password || '',
        });
      } catch (error) {
        logger.error(error);
      }
    }),
    // Set Network
    commands.registerCommand('ethcode.network.set', () => {
      const quickPick = window.createQuickPick<INetworkQP>();
      const options: Array<INetworkQP> = [
        { label: 'Main', networkId: 1 },
        { label: 'Ropsten', networkId: 3 },
        { label: 'Rinkeby', networkId: 4 },
        { label: 'Goerli', networkId: 5 },
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
      if (addresses && addresses.length > 0) {
        const options: Array<IAccountQP> = addresses.map((account) => ({
          label: account.pubAddress,
          checksumAddr: account.checksumAddress,
        }));
        quickPick.items = options.map((account) => ({
          label: account.checksumAddr,
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
          logger.success(JSON.stringify(m.localAddresses));
        }
      });
      accWorker.send({
        command: 'get-localAccounts',
        keyStorePath: context.extensionPath,
      });
    }),
    // Set unsigned transaction
    commands.registerCommand('ethcode.transaction.set', async (tx) => {
      const unsignedTx = tx || (await window.showInputBox(unsignedTxInp));
      context.workspaceState.update('unsignedTx', unsignedTx);
    }),
    // Create unsigned transaction
    commands.registerCommand('ethcode.transaction.build', async () => {
      const networkId = context.workspaceState.get('networkId');
      const account = context.workspaceState.get('account');
      const contract = context.workspaceState.get('contract');
      const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
      const gas: number | undefined = context.workspaceState.get('gasEstimate');
      if (isComContract(contract)) {
        const { abi, bin } = contract;
        const txWorker = createWorker();
        txWorker.on('message', (m: any) => {
          logger.log(`Transaction worker message: ${JSON.stringify(m)}`);
          if (m.error) {
            logger.error(m.error);
          } else {
            context.workspaceState.update('unsignedTx', m.buildTxResult);
            logger.success(m.buildTxResult);
          }
        });
        const payload = {
          abi,
          bytecode: bin,
          params: params || [],
          gasSupply: gas || 0,
          from: account,
        };
        txWorker.send({
          command: 'build-rawtx',
          payload,
          testnetId: networkId,
        });
      } else if (isStdContract(contract)) {
        const { abi, evm } = contract;
        const { bytecode } = evm;
        const txWorker = createWorker();
        txWorker.on('message', (m: any) => {
          logger.log(`Transaction worker message: ${JSON.stringify(m)}`);
          if (m.error) {
            logger.error(m.error);
          } else {
            context.workspaceState.update('unsignedTx', m.buildTxResult);
            logger.success(m.buildTxResult);
          }
        });
        txWorker.send({
          command: 'build-rawtx',
          payload: {
            abi,
            bytecode,
            params: [],
            gasSupply: 0,
            from: account,
          },
          testnetId: networkId,
        });
      } else {
        logger.error(Error('Could not parse contract.'));
      }
    }),
    // Load combined JSON output
    commands.registerCommand('ethcode.combined-json.load', () => {
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      parseCombinedJSONPayload(context, editorContent);
    }),
    // Load combined JSON output
    commands.registerCommand('ethcode.standard-json.load', (_jsonPayload: any) => {
      if (_jsonPayload && isStdJSONOutput(_jsonPayload)) {
        parseJSONPayload(context, JSON.stringify(_jsonPayload));
      } else {
        const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
        parseJSONPayload(context, editorContent);
      }
    }),
    // Create Input JSON
    commands.registerCommand('ethcode.contract.input.create', async () => {
      const contract:
        | CombinedCompiledContract
        | StandardCompiledContract
        | undefined = await context.workspaceState.get('contract');
      if (contract && workspace.workspaceFolders) {
        const constructor: Array<ABIDescription> = contract.abi.filter((i: ABIDescription) => i.type === 'constructor');
        const constInps: Array<ABIParameter> = <Array<ABIParameter>>constructor[0].inputs;
        if (constInps && constInps.length > 0) {
          const inputs: Array<ConstructorInputValue> = constInps.map(
            (inp: ABIParameter) => <ConstructorInputValue>{ ...inp, value: '' }
          );
          const fileWorker = createWorker();
          fileWorker.send({
            command: 'create-input-file',
            payload: {
              path: workspace.workspaceFolders[0].uri.path,
              inputs,
            },
          });
        }
      } else logger.error(errors.ContractNotFound);
    }),
    // Load constructor inputs from JSON
    commands.registerCommand('ethcode.contract.input.load', async () => {
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      if (editorContent) {
        const constructorInputs: Array<ConstructorInputValue> = JSON.parse(editorContent);
        context.workspaceState.update('constructor-inputs', constructorInputs);
      }
    }),
    // Get gas estimate
    commands.registerCommand('ethcode.contract.gas.get', async () => {
      const networkId = context.workspaceState.get('networkId');
      const account = context.workspaceState.get('account');
      const contract = context.workspaceState.get('contract');
      const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
      let payload = {};
      if (isComContract(contract)) {
        const { abi, bin } = contract;
        payload = {
          abi,
          bytecode: bin,
          params: params || [],
          from: account,
        };
      } else if (isStdContract(contract)) {
        const { abi, evm } = contract;
        payload = {
          abi,
          bytecode: evm.bytecode.object,
          params: params || [],
          from: account,
        };
      }
      const txWorker = createWorker();
      txWorker.on('message', (m: any) => {
        logger.log(`Transaction worker message: ${JSON.stringify(m)}`);
        if (m.error) {
          logger.error(m.error);
        } else {
          context.workspaceState.update('gasEstimate', m.gasEstimate);
          logger.success(m.gasEstimate);
        }
      });
      txWorker.send({
        command: 'get-gas-estimate',
        payload,
        testnetId: networkId,
      });
    }),
    // Set custom gas estimate
    commands.registerCommand('ethcode.contract.gas.set', async () => {
      const gas = await window.showInputBox(gasInp);
      context.workspaceState.update('gasEstimate', gas);
    }),
    commands.registerCommand('ethcode.show', async () => {
      ReactPanel.createOrShow(context.extensionPath);
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
