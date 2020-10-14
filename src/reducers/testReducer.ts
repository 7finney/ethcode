<<<<<<< HEAD
import { ADD_TEST_RESULTS, ADD_FINAL_RESULT_CALLBACK, CLEAR_FINAL_RESULT } from "../actions/types";
=======
import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT
} from "../actions/types";
>>>>>>> 4eecdbc36a335125837993094b02c8601bf73af9

const initialState = {
  testResults: [],
  testResult: {}
};

export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case ADD_TEST_RESULTS:
      return { ...state, testResults: [...state.testResults, action.payload] };
    case ADD_FINAL_RESULT_CALLBACK:
      return { ...state, testResult: action.payload };
    case CLEAR_FINAL_RESULT:
      return { ...state, testResults: [] };
    default:
      return state;
  }
};
