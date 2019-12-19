import {
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT,
  SET_CALL_RESULT
} from "../actions/types";

const initialState = {
  compiledresult: {},
  callResult: {}
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
    default:
      return state;
  }
}