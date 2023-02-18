import { type ethers } from 'ethers'
// eslint-disable-next-line import/no-duplicates
import type * as vscode from 'vscode'
// eslint-disable-next-line import/no-duplicates
import { type InputBoxOptions, window, commands } from 'vscode'
import {
  callContractMethod,
  deployContract,
  displayBalance,
  setTransactionGas,
  updateSelectedNetwork
} from './utils/networks'
import { logger } from './lib'
import {
  createKeyPair,
  deleteKeyPair,
  selectAccount,
  importKeyPair,
  exportKeyPair
} from './utils/wallet'
import {
  createERC4907Contract,
  parseBatchCompiledJSON,
  parseCompiledJSONPayload,
  selectContract
} from './utils'
import {
  getNetwork,
  getAvailableNetwork,
  providerDefault,
  setNetwork,
  getContract,
  listFunctions,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile
} from './utils/api'
import { status, wallet } from './api'

export async function activate (context: vscode.ExtensionContext) {
  context.subscriptions.push(
    // Create new account with password
    commands.registerCommand('ethcode.account.create', async () => {
      try {
        const pwdInpOpt: InputBoxOptions = {
          title: 'Password',
          ignoreFocusOut: true,
          password: true,
          placeHolder: 'Password'
        }
        const password = await window.showInputBox(pwdInpOpt)
        if (password === undefined) {
          logger.log('Account not created')
          return
        }
        createKeyPair(context, context.extensionPath, password ?? '')
      } catch (error) {
        logger.error(error)
      }
    }),

    // Delete selected account with password
    commands.registerCommand('ethcode.account.delete', async () => {
      deleteKeyPair(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Deploy ContractcallContractMethod
    commands.registerCommand('ethcode.contract.deploy', async () => {
      deployContract(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // select ethereum networks
    commands.registerCommand('ethcode.network.select', () => {
      updateSelectedNetwork(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    commands.registerCommand('ethcode.rental.create', () => {
      createERC4907Contract(context)
        .catch((error) => {
          logger.error(error)
        })
    }),
    // Select Ethereum Account
    commands.registerCommand('ethcode.account.select', () => {
      selectAccount(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Get account balance
    commands.registerCommand('ethcode.account.balance', async () => {
      displayBalance(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Set gas strategy
    commands.registerCommand('ethcode.transaction.gas.set', async () => {
      setTransactionGas(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Load combined JSON output
    commands.registerCommand('ethcode.compiled-json.load', () => {
      const editorContent = (window.activeTextEditor != null)
        ? window.activeTextEditor.document.getText()
        : undefined
      parseCompiledJSONPayload(context, editorContent)
    }),

    // Load all combined JSON output
    commands.registerCommand('ethcode.compiled-json.load.all', async () => {
      parseBatchCompiledJSON(context)
    }),

    // Select a compiled json from the list
    commands.registerCommand('ethcode.compiled-json.select', () => {
      selectContract(context)
    }),

    // Call contract method
    commands.registerCommand('ethcode.contract.call', async () => {
      callContractMethod(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Export Account
    commands.registerCommand('ethcode.account.export', async () => {
      exportKeyPair(context)
        .catch((error) => {
          logger.error(error)
        })
    }),
    // Import Key pair
    commands.registerCommand('ethcode.account.import', async () => {
      importKeyPair(context)
        .catch((error) => {
          logger.error(error)
        })
    }),

    // Activate
    commands.registerCommand('ethcode.activate', async () => {
      logger.success('Welcome to Ethcode!')
    })
  )

  // API for extensions
  // ref: https://code.visualstudio.com/api/references/vscode-api#extensions
  const api = {
    status,
    wallet: wallet(context),
    // PROVIDER
    provider: {
      get: () => providerDefault(context),
      network: {
        get: () => getNetwork(context),
        set: (network: string) => setNetwork(context, network),
        list: () => getAvailableNetwork()
      }
    },
    // CONTRACT
    contract: {
      get: async (address: string, abi: any, wallet: ethers.Signer) =>
        await getContract(context, address, abi, wallet),
      list: (abi: any) => listFunctions(abi),
      execute: async (contract: any, method: string, args: any[]) =>
        await executeContractMethod(contract, method, args),
      abi: async (name: string) => await exportABI(context, name),
      geContractAddress: async (name: string) => getDeployedContractAddress(context, name),
      getFunctionInput: async (name: string) => getFunctionInputFile(context, name),
      getConstructorInput: async (name: string) =>
        await getConstructorInputFile(context, name)
    }
  }

  return api
}
