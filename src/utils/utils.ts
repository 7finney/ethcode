import { createPublicClient, http } from 'viem'
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
  const config = getSelectedNetConf(context)
  const rpc = config.rpc

  if (!isValidHttpUrl(rpc)) {
    throw new Error('Invalid RPC URL')
  }

  return createPublicClient({
    transport: http(rpc),
    chain: {
      id: Number(config.chainID),
      name: getSelectedNetwork(context),
      network: getSelectedNetwork(context).toLowerCase().replace(' ', '-'),
      nativeCurrency: {
        name: config.nativeCurrency.name,
        symbol: config.nativeCurrency.symbol,
        decimals: Number(config.nativeCurrency.decimal)
      },
      rpcUrls: {
        default: { http: [rpc] },
        public: { http: [rpc] }
      }
    }
  })
}
