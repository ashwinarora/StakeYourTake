"use client"

import { useQuery } from "@tanstack/react-query"

export interface Evidence {
    id: number
    assetUrl?: string | null
    content: string
    debateIdPg: number
    createdAt: string
    updatedAt: string
}

async function fetchEvidenceByDebateIdPg(debateIdPg: number): Promise<Evidence[]> {
    const params = new URLSearchParams({ debateIdPg: String(debateIdPg) })
    const res = await fetch(`/api/evidence?${params.toString()}`)

    const json = await res.json().catch(() => ({}))
    if (!res.ok) {
        const message = (json as any)?.error || "Failed to fetch evidence"
        throw new Error(message)
    }
    return json as Evidence[]
}

export function useGetEvidenceByDebateIdPg(debateIdPg: number | null | undefined) {
    return useQuery({
        queryKey: ["evidence", debateIdPg],
        queryFn: () => fetchEvidenceByDebateIdPg(Number(debateIdPg)),
        enabled: Number.isInteger(Number(debateIdPg)),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    })
}


