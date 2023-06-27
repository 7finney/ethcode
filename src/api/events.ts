import type * as vscode from 'vscode'
import { event } from './api'

/**
 * Represents an interface for event emitters of network and account changes.
 */
export interface EventsInterface {
  /**
   * An event emitter for network changes.
   *
   * @event
   * @type {vscode.EventEmitter<string>}
   */
  network: vscode.EventEmitter<string>

  /**
   * An event emitter for account changes.
   *
   * @event
   * @type {vscode.EventEmitter<string>}
   */
  account: vscode.EventEmitter<string>

  /**
   * An event emitter for compiled contracts change.
   *
   * @event
   * @type {vscode.EventEmitter<any>}
   */
  contracts: vscode.EventEmitter<any>

  /**
 * An event emitter for Account List change.
 *
 * @event
 * @type {vscode.EventEmitter<any>}
 */
  updateAccountList: vscode.EventEmitter<any>
}

/**
 * Returns an object containing event emitters for network and account changes.
 *
 * @returns {EventsInterface} An object containing event emitters for network and account changes.
 *
 */
export function events (): EventsInterface {
  const network = event.network
  const account = event.account
  const contracts = event.contracts
  const updateAccountList = event.updateAccountList

  return {
    network,
    account,
    contracts,
    updateAccountList
  }
}
