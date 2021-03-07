import { window } from 'vscode';

export function successToast(msg: string) {
  window.showInformationMessage(msg, 'Dismiss');
}
export function warningToast(msg: string) {
  window.showWarningMessage(msg, 'Dismiss');
}
export function errorToast(msg: string) {
  window.showErrorMessage(msg, 'Dismiss');
}

export function actionToast(msg: string, actionName: string) {
  return window.showInformationMessage(msg, actionName, 'Dismiss');
}
