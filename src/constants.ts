import { Abi, Hex } from 'viem'
import rawAbi from './lib/ABI.json'
import { bscTestnet, mainnet, rootstockTestnet, sepolia, hederaTestnet } from 'wagmi/chains'
import { SupportedChainId } from './config/wagmi'

export const CONTRACT_ABI = rawAbi as Abi

export const chainToContractAddress: Record<SupportedChainId, Hex> = {
  [mainnet.id]: '0x0000000000000000000000000000000000000000',
  [sepolia.id]: '0xBC451B28b9619481d2C7204667fD6D83b4fb6aC7',
  [bscTestnet.id]: '0xd9d6b13f32fe9De626C2fD175fC79Fd72067bcD5',
  [rootstockTestnet.id]: '0xF949C61102A2cD12e027E3eD3dcF845509FF79Db',
  [hederaTestnet.id]: '0xF949C61102A2cD12e027E3eD3dcF845509FF79Db',
}
