import {
  ADD_TEST_RESULTS,
  ADD_FINAL_RESULT_CALLBACK,
  CLEAR_FINAL_RESULT
} from "../actions/types";

const initialState = {
  testResults: [],
  testResult: {}
};

export default (state: any = initialState, action: any) => {
  console.log(JSON.stringify(action));
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
