var keythereum = require('keythereum');
import * as fs from "fs";
// @ts-ignore
import { toChecksumAddress } from './hash/util';

interface Account {
  pubAddr: string;
  checksumAddr: string;
}

// create keypair
function createKeyPair(path: string, pswd: string) {
  const params = { keyBytes: 32, ivBytes: 16 };
  const bareKey = keythereum.create(params);
  let options = {
    kdf: "scrypt",
    cipher: "aes-128-ctr"
  };
  var keyObject = keythereum.dump(pswd, bareKey.privateKey, bareKey.salt, bareKey.iv, options);
  const account: Account = { pubAddr: keyObject.address, checksumAddr: toChecksumAddress(keyObject.address) };
  // @ts-ignore
  process.send({ account });
  if (!fs.existsSync(`${path}/keystore`)) {
    fs.mkdirSync(`${path}/keystore`);
  }
  keythereum.exportToFile(keyObject, `${path}/keystore`);
  listAddresses(path);
}

// delete privateKey against address
function deleteKeyPair(keyStorePath: string, address: string) {
  let fd: any;
  try {
    fd = fs.readdir(keyStorePath + "/keystore", (err, files) => {
      if (err) {
        // @ts-ignore
        process.send({ error: 'Unable to scan directory: ' + err });
      }
      files.forEach((file) => {
        if (file.includes(address.replace('0x', ''))) {
          fs.unlinkSync(`${keyStorePath}/keystore/${file}`);
          listAddresses(keyStorePath);
          // @ts-ignore
          process.send({ resp: "Account deleted successfully" })
          return ;
        }
      });
    });
  } catch (error) {
    // @ts-ignore
    process.send({ error: error })
  }
}

// extract privateKey against address
function extractPvtKey(keyStorePath: string, address: string, pswd: string) {
  const keyObject = keythereum.importFromFile(address, keyStorePath);
  const privateKey = keythereum.recover(pswd, keyObject);
  // @ts-ignore
  process.send({ privateKey: privateKey.toString('hex') });
}

// list all local addresses
function listAddresses(keyStorePath: string) {
  let localAddresses: object;
  fs.readdir(keyStorePath + "/keystore", (err, files) => {
    if (err) {
      // @ts-ignore
      process.send({ error: 'Unable to scan directory: ' + err });
    }
    if(files) {
      localAddresses = files.map(file => {
        let arr = file.split('--')
        return { pubAddress: ('0x' + arr[arr.length - 1]), checksumAddress: toChecksumAddress(('0x' + arr[arr.length - 1])) };
      });
    }
    // @ts-ignore
    process.send({ localAddresses: localAddresses });
  });
}

// worker communication
// @ts-ignore
process.on('message', (m) => {
  if (m.command == 'create-account') {
    createKeyPair(m.ksPath, m.pswd);
  }
  if (m.command == 'extract-privateKey') {
    extractPvtKey(m.keyStorePath, m.address, m.pswd);
  }
  if (m.command == 'delete-keyPair') {
    deleteKeyPair(m.keyStorePath, m.address);
  }
  if (m.command == 'get-localAccounts') {
    listAddresses(m.keyStorePath);
  }
});