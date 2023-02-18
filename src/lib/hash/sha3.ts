// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/*
 This file is part of web3.js.

 web3.js is free software: you can redistribute it and/or modify
 it under the terms of the GNU Lesser General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 web3.js is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Lesser General Public License for more details.

 You should have received a copy of the GNU Lesser General Public License
 along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @file utils.js
 * @author Fabian Vogelsteller <fabian@ethereum.org>
 * @date 2017
 */

import _ from 'underscore'
import { BN } from 'bn.js'
import numberToBN from 'number-to-bn'
import utf8 from 'utf8'
import { hash } from './keccak'

/**
 * Returns true if object is BN, otherwise false
 *
 * @method isBN
 * @param {Object} object
 * @return {Boolean}
 */
const isBN = function (object: any) {
  return BN.isBN(object)
}

/**
 * Returns true if object is BigNumber, otherwise false
 *
 * @method isBigNumber
 * @param {Object} object
 * @return {Boolean}
 */
const isBigNumber = function (object: any) {
  return (
    (Boolean((object?.constructor))) && object.constructor.name === 'BigNumber'
  )
}

/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
const toBN = function (number: any) {
  try {
    return numberToBN.apply(null, arguments)
  } catch (e) {
    throw new Error(`${e as string} Given value: ${number as string} `)
  }
}

/**
 * Takes and input transforms it into BN and if it is negative value, into two's complement
 *
 * @method toTwosComplement
 * @param {Number|String|BN} number
 * @return {String}
 */

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const toTwosComplement = function (number: any) {
//   return `0x${toBN(number).toTwos(256).toString(16, 64) as string}`
// }

/**
 * Checks if the given string is an address
 *
 * @method isAddress
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
const isAddress = function (address: string) {
  // check if it has the basic requirements of an address
  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false
    // If it's ALL lowercase or ALL upppercase
  } else if (
    /^(0x|0X)?[0-9a-f]{40}$/.test(address) ||
    /^(0x|0X)?[0-9A-F]{40}$/.test(address)
  ) {
    return true
    // Otherwise check each case
  } else {
    return checkAddressChecksum(address)
  }
}

/**
 * Checks if the given string is a checksummed address
 *
 * @method checkAddressChecksum
 * @param {String} address the given HEX address
 * @return {Boolean}
 */
var checkAddressChecksum = function (address: string) {
  // Check each case
  address = address.replace(/^0x/i, '')
  const addressHash = sha3(address.toLowerCase()).replace(/^0x/i, '')

  for (let i = 0; i < 40; i++) {
    // the nth letter should be uppercase if the nth digit of casemap is 1
    if (
      (parseInt(addressHash[i], 16) > 7 &&
        address[i].toUpperCase() !== address[i]) ||
      (parseInt(addressHash[i], 16) <= 7 &&
        address[i].toLowerCase() !== address[i])
    ) {
      return false
    }
  }
  return true
}

/**
 * Should be called to pad string to expected length
 *
 * @method leftPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const leftPad = function (string: string, chars: number, sign: string) {
//   const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
//   string = string.toString().replace(/^0x/i, '')

//   const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

//   return (
//     (hasPrefix ? '0x' : '') +
//     new Array(padding).join(sign !== '' ? sign : '0') +
//     string
//   )
// }

/**
 * Should be called to pad string to expected length
 *
 * @method rightPad
 * @param {String} string to be padded
 * @param {Number} chars that result string should have
 * @param {String} sign, by default 0
 * @returns {String} right aligned string
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const rightPad = function (string: string, chars: number, sign: string) {
//   const hasPrefix = /^0x/i.test(string) || typeof string === 'number'
//   string = string.toString().replace(/^0x/i, '')

//   const padding = chars - string.length + 1 >= 0 ? chars - string.length + 1 : 0

//   return (
//     (hasPrefix ? '0x' : '') +
//     string +
//     new Array(padding).join(sign !== '' ? sign : '0')
//   )
// }

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
const utf8ToHex = function (str: string) {
  str = utf8.encode(str)
  let hex = ''

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\\u0000)*/, '')
  str = str.split('').reverse().join('')
  str = str.replace(/^(?:\\u0000)*/, '')
  str = str.split('').reverse().join('')

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    // if (code !== 0) {
    const n = code.toString(16)
    hex += n.length < 2 ? '0' + n : n
    // }
  }

  return '0x' + hex
}

/**
 * Should be called to get utf8 from it's hex representation
 *
 * @method hexToUtf8
 * @param {String} hex
 * @returns {String} ascii string representation of hex value
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const hexToUtf8 = function (hex: string) {
//   if (!(isHexStrict(hex))) { throw new Error('The parameter "' + hex + '" must be a valid HEX string.') }

//   let str = ''
//   let code = 0
//   hex = hex.replace(/^0x/i, '')

//   // remove 00 padding from either side
//   hex = hex.replace(/^(?:00)*/, '')
//   hex = hex.split('').reverse().join('')
//   hex = hex.replace(/^(?:00)*/, '')
//   hex = hex.split('').reverse().join('')

//   const l = hex.length

//   for (let i = 0; i < l; i += 2) {
//     code = parseInt(hex.substr(i, 2), 16)
//     // if (code !== 0) {
//     str += String.fromCharCode(code)
//     // }
//   }

