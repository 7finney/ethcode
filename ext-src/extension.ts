// @ts-ignore
import * as vscode from 'vscode';
import * as path from 'path';
import { InputBoxOptions } from 'vscode';
import { fork, ChildProcess } from 'child_process';
import API from './api';
import { ReactPanel } from './reactPanel';

import Logger from './utils/logger';

// Create logger
const logger = new Logger();
const pwdInpOpt: InputBoxOptions = {
  ignoreFocusOut: true,
  password: true,
  placeHolder: 'Password',
};

const createAccWorker = (): ChildProcess => {
  // return fork(path.join(__dirname, 'accWorker.js'), [], {
  //   execArgv: [`--inspect=${process.debugPort + 1}`],
  // });
  return fork(path.join(__dirname, 'accWorker.js'));
};
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
    }),
    vscode.commands.registerCommand('ethcode.create.account', async () => {
      logger.log('Creating ethereum keypair...');
      try {
        const password = await vscode.window.showInputBox(pwdInpOpt);
        const accWorker = createAccWorker();
        accWorker.on('message', (m: any) => {
          if (m.account) {
            logger.success('Account created!');
            logger.success(JSON.stringify(m.account));
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({ command: 'create-account', pswd: password, ksPath: context.extensionPath });
      } catch (error) {
        logger.error(error);
      }
    })
  );
  await ReactPanel.createOrShow(context.extensionPath);
  let api;
  if (ReactPanel.currentPanel) api = new API(context, ReactPanel.currentPanel);
  return api;
}
