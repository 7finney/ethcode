import { ICompilationResult } from './types';
import { ExtensionContext } from 'vscode';
import { ReactPanel } from './reactPanel';

export default class API {
  private _panel: ReactPanel;

  constructor(context: ExtensionContext, panel: ReactPanel) {
    console.log(context);
    console.log(panel);
    this._panel = panel;
  }

  loadCompiled(compilationRes: ICompilationResult) {
    console.log('Should load compiled results');
    console.log(compilationRes);
    this._panel.postMessage({
      compiled: JSON.stringify(compilationRes.data),
      sources: compilationRes.source.sources,
      testPanel: 'main',
    });
  }
}
