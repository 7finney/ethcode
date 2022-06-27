/* eslint class-methods-use-this: "warn" */

import { ICompilationResult } from './types';
import { commands } from 'vscode';

export default class API {
  loadCompiled(compilationRes: ICompilationResult) {
    commands.executeCommand('ethcode.standard-json.load', compilationRes.data);
  }
}
