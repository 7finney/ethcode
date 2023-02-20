import { getNetwork, providerDefault, setNetwork, getAvailableNetwork } from '../utils/api'
import { type ExtensionContext } from 'vscode'

interface ProviderInterface {
  get: () => any
  network: {
    get: () => any
    set: (network: string) => any
    list: () => any
  }
}

export function provider (context: ExtensionContext): ProviderInterface {
  async function get (): Promise<any> {
    return providerDefault(context)
  }

  function networkGet (): any {
    return getNetwork(context)
  }
  function networkSet (network: string): any {
    return setNetwork(context, network)
  };
  function networkList (): any {
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