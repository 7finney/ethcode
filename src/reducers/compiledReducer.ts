import {
  SET_DEPLOYED_RESULT
} from "../actions/types";

const initialState = {
  compiledresult: {}
};

export default (state: any = initialState, action: any) => {
  console.log("action");
  console.table(JSON.stringify(action));
  switch (action.type) {
    case SET_DEPLOYED_RESULT:
      return {
        ...state,
        compiledresult: action.payload
      };
    default:
      return state;
  }
}