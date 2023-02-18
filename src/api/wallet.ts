import { getWallet, listAllWallet } from '../utils/api'
import { type ExtensionContext, EventEmitter } from 'vscode'
import { type Wallet } from 'ethers'

interface WalletInterface {
  get: (account: string) => Promise<Wallet>
  list: () => Promise<any>
  onAccountUpdate: () => EventEmitter<string>
}
export function wallet (context: ExtensionContext): WalletInterface {
  async function get (account: string): Promise<Wallet> {
    return await getWallet(context, account)
  }
  async function list (): Promise<string[]> {
    return await listAllWallet(context)
  }
  function onAccountUpdate (): EventEmitter<string> {
    return new EventEmitter<string>()
  }
  return {
    get,
    list,
    onAccountUpdate
  }
}
