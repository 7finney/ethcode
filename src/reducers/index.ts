import { combineReducers } from "redux";
import  testReducer from "./testReducer";
import compiledReducer from "./compiledReducer";
import accountReducer from "./accountReducer"

export default combineReducers({
  test: testReducer,
  compiledStore: compiledReducer,
  accountStore: accountReducer
});
