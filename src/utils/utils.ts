import { ethers } from 'ethers'
import * as vscode from 'vscode'
import { type NetworkConfig } from '../types'
import { logger } from '../lib'

const isValidHttpUrl: any = (url_: string) => {
  let url

  try {
    url = new URL(url_)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

const getConfiguration: any = () => {
  return vscode.workspace.getConfiguration('ethcode')
}

export const getSelectedNetConf = (context: vscode.ExtensionContext): NetworkConfig => {
  try {
    const networks: any = getConfiguration().get('networks')
    const selectedNetworkConfig = networks[getSelectedNetwork(context)]
    const parsedConfig: NetworkConfig = JSON.parse(selectedNetworkConfig)
    return parsedConfig
  } catch (error) {
    logger.error(error)
    logger.log('No selected network found. Using default!')
  }
  const networks: any = getConfiguration().get('networks')
  const defaultConfig: NetworkConfig = JSON.parse(networks[0])
  return defaultConfig
}

// Selected Network Configuratin Helper
export const getSelectedNetwork = (context: vscode.ExtensionContext): string => {
  return context.workspaceState.get('selectedNetwork') as string
}

export const getSelectedProvider: any = (context: vscode.ExtensionContext) => {
  const rpc = getSelectedNetConf(context).rpc // default providers have a name with less than 10 chars
  if (isValidHttpUrl(rpc) === true) return new ethers.providers.JsonRpcProvider(rpc)

  return ethers.providers.getDefaultProvider(rpc)
}
