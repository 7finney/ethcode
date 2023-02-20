import {
  getContract,
  listFunctions,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import {
  type ethers,
  type Contract
} from 'ethers'

interface ContractInterface {
  get: (address: string, abi: any, wallet: ethers.Signer) => Promise<Contract>
  list: (abi: any) => any
  execute: (contract: any, method: string, args: any[]) => Promise<any>
  abi: (name: string) => Promise<any>
  getContractAddress: (name: string) => Promise<any>
  getFunctionInput: (name: string) => Promise<any>
  getConstructorInput: (name: string) => Promise<any>
}

export function contract (context: ExtensionContext): ContractInterface {
  async function get (address: string, abi: any, wallet: ethers.Signer): Promise<Contract> {
    return await getContract(context, address, abi, wallet)
  }

  function list (abi: any): any {
    return listFunctions(abi)
  }

  async function execute (contract: any, method: string, args: any[]): Promise<any> {
    return await executeContractMethod(contract, method, args)
  }

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
    get,
    list,
    execute,
    abi,
    getContractAddress,
    getFunctionInput,
    getConstructorInput
  }
}
