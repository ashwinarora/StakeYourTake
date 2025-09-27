import { SupportedChainId } from "@/config/wagmi"
import { Address, getContract } from "viem"
import { getPublicClient } from "./viem"
import { chainToContractAddress, CONTRACT_ABI } from "@/constants"

export const getSYTContract = (chainId: SupportedChainId) => {
    return getContract({
        abi: CONTRACT_ABI,
        address: chainToContractAddress[chainId],
        client: getPublicClient(chainId),
    })
}

export const getUserVote = async (contract: ReturnType<typeof getSYTContract>, debateId: number, voter: Address): Promise<[boolean, boolean, boolean]> => {
    return await contract.read.voters([debateId, voter]) as [boolean, boolean, boolean]
}

export const hasVoted = async (contract: ReturnType<typeof getSYTContract>, debateId: number, voter: Address): Promise<boolean> => {
    const vote = await getUserVote(contract, debateId, voter)
    return vote[0]
}
