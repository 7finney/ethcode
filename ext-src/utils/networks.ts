import { ethers } from 'ethers';
import * as vscode from 'vscode';

const provider = ethers.providers;

const getConfiguration = () => {
  return vscode.workspace.getConfiguration('ethcode');
};

const getNetworkNames = (): Array<string> => {
  const networks = getConfiguration().get('networks') as object;
  return Object.keys(networks);
};

// Selected Network Configuratin Helper
let selectedNetwork: string = getConfiguration().get('selectedNetwork') as string;
const getSelectedNetwork = () => {
  return selectedNetwork;
};

const getSeletedRpcUrl = () => {
  const networks = getConfiguration().get('networks') as any;
  return networks[getSelectedNetwork()];
};

const updateSelectedNetwork = async (name: string) => {
  const config = getConfiguration();
  await config.update('selectedNetwork', name, true);
  selectedNetwork = name;
};

const getSelectedProvider = () => {
  const networkName = getSelectedNetwork();
  if (networkName === 'ganache') return new provider.JsonRpcProvider('http://127.0.0.1:7545');

  const rpc = getSeletedRpcUrl(); // default providers have a name with less than 10 chars
  if (rpc.length < 15) return provider.getDefaultProvider(rpc);

  return new provider.JsonRpcProvider(rpc);
};

export { getNetworkNames, getSelectedNetwork, getSelectedProvider, updateSelectedNetwork };
