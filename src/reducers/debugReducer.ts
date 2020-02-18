import { SET_TESTNET_ID } from "../actions/types"

const initialState = {
  testNetId: ''
};

export default (state: any = initialState, action: any) => {

  switch (action.type) {
    case SET_TESTNET_ID:
      return {
        ...state,
        testNetId: action.payload
      }
    default:
      return state;
  }
}