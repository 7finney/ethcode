import { SET_TESTNET_ID, SET_PROCESS_MSG, SET_ERR_MSG } from '../actions/types';

interface IAction {
  type: string;
  payload: string | Error;
}

interface IState {
  testNetId: string;
  processMsg: string;
  error: Error | null;
}

const initialState = {
  testNetId: 'ganache',
  processMsg: '',
  error: null,
};

export default (state: IState = initialState, action: IAction) => {
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
    default:
      return state;
  }
};
