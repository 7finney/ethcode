import { QuickPickItem } from 'vscode';
import { JsonFragment } from '@ethersproject/abi';

export interface ISource {
  content: string | undefined;
}

export interface ISources {
  [key: string]: ISource;
}

export interface IAccount {
  label: string;
  value: string;
  pubAddr?: string;
  checksumAddr?: string;
}

export interface Account {
  pubAddr: string;
  checksumAddr: string;
}

export type LocalAddressType = {
  pubAddress: string;
  checksumAddress: string;
};

export type GanacheAddressType = string;

export interface TokenData {
  appId?: string;
  token?: string;
  email?: string;
}

export interface ICompilationResult {
  source: {
    target: string;
    sources: ISources;
  };
  data: any;
}

export interface INetworkQP extends QuickPickItem {
  label: string;
}
export interface IEthereumNetworkQP extends QuickPickItem {
  name: string;
  rpc: string;
  chainId?: number | string;
}

export interface IAccountQP extends QuickPickItem {
  checksumAddr: string;
}

export interface ICombinedJSONContractsQP extends QuickPickItem {
  contractKey: string;
}

export interface IStandardJSONContractsQP extends QuickPickItem {
  contractKey: string;
}

export interface IFunctionQP extends QuickPickItem {
  functionKey: string;
}

export interface ConstructorInputValue extends JsonFragment {
  value: string;
}

export interface TxReceipt {
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  blockNumber: number;
  from: string;
  to?: null;
  gasUsed: number;
  cumulativeGasUsed: number;
  contractAddress: string;
  logs?: null[] | null;
  status: number;
  logsBloom: string;
}

// Typeguard

export function isConstructorInputValue(obj: any): obj is ConstructorInputValue {
  return obj.value !== undefined;
}
