import { ethers } from "ethers";
import * as vscode from "vscode";

import { extractPvtKey, listAddresses } from "./wallet";

import { getNetworkNames, getSelectedNetConf, getSelectedProvider } from "./networks";

// PROVIDER

const providerDefault = (context: vscode.ExtensionContext) => {
  return getSelectedProvider(context);
}

const getAvailableNetwork = () => {
  return getNetworkNames();
}

const getNetwork = (context: vscode.ExtensionContext) => {
  return getSelectedNetConf(context);
}

const setNetwork = (context: vscode.ExtensionContext, network: string) => {
  if(network === null){
    return "Network parameter not given";
  }
  if (!getNetworkNames().includes(network)) {
    return "Network not found";
  } else {
    context.workspaceState.update("selectedNetwork", network);
    return "Network changed to " + network;
  }
}

// WALLET

const getWallet = async (context: vscode.ExtensionContext, account: string) => {
  const address: any = await context.workspaceState.get("account");
  account  = account || address;
  let provider = getSelectedProvider(context);
  let privateKey = await extractPvtKey(context.extensionPath, account);
  const wallet = new ethers.Wallet(privateKey,provider)
  return wallet;
}

const listAllWallet = async (context: vscode.ExtensionContext) => {
  let result = await listAddresses(context, context.extensionPath);
  return result;
}

// CONTRACT

const getContract = async (context: vscode.ExtensionContext, address: string, abi: any, wallet: ethers.Signer) => {
  let contract = new ethers.Contract(address, abi, wallet);
  return contract;
}

const listFunctions = (abi: any) => {
  let result = [];
  for (let i = 0; i < abi.length; i++) {
    if (abi[i].type === "function") {
      result.push(abi[i].name);
    }
  }
  return result;
}

const executeContractMethod = async (contract: any, method: string, args: any[]) => {
  let result = await contract[method](...args);
  return result;
}

export {
  getNetwork,
  setNetwork,
  getAvailableNetwork,
  providerDefault,
  listAllWallet,
  getWallet,
  getContract,
  listFunctions,
  executeContractMethod
}