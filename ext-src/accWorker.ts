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
  fs.writeFile(`${path}/keystore/${keyObject.address}.json`, JSON.stringify(keyObject), function (err) {
    if (err) throw err;
    console.log('Saved!');
  });
}

// delete privateKey against address
function deleteKeyPair(keyStorePath: string, address: string) {
  fs.unlinkSync(`${keyStorePath}/keystore/${address}.json`);
}

// extract privateKey against address
function extractPvtKey(keyStorePath: string, address: string, pswd: string) {
  const keyObject = keythereum.importFromFile(address, keyStorePath);
  const privateKey = keythereum.recover(pswd, keyObject);
  // @ts-ignore
  process.send({ privateKey: privateKey.toString('hex') });
}

// worker communication
// @ts-ignore
process.on('message', (m) => {
  if (m.command == 'create-account') {
    createKeyPair(m.path, m.pswd);
  }
  if (m.command == 'extract-privateKey') {
    extractPvtKey(m.keyStorePath, m.address, m.pswd);
  }
  if (m.command == 'delete-keyPair') {
    deleteKeyPair(m.keyStorePath, m.address);
  }
});