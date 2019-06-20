import { ADD_TEST_RESULTS, ADD_FINAL_RESULT_CALLBACK } from "./types";

export const addTestResults = (data: any) => {
  return { type: ADD_TEST_RESULTS, payload: data };
};

export const addFinalResultCallback = (data: any) => {
    return {type: ADD_FINAL_RESULT_CALLBACK, payload: data }
}