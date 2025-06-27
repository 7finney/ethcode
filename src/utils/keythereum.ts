/**
 * Create, import, and export ethereum keys.
 * @author Jack Peterson (jack@tinybike.net)
 */

import * as cryptoModule from "crypto";
import * as scryptModule from "ethereum-cryptography/scrypt";
import * as ecpbkdf2 from "ethereum-cryptography/pbkdf2";
import { keccak256 as _keccak256 } from "ethereum-cryptography/keccak";
import * as random from "ethereum-cryptography/random";
import * as secp256k1 from "ethereum-cryptography/secp256k1-compat";
import * as uuid from "uuid";

declare const process: any;
var isBrowser = typeof process === "undefined" || !process.nextTick || Boolean((process as any).browser);

function isFunction(f: any): boolean {
  return typeof f === "function";
}

function keccak256(buffer: Buffer | Uint8Array): Buffer {
  return Buffer.from(_keccak256(buffer));
}

export const version = "1.2.0";

export const browser = isBrowser;

export const crypto = {
    pbkdf2: function (password: any, salt: any, iters: number, dklen: number, prf: string, cb: (result: Buffer) => void) {
      setTimeout(function () {
        ecpbkdf2.pbkdf2(password, salt, iters, dklen, prf).then(function (res: Uint8Array) {
          cb(Buffer.from(res));
        });
      }, 0);
    },

    pbkdf2Sync: function (password: any, salt: any, iters: number, dklen: number, prf: string): Buffer {
      return Buffer.from(ecpbkdf2.pbkdf2Sync(password, salt, iters, dklen, prf));
    },

    randomBytes: function (bytes: number): Buffer {
      return Buffer.from(random.getRandomBytesSync(bytes));
    }
};

export const constants = {

    // Symmetric cipher for private key encryption
    cipher: "aes-128-ctr",

    // Initialization vector size in bytes
    ivBytes: 16,

    // ECDSA private key size in bytes
    keyBytes: 32,

    // Key derivation function parameters
    pbkdf2: {
      c: 262144,
      dklen: 32,
      hash: "sha256",
      prf: "hmac-sha256"
    },
    scrypt: {
      memory: 280000000,
      dklen: 32,
      n: 262144,
      r: 8,
      p: 1
    }
};

/**
 * Check whether a string is valid hex.
 * @param {string} str String to validate.
 * @return {boolean} True if the string is valid hex, false otherwise.
 */
export function isHex(str: string): boolean {
  if (str.length % 2 === 0 && str.match(/^[0-9a-f]+$/i)) return true;
  return false;
}

/**
 * Check whether a string is valid base-64.
 * @param {string} str String to validate.
 * @return {boolean} True if the string is valid base-64, false otherwise.
 */
export function isBase64(str: string): boolean {
  var index: number;
  if (str.length % 4 > 0 || str.match(/[^0-9a-z+\/=]/i)) return false;
  index = str.indexOf("=");
  if (index === -1 || str.slice(index).match(/={1,2}/)) return true;
  return false;
}

/**
 * Convert a string to a Buffer.  If encoding is not specified, hex-encoding
 * will be used if the input is valid hex.  If the input is valid base64 but
 * not valid hex, base64 will be used.  Otherwise, utf8 will be used.
 * @param {string} str String to be converted.
 * @param {string=} enc Encoding of the input string (optional).
 * @return {Buffer} Buffer (bytearray) containing the input data.
 */
export function str2buf(str: any, enc?: string): Buffer | any {
  if (!str || str.constructor !== String) return str;
  if (!enc && isHex(str.toString())) enc = "hex";
  if (!enc && isBase64(str.toString())) enc = "base64";
  return Buffer.from(str, enc as BufferEncoding);
}

/**
 * Check if the selected cipher is available.
 * @param {string} cipher Encryption algorithm.
 * @return {boolean} If available true, otherwise false.
 */
export function isCipherAvailable(cipher: string): boolean {
  return cryptoModule.getCiphers().some(function (name: string) { return name === cipher; });
}

