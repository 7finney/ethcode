import { SET_UNSG_TX } from "../actions/types"

const initialState = {
  unsignedTx: ""
};

export default (state: any = initialState, action: any) => {
  
  switch (action.type) {
    case SET_UNSG_TX:
      return {
        ...state,
        unsignedTx: action.payload
      }
    default:
      return state;
  }
}