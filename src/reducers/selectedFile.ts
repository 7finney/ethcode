import { CHANGE_PATH } from "../actions/types";

export default function selectedFile(state: string = "", action: any) {
  switch (action.type) {
    case CHANGE_PATH:
      return (state = action.payload);
    default:
      return state;
  }
}
