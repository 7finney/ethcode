import * as fs from 'fs';
import * as vscode from 'vscode';
import { window, InputBoxOptions } from 'vscode';
import { logger } from '../lib';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const keythereum = require('keythereum');

// @ts-ignore
import { toChecksumAddress } from '../hash/util';
import { Account, IAccountQP, LocalAddressType } from '../types';

// list all local addresses
const listAddresses = (context: vscode.ExtensionContext, keyStorePath: string) => {
  try {
    let localAddresses: LocalAddressType[];
    const files = fs.readdirSync(`${keyStorePath}/keystore`);

    localAddresses = files.map((file) => {
      const arr = file.split('--');
      return {
        pubAddress: `0x${arr[arr.length - 1]}`,
        checksumAddress: toChecksumAddress(`0x${arr[arr.length - 1]}`),
      };
    });

    context.workspaceState.update('addresses', localAddresses);
    logger.log(JSON.stringify(localAddresses));
  } catch (err) {
    logger.error(err);
  }
}

// create keypair
const createKeyPair = (context: vscode.ExtensionContext, path: string, pswd: string) => {
  const params = { keyBytes: 32, ivBytes: 16 };
  const bareKey = keythereum.create(params);
  const options = {
    kdf: 'scrypt',
    cipher: 'aes-128-ctr',
  };
  const keyObject = keythereum.dump(Buffer.from(pswd, 'utf-8'), bareKey.privateKey, bareKey.salt, bareKey.iv, options);
  const account: Account = { pubAddr: keyObject.address, checksumAddr: toChecksumAddress(keyObject.address) };
  logger.success('Account created!');
  logger.log(JSON.stringify(account));

  if (!fs.existsSync(`${path}/keystore`)) {
    fs.mkdirSync(`${path}/keystore`);
  }
  keythereum.exportToFile(keyObject, `${path}/keystore`);
  listAddresses(context, path);
}

// delete privateKey against address
const deleteKeyPair = async (context: vscode.ExtensionContext) => {
  try {
    const pubkeyInp: InputBoxOptions = {
      ignoreFocusOut: true,
      placeHolder: 'Public key',
    };
    const publicKey = await window.showInputBox(pubkeyInp);
    if (publicKey == undefined)
      throw new Error('Please input public address');

    fs.readdir(`${context.extensionPath}/keystore`, (err, files) => {
      if (err) throw new Error(`Unable to scan directory: ${err}`);

      files.forEach((file) => {
        if (file.includes(publicKey.replace('0x', ''))) {
          fs.unlinkSync(`${context.extensionPath}/keystore/${file}`);
          listAddresses(context, context.extensionPath);
          logger.log('Account deleted!');
        }
      });
    });
  } catch (error) {
    logger.error(error);
  }
}

// extract privateKey against address
const extractPvtKey = async (keyStorePath: string, address: string) => {
  try {
    const pwdInpOpt: vscode.InputBoxOptions = {
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Password',
    };
    const password = await window.showInputBox(pwdInpOpt);

    const keyObject = keythereum.importFromFile(address, keyStorePath);
    return keythereum.recover(Buffer.from(password || '', 'utf-8'), keyObject);
  } catch (e) {
    throw new Error("Password is wrong or such address doesn't exist in wallet lists");
  }
}

const selectAccount = (context: vscode.ExtensionContext) => {
  const quickPick = window.createQuickPick<IAccountQP>();
  const addresses: Array<LocalAddressType> | undefined = context.workspaceState.get('addresses');
  const ganacheAddresses: Array<string> | undefined = context.workspaceState.get('ganache-addresses');
  let options: Array<IAccountQP> = [];

  if (addresses) {
    options = addresses.map(
      (account) =>
        <IAccountQP>{
          label: account.pubAddress,
          description: 'Local account',
          checksumAddr: account.checksumAddress,
        }
    );
  }

  if (ganacheAddresses) {
    const gOpts: Array<IAccountQP> = ganacheAddresses.map(
      (addr) => <IAccountQP>{ label: addr, description: 'Ganache account', checksumAddr: addr }
    );
    options = [...options, ...gOpts];
  }

  if (options.length === 0) return;

  quickPick.items = options.map((account) => ({
    label: account.checksumAddr,
    description: account.description,
    checksumAddr: account.checksumAddr,
  }));

  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = 'Select account';
  });

  quickPick.onDidChangeSelection((selection: Array<IAccountQP>) => {
    if (selection[0]) {
      const { checksumAddr } = selection[0];
      context.workspaceState.update('account', checksumAddr);
      quickPick.dispose();
    }
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

export {
  listAddresses,
  createKeyPair,
  deleteKeyPair,
  extractPvtKey,
  selectAccount
}