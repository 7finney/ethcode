import { ethers } from 'ethers';
import * as vscode from 'vscode';
import { InputBoxOptions, window, commands } from 'vscode';
import {
  GanacheAddressType,
} from './types';
import {
  estimateTransactionGas,
  getTransactionInfo,
  getTransactionReceipt,
} from './lib';
import {
  callContractMethod,
  deployContract,
  displayBalance,
  updateSelectedNetwork,
} from './utils/networks';
import { logger } from './lib';
import { createKeyPair, deleteKeyPair, listAddresses, selectAccount } from './utils/wallet';
import { parseBatchCompiledJSON, parseCompiledJSONPayload, selectContract } from './utils';
import { createConstructorInput, createFunctionInput } from './utils/functions';

// eslint-disable-next-line import/prefer-default-export
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(

    // Create new account with password
    commands.registerCommand('ethcode.account.create', async () => {
      try {
        const pwdInpOpt: InputBoxOptions = {
          ignoreFocusOut: true,
          password: true,
          placeHolder: 'Password',
        };
        const password = await window.showInputBox(pwdInpOpt);
        createKeyPair(context, context.extensionPath, password || '');
      } catch (error) {
        logger.error(error);
      }
    }),

    // Delete selected account with password
    commands.registerCommand('ethcode.account.delete', async () => {
      deleteKeyPair(context);
    }),

    // Deploy Contract
    commands.registerCommand('ethcode.contract.deploy', async () => {
      deployContract(context);
    }),

    // select ethereum networks
    commands.registerCommand('ethcode.network.select', () => {
      updateSelectedNetwork(context);
    }),

    // Select Ethereum Account
    commands.registerCommand('ethcode.account.select', () => {
      selectAccount(context);
    }),

    // List local Accounts
    commands.registerCommand('ethcode.account.list', async () => {
      listAddresses(context, context.extensionPath);
    }),

    // List Ganache accounts
    commands.registerCommand('ethcode.account.ganache.list', async () => {
      try {
        await new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545').listAccounts().then((account: any) => {
          context.workspaceState.update('ganache-addresses', <Array<GanacheAddressType>>account);
          const gadd = context.workspaceState.get('ganache-addresses');
          logger.log(JSON.stringify(gadd));
        });
      } catch (e) {
        console.log("Ganache isn't registered");
      }
    }),

    // Get account balance
    commands.registerCommand('ethcode.account.balance', async () => {
      displayBalance(context);
    }),

    // Set unsigned transaction
    commands.registerCommand('ethcode.transaction.set', async (tx: any) => {
      const unsignedTxInp: InputBoxOptions = {
        ignoreFocusOut: false,
        placeHolder: 'Unsigned transaction JSON',
      };

      const unsignedTx = tx || (await window.showInputBox(unsignedTxInp));
      context.workspaceState.update('unsignedTx', unsignedTx);
    }),

    // Create unsigned transaction
    commands.registerCommand('ethcode.transaction.build', async () => {
      // const networkId = context.workspaceState.get('networkId');
      // const account: string | undefined = context.workspaceState.get('account');
      // const contract = context.workspaceState.get('contract') as CompiledJSONOutput;
      // const params: Array<ConstructorInputValue> | undefined = context.workspaceState.get('constructor-inputs');
      // const gas: number | undefined = context.workspaceState.get('gasEstimate');

      // const txWorker = createWorker();
      // txWorker.on('message', (m: any) => {
      //   logger.log(`Transaction worker message: ${JSON.stringify(m)}`);
      //   if (m.error) {
      //     logger.error(m.error);
      //   } else {
      //     context.workspaceState.update('unsignedTx', m.buildTxResult);
      //     logger.log(m.buildTxResult);
      //   }
      // });

      // const payload = {
      //   abi: getAbi(contract),
      //   bytecode: getByteCode(contract),
      //   params: params || [],
      //   gasSupply: gas || 0,
      //   from: account,
      // };
      // txWorker.send({
      //   command: 'build-rawtx',
      //   payload,
      //   testnetId: networkId,
      // });
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
    commands.registerCommand('ethcode.compiled-json.load.all', async () => {
      parseBatchCompiledJSON(context);
    }),

    // Select a compiled json from the list
    commands.registerCommand('ethcode.compiled-json.select', () => {
      selectContract(context);
    }),

    // Create call input for method
    commands.registerCommand('ethcode.contract.call.input.create', () => {
      createFunctionInput(context);
    }),

    // Call contract method
    commands.registerCommand('ethcode.contract.call', async () => {
      callContractMethod(context);
    }),

    // Set custom gas estimate
    commands.registerCommand('ethcode.transaction.gas.set', async () => {
      const gasInp: InputBoxOptions = {
        ignoreFocusOut: false,
        placeHolder: 'Enter custom gas',
      };

      const gas = await window.showInputBox(gasInp);
      context.workspaceState.update('gasEstimate', gas);
    }),

    // Activate
    commands.registerCommand('ethcode.activate', async () => {
      logger.success('Welcome to Ethcode!');
      commands.executeCommand('ethcode.account.list');
      commands.executeCommand('ethcode.account.ganache.list');
    })
  );
}
