import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT,
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_UNSG_TX,
  SET_TESTNET_CALL_RESULT,
  SET_PROCESS_MSG,
  SET_ERR_MSG,
  SET_GAS_ESTM,
  SET_APP_REG,
} from './types';

import { CompilationResult, IAccount } from '../types';
import { Dispatch } from 'react';

interface IDispatch {
  type: string;
  payload: CompilationResult | IAccount | string | number | boolean | Error;
}

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

export const setUnsgTxn = (unsgTxn: any) => {
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: SET_UNSG_TX, payload: unsgTxn });
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

export const setGasEstimate = (gas: number) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_GAS_ESTM, payload: gas });
  };
};

export const setAppRegistered = (appRegistered: boolean) => {
  return (dispatch: Dispatch<IDispatch>) => {
    dispatch({ type: SET_APP_REG, payload: appRegistered });
  };
};
