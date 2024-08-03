import { ethers } from 'ethers'
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
  if (getSelectedNetwork(context) === undefined) {
    logger.log('No network selected. Please select a network.')
    return
  }

  const address: string = await context.workspaceState.get('account') as string
  const nativeCurrencySymbol =
    getSelectedNetConf(context).nativeCurrency.symbol

  logger.log('Fetching balance...')

  try {
    void getSelectedProvider(context)
      .getBalance(address)
      .then(async (value: any) => {
        const balance = ethers.utils.formatEther(value)
        void context.workspaceState.update('balance', balance)

        const networkName: string = getSelectedNetwork(context)
        logger.success(
          `\nAccount: ${address} \nBalance: ${balance} ${nativeCurrencySymbol} \nNetwork: ${networkName}`
        )
      })
  } catch (_) {
    logger.error(new Error("Selected network RPC isn't supported."))
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
    if (abi === undefined) throw new Error('Abi is not defined.')

    const abiItem = await getFunctionInputs(context)
    if (abiItem === undefined) throw new Error('Function is not defined.')

    const params_ = abiItem.inputs?.map((e: any) => e.value)
    const params = params_ === undefined ? [] : params_
    console.log(params)
    logger.success(`Calling ${compiledOutput.name as string} : ${abiItem.name as string} -->`)

    const contractAddres = getDeployedInputs(context).address
    if (contractAddres === undefined) { throw new Error('Enter deployed address of selected contract.') }

    if (abiItem.stateMutability === 'view' || abiItem.stateMutability === 'pure') {
      selectContract(context)

      const contract = new ethers.Contract(
        contractAddres,
        abi,
        getSelectedProvider(context)
      )

      const result = await contract[abiItem.name as string](...params)
      logger.success(
        `Calling ${compiledOutput.name as string} : ${abiItem.name as string} --> Success!`
      )
      logger.log(JSON.stringify(result))
    } else {
      const contract = await getSignedContract(context, contractAddres)

      let result

      if (abiItem.stateMutability === 'nonpayable') {
        const gasCondition = (await context.workspaceState.get(
          'gas'
        )) as string

        const gasEstimate = await getGasEstimates(gasCondition, context)
        const settingsGasLimit = (await getConfiguration().get(
          'gasLimit'
        )) as number
        if (gasEstimate !== undefined) {
          const maxFeePerGas = (gasEstimate).price
          result = await contract[abiItem.name as string](...params, {
            gasPrice: ethers.utils.parseUnits(maxFeePerGas.toString(), 'gwei'),
            gasLimit: settingsGasLimit
          })
        } else {
          result = await contract[abiItem.name as string](...params)
        }
      } else {
        const payable: any = params[params.length - 1]
        const param = params.slice(0, params.length - 1)
        console.log('param -----> ', param)
        console.log('payable -----> ', payable)
        const selectedObject: any = abiItem.inputs?.find((item: any) => (
          'value' in item && 'type' in item && 'unit' in item
        ))
        console.log('selectedObject -----> ', selectedObject)
        const payableUnit = selectedObject.unit
        console.log('payableUnit -----> ', payableUnit)
        const payableValue = ethers.utils.parseUnits(payable.toString(), payableUnit)
        console.log('payableValue -----> ', payableValue)
        const gasCondition = (await context.workspaceState.get(
          'gas'
        )) as string

        const gasEstimate = await getGasEstimates(gasCondition, context)

        const settingsGasLimit = (await getConfiguration().get(
          'gasLimit'
        )) as number

        if (gasEstimate !== undefined) {
          const maxFeePerGas = (gasEstimate).price

          result = await contract[abiItem.name as string](...param, {
            gasPrice: ethers.utils.parseUnits(maxFeePerGas.toString(), 'gwei'),
            gasLimit: settingsGasLimit,
            value: payableValue
          })
        } else {
          result = await contract[abiItem.name as string](...param,
            {
              value: payableValue
            })
        }
      }

      logger.success('Waiting for confirmation...')

      await result.wait()
      logger.success('Transaction confirmed!')
      logger.success(
        `Calling ${compiledOutput.name as string} : ${abiItem.name as string} --> Success!`
      )
      logger.success(
        `You can see detail of this transaction here. ${getSelectedNetConf(context).blockScanner}/tx/${result.hash as string}`
      )
    }
  } catch (err: any) {
    logger.error(err)
  }
}

