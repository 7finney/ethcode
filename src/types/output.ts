import { type AbiItem } from './types'

export interface HardHatCompiledOutput {
  contractName: string
  sourceName: string
  /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
  abi: readonly AbiItem[]
  bytecode: string
  deployedBytecode: string
}

export interface RemixCompiledOutput {
  data: {
    bytecode: BytecodeObject
    deployedByteCode: BytecodeObject
  }
  /** The Ethereum Contract ABI. If empty, it is represented as an empty array. */
  abi: readonly AbiItem[]
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
): string | undefined => {
  if (output.contractType === 0) return ''

  if (output.contractType === 1) {
    const bytecode = output.hardhatOutput?.bytecode
    if (!bytecode) return undefined
    // Ensure 0x prefix for Hardhat format
    return bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`
  }

  // Remix format
  const bytecode = output.remixOutput?.data.bytecode.object
  if (!bytecode) {
    console.log('Remix bytecode is undefined or null')
    return undefined
  }
  
  console.log(`Original Remix bytecode: ${bytecode.substring(0, 20)}...`)
  console.log(`Bytecode starts with 0x: ${bytecode.startsWith('0x')}`)
  
  // Ensure 0x prefix for Remix format
  const result = bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`
  console.log(`Final bytecode: ${result.substring(0, 20)}...`)
  
  return result
}

export interface BytecodeObject {
  /** The bytecode as a hex string. */
  object: string
  /** Opcodes list */
  opcodes: string
  /** The source mapping as a string. See the source mapping definition. */
  sourceMap: string
  /** If given, this is an unlinked object. */
  linkReferences?: Record<string, Record<string, Array<{ start: number, length: number }>>>
}

export interface Fees {
  maxFeePerGas: bigint
  maxPriorityFeePerGas?: bigint
}

export interface FeeHistory {
  oldestBlock: number
  reward: string[][]
  baseFeePerGas: string[]
  gasUsedRatio: number[]
}
