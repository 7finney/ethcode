import { ethers } from "ethers";
import * as vscode from "vscode";
// import {EventEmitter} from "events";
import { extractPvtKey, listAddresses } from "./wallet";

import {
  getNetworkNames,
  getSelectedNetConf,
  getSelectedProvider,
} from "./networks";
import { CompiledJSONOutput } from "../types";
import {
  getConstructorInputFullPath,
  getDeployedFullPath,
  getFunctionInputFullPath,
  getFunctionInputs,
} from "./functions";

// EVENTS
// const ethcode = new vscode.EventEmitter<string>();
const ethcode = {
  network : new vscode.EventEmitter<string>(),
  account : new vscode.EventEmitter<string>()
}


// PROVIDER

const providerDefault = (context: vscode.ExtensionContext) => {
  return getSelectedProvider(context);
};

const getAvailableNetwork = () => {
  return getNetworkNames();
};

const getNetwork = (context: vscode.ExtensionContext) => {
  return getSelectedNetConf(context);
};

const setNetwork = (context: vscode.ExtensionContext, network: string) => {
  if (network === null) {
    return "Network parameter not given";
  }
  if (!getNetworkNames().includes(network)) {
    return "Network not found";
  } else {
    context.workspaceState.update("selectedNetwork", network);
    return "Network changed to " + network;
  }
};

// ACCOUNT
const getAccount = async (context: vscode.ExtensionContext) => {
  const address: any = await context.workspaceState.get("account");
  return address;
};


// WALLET

const getWallet = async (context: vscode.ExtensionContext, account: string) => {
  const address: any = await context.workspaceState.get("account");
  account = account || address;
  let provider = getSelectedProvider(context);
  let privateKey = await extractPvtKey(context.extensionPath, account);
  const wallet = new ethers.Wallet(privateKey, provider);
  return wallet;
};

const listAllWallet = async (context: vscode.ExtensionContext) => {
  let result = await listAddresses(context, context.extensionPath);
  return result;
};

// CONTRACT

const getContract = async (
  context: vscode.ExtensionContext,
  address: string,
  abi: any,
  wallet: ethers.Signer
) => {
  let contract = new ethers.Contract(address, abi, wallet);
  return contract;
};

const listFunctions = (abi: any) => {
  let result = [];
  for (let i = 0; i < abi.length; i++) {
    if (abi[i].type === "function") {
      result.push(abi[i].name);
    }
  }
  return result;
};

const executeContractMethod = async (
  contract: any,
  method: string,
  args: any[]
) => {
  let result = await contract[method](...args);
  return result;
};

const exportABI = async (
  context: vscode.ExtensionContext,
  selectSpecific: string = ""
) => {
  const contracts = context.workspaceState.get("contracts") as {
    [name: string]: CompiledJSONOutput;
  };
  if (contracts === undefined || Object.keys(contracts).length === 0) return;
  // return all abi if name is not specified else return abi of specific contract

  const contractABIS = Object.keys(contracts).map((name) => {
    return {
      name,
      abi: contracts[name].hardhatOutput?.abi,
    };
  });

  for (let i = 0; i < contractABIS.length; i++) {
    if (contractABIS[i].name === selectSpecific) {
      return contractABIS[i].abi;
    }
  }
  return contractABIS;
};

const getDeployedContractAddress = async (
  context: vscode.ExtensionContext,
  name: string
) => {
  const contracts = context.workspaceState.get("contracts") as {
    [name: string]: CompiledJSONOutput;
  };
  if (contracts === undefined || Object.keys(contracts).length === 0) return;
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    let contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]];
    if (contract.name === name) {
      let link = getDeployedFullPath(contract);
      let json = require(link);
      console.log(json);
      return json;
    }
  }
};

const getFunctionInputFile = async (
  context: vscode.ExtensionContext,
  name: string
) => {
  const contracts = context.workspaceState.get("contracts") as {
    [name: string]: CompiledJSONOutput;
  };
  if (contracts === undefined || Object.keys(contracts).length === 0) return;
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    let contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]];
    if (contract.name === name) {
      let link = getFunctionInputFullPath(contract);
      let json = require(link);
      console.log(json);
      return json;
    }
  }
};

const getConstructorInputFile = async (
  context: vscode.ExtensionContext,
  name: string
) => {
  const contracts = context.workspaceState.get("contracts") as {
    [name: string]: CompiledJSONOutput;
  };
  if (contracts === undefined || Object.keys(contracts).length === 0) return;
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    let contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]];
    if (contract.name === name) {
      let link = getConstructorInputFullPath(contract);
      let json = require(link);
      console.log(json);
      return json;
    }
  }
};




export {
  getNetwork,
  setNetwork,
  getAvailableNetwork,
  providerDefault,
  listAllWallet,
  getWallet,
  getContract,
  listFunctions,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile,
  getAccount,
  ethcode,
  // getEventEmitter
};
