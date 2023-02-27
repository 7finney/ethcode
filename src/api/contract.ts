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

export interface ContractInterface {
  list: () => string[]
  abi: (name: string) => Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined>
  getContractAddress: (name: string) => Promise<string | undefined>
  getFunctionInput: (name: string) => Promise<object | undefined>
  getConstructorInput: (name: string) => Promise<object | undefined>
}

export function contract (context: ExtensionContext): ContractInterface {
  function list (): string[] {
    const contracts = context.workspaceState.get('contracts') as string[]
    if (contracts === undefined || contracts.length === 0) return []
    return Object.keys(contracts)
  }
  async function abi (name: string): Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined> {
    return await exportABI(context, name)
  }

  async function getContractAddress (name: string): Promise<string | undefined> {
    return await getDeployedContractAddress(context, name)
  }

  async function getFunctionInput (name: string): Promise<object | undefined> {
    return getFunctionInputFile(context, name)
  }

  async function getConstructorInput (name: string): Promise<object | undefined> {
    return await getConstructorInputFile(context, name)
  }

  return {
    list,
    abi,
    getContractAddress,
    getFunctionInput,
    getConstructorInput
  }
}
