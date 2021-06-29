/* eslint class-methods-use-this: "warn" */

import { ICompilationResult } from './types';
import { ExtensionContext, commands } from 'vscode';
import { ReactPanel } from './reactPanel';

export default class API {
  // ctx: ExtensionContext;

  // constructor(context: ExtensionContext) {
  //   this.ctx = context;
  // }

  loadCompiled(compilationRes: ICompilationResult) {
    commands.executeCommand('ethcode.standard-json.load', compilationRes.data);
  }
}
