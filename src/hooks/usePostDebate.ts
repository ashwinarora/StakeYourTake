"use client"

import { useMutation } from "@tanstack/react-query"
import type { Hex } from "viem"
import type { SupportedChainId } from "@/config/wagmi"

export type PostDebateInput = {
    title: string
    description: string
    txHash: Hex
    chainId: SupportedChainId
    assetUrl?: string
}

export type Debate = {
    id: number
    title: string
    description: string
    debateId: number
    assetUrl?: string | null
    chainId: number
    creationTxHash: string
    createdAt: string
    updatedAt: string
}

async function postDebate(payload: PostDebateInput): Promise<Debate> {
    const res = await fetch("/api/debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    })

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        const message = (json as any)?.error || "Failed to create debate"
        throw new Error(message)
    }
    return json as Debate
}

export function usePostDebate() {
    return useMutation({
        mutationFn: postDebate,
    })
}


