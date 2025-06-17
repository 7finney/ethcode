import { type PublicClient } from 'viem'
import { type Fees, type FeeHistory } from '../types'

export async function get1559Fees (
  client: PublicClient,
  maxFeePerGasFromConfig: bigint,
  percentile: number
): Promise<Fees> {
  const { reward, baseFeePerGas }: FeeHistory = await client.request({
    method: 'eth_feeHistory',
    params: ['0x5', 'latest', [percentile]]
  })

  const maxPriorityFeePerGas = reward.reduce((accumulator, currentValue) => BigInt(accumulator) + BigInt(currentValue[0]), BigInt(0)) / BigInt(reward.length)

  if (maxPriorityFeePerGas > 0 && maxPriorityFeePerGas > maxFeePerGasFromConfig) {
    throw new Error(
      `Estimated miner tip of ${maxPriorityFeePerGas} exceeds configured max fee per gas of ${maxFeePerGasFromConfig}.`
    )
  }

  const maxFeePerGas = BigInt(baseFeePerGas[baseFeePerGas.length - 1]) * BigInt(2) + BigInt(maxPriorityFeePerGas)

  if (maxFeePerGas > 0 && maxPriorityFeePerGas > 0) {
    return {
      maxPriorityFeePerGas: BigInt(maxPriorityFeePerGas),
      maxFeePerGas: maxFeePerGas > maxFeePerGasFromConfig ? maxFeePerGasFromConfig : maxFeePerGas
    }
  }

  return {
    maxFeePerGas: maxFeePerGasFromConfig
  }
}
