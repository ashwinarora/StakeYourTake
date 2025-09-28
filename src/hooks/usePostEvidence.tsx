"use client"

import { useMutation } from "@tanstack/react-query"
import { useSignTypedData } from "wagmi"
import type { Hex } from "viem"
import type { SupportedChainId } from "@/config/wagmi"
import type { Evidence } from "@/hooks/useGetEvidenceByDebateIdPg"
import { chainToContractAddress } from "@/constants"

export type PostEvidenceInput = {
    debateIdPg: number
    debateId: number
    chainId: SupportedChainId
    content: string
    assetUrl?: string
}

async function postEvidence(payload: PostEvidenceInput & { signature: Hex }): Promise<Evidence> {
    const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        const message = (json as any)?.error || "Failed to submit evidence"
        throw new Error(message)
    }
    return json as Evidence
}

export function usePostEvidence() {
    const { signTypedDataAsync } = useSignTypedData()

    return useMutation({
        mutationFn: async (input: PostEvidenceInput) => {
            const domain = {
                name: "StakeYourTake",
                version: "1" as const,
                chainId: input.chainId,
                verifyingContract: chainToContractAddress[input.chainId],
            } as const

            const types = {
                Evidence: [
                    { name: "content", type: "string" },
                    { name: "debateId", type: "uint256" },
                ],
            } as const

            const signature = await signTypedDataAsync({
                domain,
                types,
                primaryType: "Evidence",
                message: { content: input.content, debateId: BigInt(input.debateId) },
            })

            return await postEvidence({ ...input, signature })
        },
    })
}


