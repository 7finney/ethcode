import { ethers } from 'ethers';
import * as vscode from 'vscode';
import { logger } from './logger';

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

const displayBalance = (context: vscode.ExtensionContext, address: string) => {
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

export { getNetworkNames, getSelectedNetwork, getSelectedProvider, updateSelectedNetwork, displayBalance };
