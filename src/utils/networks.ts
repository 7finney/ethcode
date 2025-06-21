import { 
  createPublicClient, 
  createWalletClient,
  http, 
  type PublicClient,
  type WalletClient,
  type Chain,
  formatEther,
  parseEther,
  type Hash,
  type Address,
  type Account
} from 'viem'
import * as vscode from 'vscode'
import { window } from 'vscode'
import {
  type CompiledJSONOutput,
  getAbi,
  getByteCode
} from '../types/output'
import { logger } from '../lib'
import { extractPvtKey } from './wallet'
import { type INetworkQP } from '../types'
import {
  getConstructorInputs,
  getDeployedInputs,
  getFunctionInputs,
  getGasEstimates
} from './functions'

import { errors } from '../config/errors'
import { selectContract } from './contracts'
import { event } from '../api/api'
import { getSelectedProvider, getSelectedNetwork, getSelectedNetConf } from './utils'
import { provider } from '../api'

const getConfiguration: any = () => {
  return vscode.workspace.getConfiguration('ethcode')
}

const getNetworkNames = (): string[] => {
  const networks = getConfiguration().get('networks') as object
  return Object.keys(networks)
}

const updateSelectedNetwork: any = async (context: vscode.ExtensionContext) => {
  const quickPick = window.createQuickPick<INetworkQP>()

  quickPick.items = getNetworkNames().map((name: any) => ({
    label: name
  }))
  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = 'Select network'
  })
  quickPick.onDidChangeSelection(() => {
    const selection = quickPick.selectedItems[0]
    if (selection != null) {
      const { label } = selection
      void context.workspaceState.update('selectedNetwork', label)
      quickPick.dispose()

      event.network.fire(label)

      logger.success(`Selected network is ${label}`)
    }
  })
  quickPick.onDidHide(() => { quickPick.dispose() })
  quickPick.show()
}

// Contract function calls
const displayBalance: any = async (context: vscode.ExtensionContext) => {
  const network = getSelectedNetwork(context)
  if (!network) {
    logger.log('No network selected. Please select a network.')
    return
  }

  const address: string = await context.workspaceState.get('account') as string
  if (!address) {
    logger.log('No account selected. Please select an account.')
    return
  }

  const nativeCurrencySymbol = getSelectedNetConf(context).nativeCurrency.symbol
  logger.log('Fetching balance...')

  try {
    const publicClient = getSelectedProvider(context) as PublicClient
    const balance = await publicClient.getBalance({ address: address as `0x${string}` })
    const formattedBalance = formatEther(balance)
    void context.workspaceState.update('balance', formattedBalance)

    const networkName: string = getSelectedNetwork(context)
    logger.success(
      `\nAccount: ${address} \nBalance: ${formattedBalance} ${nativeCurrencySymbol} \nNetwork: ${networkName}`
    )
  } catch (error) {
    logger.error(error)
  }
}

const isTestingNetwork: any = (context: vscode.ExtensionContext) => {
  if (getSelectedNetwork(context) === 'Ganache Testnet') return true
  if (getSelectedNetwork(context) === 'Hardhat Testnet') return true
  return false
}

const setTransactionGas: any = async (context: vscode.ExtensionContext) => {
  const quickPick = window.createQuickPick()

  const gasConditions = ['Low', 'Medium', 'High']

  quickPick.items = gasConditions.map((condition) => ({
    label: condition
  }))

  quickPick.onDidChangeActive(() => {
    quickPick.placeholder = 'Select Gas estimation'
  })

  quickPick.onDidChangeSelection((selection) => {
    if (selection[0] != null) {
      const { label } = selection[0]
      void context.workspaceState.update('gas', label)
      logger.success(`${label} gas is selected.`)
      quickPick.dispose()
    }
  })

  quickPick.onDidHide(() => { quickPick.dispose() })
  quickPick.show()
}

