import { ICompilationResult } from './types';
import { ExtensionContext } from 'vscode';
import { ReactPanel } from './reactPanel';

export default class API {
  private _panel: ReactPanel;

  constructor(context: ExtensionContext, panel: ReactPanel) {
    this._panel = panel;
  }

  loadCompiled(compilationRes: ICompilationResult) {
    this._panel.postMessage({
      compiled: JSON.stringify(compilationRes.data),
      sources: compilationRes.source.sources,
      testPanel: 'main',
    });
  }
}