/**
 * Symmetric private key encryption using secret (derived) key.
 * @param {Buffer|string} plaintext Data to be encrypted.
 * @param {Buffer|string} key Secret key.
 * @param {Buffer|string} iv Initialization vector.
 * @param {string=} algo Encryption algorithm (default: constants.cipher).
 * @return {Buffer} Encrypted data.
 */
export function encrypt(plaintext: any, key: any, iv: any, algo?: string): Buffer {
  var cipher: cryptoModule.Cipher, ciphertext: Buffer;
  const algorithm = algo || constants.cipher;
  if (!isCipherAvailable(algorithm)) throw new Error(algorithm + " is not available");
  cipher = cryptoModule.createCipheriv(algorithm, str2buf(key), str2buf(iv));
  ciphertext = cipher.update(str2buf(plaintext));
  return Buffer.concat([ciphertext, cipher.final()]);
}

/**
 * Symmetric private key decryption using secret (derived) key.
 * @param {Buffer|string} ciphertext Data to be decrypted.
 * @param {Buffer|string} key Secret key.
 * @param {Buffer|string} iv Initialization vector.
 * @param {string=} algo Encryption algorithm (default: constants.cipher).
 * @return {Buffer} Decrypted data.
 */
export function decrypt(ciphertext: any, key: any, iv: any, algo?: string): Buffer {
  var decipher: cryptoModule.Decipher, plaintext: Buffer;
  const algorithm = algo || constants.cipher;
  if (!isCipherAvailable(algorithm)) throw new Error(algorithm + " is not available");
  decipher = cryptoModule.createDecipheriv(algorithm, str2buf(key), str2buf(iv));
  plaintext = decipher.update(str2buf(ciphertext));
  return Buffer.concat([plaintext, decipher.final()]);
}

/**
 * Derive Ethereum address from private key.
 * @param {Buffer|string} privateKey ECDSA private key.
 * @return {string} Hex-encoded Ethereum address.
 */
export function privateKeyToAddress(privateKey: any): string {
  var privateKeyBuffer: Buffer, publicKey: Buffer;
  privateKeyBuffer = str2buf(privateKey);
  if (privateKeyBuffer.length < 32) {
    privateKeyBuffer = Buffer.concat([
      Buffer.alloc(32 - privateKeyBuffer.length, 0),
      privateKeyBuffer
    ]);
  }
  publicKey = Buffer.from(
    secp256k1.publicKeyCreate(privateKeyBuffer, false).slice(1)
  );
  return "0x" + keccak256(publicKey).slice(-20).toString("hex");
}

/**
 * Calculate message authentication code from secret (derived) key and
 * encrypted text.  The MAC is the keccak-256 hash of the byte array
 * formed by concatenating the second 16 bytes of the derived key with
 * the ciphertext key's contents.
 * @param {Buffer|string} derivedKey Secret key derived from password.
 * @param {Buffer|string} ciphertext Text encrypted with secret key.
 * @return {string} Hex-encoded MAC.
 */
export function getMAC(derivedKey: any, ciphertext: any): string | undefined {
  if (derivedKey !== undefined && derivedKey !== null && ciphertext !== undefined && ciphertext !== null) {
    return keccak256(Buffer.concat([
      str2buf(derivedKey).slice(16, 32),
      str2buf(ciphertext)
    ])).toString("hex");
  }
}

/**
 * Used internally.
 */
export function deriveKeyUsingScrypt(password: any, salt: any, options: any, cb: any) {
  var n = options.kdfparams.n || constants.scrypt.n;
  var r = options.kdfparams.r || constants.scrypt.r;
  var p = options.kdfparams.p || constants.scrypt.p;
  var dklen = options.kdfparams.dklen || constants.scrypt.dklen;
  if (isFunction(cb)) {
    scryptModule
      .scrypt(password, salt, n, p, r, dklen)
      .then(function (key: Uint8Array) {
        cb(Buffer.from(key));
      })
      .catch(cb);
  } else {
    return Buffer.from(scryptModule.scryptSync(password, salt, n, p, r, dklen));
  }
}

