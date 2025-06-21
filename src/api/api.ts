import { type ExtensionContext } from 'vscode'
import { type PublicClient } from 'viem'
import { getProvider } from './provider'
import { type ContractABI, type CompiledJSONOutput, type NetworkConfig, type Fees } from '../types'
import { createConstructorInput, createDeployed, createFunctionInput, getConstructorInputFullPath, getDeployedFullPath, getFunctionInputFullPath } from '../utils/functions'
import { logger } from '../lib'
import * as vscode from 'vscode'

export const event = {
  network: new vscode.EventEmitter<string>(),
  account: new vscode.EventEmitter<string>(),
  contracts: new vscode.EventEmitter<any>(),
  updateAccountList: new vscode.EventEmitter<string[]>()
}

export async function getNetwork(context: ExtensionContext) {
  const client = getProvider(context)
  // viem does not have getNetwork, so use chainId and rpc info
  return {
    chainId: client.chain?.id,
    name: client.chain?.name,
    rpc: client.transport.url
  }
}

export async function getNetworkFeeData(context: ExtensionContext) {
  const client = getProvider(context)
  // Use viem's fee data method or custom RPC call
  const feeHistory = await client.request({
    method: 'eth_feeHistory',
    params: ['0x5', 'latest', [70]]
  })
  return feeHistory
}

export async function exportABI(context: ExtensionContext, contractName: string = '') {
  const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
  if (contracts === undefined || Object.keys(contracts).length === 0) return

  const contractABIS: readonly ContractABI[] = Object.keys(contracts).map((name) => ({
      name,
      abi: contracts[name].hardhatOutput?.abi
  }))
  const contractABI = contractABIS.find(contract => contract.name === contractName)?.abi
  if (contractName === '' || contractABI === undefined) return contractABIS
  return contractABI
}

export async function getDeployedContractAddress(context: ExtensionContext, name: string) {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return
    for (const contract of Object.values(contracts)) {
      if (contract.name === name) {
        const link = getDeployedFullPath(contract)
        const linkchnage = link.replace(/\\/g, '/')
        const fileUri = vscode.Uri.file(linkchnage)
        const contents = await vscode.workspace.fs.readFile(fileUri)
        const decoder = new TextDecoder()
        const jsonString = decoder.decode(contents)
        const json = JSON.parse(jsonString)
        return json.address
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export async function getFunctionInputFile(context: ExtensionContext, name: string) {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return

    const contract = Object.values(contracts).find(contract => contract.name === name)
    if (contract != null) {
      const link = getFunctionInputFullPath(contract)
      const linkchnage = link.replace(/\\/g, '/')
      const fileUri = vscode.Uri.file(linkchnage)
      const contents = await vscode.workspace.fs.readFile(fileUri)
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(contents)
      const json = JSON.parse(jsonString)
      return json
    }
  } catch (error) {
    console.error(error)
  }
}

export async function getConstructorInputFile(context: ExtensionContext, name: string) {
  try {
    const contracts = context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    if (contracts === undefined || Object.keys(contracts).length === 0) return
    const contract = Object.values(contracts).find(contract => contract.name === name)
    if (contract != null) {
      const link = getConstructorInputFullPath(contract)
      const linkchnage = link.replace(/\\/g, '/')
      const fileUri = vscode.Uri.file(linkchnage)
      const contents = await vscode.workspace.fs.readFile(fileUri)
      const decoder = new TextDecoder()
      const jsonString = decoder.decode(contents)
      const json = JSON.parse(jsonString)
      return json
    }
  } catch (error) {
    console.log(error)
    return []
  }
}

export async function createContractFiles(context: vscode.ExtensionContext, contractTitle: string) {
  try {
    const contracts = await context.workspaceState.get('contracts') as Record<string, CompiledJSONOutput>
    
    if (!contracts || Object.keys(contracts).length === 0) {
      logger.error('No contracts found in workspace state')
      return
    }
    
    const name = Object.keys(contracts).filter(
      (i: string) => i === contractTitle
    )
    
    if (name.length === 0) {
      logger.error(`Contract ${contractTitle} not found in workspace`)
      return
    }
    
    const contract: CompiledJSONOutput = contracts[name[0]]

    void context.workspaceState.update('contract', contract)
    createConstructorInput(contract)
    createFunctionInput(contract)
    createDeployed(contract)

    logger.success(`Contract ${name[0]} is selected.`)
  } catch (error) {
    logger.error(`Error in createContractFiles: ${error}`)
  }
}
