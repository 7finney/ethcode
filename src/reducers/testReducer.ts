import { ADD_TEST_RESULTS, ADD_FINAL_RESULT_CALLBACK } from "../actions/types";

const initialState = {
  testResults: [],
  testResult: { totalFailing: 0, totalPassing: 0, totalTime: 0 }
};

export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case ADD_TEST_RESULTS:
      return { ...state, testResults: [...state.testResults, action.payload] };
    case ADD_FINAL_RESULT_CALLBACK:
      return { ...state, testResult: action.payload };
    default:
      return state;
  }
};
