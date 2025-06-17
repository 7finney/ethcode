import { type ExtensionContext } from 'vscode'
import { createPublicClient, http, type PublicClient } from 'viem'
import { getSelectedNetConf, getNetworkNames } from '../utils/networks'
import { type NetworkConfig } from '../types'

export interface ProviderInterface {
  get: () => Promise<PublicClient>
  network: {
    get: () => NetworkConfig
    set: (network: string) => string
    list: () => string[]
    getGasPrices: () => Promise<{ maxFeePerGas: string, maxPriorityFeePerGas: string }>
  }
}

export function getProvider(context: ExtensionContext): PublicClient {
  const networkConfig = getSelectedNetConf(context)
  return createPublicClient({
    transport: http(networkConfig.rpc)
  })
}

export function provider(context: ExtensionContext): ProviderInterface {
  async function get(): Promise<PublicClient> {
    return getProvider(context)
  }

  function networkGet(): NetworkConfig {
    return getSelectedNetConf(context)
  }

  function networkSet(network: string): string {
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

  function networkList(): string[] {
    return getNetworkNames()
  }

  async function getGasPrices(): Promise<{ maxFeePerGas: string, maxPriorityFeePerGas: string }> {
    const client = getProvider(context)
    const feeHistory = await client.request({
      method: 'eth_feeHistory',
      params: ['0x5', 'latest', [70]]
    }) as { baseFeePerGas: string[], reward: string[][] }

    if (!feeHistory.reward || !feeHistory.baseFeePerGas || feeHistory.reward.length === 0) {
      throw new Error('Failed to fetch gas price data from the network')
    }

    const baseFeePerGas = feeHistory.baseFeePerGas
    const reward = feeHistory.reward
    const maxPriorityFeePerGas = reward.reduce((acc: bigint, curr: string[]) => acc + BigInt(curr[0]), 0n) / BigInt(reward.length)
    const maxFeePerGas = BigInt(baseFeePerGas[baseFeePerGas.length - 1]) * 2n + maxPriorityFeePerGas
    return {
      maxFeePerGas: maxFeePerGas.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
    }
  }

  return {
    get,
    network: {
      get: networkGet,
      set: networkSet,
      list: networkList,
      getGasPrices
    }
  }
}
