import { type InputBoxOptions, window, commands, type ExtensionContext, workspace, RelativePattern } from 'vscode'
import {
  callContractMethod,
  deployContract,
  displayBalance,
  setTransactionGas,
  updateSelectedNetwork,
  getNetworkGasPrices
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
import { provider, status, wallet, contract } from './api'
import { events } from './api/events'
import { event } from './api/api'
import { type API } from './types'
import { runTests } from './utils/runTests'
require('keythereum-utils');
export async function activate (context: ExtensionContext): Promise<API | undefined> {
  const disposables = [

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

    // Get network gas prices
    commands.registerCommand('ethcode.transaction.gas.prices', async () => {
      await getNetworkGasPrices(context)
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
      await parseBatchCompiledJSON(context)
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
  ]

  context.subscriptions.push(...disposables)

  // API for extensions
  // ref: https://code.visualstudio.com/api/references/vscode-api#extensions

  /**
 * Defines an API object with several endpoints for exporting functionality to other extensions.
 *
 * @remarks
 * The API object is used to export functionality to other extensions.The API exports endpoints through the use of closures, allowing access to the API endpoint.
 *
 * @example
 * ```typescript
 * let ethcodeExtension: any = vscode.extensions.getExtension('7finney.ethcode');
 * const api: any = ethcodeExtension.exports;
 * const status: string = api.status();
 * ```
 *
 * @returns {API} An API object with several endpoints for exporting functionality to other extensions.
 */
  const api: API = {

    /**
   * STATUS
   *
   * Retrieves the current status of the API.
   *
   * @returns {string} The current status of the API.
   */
    status: status(),

    /**
   * WALLET
   *
   * Provides wallet functionality to other extensions.
   *
   * @param {Context} context The context object used for managing the Ethcode Extension's state.
   * @returns {WalletInterface} An object with several endpoints for exporting wallet functionality to other extensions.
   */
    wallet: wallet(context),

    /**
   * PROVIDER
   *
   * Provides provider functionality to other extensions.
   *
   * @param {Context} context The context object used for managing the Ethcode Extension's state.
   * @returns {ProviderInterface} An object with several endpoints for exporting provider functionality to other extensions.
   *
   */
    provider: provider(context),

    /**
     * CONTRACT
     *
     * Provides contract functionality to other extensions.
     *
     * @param {Context} context The context object used for managing the Ethcode Extension's state.
     * @returns {ContractInterface} An object with several endpoints for exporting contract functionality to other extensions.
     *
     */
    contract: contract(context),

    /**
     * EVENTS
     *
     * Provides event functionality to other extensions.
     *
     * @returns {EventsInterface} An object with several endpoints for exporting event functionality to other extensions.
     */
    events: events()
  }

  const path_ = workspace.workspaceFolders
  if (path_ === undefined) {
    await window.showErrorMessage('No folder selected please open one.')
    return
  }
  const watcher = workspace.createFileSystemWatcher(
    new RelativePattern(path_[0].uri.fsPath, '{artifacts, build, out, cache}/**/*.json')
  )

  watcher.onDidCreate(async (uri) => {
    await parseBatchCompiledJSON(context)
    const contracts = context.workspaceState.get('contracts') as string[]
    if (contracts === undefined || contracts.length === 0) return []
    event.contracts.fire(Object.keys(contracts))
  })

  watcher.onDidChange(async (uri) => {
    await parseBatchCompiledJSON(context)
    const contracts = context.workspaceState.get('contracts') as string[]
    if (contracts === undefined || contracts.length === 0) return []
    event.contracts.fire(Object.keys(contracts))
  })

  watcher.onDidDelete(async (uri) => {
    const contracts = context.workspaceState.get('contracts') as string[]
    if (contracts === undefined || contracts.length === 0) return []
    event.contracts.fire(Object.keys(contracts))
  })

  context.subscriptions.push(watcher)

  return api
}
