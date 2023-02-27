import { type JsonFragment } from '@ethersproject/abi'
import { type ContractInterface } from '../api/contract'
import { type EventsInterface } from '../api/events'
import { type ProviderInterface } from '../api/provider'
import { type WalletInterface } from '../api/wallet'

export interface API {
  status: string
  wallet: WalletInterface
  contract: ContractInterface
  provider: ProviderInterface
  events: EventsInterface
}

export interface ContractABI {
  name: string
  abi: readonly JsonFragment[] | undefined
}
