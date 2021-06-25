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
  StandardJSONOutput,
  ICombinedJSONContractsQP,
  IStandardJSONContractsQP,
  StandardCompiledContract,
  CombinedCompiledContract,
  isStdContract,
  isComContract,
  ABIDescription,
} from './types';
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

const paramsInpOpt: InputBoxOptions = {
  ignoreFocusOut: false,
  placeHolder: 'Enter constructor parameters',
  value: '[]',
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
      const params = await window.showInputBox(paramsInpOpt);
      console.log(contract);
      if (isComContract(contract)) {
        console.log('Build transaction for combined output');
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
          params: JSON.parse(params!) || [],
          gasSupply: 2488581,
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
      if (editorContent) {
        const { contracts }: CombinedJSONOutput = JSON.parse(editorContent);
        const quickPick = window.createQuickPick<ICombinedJSONContractsQP>();
        quickPick.items = Object.keys(contracts).map((contract) => ({ label: contract, contractKey: contract }));
        quickPick.placeholder = 'Select contract';
        quickPick.onDidChangeActive((selection: Array<ICombinedJSONContractsQP>) => {
          quickPick.value = selection[0].label;
        });
        quickPick.onDidChangeSelection((selection: Array<ICombinedJSONContractsQP>) => {
          if (selection[0]) {
            const contract: CombinedCompiledContract = contracts[selection[0].contractKey];
            if (isComContract(contract)) {
              context.workspaceState.update('contract', contract);
            } else {
              logger.error(Error('Could not parse contract.'));
            }
            quickPick.dispose();
          }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
      } else {
        logger.error(
          Error(
            'Could not load JSON file. Make sure it follows Solidity output description. Know more: https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description.'
          )
        );
      }
    }),
    // Load combined JSON output
    commands.registerCommand('ethcode.standard-json.load', () => {
      const editorContent = window.activeTextEditor ? window.activeTextEditor.document.getText() : undefined;
      if (editorContent) {
        const { contracts }: StandardJSONOutput = JSON.parse(editorContent);
        const quickPick = window.createQuickPick<IStandardJSONContractsQP>();
        quickPick.items = Object.keys(contracts).map((contract) => ({ label: contract, contractKey: contract }));
        quickPick.placeholder = 'Select contract file';
        quickPick.onDidChangeActive((selection: Array<IStandardJSONContractsQP>) => {
          quickPick.value = selection[0].label;
        });
        quickPick.onDidChangeSelection((selection: Array<IStandardJSONContractsQP>) => {
          if (selection[0]) {
            const contractFileName = selection[0].contractKey;
            const contractFile = contracts[contractFileName];
            if (!isStdContract(contractFile)) {
              const contractQp = window.createQuickPick<IStandardJSONContractsQP>();
              contractQp.items = Object.keys(contractFile).map((contract) => ({
                label: contract,
                contractKey: contract,
              }));
              contractQp.placeholder = 'Select contract';
              contractQp.onDidChangeActive((selection: Array<IStandardJSONContractsQP>) => {
                contractQp.value = selection[0].label;
              });
              contractQp.onDidChangeSelection((selection: Array<IStandardJSONContractsQP>) => {
                if (selection[0]) {
                  const contract: StandardCompiledContract = contracts[contractFileName][selection[0].contractKey];
                  if (isStdContract(contract)) {
                    context.workspaceState.update('contract', contract);
                  } else {
                    logger.error(Error('Could not parse contract.'));
                  }
                  contractQp.dispose();
                }
              });
              contractQp.onDidHide(() => contractQp.dispose());
              contractQp.show();
            } else {
              logger.error(Error('Could not parse contract.'));
            }
            quickPick.dispose();
          }
        });
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
      } else {
        logger.error(
          Error(
            'Could not load JSON file. Make sure it follows Solidity output description. Know more: https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-input-and-output-json-description.'
          )
        );
      }
    }),
    // Create Input JSON
    commands.registerCommand('ethcode.contract.input.create', async () => {
      const contract:
        | CombinedCompiledContract
        | StandardCompiledContract
        | undefined = await context.workspaceState.get('contract');
      if (contract && workspace.workspaceFolders) {
        const constructor = contract.abi.filter((i: ABIDescription) => i.type === 'constructor');
        console.log(constructor);
        console.log(workspace.workspaceFolders[0].uri.path);
        const fileWorker = createWorker();
        fileWorker.send({
          command: 'create-input-file',
          payload: {
            path: workspace.workspaceFolders[0].uri.path,
            inputs: constructor[0].inputs,
          },
        });
      } else logger.error(errors.ContractNotFound);
    }),
    // Activate
    commands.registerCommand('ethcode.activate', async () => {
      commands.executeCommand('ethcode.account.list');
      ReactPanel.createOrShow(context.extensionPath);
      logger.success('Welcome to Ethcode!');
    })
  );
  await ReactPanel.createOrShow(context.extensionPath);
  let api;
  if (ReactPanel.currentPanel) api = new API(context, ReactPanel.currentPanel);
  return api;
}
