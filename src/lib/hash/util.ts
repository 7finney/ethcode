import * as randomBytes from 'randombytes'
import { sha3, isHexStrict } from './sha3'

function toChecksumAddress (address: any): string {
  if (address == null) return ''

  if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    throw new Error(
      `Given address ${address as string} is not a valid Ethereum address.`
    )
  }

  address = address.toLowerCase().replace(/^0x/i, '')
  const addressHash = sha3(address).replace(/^0x/i, '')
  let checksumAddress = '0x' as string

  for (let i = 0; i < address.length; i++) {
    // If ith character is 9 to f then make it uppercase
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase() as string
    } else {
      checksumAddress += address[i] as string
    }
  }
  return checksumAddress
}

function asciiToHex (str: any): any {
  if (str === null || str === undefined) {
    return '0x00'
  }
  let hex: string = ''
  for (const i in str) {
    const charCode = str[i].charCodeAt(0).toString(16) as string
    hex += `${charCode.length < 2 ? '0' + charCode : charCode}`
  }
  return '0x' + hex
}

function hexToAscii (hex: string): any {
  let i: number = 0
  let str: string = ''
  if (!(isHexStrict(hex))) {
    throw new Error('The parameter must be a valid HEX string.')
  }
  if (hex.substring(0, 2) === '0x') {
    i = 2
  }
  for (; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substring(i, 2), 16))
  }
  return str
}

function randomHex (size: any): any {
  return '0x' + randomBytes(size).toString('hex')
}

export { toChecksumAddress, asciiToHex, hexToAscii, randomHex, sha3 }
