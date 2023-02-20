import type * as vscode from 'vscode'
import { event } from './api'

interface EthcodeInterface {
  network: vscode.EventEmitter<string>
  account: vscode.EventEmitter<string>
}

export function ethcode (): EthcodeInterface {
  const network = event.network
  const account = event.account

  return {
    network,
    account
  }
}
