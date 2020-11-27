import { CompilationResult, IAccount } from "./solidityTypes";

export type GlobalStore = {
  test: {
    testResults: Array<any>;
    testResult: { [key: string]: string };
  };
  compiledStore: {
    compiledResult: Array<CompilationResult>;
    callResult: { [key: string]: string };
    testNetCallResult: { [key: string]: string };
  };
  accountStore: {
    accountBalance: number;
    accounts: Array<IAccount>;
    currAccount: { [key: string]: string };
  };
  debugStore: {
    testNetId: string;
  };
  txStore: {
    unsignedTx: string;
  };
};