const callContractMethod: any = async (context: vscode.ExtensionContext) => {
  try {
    const compiledOutput: CompiledJSONOutput = (await context.workspaceState.get(
      'contract'
    )) as CompiledJSONOutput

    if (compiledOutput === undefined) throw errors.ContractNotSelected

    const abi = getAbi(compiledOutput)
    if (!abi) {
      throw new Error('ABI is not defined in the contract artifact.')
    }
    if (!Array.isArray(abi)) {
      throw new Error('ABI must be an array.')
    }
    if (abi.length === 0) {
      throw new Error('ABI is empty. Please ensure the contract was compiled correctly.')
    }

    const abiItem = await getFunctionInputs(context)
    if (abiItem === undefined) throw new Error('Function is not defined.')

    const params_ = abiItem.inputs?.map((e: any) => e.value)
    const params = params_ === undefined ? [] : params_
    logger.success(`Calling ${compiledOutput.name as string} : ${abiItem.name as string} -->`)

    const contractAddress = getDeployedInputs(context).address
    if (contractAddress === undefined) { throw new Error('Enter deployed address of selected contract.') }

    const publicClient = getSelectedProvider(context) as PublicClient
    const account = await context.workspaceState.get('account') as `0x${string}`
    if (!account) {
      throw new Error('No account selected. Please select an account before calling.')
    }
    const rpc = getSelectedNetConf(context).rpc
    const walletClient = createWalletClient({
      chain: getSelectedNetConf(context) as unknown as Chain,
      transport: http(rpc),
      account
    })

    if (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure') {
      const result = await publicClient.readContract({
        address: contractAddress as Address,
        abi,
        functionName: abiItem.name as string,
        args: params
      })
      logger.success(
        `Calling ${compiledOutput.name as string} : ${abiItem.name as string} --> Success!`
      )
      logger.log(JSON.stringify(result))
    } else {
      const gasCondition = (await context.workspaceState.get('gas')) as string
        const gasEstimate = await getGasEstimates(gasCondition, context)
      const settingsGasLimit = (await getConfiguration().get('gasLimit')) as number

      const hash = await walletClient.writeContract({
        address: contractAddress as Address,
        abi,
        functionName: abiItem.name as string,
        args: params,
        gas: BigInt(settingsGasLimit),
        maxFeePerGas: gasEstimate?.price ? BigInt(gasEstimate.price) : undefined,
        account
      })

      logger.success(`Transaction hash: ${hash}`)
    }
  } catch (error) {
    logger.error(error)
  }
}

