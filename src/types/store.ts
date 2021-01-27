import { CompilationResult, IAccount, TransactionResult } from './solidityTypes';

export interface IAccStore {
  currAccount: IAccount | null;
  balance: number;
  accounts: IAccount[];
  privateKey?: string | null;
}

export interface IDebugStore {
  testNetId: string;
  processMsg: string;
  appRegistered: boolean;
  error: Error | null;
}

export interface ITxStore {
  gasEstimate: number;
  unsignedTx: string;
}

export interface IContractStore {
  compiledResult: CompilationResult | null;
  callResult: { [key: string]: string };
  deployedResult: TransactionResult | null;
  activeContractName: string;
  activeFileName: string;
}

export type GlobalStore = {
  test: {
    testResults: Array<any>;
    testResult: { [key: string]: string };
  };
  contractsStore: IContractStore;
  accountStore: IAccStore;
  debugStore: IDebugStore;
  txStore: ITxStore;
};
