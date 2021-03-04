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
    vscode.commands.registerCommand('ethcode.versionSelector', async () => {
      try {
        if (ReactPanel.currentPanel) {
          ReactPanel.currentPanel
            .getCompilerVersion()
            .then((versions) => {
              // @ts-ignore
              logger.log(JSON.stringify(Object.keys(versions.releases)));
              // @ts-ignore
              vscode.window.showQuickPick(Object.keys(versions.releases)).then((selected) => {
                if (selected) {
                  // @ts-ignore
                  ReactPanel.currentPanel.setSolidityVersion(selected);
                }
              });
            })
            .catch((err: any) => {
              logger.error(err);
            });
        }
      } catch (error) {
        logger.error(error);
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('ethcode.activate', async () => {
      logger.log('Activating ethcode...');
      ReactPanel.createOrShow(context.extensionPath);
      logger.success('Welcome to Ethcode!');
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('ethcode.compile', () => {
      if (!ReactPanel.currentPanel) {
        return;
      }
      const fileName = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.fileName : undefined;
      const editorContent = vscode.window.activeTextEditor
        ? vscode.window.activeTextEditor.document.getText()
        : undefined;
      ReactPanel.currentPanel.compileContract(context, editorContent, fileName);
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
