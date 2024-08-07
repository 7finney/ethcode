import {
  getNetwork,
  providerDefault,
  setNetwork,
  getAvailableNetwork,
  getNetworkGasPrices
} from './api'
import {
  type ExtensionContext
} from 'vscode'
import { type Provider } from '@ethersproject/providers'
import { type Fees, type NetworkConfig } from '../types'

/**
 * Interface for the provider API.
 */
export interface ProviderInterface {
  /**
   * Returns a Promise that resolves to the current ethers.js provider instance of the network selected in the extension.
   *
   * @returns A Promise that resolves to the current ethers.js provider instance.
   */
  get: () => Promise<Provider>

  /**
   * Provides methods for interacting with the current network configuration.
   */
  network: {

    /**
     * Returns the current network configuration selected in the extension.
     *
     * @returns The current network configuration.
     */
    get: () => NetworkConfig

    /**
     * Sets the current network configuration with the given network name in the extension.
     *
     * @param network - The name of the network to switch to.
     * @returns The name of the network that was set.
     */
    set: (network: string) => string

    /**
     * Returns an array of the names of all available networks in the extension.
     *
     * @returns An array of the names of all available networks.
     */
    list: () => string[]

    /**
     * Returns the current gas price of the network selected in the extension.
     * @returns the current gas price of the network selected in the extension.
     */
    getGasPrices: () => Promise<any>
  }
}

/**
 * Returns an object providing methods for interacting with the ethers.js provider.
 *
 * @param context - The extension context.
 * @returns An object providing methods for interacting with the ethers.js provider.
 */
export function provider (context: ExtensionContext): ProviderInterface {
  /**
   * Returns a Promise that resolves to the current ethers.js provider instanc for the network selected in the extension.
   *
   * @returns A Promise that resolves to the current Ethereum provider instance.
   */
  async function get (): Promise<Provider> {
    const provider = await providerDefault(context)
    return provider
  }

  /**
   * Returns the current network configuration in ethcode.
   *
   * @returns The current network configuration.
   */
  function networkGet (): NetworkConfig {
    return getNetwork(context)
  }

  /**
   * Sets the current network configuration to the given network name in ethcode.
   *
   * @param network - The name of the network to switch to.
   * @returns The name of the network that was set.
   */
  function networkSet (network: string): string {
    return setNetwork(context, network)
  }

  /**
   * Returns an array of the names of all available networks in the extension.
   *
   * @returns An array of the names of all available networks.
   */
  function networkList (): string[] {
    return getAvailableNetwork()
  };

  /**
   * Returns the current gas price of the network selected in the extension.
   * @returns the current gas price of the network selected in the extension.
   */
  async function getGasPrices (): Promise<Fees> {
    return await getNetworkGasPrices(context)
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
