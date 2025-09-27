import { SupportedChainId } from "@/config/wagmi";
import { fetchTransactionDetailsByHash } from "@/lib/viem";
import DebateManager from "@/services/DebateManager";
import { NextResponse } from "next/server";
import { Hex } from "viem";

type PostDebateBody = {
    title: string;
    description: string;
    txHash: Hex;
    chainId: SupportedChainId;
}

export async function POST(request: Request) {
    const body = await request.json();
    const { title, description, txHash, chainId } = body as PostDebateBody;
    const details = await fetchTransactionDetailsByHash(txHash, chainId);
    // console.log(details.receipt?.logs)
    
    const dbres = DebateManager.getInstance().createDebate({
        title,
        description,
        debateId: Number((details.decodedLogs[0].args as any).debateId),
        chainId,
        creationTxHash: txHash,
    });
    return NextResponse.json(dbres);
}