import { CompilationResult, IAccount, TransactionResult } from './solidityTypes';

interface IDebugStore {
  testNetId: string;
  processMsg: string;
  error: Error | null;
}

export type GlobalStore = {
  test: {
    testResults: Array<any>;
    testResult: { [key: string]: string };
  };
  contractsStore: {
    compiledResult: Array<CompilationResult>;
    callResult: { [key: string]: string };
    testNetCallResult: { [key: string]: string };
  };
  accountStore: {
    accountBalance: number;
    accounts: Array<IAccount>;
    currAccount: IAccount;
  };
  debugStore: IDebugStore;
  txStore: {
    unsignedTx: string;
    deployedResult: TransactionResult;
  };
};
