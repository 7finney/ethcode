import { CompilationResult, TransactionResult } from 'types/solidityTypes';
import {
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT,
  SET_TESTNET_CALL_RESULT,
  SET_COMPILED_RESULT,
} from '../actions/types';

interface IState {
  compiledresult: Array<CompilationResult>;
  callResult: { [key: string]: string };
  testNetCallResult: { [key: string]: string };
  deployedResult: TransactionResult | null;
}
const initialState: IState = {
  compiledresult: [],
  callResult: {},
  testNetCallResult: {},
  deployedResult: null,
};

export default (state: any = initialState, action: any): IState => {
  switch (action.type) {
    case SET_DEPLOYED_RESULT:
      return {
        ...state,
        deployedResult: action.payload,
      };
    case CLEAR_DEPLOYED_RESULT:
      return {
        ...state,
        compiledresult: {},
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
        compiledResult: JSON.parse(action.payload),
      };
    default:
      return state;
  }
};
