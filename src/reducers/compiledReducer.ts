import {
  SET_DEPLOYED_RESULT,
  CLEAR_DEPLOYED_RESULT
} from "../actions/types";

const initialState = {
  compiledresult: {}
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
        compiledresult: {}
      }
    default:
      return state;
  }
}