<<<<<<< HEAD
import { SET_DEPLOYED_RESULT, CLEAR_DEPLOYED_RESULT, SET_CALL_RESULT, SET_TESTNET_CALL_RESULT } from "../actions/types";
=======
import {
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_TESTNET_CALL_RESULT
} from "../actions/types";
>>>>>>> 4eecdbc36a335125837993094b02c8601bf73af9

const initialState = {
  compiledresult: {},
  callResult: {},
  testNetCallResult: {}
};

export default (state: any = initialState, action: any) => {
  switch (action.type) {
    case SET_DEPLOYED_RESULT:
      return {
        ...state,
        compiledresult: action.payload
      };
    case CLEAR_DEPLOYED_RESULT:
      return {
        ...state,
        compiledresult: {},
        callResult: {}
      }
    case SET_CALL_RESULT:
      return {
        ...state,
        callResult: action.payload
      }
    case SET_TESTNET_CALL_RESULT:
      return {
        ...state,
        testNetCallResult: action.payload
      }
    default:
      return state;
  }
}