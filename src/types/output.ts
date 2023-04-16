import { type JsonFragment } from '@ethersproject/abi'
import type * as ethers from 'ethers'

export interface HardHatCompiledOutput {
  contractName: string
  sourceName: string
  /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
  abi: readonly JsonFragment[]
  bytecode: string
  deployedBytecode: string
}

export interface RemixCompiledOutput {
  data: {
    bytecode: BytecodeObject
    deployedByteCode: BytecodeObject
  }
  /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
  abi: readonly JsonFragment[]
}

interface GasEstimate {
  confidence: number
  maxFeePerGas: number
  maxPriorityFeePerGas: number
  price: number
}

export interface GasEstimateOutput {
  low: GasEstimate
  medium: GasEstimate
  high: GasEstimate
}

export interface CompiledJSONOutput {
  name?: string // contract name
  path?: string // local path of the contract
  contractType: number // 0: null, 1: hardhat output, 2: remix output
  hardhatOutput?: HardHatCompiledOutput
  remixOutput?: RemixCompiledOutput
}

export const getAbi = (output: CompiledJSONOutput): any => {
  if (output.contractType === 0) return []

  if (output.contractType === 1) return output.hardhatOutput?.abi

  return output.remixOutput?.abi
}

export const getByteCode = (
  output: CompiledJSONOutput
): ethers.utils.BytesLike | undefined => {
  if (output.contractType === 0) return ''

  if (output.contractType === 1) return output.hardhatOutput?.bytecode

  return output.remixOutput?.data.bytecode.object
}

export interface BytecodeObject {
  /** The bytecode as a hex string. */
  object: ethers.utils.BytesLike
  /** Opcodes list */
  opcodes: string
  /** The source mapping as a string. See the source mapping definition. */
  sourceMap: string
  /** If given, this is an unlinked object. */
  linkReferences?: Record<string, Record<string, Array<{ start: number, length: number }>>>
}
