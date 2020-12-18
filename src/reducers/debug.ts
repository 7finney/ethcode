import { IDebugStore } from 'types';
import { SET_TESTNET_ID, SET_PROCESS_MSG, SET_ERR_MSG, SET_APP_REG } from '../actions/types';

interface IAction {
  type: string;
  payload: string | boolean | Error;
}

const initialState: IDebugStore = {
  testNetId: 'ganache',
  processMsg: '',
  appRegistered: false,
  error: null,
};

export default (state: IDebugStore = initialState, action: IAction) => {
  switch (action.type) {
    case SET_TESTNET_ID:
      return {
        ...state,
        testNetId: action.payload,
      };
    case SET_PROCESS_MSG:
      return {
        ...state,
        processMsg: action.payload,
      };
    case SET_ERR_MSG:
      return {
        ...state,
        error: action.payload,
      };
    case SET_APP_REG:
      return {
        ...state,
        appRegistered: action.payload,
      };
    default:
      return state;
  }
};
