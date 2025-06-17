import * as assert from 'assert'
import * as vscode from 'vscode'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'

suite('Viem Integration Test Suite', () => {
  test('Connect to network', async () => {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http()
    })

    const blockNumber = await publicClient.getBlockNumber()
    assert.ok(blockNumber > 0, 'Should get a valid block number')
  })

  test('Get account balance', async () => {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http()
    })

    const balance = await publicClient.getBalance({
      address: '0x0000000000000000000000000000000000000000'
    })
    assert.ok(balance >= 0n, 'Should get a valid balance')
  })
}) 