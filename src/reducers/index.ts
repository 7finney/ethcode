import { combineReducers } from 'redux';
import testReducer from './test';
import compiledReducer from './contracts';
import accountReducer from './account';
import debugReducer from './debug';
import txReducer from './transaction';

export default combineReducers({
  test: testReducer,
  contractsStore: compiledReducer,
  accountStore: accountReducer,
  debugStore: debugReducer,
  txStore: txReducer,
});
