import {
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile
} from './api'
import {
  type ExtensionContext
} from 'vscode'

interface ContractInterface {
  abi: (name: string) => Promise<any>
  getContractAddress: (name: string) => Promise<any>
  getFunctionInput: (name: string) => Promise<any>
  getConstructorInput: (name: string) => Promise<any>
}

export function contract (context: ExtensionContext): ContractInterface {
  async function abi (name: string): Promise<any> {
    return await exportABI(context, name)
  }

  async function getContractAddress (name: string): Promise<any> {
    return getDeployedContractAddress(context, name)
  }

  async function getFunctionInput (name: string): Promise<any> {
    return getFunctionInputFile(context, name)
  }

  async function getConstructorInput (name: string): Promise<any> {
    return await getConstructorInputFile(context, name)
  }

  return {
    abi,
    getContractAddress,
    getFunctionInput,
    getConstructorInput
  }
}