/**
 * Derive secret key from password with key dervation function.
 * @param {string|Buffer} password User-supplied password.
 * @param {string|Buffer} salt Randomly generated salt.
 * @param {Object=} options Encryption parameters.
 * @param {string=} options.kdf Key derivation function (default: pbkdf2).
 * @param {string=} options.cipher Symmetric cipher (default: constants.cipher).
 * @param {Object=} options.kdfparams KDF parameters (default: constants.<kdf>).
 * @param {function=} cb Callback function (optional).
 * @return {Buffer} Secret key derived from password.
 */
export function deriveKey(password: any, salt: any, options: any, cb: any) {
  var prf: string, iters: number, dklen: number;
  if (typeof password === "undefined" || password === null || !salt) {
    throw new Error("Must provide password and salt to derive a key");
  }
  options = options || {};
  options.kdfparams = options.kdfparams || {};

  // convert strings to buffers
  password = str2buf(password, "utf8");
  salt = str2buf(salt);

  // use scrypt as key derivation function
  if (options.kdf === "scrypt") {
    return deriveKeyUsingScrypt(password, salt, options, cb);
  }

  // use default key derivation function (PBKDF2)
  prf = options.kdfparams.prf || constants.pbkdf2.prf;
  if (prf === "hmac-sha256") prf = "sha256";
  iters = options.kdfparams.c || constants.pbkdf2.c;
  dklen = options.kdfparams.dklen || constants.pbkdf2.dklen;
  if (!isFunction(cb)) {
    return Buffer.from(ecpbkdf2.pbkdf2Sync(password, salt, iters, dklen, prf));
  }
  setTimeout(function () {
    ecpbkdf2.pbkdf2(password, salt, iters, dklen, prf).then(function (res: Uint8Array) {
      cb(Buffer.from(res));
    });
  }, 0);
}

/**
 * Generate random numbers for private key, initialization vector,
 * and salt (for key derivation).
 * @param {Object=} params Encryption options (defaults: constants).
 * @param {string=} params.keyBytes Private key size in bytes.
 * @param {string=} params.ivBytes Initialization vector size in bytes.
 * @param {function=} cb Callback function (optional).
 * @return {Object<string,Buffer>} Private key, IV and salt.
 */
export function create(params: any, cb: any): any {
  var keyBytes: number, ivBytes: number;
  params = params || {};
  keyBytes = params.keyBytes || constants.keyBytes;
  ivBytes = params.ivBytes || constants.ivBytes;

  function checkBoundsAndCreateObject(randomBytes: any): any {
    var privateKey: Buffer;
    randomBytes = Buffer.from(randomBytes);
    privateKey = randomBytes.slice(0, keyBytes);
    if (!secp256k1.privateKeyVerify(privateKey)) return create(params, cb);
    return {
      privateKey: privateKey,
      iv: randomBytes.slice(keyBytes, keyBytes + ivBytes),
      salt: randomBytes.slice(keyBytes + ivBytes)
    };
  }

  // synchronous key generation if callback not provided
  if (!isFunction(cb)) {
    return checkBoundsAndCreateObject(random.getRandomBytesSync(keyBytes + ivBytes + keyBytes));
  }

  // asynchronous key generation
  random.getRandomBytes(keyBytes + ivBytes + keyBytes).then(function (randomBytes: Uint8Array) {
    cb(checkBoundsAndCreateObject(randomBytes));
  }, function (err: any) {
    cb(err);
  });
}

/**
 * Assemble key data object in secret-storage format.
 * @param {Buffer} derivedKey Password-derived secret key.
 * @param {Buffer} privateKey Private key.
 * @param {Buffer} salt Randomly generated salt.
 * @param {Buffer} iv Initialization vector.
 * @param {Object=} options Encryption parameters.
 * @param {string=} options.kdf Key derivation function (default: pbkdf2).
 * @param {string=} options.cipher Symmetric cipher (default: constants.cipher).
 * @param {Object=} options.kdfparams KDF parameters (default: constants.<kdf>).
 * @return {Object}
 */
