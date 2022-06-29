/* eslint class-methods-use-this: "warn" */

import { ICompilationResult } from './types';
import { commands } from 'vscode';

export default class API {
  // ctx: ExtensionContext;

  // constructor(context: ExtensionContext) {
  //   this.ctx = context;
  // }

  loadCompiled(compilationRes: ICompilationResult) {
    commands.executeCommand('ethcode.standard-json.load', compilationRes.data);
  }
}
