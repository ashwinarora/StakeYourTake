import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, bscTestnet } from 'wagmi/chains'
import {  metaMask } from 'wagmi/connectors'
import { createPublicClient, http as viemHttp } from 'viem'

export const config = createConfig({
  chains: [mainnet, sepolia, bscTestnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
})

export const publicClients = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: viemHttp() }),
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: viemHttp() }),
  [bscTestnet.id]: createPublicClient({ chain: bscTestnet, transport: viemHttp() }),
}

export type SupportedChainId = typeof mainnet.id | typeof sepolia.id | typeof bscTestnet.id