import { Abi } from 'viem'
import rawAbi from './lib/ABI.json'
import { bscTestnet, mainnet, sepolia } from 'wagmi/chains'

export const CONTRACT_ABI = rawAbi as Abi

export const chainToContractAddress = {
  [mainnet.id]: '0x0000000000000000000000000000000000000000',
  [sepolia.id]: '0x0000000000000000000000000000000000000000',
  [bscTestnet.id]: '0xd9d6b13f32fe9De626C2fD175fC79Fd72067bcD5',
}