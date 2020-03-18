var keythereum = require('keythereum');
import * as fs from "fs";

// create keypair
function createKeyPair(path: string, pswd: string) {
  const params = { keyBytes: 32, ivBytes: 16 };
  const bareKey = keythereum.create(params);
  let options = {
    kdf: "scrypt",
    cipher: "aes-128-ctr"
  };
  var keyObject = keythereum.dump(pswd, bareKey.privateKey, bareKey.salt, bareKey.iv, options);
  // @ts-ignore
  process.send({ pubAddress: keyObject.address });
  if (!fs.existsSync(`${path}/keystore`)) {
    fs.mkdirSync(`${path}/keystore`);
  }
  var file = keythereum.exportToFile(keyObject, `${path}/keystore`);
  listAddresses(path);
  // fs.writeFileSync(`${path}/keystore/0x${keyObject.address}.json`, JSON.stringify(keyObject));
}

// delete privateKey against address
function deleteKeyPair(keyStorePath: string, address: string) {
  var fd: any;
  try {
    fd = fs.readdir(keyStorePath + "/keystore", (err, files) => {
      if (err) {
        // @ts-ignore
        process.send({ error: 'Unable to scan directory: ' + err });
      }
      files.forEach((file) => {
        if (file.includes(address)) {
          fs.unlinkSync(`${keyStorePath}/keystore/${file}`);
          listAddresses(keyStorePath);
          return ;
        }
      });
    });
    // @ts-ignore
    process.send({ resp: "Account deleted successfully" })
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
  var localAddresses: string[] = [];
  // @ts-ignore
  process.send({ call: "kartik calling kartik" });
  fs.readdir(keyStorePath + "/keystore", (err, files) => {
    if (err) {
      // @ts-ignore
      process.send({ error: 'Unable to scan directory: ' + err });
    }
    if(files) {
      localAddresses = files.map(file => {
        var arr = file.split('--')
        return ('0x' + arr[arr.length - 1]);
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