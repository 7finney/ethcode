import { type ExtensionContext } from 'vscode'
import { createWalletClient, custom, type Account } from 'viem'
import { getProvider } from './provider'
import { listAddresses } from '../utils/wallet'

export interface WalletInterface {
  get: (account: string) => Promise<Account>
  list: () => Promise<string[]>
}

export async function getWallet(context: ExtensionContext, account: string): Promise<Account> {
  // In viem, an account is just an object with address and privateKey (if available)
  // Here, we assume account is a private key string
  // You may want to adjust this logic to fit your keystore/account management
  return { address: account as `0x${string}` } as Account
}

export function wallet(context: ExtensionContext): WalletInterface {
  async function get(account: string): Promise<Account> {
    return getWallet(context, account)
  }

  async function list(): Promise<string[]> {
    return listAddresses(context, context.extensionPath)
  }

  return {
    get,
    list
  }
}
