import { decodeFunctionData, Hex, parseEventLogs } from 'viem'
import { mainnet, sepolia, bscTestnet } from 'wagmi/chains'
import { publicClients, SupportedChainId } from '@/config/wagmi'
import { CONTRACT_ABI } from '@/constants'

type DecodedLogs = Array<{
  address: Hex
  eventName: string
  args: Record<string, unknown> | unknown[]
  logIndex: number
  txIndex: number
  blockNumber: bigint
}>

export type TransactionDetails = {
  transaction: Awaited<ReturnType<(typeof publicClients)[SupportedChainId]['getTransaction']>> | null
  receipt: Awaited<ReturnType<(typeof publicClients)[SupportedChainId]['getTransactionReceipt']>> | null
  decodedLogs: DecodedLogs
}

export function getPublicClient(chainId: SupportedChainId) {
  const client = publicClients[chainId]
  if (!client) {
    throw new Error(`Unsupported chain id: ${chainId}`)
  }
  return client
}

export async function fetchTransactionDetailsByHash(hash: Hex, chainId: SupportedChainId ): Promise<TransactionDetails> {
  const client = getPublicClient(chainId)
  const [transaction, receipt] = await Promise.all([
    client.getTransaction({ hash }).catch(() => null),
    client.getTransactionReceipt({ hash }).catch(() => null),
  ])
  if(!transaction || !receipt) return { transaction: null, receipt: null, decodedLogs: [] }

  let decodedInput:
    | { functionName: string; args: unknown[] }
    | null = null
  try {
    const { functionName, args } = decodeFunctionData({
      abi: CONTRACT_ABI,
      data: transaction.input,
    })
    decodedInput = { functionName, args: args as unknown[] }
  } catch {
    // Not a contract call you have ABI for, or it's a simple transfer
    decodedInput = null
  }

  let decodedLogs: DecodedLogs = []

  try {
    const parsed = parseEventLogs({
      abi: CONTRACT_ABI,
      logs: receipt.logs,
      // Optional: if you only want logs from a specific contract:
      // strict: true,
    })

    decodedLogs = parsed.map((l) => ({
      address: l.address as Hex,
      eventName: l.eventName!,
      args: l.args as any,
      logIndex: Number(l.logIndex),
      txIndex: Number(l.transactionIndex),
      blockNumber: l.blockNumber!,
    }))
  } catch {
    // If some logs don't match your ABI (other contracts emitted),
    // parseEventLogs will ignore them, or you can decode per-log with decodeEventLog.
    console.log('Error parsing event logs')
  }

  console.log(decodedLogs)

  return { transaction, receipt, decodedLogs }
}

export const defaultChainId: SupportedChainId = sepolia.id


