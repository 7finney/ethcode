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

interface WalletInterface {
  get: (account: string) => Promise<Wallet>
  list: () => Promise<any>
}

export function wallet (context: ExtensionContext): WalletInterface {
  async function get (account: string): Promise<Wallet> {
    return await getWallet(context, account)
  }
  async function list (): Promise<string[]> {
    return await listAllWallet(context)
  }

  return {
    get,
    list
  }
}