/**
 * @dev deploy the contract using the compiled json output and signer wallet
 */
const deployContract: any = async (context: vscode.ExtensionContext) => {
  try {
    logger.success('Deploying contract...')
    const myContract = await getContractFactoryWithParams(context)
    const parameters = getConstructorInputs(context)
    const gasCondition = (await context.workspaceState.get('gas')) as string
    const gasEstimate = await getGasEstimates(gasCondition, context)
    if (gasEstimate !== undefined) {
      const maxFeePerGas = (gasEstimate).price
      const settingsGasLimit = (await getConfiguration().get(
        'gasLimit'
      )) as number
      console.log('maxFeePerGas -----> ', maxFeePerGas)
      console.log('settingsGasLimit -----> ', settingsGasLimit)

      // const contract = await myContract.deploy(...parameters, {
      //   gasPrice: ethers.utils.parseUnits(maxFeePerGas.toString(), 'gwei'),
      //   gasLimit: settingsGasLimit
      // })

      // void context.workspaceState.update('contractAddress', contract.address)
      // logger.success(`Contract deployed to ${contract.address as string}`)
    } else {
      const contract = await myContract.deploy(...parameters)

      void context.workspaceState.update('contractAddress', contract.address)
      logger.success(`Contract deployed to ${contract.address as string}`)
    }
  } catch (err) {
    logger.error(err)
  }
}

const getSignedContract: any = async (
  context: vscode.ExtensionContext,
  contractAddres: string
): Promise<ethers.Contract> => {
  const compiledOutput = (await context.workspaceState.get(
    'contract'
  )) as CompiledJSONOutput
  if (compiledOutput === undefined) throw errors.ContractNotSelected

  const abi = getAbi(compiledOutput)
  if (abi === undefined) throw new Error('Abi is not defined.')

  const byteCode = getByteCode(compiledOutput)
  if (byteCode === undefined) throw new Error('ByteCode is not defined.')

  let contract
  if (isTestingNetwork(context) === true) {
    // Deploy to ganache network
    const provider = getSelectedProvider(
      context
    ) as ethers.providers.JsonRpcProvider
    const signer = provider.getSigner()
    contract = new ethers.Contract(contractAddres, abi, signer)
  } else {
    const account = context.workspaceState.get('account') as string
    const privateKey = await extractPvtKey(context.extensionPath, account)
    const wallet = new ethers.Wallet(privateKey)
    const provider = getSelectedProvider(context)
    const signingAccount = wallet.connect(provider)
    contract = new ethers.Contract(contractAddres, abi, signingAccount)
  }
  return contract
}

const getContractFactoryWithParams: any = async (
  context: vscode.ExtensionContext
): Promise<ethers.ContractFactory> => {
  const compiledOutput = (await context.workspaceState.get(
    'contract'
  )) as CompiledJSONOutput
  if (compiledOutput === undefined) throw errors.ContractNotSelected

  const abi = getAbi(compiledOutput)
  if (abi === undefined) throw new Error('Abi is not defined.')

  const byteCode = getByteCode(compiledOutput)
  if (byteCode === undefined) throw new Error('ByteCode is not defined.')

  let myContract
  if (isTestingNetwork(context) === true) {
    // Deploy to ganache network
    const provider = getSelectedProvider(
      context
    ) as ethers.providers.JsonRpcProvider
    const signer = provider.getSigner()
    myContract = new ethers.ContractFactory(abi, byteCode, signer)
  } else {
    // Deploy to ethereum network
    const account = context.workspaceState.get('account') as string
    const privateKey = await extractPvtKey(context.extensionPath, account)
    const provider = getSelectedProvider(context)
    const wallet = new ethers.Wallet(privateKey)
    const signingAccount = wallet.connect(provider)
    myContract = new ethers.ContractFactory(abi, byteCode, signingAccount)
  }
  return myContract
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
  setTransactionGas
}
