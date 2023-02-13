import { ethers } from "ethers";
import * as vscode from "vscode";
import { InputBoxOptions, window, commands } from "vscode";
import { GanacheAddressType } from "./types";
import {
  callContractMethod,
  deployContract,
  displayBalance,
  getSelectedProvider,
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
  listAddresses,
} from "./utils/wallet";
import {
  createERC4907Contract,
  parseBatchCompiledJSON,
  parseCompiledJSONPayload,
  selectContract,
} from "./utils";
import {
  getNetwork,
  getWallet,
  getAvailableNetwork,
  providerDefault,
  setNetwork,
  listAllWallet,
  getContract,
  listFunctions,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile,
  getAccount
} from "./utils/api";

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // Create new account with password
    commands.registerCommand("ethcode.account.create", async () => {
      try {
        const pwdInpOpt: InputBoxOptions = {
          title: "Password",
          ignoreFocusOut: true,
          password: true,
          placeHolder: "Password",
        };
        const password = await window.showInputBox(pwdInpOpt);
        if (password === undefined) {
          logger.log("Account not created");
          return;
        }
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
      deployContract(context); //*
    }),

    // select ethereum networks
    commands.registerCommand("ethcode.network.select", () => {
      updateSelectedNetwork(context);
    }),

    commands.registerCommand("ethcode.rental.create", () => {
      createERC4907Contract(context);
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

    // Activate
    commands.registerCommand("ethcode.activate", async () => {
      logger.success("Welcome to Ethcode!");
    })
  );

  // API for extensions
  // ref: https://code.visualstudio.com/api/references/vscode-api#extensions
  const api = {
    // STATUS
    status: () => {
      return "ok";
    },
    // ACCOUNT
    account: {
      get: () => getAccount(context)
    },
    // WALLET
    wallet: {
      get: (account: string) => getWallet(context, account),
      list: () => listAllWallet(context),
    },
    // PROVIDER
    provider: {
      get: () => providerDefault(context),
      network: {
        get: () => getNetwork(context),
        set: (network: string) => setNetwork(context, network),
        list: () => getAvailableNetwork(),
      },
    },
    // CONTRACT
    contract: {
      get: (address: string, abi: any, wallet: ethers.Signer) =>
        getContract(context, address, abi, wallet),
      list: (abi: any) => listFunctions(abi),
      execute: (contract: any, method: string, args: any[]) =>
        executeContractMethod(contract, method, args),
      abi: (name: string) => exportABI(context, name),
      geContractAddress: (name: string) =>
        getDeployedContractAddress(context, name),
      getFunctionInput: (name: string) => getFunctionInputFile(context, name),
      getConstructorInput: (name: string) =>
        getConstructorInputFile(context, name),
    },
  };

  return api;
}