const deployContract: any = async (context: vscode.ExtensionContext) => {
  try {
    // Check if workspace is properly initialized
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      throw new Error('No workspace folder found. Please open a workspace before deploying.')
    }

    const compiledOutput: CompiledJSONOutput = (await context.workspaceState.get(
      'contract'
    )) as CompiledJSONOutput

    if (!compiledOutput) throw new Error('No contract artifact selected!')

    if (!compiledOutput.name) {
      throw new Error('Contract artifact does not have a valid name.')
    }

    if (!compiledOutput.path) {
      throw new Error('Contract artifact does not have a valid path.')
    }

    const abi = getAbi(compiledOutput)
    if (!abi) {
      throw new Error('ABI is not defined in the contract artifact.')
    }
    if (!Array.isArray(abi)) {
      throw new Error('ABI must be an array.')
    }
    if (abi.length === 0) {
      throw new Error('ABI is empty. Please ensure the contract was compiled correctly.')
    }

    const bytecode = getByteCode(compiledOutput)
    if (!bytecode) {
      throw new Error('Bytecode is not defined in the contract artifact.')
    }
    if (typeof bytecode !== 'string') {
      throw new Error('Bytecode must be a string.')
    }
    
    logger.log(`Raw bytecode type: ${typeof bytecode}`)
    logger.log(`Raw bytecode length: ${bytecode.length}`)
    logger.log(`Raw bytecode starts with 0x: ${bytecode.startsWith('0x')}`)
    logger.log(`Raw bytecode first 20 chars: ${bytecode.substring(0, 20)}`)
    
    if (!bytecode.startsWith('0x')) {
      throw new Error('Bytecode must start with 0x prefix.')
    }
    if (bytecode.length < 4) {
      throw new Error('Bytecode appears to be invalid (too short).')
    }

    // Log bytecode details for debugging
    logger.log(`Bytecode length: ${bytecode.length} characters`)
    logger.log(`Bytecode prefix: ${bytecode.substring(0, 10)}...`)
    logger.log(`Contract type: ${compiledOutput.contractType} (1=Hardhat, 2=Remix)`)

    const constructorInputs = await getConstructorInputs(context)
    if (constructorInputs === undefined) throw new Error('Constructor inputs are not defined.')

    // Validate constructor inputs
    if (Array.isArray(constructorInputs)) {
      logger.log(`Constructor inputs: ${JSON.stringify(constructorInputs)}`)
      // Check for any undefined or null values in constructor inputs
      const invalidInputs = constructorInputs.filter(input => input === undefined || input === null)
      if (invalidInputs.length > 0) {
        throw new Error('Constructor inputs contain invalid values. Please check your constructor input file.')
      }
    } else {
      throw new Error('Constructor inputs must be an array.')
    }

    const account = await context.workspaceState.get('account') as `0x${string}`
    if (!account) {
      throw new Error('No account selected. Please select an account before deploying.')
    }
    
    // Check account balance before deployment
    try {
      const publicClient = getSelectedProvider(context) as PublicClient
      const balance = await publicClient.getBalance({ address: account })
      const formattedBalance = formatEther(balance)
      logger.log(`Account balance: ${formattedBalance} ETH`)
      
      // Check if balance is sufficient (at least 0.001 ETH for deployment)
      if (balance < parseEther('0.001')) {
        throw new Error('Insufficient balance for deployment. Please ensure your account has at least 0.001 ETH.')
      }
    } catch (balanceError) {
      logger.error(`Error checking balance: ${balanceError}`)
      throw new Error('Unable to check account balance. Please ensure your account has sufficient funds.')
    }
    
    const networkConfig = getSelectedNetConf(context)
    if (!networkConfig || !networkConfig.rpc) {
      throw new Error('No network selected or invalid network configuration. Please select a network before deploying.')
    }
    
    // Test RPC connection
    try {
      const publicClient = getSelectedProvider(context) as PublicClient
      await publicClient.getBlockNumber()
      logger.log(`Connected to network: ${getSelectedNetwork(context)}`)
    } catch (rpcError) {
      logger.error(`RPC connection failed: ${rpcError}`)
      throw new Error('Unable to connect to the selected network. Please check your network configuration.')
    }
    
    const rpc = networkConfig.rpc
    const walletClient = createWalletClient({
      chain: getSelectedNetConf(context) as unknown as Chain,
      transport: http(rpc),
      account
    })

    logger.log('Deploying contract...')
    logger.log(`Network: ${getSelectedNetwork(context)}`)
    logger.log(`Account: ${account}`)
    logger.log(`Constructor args: ${JSON.stringify(constructorInputs)}`)

    try {
      const hash = await walletClient.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: constructorInputs,
        account
      })

      logger.success(`Contract deployed with hash: ${hash}`)
    } catch (deployError) {
      logger.error(`Deployment transaction failed: ${deployError}`)
      throw deployError
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Deployment failed: ${errorMessage}`)
    
    // Provide more specific guidance based on error type
    if (errorMessage.includes('No contract artifact selected')) {
      logger.log('Please select a compiled contract artifact first.')
    } else if (errorMessage.includes('No account selected')) {
      logger.log('Please create and select an account first.')
    } else if (errorMessage.includes('No network selected')) {
      logger.log('Please select a network first.')
    } else if (errorMessage.includes('Constructor inputs are not defined')) {
      logger.log('Please ensure constructor input file exists and contains valid parameters.')
    } else if (errorMessage.includes('insufficient funds')) {
      logger.log('Please ensure your account has sufficient balance for deployment.')
    }
  }
}

// Get network gas prices
const getNetworkGasPrices: any = async (context: vscode.ExtensionContext) => {
  try {
    const { maxFeePerGas, maxPriorityFeePerGas } = await provider(context).network.getGasPrices()
    if (maxFeePerGas === undefined || maxPriorityFeePerGas === undefined) {
      logger.log('Gas price data is undefined or not available for this network.')
    } else {
      logger.log('maxFeePerGas > ' + maxFeePerGas)
      logger.log('maxPriorityFeePerGas > ' + maxPriorityFeePerGas)
    }
  } catch (error) {
    logger.error('Error fetching gas prices: ' + error)
  }
}

export {
  getConfiguration,
  getNetworkNames,
  getSelectedNetConf,
  getSelectedNetwork,
  getSelectedProvider,
  updateSelectedNetwork,
  displayBalance,
  callContractMethod,
  deployContract,
  isTestingNetwork,
  setTransactionGas,
  getNetworkGasPrices
}
