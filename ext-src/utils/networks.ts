import * as vscode from 'vscode';
import { IEthereumNetworkQP } from '../types';

const settings = vscode.workspace.getConfiguration('ethcode');

const getNetworkProviders = (): Array<IEthereumNetworkQP> => {
  return settings.networks;
};

const getSelectedNetwork = () => {
  return settings.selectedNetwork;
};

const updateSelectedNetwork = async (name: string) => {
  const config = vscode.workspace.getConfiguration('ethcode');
  await config.update('selectedNetwork', { networkName: name }, true);
};

export { settings, getNetworkProviders, getSelectedNetwork, updateSelectedNetwork };
