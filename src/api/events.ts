import type * as vscode from 'vscode'
import { event } from './api'

export interface EventsInterface {
  network: vscode.EventEmitter<string>
  account: vscode.EventEmitter<string>
}

export function events (): EventsInterface {
  const network = event.network
  const account = event.account

  return {
    network,
    account
  }
}
