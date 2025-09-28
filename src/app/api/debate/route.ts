import { SupportedChainId } from "@/config/wagmi";
import { fetchTransactionDetailsByHash } from "@/lib/viem";
import DebateManager from "@/services/DebateManager";
import { NextResponse } from "next/server";
import { Hex } from "viem";

type PostDebateBody = {
    title: string;
    description: string;
    assetUrl?: string;
    txHash: Hex;
    chainId: SupportedChainId;
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

        const { title, description, txHash, chainId, assetUrl } = body as PostDebateBody;
        if (!title || !description || !txHash || chainId === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        if (typeof txHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
            return NextResponse.json({ error: "Invalid txHash" }, { status: 400 });
        }
        if (typeof chainId !== "number") {
            return NextResponse.json({ error: "Invalid chainId" }, { status: 400 });
        }

        const details = await fetchTransactionDetailsByHash(txHash as Hex, chainId as SupportedChainId);
        if (!details.transaction || !details.receipt || details.decodedLogs.length === 0) {
            return NextResponse.json({ error: "Transaction details not found" }, { status: 404 });
        }

        const debateId = Number((details.decodedLogs[0].args as any)?.debateId);
        if (!Number.isFinite(debateId)) {
            return NextResponse.json({ error: "Invalid debateId in logs" }, { status: 400 });
        }

        const dbres = await DebateManager.getInstance().createDebate({
            title,
            description,
            assetUrl,
            debateId,
            chainId: chainId as SupportedChainId,
            creationTxHash: txHash as Hex,
        });
        return NextResponse.json(dbres, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const debates = await DebateManager.getInstance().getAllDebates();
        return NextResponse.json(debates, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}