import { ITxStore } from 'types';
import { SET_GAS_ESTM, SET_UNSG_TX } from '../actions/types';

const initialState: ITxStore = {
  unsignedTx: '',
  gasEstimate: 0,
};

interface IAction {
  type: string;
  payload: number | string;
}

export default (state: ITxStore = initialState, action: IAction) => {
  switch (action.type) {
    case SET_UNSG_TX:
      return {
        ...state,
        unsignedTx: action.payload,
      };
    case SET_GAS_ESTM:
      return {
        ...state,
        gasEstimate: action.payload,
      };
    default:
      return state;
  }
};
