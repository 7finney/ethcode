import { CHANGE_PATH } from "./types";

export function changePath(payload: string): any {
  return { type: CHANGE_PATH, payload };
}
