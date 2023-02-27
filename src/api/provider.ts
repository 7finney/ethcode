import {
  getNetwork,
  providerDefault,
  setNetwork,
  getAvailableNetwork
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import { type Provider } from '@ethersproject/providers'
import { type NetworkConfig } from '../types'
export interface ProviderInterface {
  get: () => Promise<Provider>
  network: {
    get: () => NetworkConfig
    set: (network: string) => string
    list: () => string[]
  }
}

export function provider (context: ExtensionContext): ProviderInterface {
  async function get (): Promise<Provider> {
    const provider = await providerDefault(context)
    return provider
  }

  function networkGet (): NetworkConfig {
    return getNetwork(context)
  }
  function networkSet (network: string): string {
    return setNetwork(context, network)
  };
  function networkList (): string[] {
    return getAvailableNetwork()
  };

  return {
    get,
    network: {
      get: networkGet,
      set: networkSet,
      list: networkList
    }
  }
}
