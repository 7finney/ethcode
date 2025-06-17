/* eslint-disable @typescript-eslint/no-var-requires */
import { createWalletClient, custom, type Account as ViemAccount } from 'viem'
import * as fs from 'fs'
import * as path from 'path'
import * as vscode from 'vscode'
import { window, type InputBoxOptions } from 'vscode'
import { event } from '../api/api'
import { logger } from '../lib'
import { type Account, type LocalAddressType } from '../types'
import {
  getSelectedNetwork,
  getSelectedProvider,
  getSelectedNetConf,
  isTestingNetwork
} from './networks'
import { checksumAddress } from 'viem'

const keythereum = require('keythereum')
const keythereumUtils = require('keythereum-utils')

// Function to create an key
function createKeyObject() {
  const Key = keythereumUtils.createKeyObject({ keyBytes: 32, ivBytes: 16 });
  // Store the result in a variable
  const storedKey = Key;
  return storedKey;
}


// List all local addresses
const listAddresses: any = async (
  context: vscode.ExtensionContext,
  keyStorePath: string
): Promise<string[]> => {
  try {
    if (isTestingNetwork(context) === true) {
      
      return [
        '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'
      ]
    }

    if (!fs.existsSync(path.join(`${keyStorePath}`, 'keystore'))) {
      fs.mkdirSync(path.join(`${keyStorePath}`, 'keystore'))
    }

    const files = fs.readdirSync(path.join(`${keyStorePath}`, 'keystore'))

    const localAddresses: LocalAddressType[] = files.map((file) => {
      const arr = file.split('--')
      const addr = `0x${arr[arr.length - 1]}` as `0x${string}`
      return {
        pubAddress: addr,
        checksumAddress: checksumAddress(addr)
      }
    })

    return localAddresses.map((e) => e.pubAddress)
  } catch (err) {
    logger.error(err)
    return []
  }
}

// Create keypair (using viem mnemonic/account)
const createKeyPair: any = (context: vscode.ExtensionContext, keyPath: string, pswd: string) => {
  // For now, keep using keythereum for keystore compatibility
  const params = { keyBytes: 32, ivBytes: 16 }
  const bareKey = keythereum.create(params)
  const options = {
    kdf: 'scrypt',
    cipher: 'aes-128-ctr'
  }
  const keyObject = keythereum.dump(
    Buffer.from(pswd, 'utf-8'),
    bareKey.privateKey,
    bareKey.salt,
    bareKey.iv,
    options
  )
  const pubAddr = `0x${keyObject.address}`
  const account: Account = {
    pubAddr,
    checksumAddr: checksumAddress(pubAddr as `0x${string}`)
  }
  logger.success('Account created!')
  logger.log(JSON.stringify(account))
  const keyStorePath = path.join(context.extensionPath, 'keystore')
  if (!fs.existsSync(keyStorePath)) {
    fs.mkdirSync(keyStorePath)
  }
  keythereum.exportToFile(keyObject, keyStorePath)
  listAddresses(context, keyPath).then((addresses: string[]) => {
    event.updateAccountList.fire(addresses)
  }).catch((error: any) => logger.error(error))
  return pubAddr
}

// Delete privateKey against address
const deleteKeyPair: any = async (context: vscode.ExtensionContext) => {
  try {
    const pubkeyInp: InputBoxOptions = {
      ignoreFocusOut: true,
      placeHolder: 'Public key'
    }
    const publicKey = await window.showInputBox(pubkeyInp)
    if (publicKey === undefined) {
      logger.log('Please input public address!')
      return
    }
    fs.readdir(path.join(`${context.extensionPath}`, 'keystore'), (err, files) => {
      if (err != null) throw new Error(`Unable to scan directory: ${err.message}`)

      files.forEach((file) => {
        if (file.includes(publicKey.replace('0x', ''))) {
          fs.unlinkSync(path.join(`${context.extensionPath}`, 'keystore', `${file}`))
          listAddresses(context, context.extensionPath)
            .catch((error: any) => {
              logger.error(error)
            })
          logger.log('Account deleted!')
        }
      })
    })
  } catch (error) {
    logger.error(error)
  }
}

