// @ts-ignore
import * as vscode from 'vscode';
import API from './api';
import { ReactPanel } from './reactPanel';

import Logger from './utils/logger';

// Create logger
const logger = new Logger();

// eslint-disable-next-line import/prefer-default-export
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('ethcode.activate', async () => {
      logger.log('Activating ethcode...');
      ReactPanel.createOrShow(context.extensionPath);
      logger.success('Welcome to Ethcode!');
    }),
    vscode.commands.registerCommand('ethcode.runTest', () => {
      if (!ReactPanel.currentPanel) {
        return;
      }
      const fileName = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : undefined;
      const editorContent = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.getText()
        : undefined;
      ReactPanel.currentPanel.sendTestContract(editorContent, fileName);
    })
  );
  await ReactPanel.createOrShow(context.extensionPath);
  let api;
  if (ReactPanel.currentPanel) api = new API(context, ReactPanel.currentPanel);
  return api;
}
