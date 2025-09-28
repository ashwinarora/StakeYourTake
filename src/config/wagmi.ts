import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, bscTestnet, rootstockTestnet, hederaTestnet } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'
import { createPublicClient, http as viemHttp } from 'viem'

export const config = createConfig({
  chains: [mainnet, sepolia, bscTestnet, rootstockTestnet, hederaTestnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
    [rootstockTestnet.id]: http(),
    [hederaTestnet.id]: http(),
  },
})

export const publicClients = {
  [mainnet.id]: createPublicClient({ chain: mainnet, transport: viemHttp() }),
  [sepolia.id]: createPublicClient({ chain: sepolia, transport: viemHttp() }),
  [bscTestnet.id]: createPublicClient({ chain: bscTestnet, transport: viemHttp() }),
  [rootstockTestnet.id]: createPublicClient({ chain: rootstockTestnet, transport: viemHttp() }),
  [hederaTestnet.id]: createPublicClient({ chain: hederaTestnet, transport: viemHttp() }),
}

export type SupportedChainId =
  typeof mainnet.id |
  typeof sepolia.id |
  typeof bscTestnet.id |
  typeof rootstockTestnet.id |
  typeof hederaTestnet.id