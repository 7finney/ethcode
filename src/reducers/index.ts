import { combineReducers } from "redux";
import  testReducer from "./testReducer";
import compiledReducer from "./compiledReducer";

export default combineReducers({
  test: testReducer,
  compiledStore: compiledReducer,
});
