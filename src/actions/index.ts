import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT,
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_ACC_DATA,
  SET_UPDATE_BALANCE,
  SET_TESTNET_ID,
  SET_UNSG_TX,
  APPND_NEW_ACC,
  SET_TESTNET_CALL_RESULT,
  SET_PROCESS_MSG,
  SET_ERR_MSG,
  SET_COMPILED_RESULT,
} from './types';

import { CompilationResult, IAccount, IAccStore } from '../types';
import { Dispatch } from 'react';

interface IDispatch {
  type: string;
  payload: CompilationResult | IAccount | IAccStore | string | Error;
}

export const setCompiledResults = (data: CompilationResult) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_COMPILED_RESULT, payload: data });
  };
};

export const addTestResults = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: ADD_TEST_RESULTS, payload: data });
  };
};

export const addFinalResultCallback = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: ADD_FINAL_RESULT_CALLBACK, payload: data });
  };
};

export const clearFinalResult = () => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: CLEAR_FINAL_RESULT });
  };
};

export const setDeployedResult = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_DEPLOYED_RESULT, payload: data });
  };
};

export const clearDeployedResult = () => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: CLEAR_DEPLOYED_RESULT });
  };
};

export const setCallResult = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_CALL_RESULT, payload: data });
  };
};

export const setTestnetCallResult = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_TESTNET_CALL_RESULT, payload: data });
  };
};

export const setAccountBalance = (data: IAccStore) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_ACC_DATA, payload: data });
  };
};

export const setCurrAccChange = (data: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_UPDATE_BALANCE, payload: data });
  };
};

export const setTestNetId = (testNetId: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_TESTNET_ID, payload: testNetId });
  };
};

export const setUnsgTxn = (unsgTxn: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_UNSG_TX, payload: unsgTxn });
  };
};

export const addNewAcc = (account: IAccount) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: APPND_NEW_ACC, payload: account });
  };
};

export const setProcessMsg = (msg: string) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_PROCESS_MSG, payload: msg });
  };
};

export const setErrMsg = (error: Error) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_ERR_MSG, payload: error });
  };
};
