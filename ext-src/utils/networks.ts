import { ethers } from 'ethers';
import * as vscode from 'vscode';
import { CompiledJSONOutput, getAbi, getByteCode } from '../types/output';
import { logger } from './logger';
import { JsonFragment } from '@ethersproject/abi';

const provider = ethers.providers;

const getConfiguration = () => {
  return vscode.workspace.getConfiguration('ethcode');
};

const getNetworkNames = (): Array<string> => {
  const networks = getConfiguration().get('networks') as object;
  return Object.keys(networks);
};

// Selected Network Configuratin Helper
const getSelectedNetwork = (context: vscode.ExtensionContext): string => {
  return context.workspaceState.get('selectedNetwork') as string;
};

const getSeletedRpcUrl = (context: vscode.ExtensionContext) => {
  const networks = getConfiguration().get('networks') as any;
  return networks[getSelectedNetwork(context)];
};

const updateSelectedNetwork = async (context: vscode.ExtensionContext, name: string) => {
  context.workspaceState.update('selectedNetwork', name);
};

const isValidHttpUrl = (url_: string): boolean => {
  let url;

  try {
    url = new URL(url_);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

const getSelectedProvider = (context: vscode.ExtensionContext) => {
  const rpc = getSeletedRpcUrl(context); // default providers have a name with less than 10 chars
  if (isValidHttpUrl(rpc)) return new provider.JsonRpcProvider(rpc);

  return provider.getDefaultProvider(rpc);
};

// Contract function calls
const displayBalance = async (context: vscode.ExtensionContext) => {
  const address: any = await context.workspaceState.get('account');

  try {
    getSelectedProvider(context)
      .getBalance(address)
      .then(async (value) => {
        const balance = ethers.utils.formatEther(value);
        context.workspaceState.update('balance', balance);

        const networkName: any = getSelectedNetwork(context);
        logger.success(`${address} has account Balance on ${networkName} network is: ${balance} Eth`);
      });
  } catch (_) {
    logger.error(new Error("Selected network RPC isn't supported."));
  }
};

const callContractMethod = async (context: vscode.ExtensionContext, abiItem: JsonFragment) => {
  try {
    const compiledOutput = (await context.workspaceState.get('contract')) as CompiledJSONOutput;
    const abi = getAbi(compiledOutput);
    if (abi == undefined)
      throw new Error("Abi is not defined");

    const provider = getSelectedProvider(context);

    const contractAddres = '0x000';

    const contract = new ethers.Contract(
      contractAddres,
      abi,
      provider,
    );

    if (abiItem.name == undefined)
      throw new Error("Function name is required");
      
    const result = await contract[abiItem.name](abiItem.inputs);
    logger.log(JSON.stringify(result));
  } catch (err) {
    logger.error(err);
  }
}

const deployContract = async (context: vscode.ExtensionContext) => {
  try {
    const compiledOutput = (await context.workspaceState.get('contract')) as CompiledJSONOutput;
    const abi = getAbi(compiledOutput);
    if (abi == undefined)
      throw new Error("Abi is not defined");

    const byteCode = getByteCode(compiledOutput);
    if (byteCode == undefined)
      throw new Error("ByteCode is not defined");

    const provider = getSelectedProvider(context);
    const mnemonic = "<see-phrase>" // seed phrase for your Metamask account
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const account = wallet.connect(provider);

    const myContract = new ethers.ContractFactory(abi, byteCode, account);
    const contract = await myContract.deploy();

    context.workspaceState.update('contractAddress', contract.address);
    logger.log(`Contract has been deployed to ${contract.address}`);

  } catch (err) {
    logger.error(err);
  }
}

export {
  getNetworkNames,
  getSelectedNetwork,
  getSelectedProvider,
  updateSelectedNetwork,
  displayBalance,
  callContractMethod,
  deployContract
};
