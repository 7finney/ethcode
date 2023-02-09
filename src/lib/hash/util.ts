import * as _ from "underscore";
import * as randomBytes from "randombytes";
import { sha3, isHexStrict } from "./sha3";

function toChecksumAddress(address: any) {
  if (typeof address === undefined) return "";

  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    throw new Error(
      'Given address "' + address + '" is not a valid Ethereum address.'
    );
  }

  address = address.toLowerCase().replace(/^0x/i, "");
  var addressHash = sha3(address).replace(/^0x/i, "");
  var checksumAddress = "0x";

  for (var i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
}

function asciiToHex(str: any) {
  if (!str) {
    return "0x00";
  }
  var hex: string = "";
  for (let i in str) {
    var charCode = str[i].charCodeAt(0).toString(16);
    hex += charCode.length < 2 ? "0" + charCode : charCode;
  }
  return "0x" + hex;
}

function hexToAscii(hex: string) {
  var i: number = 0;
  var str: String = "";
  if (!isHexStrict(hex)) {
    throw new Error("The parameter must be a valid HEX string.");
  }
  if (hex.substring(0, 2) === "0x") {
    i = 2;
  }
  for (; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, 2), 16));
  }
}

function randomHex(size: any) {
  return "0x" + randomBytes(size).toString("hex");
}

export { toChecksumAddress, asciiToHex, hexToAscii, randomHex, sha3 };