//   return utf8.decode(str)
// }

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const hexToNumber = function (value: any) {
//   if (value === null || typeof value === 'undefined') {
//     return value
//   }

//   if ((Boolean(_.isString(value))) && !(isHexStrict(value))) {
//     throw new Error(`Given value ${value.toString() as string} is not a valid hex string.`)
//   }

//   return toBN(value).toNumber()
// }

/**
 * Converts value to it's decimal representation in string
 *
 * @method hexToNumberString
 * @param {String|Number|BN} value
 * @return {String}
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const hexToNumberString = function (value: any) {
//   if (value === null || typeof value === 'undefined') return value

//   if ((Boolean(_.isString(value))) && !(isHexStrict(value))) {
//     throw new Error(`Given value ${value.toString() as string} is not a valid hex string.`)
//   }

//   return toBN(value).toString(10)
// }

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
const numberToHex = function (value: any) {
  if ((Boolean(_.isNull(value))) || (Boolean(_.isUndefined(value)))) {
    return value
  }

  if (!isFinite(value) && !(isHexStrict(value))) {
    throw new Error(`Given value ${value.toString() as string} is not a number.`)
  }

  const number = toBN(value)
  const result = number.toString(16)

  return (number.lt(new BN(0))) as boolean ? `-0x${result.substr(1) as string}` : `0x${result as string}`
}

/**
 * Convert a byte array to a hex string
 *
 * Note: Implementation from crypto-js
 *
 * @method bytesToHex
 * @param {Array} bytes
 * @return {String} the hex string
 */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const bytesToHex = function (bytes: any[]) {
//   for (let hex = [], i = 0; i < bytes.length; i++) {
//     /* jshint ignore:start */
//     hex.push((bytes[i] >>> 4).toString(16))
//     hex.push((bytes[i] & 0xf).toString(16))
//     /* jshint ignore:end */
//   }
//   return `0x${hex.join('') as string}`
// }

/**
 * Convert a hex string to a byte array
 *
 * Note: Implementation from crypto-js
 *
 * @method hexToBytes
 * @param {string} hex
 * @return {Array} the byte array
 */
const hexToBytes = function (hex: string) {
  hex = hex.toString()

  if (!(isHexStrict(hex))) {
    throw new Error('Given value "' + hex + '" is not a valid hex string.')
  }

  hex = hex.replace(/^0x/i, '')

  for (let bytes = [], c = 0; c < hex.length; c += 2) { bytes.push(parseInt(hex.substr(c, 2), 16)) }
  return bytes
}

/**
 * Auto converts any given value into it's hex representation.
 *
 * And even stringifys objects before.
 *
 * @method toHex
 * @param {String|Number|BN|Object|Buffer} value
 * @param {Boolean} returnType
 * @return {String}
 */
const toHex = function (value: any, returnType: boolean) {
  /* jshint maxcomplexity: false */

  if (isAddress(value)) {
    return returnType
      ? 'address'
      : `0x${value.toLowerCase().replace(/^0x/i, '') as string}`
  }

  if (_.isBoolean(value) === true) {
    return returnType ? 'bool' : (value != null) ? '0x01' : '0x00'
  }

  if (Buffer.isBuffer(value)) {
    return '0x' + value.toString('hex')
  }

  if ((Boolean(_.isObject(value))) && !isBigNumber(value) && !isBN(value)) {
    return returnType ? 'string' : utf8ToHex(JSON.stringify(value))
  }

  // if its a negative number, pass it through numberToHex
  if (_.isString(value) === true) {
    if (value.indexOf('-0x') === 0 || value.indexOf('-0X') === 0) {
      return returnType ? 'int256' : numberToHex(value)
    } else if (value.indexOf('0x') === 0 || value.indexOf('0X') === 0) {
      return returnType ? 'bytes' : value
    } else if (!isFinite(value)) {
      return returnType ? 'string' : utf8ToHex(value)
    }
  }

  return returnType ? (value < 0 ? 'int256' : 'uint256') : numberToHex(value)
}

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHexStrict = function (hex: string) {
  return ((Boolean(_.isString(hex))) || (Boolean(_.isNumber(hex)))) && /^(-)?0x[0-9a-f]*$/i.test(hex)
}

/**
 * Check if string is HEX
 *
 * @method isHex
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
const isHex = function (hex: string) {
  return (
    ((Boolean(_.isString(hex))) || (Boolean(_.isNumber(hex)))) && /^(-0x|0x)?[0-9a-f]*$/i.test(hex)
  )
}

/**
 * Hashes values to a sha3 hash using keccak 256
 *
 * To hash a HEX string the hex must have 0x in front.
 *
 * @method sha3
 * @return {String} the sha3 string
 */
const SHA3_NULL_S =
  '0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

var sha3 = function (value: any) {
  if (isBN(value)) {
    value = value.toString()
  }

  if (isHexStrict(value) && /^0x/i.test(value.toString())) {
    value = hexToBytes(value)
  }

  const returnValue = hash.keccak256(value) // jshint ignore:line

  if (returnValue === SHA3_NULL_S) {
    return null
  } else {
    return returnValue
  }
}

export { sha3, isHexStrict, isHex, toHex, hexToBytes }
