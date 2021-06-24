import { QuickPickItem } from 'vscode';
import { CompiledContract } from './output';

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
  networkId: number;
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

// Typeguard

export function isCompiledContract(obj: any): obj is CompiledContract {
  return obj.abi !== undefined;
}