export function marshal(derivedKey: any, privateKey: any, salt: any, iv: any, options: any) {
  var ciphertext: string, keyObject: any, algo: string;
  options = options || {};
  options.kdfparams = options.kdfparams || {};
  algo = options.cipher || constants.cipher;

  // encrypt using first 16 bytes of derived key
  ciphertext = encrypt(privateKey, derivedKey.slice(0, 16), iv, algo).toString("hex");

  keyObject = {
    address: privateKeyToAddress(privateKey).slice(2),
    crypto: {
      cipher: options.cipher || constants.cipher,
      ciphertext: ciphertext,
      cipherparams: { iv: iv.toString("hex") },
      mac: getMAC(derivedKey, ciphertext)
    },
    id: uuid.v4(), // random 128-bit UUID
    version: 3
  };

  if (options.kdf === "scrypt") {
    keyObject.crypto.kdf = "scrypt";
    keyObject.crypto.kdfparams = {
      dklen: options.kdfparams.dklen || constants.scrypt.dklen,
      n: options.kdfparams.n || constants.scrypt.n,
      r: options.kdfparams.r || constants.scrypt.r,
      p: options.kdfparams.p || constants.scrypt.p,
      salt: salt.toString("hex")
    };

  } else {
    keyObject.crypto.kdf = "pbkdf2";
    keyObject.crypto.kdfparams = {
      c: options.kdfparams.c || constants.pbkdf2.c,
      dklen: options.kdfparams.dklen || constants.pbkdf2.dklen,
      prf: options.kdfparams.prf || constants.pbkdf2.prf,
      salt: salt.toString("hex")
    };
  }

  return keyObject;
}

/**
 * Export private key to keystore secret-storage format.
 * @param {string|Buffer} password User-supplied password.
 * @param {string|Buffer} privateKey Private key.
 * @param {string|Buffer} salt Randomly generated salt.
 * @param {string|Buffer} iv Initialization vector.
 * @param {Object=} options Encryption parameters.
 * @param {string=} options.kdf Key derivation function (default: pbkdf2).
 * @param {string=} options.cipher Symmetric cipher (default: constants.cipher).
 * @param {Object=} options.kdfparams KDF parameters (default: constants.<kdf>).
 * @param {function=} cb Callback function (optional).
 * @return {Object}
 */
export function dump(password: any, privateKey: any, salt: any, iv: any, options: any, cb?: any) {
  options = options || {};
  iv = str2buf(iv);
  privateKey = str2buf(privateKey);

  // synchronous if no callback provided
  if (!isFunction(cb)) {
    return marshal(deriveKey(password, salt, options, undefined), privateKey, salt, iv, options);
  }

  // asynchronous if callback provided
  deriveKey(password, salt, options, function (derivedKey: any) {
    cb(marshal(derivedKey, privateKey, salt, iv, options));
  });
}

/**
 * Recover plaintext private key from secret-storage key object.
 * @param {string|Buffer} password User-supplied password.
 * @param {Object} keyObject Keystore object.
 * @param {function=} cb Callback function (optional).
 * @return {Buffer} Plaintext private key.
 */
export function recover(password: any, keyObject: any, cb?: any) {
  var keyObjectCrypto: any, iv: any, salt: any, ciphertext: any, algo: any;
  keyObjectCrypto = keyObject.Crypto || keyObject.crypto;

  // verify that message authentication codes match, then decrypt
  function verifyAndDecrypt(derivedKey: any, salt: any, iv: any, ciphertext: any, algo: any) {
    var key: any;
    if (getMAC(derivedKey, ciphertext) !== keyObjectCrypto.mac) {
      throw new Error("message authentication code mismatch");
    }
    if (keyObject.version === "1") {
      key = keccak256(derivedKey.slice(0, 16)).slice(0, 16);
    } else {
      key = derivedKey.slice(0, 16);
    }
    return decrypt(ciphertext, key, iv, algo);
  }

  iv = str2buf(keyObjectCrypto.cipherparams.iv);
  salt = str2buf(keyObjectCrypto.kdfparams.salt);
  ciphertext = str2buf(keyObjectCrypto.ciphertext);
  algo = keyObjectCrypto.cipher;

  if (keyObjectCrypto.kdf === "pbkdf2" && keyObjectCrypto.kdfparams.prf !== "hmac-sha256") {
    throw new Error("PBKDF2 only supported with HMAC-SHA256");
  }

  // derive secret key from password
  if (!isFunction(cb)) {
    return verifyAndDecrypt(deriveKey(password, salt, keyObjectCrypto, undefined), salt, iv, ciphertext, algo);
  }
  deriveKey(password, salt, keyObjectCrypto, function (derivedKey: any) {
    try {
      cb(verifyAndDecrypt(derivedKey, salt, iv, ciphertext, algo));
    } catch (exc) {
      cb(exc);
    }
  });
}

