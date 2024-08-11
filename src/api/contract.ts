import {
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile,
  createContractFiles
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import { type ContractABI, type CompiledJSONOutput } from '../types'

import { type JsonFragment } from '@ethersproject/abi'
import { parseBatchCompiledJSON } from '../utils/contracts'

/**
 * Defines the contract API interface.
 * @interface
 * @property {() => Promise<string[]>} list Retrieves the list of contracts.
 * @property {(name: string) => Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>} abi Retrieves the abi of the contract.
 * @property {(name: string) => Promise<string | undefined>} getContractAddress Retrieves the address of the contract.
 * @property {(name: string) => Promise<object | undefined>} getFunctionInput Retrieves the function input of the contract.
 * @property {(name: string) => Promise<object | undefined>} getConstructorInput Retrieves the constructor input of the contract.
 * @property {(name: string) => Promise<object | undefined>} getConstructorInput Retrieves the constructor input of the contract.
 */
export interface ContractInterface {
  list: () => Promise<string[]>
  abi: (name: string) => Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>
  getContractAddress: (name: string) => Promise<string | undefined>
  getFunctionInput: (name: string) => Promise<object | undefined>
  getConstructorInput: (name: string) => Promise<object | undefined>
  selectContract: (name: string) => Promise<void>
}

/**
 * Exports contract API.
 * Returns a `ContractInterface` object.
 * This API provides methods for managing interactions with smart contract files inside Ethcode workspace.
 *
 * @param {ExtensionContext} context - The `ExtensionContext` object representing the context in which the function is being called.
 * @returns {ContractInterface} - The `ContractInterface` object representing the available smart contract management methods.
 */
export function contract (context: ExtensionContext): ContractInterface {
  /**
   * Returns a list of the compiled contracts loaded in ethcode.
   *
   * @returns {Promise<string[]>} - The array of contract names.
   */
  async function list (): Promise<string[]> {
    await parseBatchCompiledJSON(context)
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    // Exclude library contracts
    const userContracts = Object.keys(contracts).filter((i) => {
      const contract = contracts[i]
      const contractName = contract.name ?? ''
      // return contract if not in hardhat library or foundry library
      const foundryLibContracts = [
        'IMulticall3',
        'Script',
        'StdAssertions',
        'StdChains',
        'StdCheats',
        'StdInvariant',
        'StdStyle',
        'StdUtils',
        'Vm',
        'console',
        'console2',
        'Test',
        'CommonBase',
        'ScriptBase',
        'TestBase',
        'CounterScript',
        'StdCheatsSafe',
        'stdError',
        'stdJson',
        'stdMath',
        'stdStorage',
        'stdStorageSafe',
        'VmSafe',
        'DSTest'
      ]
      // const hardhatLibContracts = ['']
      return !foundryLibContracts.includes(contractName)
    })
    if (userContracts === undefined || Object.keys(userContracts).length === 0) return []
    return userContracts
  }

  /**
   * Returns the ABI for the specified contract in ethcode.
   *
   * @param {string} name - Name of the contract for which to retrieve the ABI.
   * @returns {Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>} - ABI of the specified contract, `undefined` if the ABI cannot be retrieved.
   */
  async function abi (contractTitle: string): Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined> {
    return await exportABI(context, contractTitle)
  }

  /**
   * Returns the address of the specified contract in ethcode.
   *
   * @param {string} name - Name of the contract for which to retrieve the address.
   * @returns {Promise<string | undefined>} - The address of the specified deployed contract, or undefined if the address cannot be retrieved.
   */
  async function getContractAddress (contractTitle: string): Promise<string | undefined> {
    return await getDeployedContractAddress(context, contractTitle)
  }

  /**
   * Returns the function input JSON for the specified contract in ethcode.
   *
   * @param {string} name - Name of the contract for which to retrieve the function input.
   * @returns {Promise<object | undefined>} - The function input JSON for the specified contract, or undefined if the input cannot be retrieved.
   */
  async function getFunctionInput (contractTitle: string): Promise<object | undefined> {
    return getFunctionInputFile(context, contractTitle)
  }

  /**
   * Returns the constructor input file for the specified contract in ethcode .
   *
   * @param {string} name - Name of the contract for which to retrieve the constructor input.
   * @returns {Promise<object | undefined>} - The constructor input object for the specified contract, or undefined if the input cannot be retrieved.
   */
  async function getConstructorInput (contractTitle: string): Promise<object | undefined> {
    return await getConstructorInputFile(context, contractTitle)
  }

  async function selectContract (
    contractTitle: string
  ): Promise<void> {
    await createContractFiles(context, contractTitle)
  }

  return {
    list,
    abi,
    getContractAddress,
    getFunctionInput,
    getConstructorInput,
    selectContract
  }
}
