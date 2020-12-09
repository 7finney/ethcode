import { ITxStore } from 'types';
import { SET_UNSG_TX } from '../actions/types';

const initialState: ITxStore = {
  unsignedTx: '',
};

export default (state: ITxStore = initialState, action: any) => {
  switch (action.type) {
    case SET_UNSG_TX:
      return {
        ...state,
        unsignedTx: action.payload,
      };
    default:
      return state;
  }
};
