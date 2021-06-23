// @ts-ignore
import * as vscode from 'vscode';
import * as path from 'path';
import { InputBoxOptions } from 'vscode';
import { fork, ChildProcess } from 'child_process';
import API from './api';
import { ReactPanel } from './reactPanel';

import Logger from './utils/logger';
import { INetworkQP } from './types';

// Create logger
const logger = new Logger();
const pwdInpOpt: InputBoxOptions = {
  ignoreFocusOut: true,
  password: true,
  placeHolder: 'Password',
};
const pubkeyInp: InputBoxOptions = {
  ignoreFocusOut: true,
  placeHolder: 'Public key',
};
const unsignedTxInp: InputBoxOptions = {
  ignoreFocusOut: false,
  placeHolder: 'Unsigned transaction JSON',
};
const testNetInp: InputBoxOptions = {
  ignoreFocusOut: false,
  placeHolder: 'Test Network ID',
};

const createAccWorker = (): ChildProcess => {
  // return fork(path.join(__dirname, 'accWorker.js'), [], {
  //   execArgv: [`--inspect=${process.debugPort + 1}`],
  // });
  return fork(path.join(__dirname, 'accWorker.js'));
};
const createWorker = (): ChildProcess => {
  // return fork(path.join(__dirname, 'accWorker.js'), [], {
  //   execArgv: [`--inspect=${process.debugPort + 1}`],
  // });
  return fork(path.join(__dirname, 'worker.js'));
};
// eslint-disable-next-line import/prefer-default-export
export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('ethcode.activate', async () => {
      ReactPanel.createOrShow(context.extensionPath);
      logger.success('Welcome to Ethcode!');
    }),
    // Create new account with password
    vscode.commands.registerCommand('ethcode.account.create', async () => {
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
    }),
    // Delete selected account with password
    vscode.commands.registerCommand('ethcode.account.delete', async () => {
      try {
        const publicKey = await vscode.window.showInputBox(pubkeyInp);
        const accWorker = createAccWorker();
        accWorker.on('message', (m: any) => {
          if (m.resp) {
            logger.success('Account deleted!');
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({ command: 'delete-keyPair', address: publicKey, keyStorePath: context.extensionPath });
      } catch (error) {
        logger.error(error);
      }
    }),
    // Sign & deploy a transaction
    vscode.commands.registerCommand('ethcode.account.sign-deploy', async () => {
      try {
        const testNetId = context.workspaceState.get('networkId');
        const unsignedTx = await vscode.window.showInputBox(unsignedTxInp);
        const publicKey = await vscode.window.showInputBox(pubkeyInp);
        const password = await vscode.window.showInputBox(pwdInpOpt);
        const accWorker = createAccWorker();
        const signedDeployWorker = createWorker();
        accWorker.on('message', (m: any) => {
          if (m.privateKey) {
            const { privateKey } = m;
            signedDeployWorker.on('message', (m: any) => {
              logger.log(`SignDeploy worker message: ${JSON.stringify(m)}`);
              if (m.error) {
                logger.error(m.error);
              } else if (m.transactionResult) {
                logger.success('Contract transaction submitted!');
              }
            });
            signedDeployWorker.send({
              command: 'sign-deploy',
              payload: {
                unsignedTx,
                pvtKey: privateKey,
              },
              testnetId: testNetId,
            });
          } else if (m.error) {
            logger.error(m.error);
          }
        });
        accWorker.send({
          command: 'extract-privateKey',
          address: publicKey,
          keyStorePath: context.extensionPath,
          password,
        });
      } catch (error) {
        logger.error(error);
      }
    }),
    // Set Network
    vscode.commands.registerCommand('ethcode.network.set', () => {
      const quickPick = vscode.window.createQuickPick<INetworkQP>();
      const options: Array<INetworkQP> = [
        { label: 'Main', networkId: 1 },
        { label: 'Ropsten', networkId: 3 },
        { label: 'Rinkeby', networkId: 4 },
        { label: 'Goerli', networkId: 5 },
      ];
      quickPick.items = options.map((network) => ({ label: network.label, networkId: network.networkId }));
      quickPick.placeholder = 'Select network';
      quickPick.onDidChangeActive((selection: Array<INetworkQP>) => {
        quickPick.value = selection[0].label;
      });
      quickPick.onDidChangeSelection((selection: Array<INetworkQP>) => {
        if (selection[0]) {
          const { networkId } = selection[0];
          context.workspaceState.update('networkId', networkId);
          quickPick.dispose();
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    }),
    // Set Account
    vscode.commands.registerCommand('ethcode.account.set', () => {})
  );
  await ReactPanel.createOrShow(context.extensionPath);
  let api;
  if (ReactPanel.currentPanel) api = new API(context, ReactPanel.currentPanel);
  return api;
}
