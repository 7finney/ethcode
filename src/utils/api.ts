import { ethers, type Wallet, type Contract } from 'ethers'
import { type ExtensionContext } from 'vscode'
import { extractPvtKey, listAddresses } from './wallet'

import {
  getNetworkNames,
  getSelectedNetConf,
  getSelectedProvider
} from './networks'
import { type CompiledJSONOutput } from '../types'
import {
  getConstructorInputFullPath,
  getDeployedFullPath,
  getFunctionInputFullPath
} from './functions'

// PROVIDER

const providerDefault = (context: ExtensionContext): any => {
  return getSelectedProvider(context)
}

const getAvailableNetwork = (): any => {
  return getNetworkNames()
}

const getNetwork = (context: ExtensionContext): any => {
  return getSelectedNetConf(context)
}

const setNetwork = (context: ExtensionContext, network: string): any => {
  if (network === null) {
    return 'Network parameter not given'
  }
  if (getNetworkNames().includes(network) != null) {
    return 'Network not found'
  } else {
    void context.workspaceState.update('selectedNetwork', network)
    return 'Network changed to ' + network
  }
}

// WALLET

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
): Promise<any> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  // return all abi if name is not specified else return abi of specific contract

  const contractABIS = Object.keys(contracts).map((name) => {
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

const getDeployedContractAddress: any = async (
  context: ExtensionContext,
  name: string
) => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getDeployedFullPath(contract)
      const json = await require(link)
      console.log(json)
      return json
    }
  }
}

const getFunctionInputFile: any = async (
  context: ExtensionContext,
  name: string
) => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getFunctionInputFullPath(contract)
      const json = await require(link)
      console.log(json)
      return json
    }
  }
}

const getConstructorInputFile = async (
  context: ExtensionContext,
  name: string
): Promise<any> => {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return
  for (let i = 0; i < Object.keys(contracts).length; i++) {
    const contract: CompiledJSONOutput = contracts[Object.keys(contracts)[i]]
    if (contract.name === name) {
      const link = getConstructorInputFullPath(contract)
      const json = await require(link)
      console.log(json)
      return json
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
  getConstructorInputFile
}