/**
 * Generate filename for a keystore file.
 * @param {string} address Ethereum address.
 * @return {string} Keystore filename.
 */
export function generateKeystoreFilename(address: string): string {
  var filename = "UTC--" + new Date().toISOString() + "--" + address;

  // Windows does not permit ":" in filenames, replace all with "-"
  if (process.platform === "win32") filename = filename.split(":").join("-");

  return filename;
}

/**
 * Export formatted JSON to keystore file.
 * @param {Object} keyObject Keystore object.
 * @param {string=} keystore Path to keystore folder (default: "keystore").
 * @param {function=} cb Callback function (optional).
 * @return {string} JSON filename (Node.js) or JSON string (browser).
 */
export function exportToFile(keyObject: any, keystore?: string, cb?: any): string | undefined {
  var outfile: string, outpath: string, json: string, fs: any;
  keystore = keystore || "keystore";
  outfile = generateKeystoreFilename(keyObject.address);
  json = JSON.stringify(keyObject);
  if (browser) {
    if (!isFunction(cb)) return json;
    return cb(json);
  }
  outpath = require("path").join(keystore, outfile);
  fs = require("fs");
  if (!isFunction(cb)) {
    fs.writeFileSync(outpath, json);
    return outpath;
  }
  fs.writeFile(outpath, json, function (err: any) {
    if (err) return cb(err);
    cb(outpath);
  });
}

/**
 * Import key data object from keystore JSON file.
 * (Note: Node.js only!)
 * @param {string} address Ethereum address to import.
 * @param {string=} datadir Ethereum data directory (default: ~/.ethereum).
 * @param {function=} cb Callback function (optional).
 * @return {Object} Keystore data file's contents.
 */
export function importFromFile(address: string, datadir?: string, cb?: any): any {
  var keystore: string, filepath: string | null, path: any, fs: any;
  if (browser) throw new Error("method only available in Node.js");
  path = require("path");
  fs = require("fs");
  address = address.replace("0x", "");
  address = address.toLowerCase();

  function findKeyfile(keystore: string, address: string, files: string[]): string | null {
    var i: number, len: number, filepath: string | null = null;
    for (i = 0, len = files.length; i < len; ++i) {
      if (files[i].indexOf(address) > -1) {
        filepath = path.join(keystore, files[i]);
        if (fs.lstatSync(filepath).isDirectory()) {
          filepath = path.join(filepath, files[i]);
        }
        break;
      }
    }
    return filepath;
  }

  datadir = datadir || path.join(process.env.HOME, ".ethereum");
  keystore = path.join(datadir, "keystore");
  if (!isFunction(cb)) {
    filepath = findKeyfile(keystore, address, fs.readdirSync(keystore));
    if (!filepath) {
      throw new Error("could not find key file for address " + address);
    }
    return JSON.parse(fs.readFileSync(filepath));
  }
  fs.readdir(keystore, function (ex: any, files: string[]) {
    var filepath: string | null;
    if (ex) return cb(ex);
    filepath = findKeyfile(keystore, address, files);
    if (!filepath) {
      return cb(new Error("could not find key file for address " + address));
    }
    return cb(JSON.parse(fs.readFileSync(filepath)));
  });
}

// Default export with all functions for backward compatibility
const keythereum = {
  version,
  browser,
  crypto,
  constants,
  isHex,
  isBase64,
  str2buf,
  isCipherAvailable,
  encrypt,
  decrypt,
  privateKeyToAddress,
  getMAC,
  deriveKeyUsingScrypt,
  deriveKey,
  create,
  marshal,
  dump,
  recover,
  generateKeystoreFilename,
  exportToFile,
  importFromFile
};

export default keythereum;