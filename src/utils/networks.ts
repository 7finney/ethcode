import { ethers } from 'ethers';
import * as vscode from 'vscode';
import { window } from 'vscode';
import { CompiledJSONOutput, getAbi, getByteCode } from '../types/output';
import { logger } from '../lib';
import { JsonFragment } from '@ethersproject/abi';
import { extractPvtKey } from './wallet';
import { INetworkQP } from '../types';
import { getConstructorInputs } from './functions';

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

const updateSelectedNetwork = async (context: vscode.ExtensionContext) => {
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
      context.workspaceState.update('selectedNetwork', label);
      quickPick.dispose();

      logger.success(`Selected network is ${label}`);
    }
  });
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
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

const callContractMethod = async (context: vscode.ExtensionContext) => {
  try {
    if (!window.activeTextEditor) {
      logger.error(new Error('Please open a tab and input function name and parameters to call'));
      return;
    }

    const abiItem: JsonFragment = JSON.parse(window.activeTextEditor.document.getText())[0];
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

/**
 * @dev deploy the contract using the compiled json output and signer wallet
 */
const deployContract = async (context: vscode.ExtensionContext) => {
  try {
    const compiledOutput = (await context.workspaceState.get('contract')) as CompiledJSONOutput;
    if (compiledOutput == undefined)
      throw new Error("Contract isn't selectd yet");

    const abi = getAbi(compiledOutput);
    if (abi == undefined)
      throw new Error("Abi is not defined");

    const byteCode = getByteCode(compiledOutput);
    if (byteCode == undefined)
      throw new Error("ByteCode is not defined");

    logger.log("Deploying the contract...");
    const account = context.workspaceState.get('account') as string;
    const privateKey = await extractPvtKey(context.extensionPath, account);

    const provider = getSelectedProvider(context);
    const wallet = new ethers.Wallet(privateKey);
    const signingAccount = wallet.connect(provider);

    const myContract = new ethers.ContractFactory(abi, byteCode, signingAccount);

    const parameters = getConstructorInputs(context);
    const contract = await myContract.deploy(...parameters);

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
