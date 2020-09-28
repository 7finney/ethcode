import { SET_ACC_BALANCE, SET_UPDATE_BALANCE, APPND_NEW_ACC } from "../actions/types";

const initialState = {
  accountBalance: 0,
  accounts: [],
  currAccount: {}
};

export default (state: any = initialState, action: any) => {
  
  switch (action.type) {
    case SET_ACC_BALANCE:
      return {
        ...state,
        accountBalance: action.payload.balance,
        accounts: action.payload.accounts,
        currAccount: action.payload.currAccount
      }
    case SET_UPDATE_BALANCE:
      return {
        ...state,
        accountBalance: +action.payload.balance,
        currAccount: action.payload.currAccount
      }
    case APPND_NEW_ACC:
      return {
        ...state,
        accounts: [...state.accounts, action.payload.account]
      }
    default:
      return state;
  }
}