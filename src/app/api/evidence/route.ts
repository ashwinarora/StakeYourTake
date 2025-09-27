import { SupportedChainId } from "@/config/wagmi";
import { getSYTContract, hasVoted } from "@/lib/contract";
import DebateManager from "@/services/DebateManager";
import { NextResponse } from "next/server";
import { Hex, recoverMessageAddress } from "viem";

type PostEvidenceBody = {
    debateIdPg: number;
    debateId: number;
    chainId: SupportedChainId;
    message: string;
    signature: Hex;
    content: string;
    assetUrl?: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        const {message, signature, debateIdPg, debateId, chainId, content, assetUrl} = body as PostEvidenceBody;
        const debateIdPgNum = Number(debateIdPg);
        if (!Number.isInteger(debateIdPgNum)) {
            return NextResponse.json({ error: "debateIdPg must be an integer" }, { status: 400 });
        }
        // const derivedAddress = await recoverMessageAddress({message, signature})
        const derivedAddress = "0x10cdc362Cf9737A172aA6803F2e968f4Cdb50761"
        const contract = getSYTContract(chainId)
        const isVoted = await hasVoted(contract, debateId, derivedAddress)
        console.log("isVoted", isVoted)
        if (!isVoted) return NextResponse.json({ error: "You need to vote before submitting evidence" }, { status: 400 });
        console.log("creating evidence")
        const evidence = await DebateManager.getInstance().createEvidence({
            debateIdPg: debateIdPgNum,
            content,
            assetUrl,
        })
        return NextResponse.json(evidence, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}