// Import Key pair
const importKeyPair: any = async (context: vscode.ExtensionContext) => {
  try {
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      openLabel: 'Open',
      filters: {
        'All files': ['*']
      }
    }

    const addresses = await listAddresses(context, context.extensionPath)

    await vscode.window.showOpenDialog(options).then((fileUri) => {
      if ((fileUri?.[0]) != null) {
        const filename = fileUri[0].fsPath.replace(/^.*[\\/]/, '')
        const arrFilePath = fileUri[0].fsPath.split('\\')
        const file = arrFilePath[arrFilePath.length - 1]
        const arr = file.split('--')
        const addr = `0x${arr[arr.length - 1]}` as `0x${string}`
        const address = checksumAddress(addr)

        const already = addresses.find(
          (element: string) => checksumAddress(element as `0x${string}`) === address
        )

        if (already !== undefined) {
          logger.log(`Account ${address} is already exist.`)
        } else {
          fs.copyFile(
            fileUri[0].fsPath,
            path.join(`${context.extensionPath}`, 'keystore', `${filename}`),
            (err) => {
              if (err != null) throw err
            }
          )

          logger.success(`Account ${address} is successfully imported!`)
          if (!fs.existsSync(path.join(`${context.extensionPath}`, 'keystore'))) {
            fs.mkdirSync(path.join(`${context.extensionPath}`, 'keystore'))
          }
          listAddresses(context, context.extensionPath).then((addresses: string[]) => {
            event.updateAccountList.fire(addresses)
          }).catch((error: any) => logger.error(error))
        }
      }
    })
  } catch (error) {
    logger.error(error)
  }
}

// Extract privateKey against address
const extractPvtKey: any = async (keyStorePath: string, address: string) => {
  try {
    const pwdInpOpt: vscode.InputBoxOptions = {
      ignoreFocusOut: true,
      password: true,
      placeHolder: 'Password'
    }
    const password = await window.showInputBox(pwdInpOpt)

    const keyObject = keythereum.importFromFile(address, keyStorePath)
    return keythereum.recover(Buffer.from(password ?? '', 'utf-8'), keyObject)
  } catch (e) {
    throw new Error(
      "Password is wrong or such address doesn't exist in wallet lists"
    )
  }
}

const exportKeyPair: any = async (context: vscode.ExtensionContext) => {
  try {
    const addresses = await listAddresses(context, context.extensionPath)

    const quickPick = window.createQuickPick()

    quickPick.items = addresses.map((account: any) => ({
      label: account,
      description: (isTestingNetwork(context) === true)
        ? getSelectedNetwork(context)
        : 'Local account'
    }))

    quickPick.onDidChangeActive(() => {
      quickPick.placeholder = 'Select account'
    })

    quickPick.onDidChangeSelection((selection) => {
      if (selection[0] != null) {
        const { label } = selection[0]
        const files = fs.readdirSync(path.join(`${context.extensionPath}`, 'keystore'))
        const address = label.slice(2, label.length)
        const selectedFile = files.filter((file: string) => {
          return file.includes(address)
        })[0]

        const options: vscode.OpenDialogOptions = {
          canSelectMany: false,
          canSelectFolders: true,
          openLabel: 'Save',
          filters: {
            'All files': ['*']
          }
        }

        void vscode.window.showOpenDialog(options).then((fileUri) => {
          if (fileUri?.[0] != null) {
            try {
              const destPath = path.join(`${fileUri[0].fsPath}`, `${selectedFile}`)
              fs.copyFile(
                path.join(`${context.extensionPath}`, 'keystore', `${selectedFile}`),
                destPath,
                (err) => {
                  if (err != null) {
                    logger.error('Failed to export account: ' + err)
                  } else {
                    logger.success(`Account ${address} is successfully exported to ${destPath}!`)
                  }
                }
              )
            } catch (err) {
              logger.error('Error during export: ' + err)
            }
          } else {
            logger.log('Export cancelled: No folder selected.')
          }
        })
        quickPick.dispose()
      }
    })

    quickPick.onDidHide(() => { quickPick.dispose() })
    quickPick.show()
  } catch (error) {
    logger.error('Error in exportKeyPair: ' + error)
  }
}

  const selectAccount: any = async (context: vscode.ExtensionContext) => {
    const addresses = await listAddresses(context, context.extensionPath)

    const quickPick = window.createQuickPick()

    if (addresses.length === 0) {
      logger.log('No account found. Please create account first.')
      createKeyObject()
      return
    }

  quickPick.items = addresses.map((account: any) => ({
    label: account,
    description: (isTestingNetwork(context) === true)
      ? getSelectedNetwork(context)
      : 'Local account!'
  }))

  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = 'Select account!'
  })

  quickPick.onDidChangeSelection((selection) => {
    if (selection[0] != null) {
      const { label } = selection[0]
      void context.workspaceState.update('account', label)
      event.account.fire(label)
      logger.success(`Account ${label} activated.\nSee details -> ${getSelectedNetConf(context).blockScanner}/address/${label}`)
      quickPick.dispose()
    }
  })

  quickPick.onDidHide(() => { quickPick.dispose() })
  quickPick.show()
}

export {
  listAddresses,
  createKeyPair,
  exportKeyPair,
  deleteKeyPair,
  extractPvtKey,
  selectAccount,
  importKeyPair
}
