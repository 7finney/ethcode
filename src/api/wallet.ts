import {
  getWallet,
  listAllWallet
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import {
  type Wallet
} from 'ethers'

/**
 * Represents an interface for interacting with a wallet present in the extension.
 */
export interface WalletInterface {

  /**
   * Returns Wallet object of ethers.js for the given account.
   *
   * @param account - The account to retrieve information for.
   * @returns A Promise that resolves to a Wallet object of ethers.js.
   */
  get: (account: string) => Promise<Wallet>

  /**
   * Returns a list of all accounts present in ethcode.
   *
   * @returns A Promise that resolves to an array of account addresses.
   */
  list: () => Promise<string[]>
}

/**
 * Returns an object with methods for interacting with a wallet.
 *
 * @param context - The VS Code extension context.
 * @returns An object with methods for interacting with a wallet.
 */
export function wallet (context: ExtensionContext): WalletInterface {
  /**
   * Returns Wallet object of ethers.js for the given account.
   *
   * @param account - The account to retrieve wallet object for that account.
   * @returns A Promise that resolves to a Wallet object of ethers.js.
   */
  async function get (account: string): Promise<Wallet> {
    return await getWallet(context, account)
  }

  /**
   * Returns a list of all accounts in the wallet.
   *
   * @returns A Promise that resolves to an array of account addresses.
   */
  async function list (): Promise<string[]> {
    return await listAllWallet(context)
  }

  return {
    get,
    list
  }
}
