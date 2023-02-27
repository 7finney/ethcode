import { ethers, type Wallet, type Contract } from 'ethers'
import { type ExtensionContext } from 'vscode'
import { extractPvtKey, listAddresses } from '../utils/wallet'
import * as vscode from 'vscode'
import {
  getNetworkNames,
  getSelectedNetConf,
  getSelectedProvider
} from '../utils/networks'
import { type ContractABI, type CompiledJSONOutput, type NetworkConfig } from '../types'
import {
  getConstructorInputFullPath,
  getDeployedFullPath,
  getFunctionInputFullPath
} from '../utils/functions'
import { type JsonFragment } from '@ethersproject/abi'

const event: {
  network: vscode.EventEmitter<string>
  account: vscode.EventEmitter<string>
} = {
  network: new vscode.EventEmitter<string>(),
  account: new vscode.EventEmitter<string>()
}

// PROVIDER
const providerDefault = (context: ExtensionContext): any => {
  return getSelectedProvider(context)
}

const getAvailableNetwork = (): string[] => {
  return getNetworkNames()
}

const getNetwork = (context: ExtensionContext): NetworkConfig => {
  return getSelectedNetConf(context)
}

const setNetwork = (context: ExtensionContext, network: string): string => {
  if (network === null) {
    return 'Network parameter not given'
  }
  if (!getNetworkNames().includes(network)) {
    return 'Network not found'
  } else {
    void context.workspaceState.update('selectedNetwork', network)
    return 'Network changed to ' + network
  }
}

// WALLETS
const getWallet = async (context: ExtensionContext, account: string): Promise<Wallet> => {
  const address: any = await context.workspaceState.get('account')
  account = account ?? address
  const provider = getSelectedProvider(context)
  const privateKey = await extractPvtKey(context.extensionPath, account)
  const wallet = new ethers.Wallet(privateKey, provider)
  return wallet
}

const listAllWallet = async (context: ExtensionContext): Promise<string[]> => {
  const result = await listAddresses(context, context.extensionPath)
  return result
}

// CONTRACT

const getContract = async (
  context: ExtensionContext,
  address: string,
  abi: any,
  wallet: ethers.Signer
): Promise<Contract> => {
  const contract = new ethers.Contract(address, abi, wallet)
  return contract
}

const listFunctions = (abi: any): any => {
  const result = []
  for (let i = 0; i < abi.length; i++) {
    if (abi[i].type === 'function') {
      result.push(abi[i].name)
    }
  }
  return result
}

const executeContractMethod = async (
  contract: any,
  method: string,
  args: any[]
): Promise<any> => {
  const result = await contract[method](...args)
  return result
}

const exportABI = async (
  context: ExtensionContext,
  selectSpecific: string = ''
): Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return

  const contractABIS: readonly ContractABI[] = Object.keys(contracts).map((name) => {
    return {
      name,
      abi: contracts[name].hardhatOutput?.abi
    }
  })

  for (let i = 0; i < contractABIS.length; i++) {
    if (contractABIS[i].name === selectSpecific) {
      return contractABIS[i].abi
    }
  }
  return contractABIS
}

const getDeployedContractAddress = async (
  context: ExtensionContext,
  name: string
): Promise<string | undefined> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getDeployedFullPath(contract)
      const json: any = await require(link)
      console.log(json)
      return json.address
    }
  }
}

const getFunctionInputFile: any = async (
  context: ExtensionContext,
  name: string
): Promise<object | undefined> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getFunctionInputFullPath(contract)
      const json: Promise<object> = await require(link)
      console.log(json)
      return await json
    }
  }
}

const getConstructorInputFile = async (
  context: ExtensionContext,
  name: string
): Promise<object | undefined> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getConstructorInputFullPath(contract)
      const json: Promise<object | undefined> = await require(link)
      console.log(json)
      return await json
    }
  }
}

export {
  getNetwork,
  setNetwork,
  getAvailableNetwork,
  providerDefault,
  listAllWallet,
  getWallet,
  getContract,
  listFunctions,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile,
  event
}
