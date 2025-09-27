import { createConfig, http } from 'wagmi'
import { mainnet, sepolia, bscTestnet } from 'wagmi/chains'
import {  metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia, bscTestnet],
  connectors: [metaMask()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
})