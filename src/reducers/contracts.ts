import { IContractStore } from 'types';
import {
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_TESTNET_CALL_RESULT,
  SET_COMPILED_RESULT,
} from '../actions/types';

const initialState: IContractStore = {
  compiledResult: null,
  callResult: {},
  testNetCallResult: {},
  deployedResult: null,
};
export default (state: IContractStore = initialState, action: any): IContractStore => {
  switch (action.type) {
    case SET_DEPLOYED_RESULT:
      return {
        ...state,
        deployedResult: action.payload,
      };
    case CLEAR_DEPLOYED_RESULT:
      return {
        ...state,
        compiledResult: null,
        callResult: {},
        deployedResult: null,
      };
    case SET_CALL_RESULT:
      return {
        ...state,
        callResult: action.payload,
      };
    case SET_TESTNET_CALL_RESULT:
      return {
        ...state,
        testNetCallResult: action.payload,
      };
    case SET_COMPILED_RESULT:
      return {
        ...state,
        compiledResult: action.payload,
      };
    default:
      return state;
  }
};
