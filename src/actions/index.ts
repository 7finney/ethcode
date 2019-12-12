import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT,
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT
} from "./types";

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
    dispatch({ type: SET_DEPLOYED_RESULT, payload: JSON.parse(data) })
  };
};

export const clearDeployedResult = () => {
  return (dispatch: Function) => {
    dispatch({ type: CLEAR_DEPLOYED_RESULT })
  };
};
