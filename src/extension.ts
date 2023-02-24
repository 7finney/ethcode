import { type InputBoxOptions, window, commands, type ExtensionContext } from 'vscode'
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
import { provider, status, wallet, contract, ethcode } from './api'

export async function activate (context: ExtensionContext): Promise<any> {
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
        console.log('password is:', password)
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
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    // Deploy ContractcallContractMethod
    commands.registerCommand('ethcode.contract.deploy', async () => {
      deployContract(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    // select ethereum networks
    commands.registerCommand('ethcode.network.select', () => {
      updateSelectedNetwork(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    commands.registerCommand('ethcode.rental.create', () => {
      createERC4907Contract(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),
    // Select Ethereum Account
    commands.registerCommand('ethcode.account.select', () => {
      selectAccount(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    // Get account balance
    commands.registerCommand('ethcode.account.balance', async () => {
      displayBalance(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    // Set gas strategy
    commands.registerCommand('ethcode.transaction.gas.set', async () => {
      setTransactionGas(context)
        .catch((error: any) => {
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
        .catch((error: any) => {
          logger.error(error)
        })
    }),

    // Export Account
    commands.registerCommand('ethcode.account.export', async () => {
      exportKeyPair(context)
        .catch((error: any) => {
          logger.error(error)
        })
    }),
    // Import Key pair
    commands.registerCommand('ethcode.account.import', async () => {
      importKeyPair(context)
        .catch((error: any) => {
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
  const api: any = {
    status,
    wallet: wallet(context),
    // PROVIDER
    provider: provider(context),
    // CONTRACT
    contract: contract(context),
    // UTILS
    events: ethcode()
  }

  return api
}
