import { ethers } from "ethers";
import * as vscode from "vscode";
import { InputBoxOptions, window, commands } from "vscode";
import { GanacheAddressType } from "./types";
import {
  callContractMethod,
  deployContract,
  displayBalance,
  setTransactionGas,
  updateSelectedNetwork,
} from "./utils/networks";
import { logger } from "./lib";
import {
  createKeyPair,
  deleteKeyPair,
  selectAccount,
  importKeyPair,
  exportKeyPair,
} from "./utils/wallet";
import {
  parseBatchCompiledJSON,
  parseCompiledJSONPayload,
  selectContract,
} from "./utils";
import { createGelatoAutomation } from "./utils/gelato";

// eslint-disable-next-line import/prefer-default-export
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // Create new account with password
    commands.registerCommand("ethcode.account.create", async () => {
      try {
        const pwdInpOpt: InputBoxOptions = {
          ignoreFocusOut: true,
          password: true,
          placeHolder: "Password",
        };
        const password = await window.showInputBox(pwdInpOpt);
        createKeyPair(context, context.extensionPath, password || "");
      } catch (error) {
        logger.error(error);
      }
    }),

    // Delete selected account with password
    commands.registerCommand("ethcode.account.delete", async () => {
      deleteKeyPair(context);
    }),

    // Deploy ContractcallContractMethod
    commands.registerCommand("ethcode.contract.deploy", async () => {
      deployContract(context);
    }),

    // select ethereum networks
    commands.registerCommand("ethcode.network.select", () => {
      updateSelectedNetwork(context);
    }),

    // Select Ethereum Account
    commands.registerCommand("ethcode.account.select", () => {
      selectAccount(context);
    }),

    // Get account balance
    commands.registerCommand("ethcode.account.balance", async () => {
      displayBalance(context);
    }),

    // Set gas strategy
    commands.registerCommand("ethcode.transaction.gas.set", async () => {
      setTransactionGas(context);
    }),

    // Load combined JSON output
    commands.registerCommand("ethcode.compiled-json.load", () => {
      const editorContent = window.activeTextEditor
        ? window.activeTextEditor.document.getText()
        : undefined;
      parseCompiledJSONPayload(context, editorContent);
    }),

    // Load all combined JSON output
    commands.registerCommand("ethcode.compiled-json.load.all", async () => {
      parseBatchCompiledJSON(context);
    }),

    // Select a compiled json from the list
    commands.registerCommand("ethcode.compiled-json.select", () => {
      selectContract(context);
    }),

    // Call contract method
    commands.registerCommand("ethcode.contract.call", async () => {
      callContractMethod(context);
    }),

    //Export Account
    commands.registerCommand("ethcode.account.export", async () => {
      exportKeyPair(context);
    }),
    //Import Key pair
    commands.registerCommand("ethcode.account.import", async () => {
      importKeyPair(context);
    }),
    commands.registerCommand("ethcode.gelato.create", async () => {
      await createGelatoAutomation(context);
    }),

    // Set custom gas estimate
    // commands.registerCommand('ethcode.transaction.gas.set', async () => {
    // const gasInp: InputBoxOptions = {
    //   ignoreFocusOut: false,
    //   placeHolder: 'Enter custom gas',
    // };

    // const gas = await window.showInputBox(gasInp);
    // context.workspaceState.update('gasEstimate', gas);
    // }),

    // Activate
    commands.registerCommand("ethcode.activate", async () => {
      logger.success("Welcome to Ethcode!");
    })
  );
}
