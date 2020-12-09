import { IAccount, IAccStore } from 'types';
import { SET_ACC_DATA, SET_UPDATE_BALANCE, APPND_NEW_ACC, SET_PVT_KEY } from '../actions/types';

const initialState: IAccStore = {
  balance: 0,
  accounts: [],
  currAccount: null,
  privateKey: null,
};

interface IAction {
  type: string;
  payload: IAccStore;
}

export default (state: IAccStore = initialState, action: IAction): IAccStore => {
  switch (action.type) {
    case SET_ACC_DATA:
      return {
        ...state,
        balance: action.payload.balance,
        accounts: action.payload.accounts,
        currAccount: action.payload.currAccount,
      };
    case SET_UPDATE_BALANCE:
      return {
        ...state,
        balance: +action.payload.balance,
        currAccount: action.payload.currAccount,
      };
    case APPND_NEW_ACC:
      return {
        ...state,
        accounts: [...state.accounts, ...action.payload.accounts],
      };
    case SET_PVT_KEY:
      return {
        ...state,
        privateKey: action.payload.privateKey,
      };
    default:
      return state;
  }
};
