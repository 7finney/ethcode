import {
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import { type ContractABI } from '../types/api'

import { type JsonFragment } from '@ethersproject/abi'

/**
 * Defines the contract interface, which specifies the various properties and methods available for managing the contract via ethcode api.
 * @interface
 * @property {() => string[]} list Retrieves the list of contracts.
 * @property {(name: string) => Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>} abi Retrieves the abi of the contract.
 * @property {(name: string) => Promise<string | undefined>} getContractAddress Retrieves the address of the contract.
 * @property {(name: string) => Promise<object | undefined>} getFunctionInput Retrieves the function input of the contract.
 * @property {(name: string) => Promise<object | undefined>} getConstructorInput Retrieves the constructor input of the contract.
 * @property {(name: string) => Promise<object | undefined>} getConstructorInput Retrieves the constructor input of the contract.
 */
export interface ContractInterface {
  list: () => string[]
  abi: (name: string) => Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>
  getContractAddress: (name: string) => Promise<string | undefined>
  getFunctionInput: (name: string) => Promise<object | undefined>
  getConstructorInput: (name: string) => Promise<object | undefined>
}

/**
 * Creates a `ContractInterface` object providing methods for managing smart contract interactions.
 *
 * @param {ExtensionContext} context - The `ExtensionContext` object representing the context in which the function is being called.
 * @returns {ContractInterface} - The `ContractInterface` object representing the available smart contract management methods.
 */
export function contract (context: ExtensionContext): ContractInterface {
  /**
   * Gets a list of available contracts compiled in ethcode .
   *
   * @returns {string[]} - The array of contract names.
   */
  function list (): string[] {
    const contracts = context.workspaceState.get('contracts') as string[]
    if (contracts === undefined || contracts.length === 0) return []
    return Object.keys(contracts)
  }

  /**
   * Gets the ABI for the specified contract compiled in ethcode .
   *
   * @param {string} name - The name of the contract for which to retrieve the ABI.
   * @returns {Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>} - The ABI for the specified contract, or undefined if the ABI cannot be retrieved.
   */
  async function abi (contractTitle: string): Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined> {
    return await exportABI(context, contractTitle)
  }

  /**
   * Gets the address of the specified deployed contract compiled in ethcode.
   *
   * @param {string} name - The name of the contract for which to retrieve the address.
   * @returns {Promise<string | undefined>} - The address of the specified deployed contract, or undefined if the address cannot be retrieved.
   */
  async function getContractAddress (contractTitle: string): Promise<string | undefined> {
    return await getDeployedContractAddress(context, contractTitle)
  }

  /**
   * Gets the function input file for the specified contract compiled in ethcode .
   *
   * @param {string} name - The name of the contract for which to retrieve the function input.
   * @returns {Promise<object | undefined>} - The function input object for the specified contract, or undefined if the input cannot be retrieved.
   */
  async function getFunctionInput (contractTitle: string): Promise<object | undefined> {
    return getFunctionInputFile(context, contractTitle)
  }

  /**
   * Gets the constructor input file for the specified contract compiled in ethcode .
   *
   * @param {string} name - The name of the contract for which to retrieve the constructor input.
   * @returns {Promise<object | undefined>} - The constructor input object for the specified contract, or undefined if the input cannot be retrieved.
   */
  async function getConstructorInput (contractTitle: string): Promise<object | undefined> {
    return await getConstructorInputFile(context, contractTitle)
  }

  return {
    list,
    abi,
    getContractAddress,
    getFunctionInput,
    getConstructorInput
  }
}
