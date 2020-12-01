import { CompilationResult, IAccount, TransactionResult } from './solidityTypes';

export type GlobalStore = {
  test: {
    testResults: Array<any>;
    testResult: { [key: string]: string };
  };
  compiledStore: {
    compiledResult: Array<CompilationResult>;
    callResult: { [key: string]: string };
    testNetCallResult: { [key: string]: string };
    deployedResult: TransactionResult;
  };
  accountStore: {
    accountBalance: number;
    accounts: Array<IAccount>;
    currAccount: IAccount;
  };
  debugStore: {
    testNetId: string;
  };
  txStore: {
    unsignedTx: string;
  };
};
