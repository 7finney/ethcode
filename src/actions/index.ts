import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT,
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_ACC_BALANCE,
  SET_UPDATE_BALANCE,
  SET_TESTNET_ID,
  SET_UNSG_TX,
  APPND_NEW_ACC,
  SET_TESTNET_CALL_RESULT,
} from "./types";

import { IAccount } from "../types";

export const addTestResults = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: ADD_TEST_RESULTS, payload: data });
  };
};

export const addFinalResultCallback = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: ADD_FINAL_RESULT_CALLBACK, payload: data });
  };
};

export const clearFinalResult = () => {
  return (dispatch: Function) => {
    dispatch({ type: CLEAR_FINAL_RESULT });
  };
};

export const setDeployedResult = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_DEPLOYED_RESULT, payload: JSON.parse(data) });
  };
};

export const clearDeployedResult = () => {
  return (dispatch: Function) => {
    dispatch({ type: CLEAR_DEPLOYED_RESULT });
  };
};

export const setCallResult = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_CALL_RESULT, payload: data });
  };
};

export const setTestnetCallResult = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_TESTNET_CALL_RESULT, payload: data });
  };
};

export const setAccountBalance = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_ACC_BALANCE, payload: data });
  };
};

export const setCurrAccChange = (data: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_UPDATE_BALANCE, payload: data });
  };
};

export const setTestNetId = (testNetId: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_TESTNET_ID, payload: testNetId });
  };
};

export const setUnsgTxn = (unsgTxn: any) => {
  return (dispatch: Function) => {
    dispatch({ type: SET_UNSG_TX, payload: unsgTxn });
  };
};

export const addNewAcc = (account: IAccount) => {
  return (dispatch: Function) => {
    dispatch({ type: APPND_NEW_ACC, payload: account });
  };
};
