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
  createConstructorInput,
  createDeployed,
  createFunctionInput,
  getConstructorInputFullPath,
  getDeployedFullPath,
  getFunctionInputFullPath
} from '../utils/functions'
import { type JsonFragment } from '@ethersproject/abi'
import { logger } from '../lib'

const event: {
  network: vscode.EventEmitter<string>
  account: vscode.EventEmitter<string>
  contracts: vscode.EventEmitter<any>
} = {
  network: new vscode.EventEmitter<string>(),
  account: new vscode.EventEmitter<string>(),
  contracts: new vscode.EventEmitter<any>()
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
  contractName: string = ''
): Promise<readonly ContractABI[] | readonly JsonFragment[] | undefined> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return

  const contractABIS: readonly ContractABI[] = Object.keys(contracts).map((name) => {
    return {
      name,
      abi: contracts[name].hardhatOutput?.abi
    }
  })
  const contractABI = contractABIS.find(contract => contract.name === contractName)?.abi as readonly JsonFragment[]
  if (contractName === '' || contractABI === undefined) return contractABIS
  return contractABI
}

const getDeployedContractAddress = async (
  context: ExtensionContext,
  name: string
): Promise<string | undefined> => {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return
    for (let i = 0; i < Object.keys(contracts).length; i++) {
      const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
      if (contract.name === name) {
        const link = getDeployedFullPath(contract)
        const linkchnage = link.replace(/\\/g, '/')
        const parsedUrl = new URL(linkchnage)
        const fileUrl: vscode.Uri = vscode.Uri.parse(`file://${parsedUrl.pathname}`)
        const contents: Uint8Array = await vscode.workspace.fs.readFile(fileUrl)
        const decoder = new TextDecoder()
        const jsonString = decoder.decode(contents)
        const json = JSON.parse(jsonString)
        return json.address
      }
    }
  } catch (error) {
    console.log(error)
  }
}

const getFunctionInputFile: any = async (
  context: ExtensionContext,
  name: string
): Promise<object | undefined> => {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return

    const contract = Object.values(contracts).find(contract => contract.name === name)
    if (contract != null) {
      const link = getFunctionInputFullPath(contract)
      const linkchnage = link.replace(/\\/g, '/')
      const parsedUrl = new URL(linkchnage)
      const fileUrl: vscode.Uri = vscode.Uri.parse(`file://${parsedUrl.pathname}`)
      const contents: Uint8Array = await vscode.workspace.fs.readFile(fileUrl)
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(contents)
      const json = JSON.parse(jsonString)
      return json
    }
  } catch (error) {
    console.log(error)
  }
}

const getConstructorInputFile = async (
  context: ExtensionContext,
  name: string
): Promise<object | undefined> => {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return
    const contract = Object.values(contracts).find(contract => contract.name === name)
    if (contract != null) {
      const link = getConstructorInputFullPath(contract)
      const linkchnage = link.replace(/\\/g, '/')
      const parsedUrl = new URL(linkchnage)
      const fileUrl: vscode.Uri = vscode.Uri.parse(`file://${parsedUrl.pathname}`)
      const contents: Uint8Array = await vscode.workspace.fs.readFile(fileUrl)
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(contents)
      const json = JSON.parse(jsonString)
      return json
    }
  } catch (error) {
    console.log(error)
  }
}

const createContractFiles = async (context: vscode.ExtensionContext, contractTitle: string): Promise<void> => {
  const contracts = await context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  const name = Object.keys(contracts).filter(
    (i: string) => i === contractTitle
  )
  const contract: CompiledJSONOutput = contracts[name[0]]

  void context.workspaceState.update('contract', contract)
  createConstructorInput(contract)
  createFunctionInput(contract)
  createDeployed(contract)

  logger.success(`Contract ${name[0]} is selected.`)
}
export {
  getNetwork,
  setNetwork,
  getAvailableNetwork,
  providerDefault,
  listAllWallet,
  getWallet,
  getContract,
  executeContractMethod,
  exportABI,
  getDeployedContractAddress,
  getFunctionInputFile,
  getConstructorInputFile,
  createContractFiles,
  event
}
