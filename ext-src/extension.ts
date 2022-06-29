import { ethers } from 'ethers';
import * as vscode from 'vscode';
import { InputBoxOptions, window, commands, workspace, WebviewPanel } from 'vscode';
import {
  IAccountQP,
  IFunctionQP,
  LocalAddressType,
  ABIDescription,
  ABIParameter,
  ConstructorInputValue,
  TxReceipt,
  GanacheAddressType,
  INetworkQP,
} from './types';
import {
  parseCompiledJSONPayload,
  parseBatchCompiledJSON,
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
import {
  displayBalance,
  getNetworkNames,
  getSelectedNetwork,
  getSelectedProvider,
  updateSelectedNetwork,
} from './utils/networks';
import { logger } from './utils/logger';

const provider = ethers.providers;
// Create logger
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
    // select ethereum networks
    commands.registerCommand('ethcode.network.select', () => {
      const quickPick = window.createQuickPick<INetworkQP>();

      quickPick.items = getNetworkNames().map((name) => ({
        label: name,
      }));
      quickPick.onDidChangeActive(() => {
        quickPick.placeholder = 'Select network';
      });
      quickPick.onDidChangeSelection((selection: Array<INetworkQP>) => {
        if (selection[0]) {
          const { label } = selection[0];
          updateSelectedNetwork(context, label);
          quickPick.dispose();

          logger.log(`Selected network is ${label}`);
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }),
    // Select Ethereum Account
    commands.registerCommand('ethcode.account.select', () => {
      const quickPick = window.createQuickPick<IAccountQP>();
      const addresses: Array<LocalAddressType> | undefined = context.workspaceState.get('addresses');
      const ganacheAddresses: Array<string> | undefined = context.workspaceState.get('ganache-addresses');
      let options: Array<IAccountQP> = [];

      if (addresses) {
        options = addresses.map(
          (account) =>
            <IAccountQP>{
              label: account.pubAddress,
              description: 'Local account',
              checksumAddr: account.checksumAddress,
            }
        );
      }

      if (ganacheAddresses) {
        const gOpts: Array<IAccountQP> = ganacheAddresses.map(
          (addr) => <IAccountQP>{ label: addr, description: 'Ganache account', checksumAddr: addr }
        );
        options = [...options, ...gOpts];
      }

      if (options.length === 0) return;

      quickPick.items = options.map((account) => ({
        label: account.checksumAddr,
        description: account.description,
        checksumAddr: account.checksumAddr,
      }));

      quickPick.onDidChangeActive(() => {
        quickPick.placeholder = 'Select account';
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

    // List local Accounts
    commands.registerCommand('ethcode.account.list', () => {
      const accWorker = createAccWorker();
      accWorker.on('message', (m: any) => {
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
    commands.registerCommand('ethcode.account.ganache.list', async () => {
      try {
        await new provider.JsonRpcProvider('http://127.0.0.1:7545').listAccounts().then((account: any) => {
          context.workspaceState.update('ganache-addresses', <Array<GanacheAddressType>>account);
          const gadd = context.workspaceState.get('ganache-addresses');
          logger.log(JSON.stringify(gadd));
        });
      } catch (e) {
        console.log('error');
      }
    }),

    // Get account balance
    commands.registerCommand('ethcode.account.balance', async () => {
      const address: any = await context.workspaceState.get('account');
      displayBalance(context, address);
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
    // Load all combined JSON output
    commands.registerCommand('ethcode.compiled-json.load.all', () => {
      if (workspace.workspaceFolders === undefined) {
        logger.error(new Error('Please open your solidity project to vscode'));
        return;
      }

      logger.log('Loading all compiled jsons...');

      context.workspaceState.update('contracts', ''); // Initialize contracts storage
      const fileWorker = createWorker();
      fileWorker.on('message', (m: any) => {
        if (m.type === 'try-parse-batch-json') {
          parseBatchCompiledJSON(context, m.paths);
        }
      });

      fileWorker.send({
        command: 'load-all-compiled-json',
        payload: {
          path: workspace.workspaceFolders[0].uri.fsPath,
        },
      });
    }),
    // Select a compiled json from the list
    commands.registerCommand('ethcode.compiled-json.select', () => {
      const contracts = context.workspaceState.get('contracts') as { [name: string]: CompiledJSONOutput };

      const quickPick = window.createQuickPick<IFunctionQP>();
      if (contracts === undefined || Object.keys(contracts).length === 0) return;

      quickPick.items = Object.keys(contracts).map((f) => ({
        label: f || '',
        functionKey: f || '',
      }));
      quickPick.placeholder = 'Select a contract';
      quickPick.onDidChangeSelection((selection: Array<IFunctionQP>) => {
        if (selection[0] && workspace.workspaceFolders) {
          const { functionKey } = selection[0];
          quickPick.dispose();
          // get selected contract
          const name = Object.keys(contracts).filter((i: string) => i === functionKey);
          const contract: CompiledJSONOutput = contracts[name[0]];
          context.workspaceState.update('contract', contract);
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }),
    // Create Input JSON
    commands.registerCommand('ethcode.contract.input.create', () => {
      const contract = context.workspaceState.get('contract') as CompiledJSONOutput;

      if (contract === undefined || contract == null || workspace.workspaceFolders === undefined) {
        logger.error(errors.ContractNotFound);
        return;
      }

      const constructor = getAbi(contract)?.filter((i: ABIDescription) => i.type === 'constructor');
      if (constructor === undefined) {
        logger.log("Abi doesn't exist on the loaded contract");
        return;
      }

      if (constructor.length === 0) {
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
        if (functions === undefined) {
          logger.log("Abi doesn't exist on the loaded contract");
          return;
        }

        if (functions.length === 0) {
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
      const contract = (await context.workspaceState.get('contract')) as CompiledJSONOutput;
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

    // Activate
    commands.registerCommand('ethcode.activate', async () => {
      commands.executeCommand('ethcode.account.list');
      commands.executeCommand('ethcode.account.ganache.list');
      logger.success('Welcome to Ethcode!');
    })
  );
}
