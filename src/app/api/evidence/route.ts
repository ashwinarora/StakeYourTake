import { SupportedChainId } from "@/config/wagmi";
import { chainToContractAddress } from "@/constants";
import { getSYTContract, hasVoted } from "@/lib/contract";
import DebateManager from "@/services/DebateManager";
import { NextResponse } from "next/server";
import { Hex, recoverTypedDataAddress } from "viem";

type PostEvidenceBody = {
    debateIdPg: number;
    debateId: number;
    chainId: SupportedChainId;
    signature: Hex;
    content: string;
    assetUrl?: string;
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => null);
        if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        const { signature, debateIdPg, debateId, chainId, content, assetUrl } = body as PostEvidenceBody;
        const debateIdPgNum = Number(debateIdPg);
        if (!Number.isInteger(debateIdPgNum)) {
            return NextResponse.json({ error: "debateIdPg must be an integer" }, { status: 400 });
        }
        // Build EIP-712 domain and types server-side to avoid trusting client-provided typed data
        const domain = {
            name: "StakeYourTake",
            version: "1",
            chainId,
            verifyingContract: chainToContractAddress[chainId],
        } as const;
        const types = {
            Evidence: [
                { name: "content", type: "string" },
                { name: "debateId", type: "uint256" },
            ],
        } as const;

        const derivedAddress = await recoverTypedDataAddress({
            domain,
            types,
            primaryType: "Evidence",
            message: { content, debateId: BigInt(debateId) },
            signature,
        });
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

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const debateIdPg = searchParams.get("debateIdPg");
        if (!debateIdPg) {
            return NextResponse.json({ error: "debateIdPg is required" }, { status: 400 });
        }
        const debateIdPgNum = Number(debateIdPg);
        if (!Number.isInteger(debateIdPgNum)) {
            return NextResponse.json({ error: "debateIdPg must be an integer" }, { status: 400 });
        }
        const evidence = await DebateManager.getInstance().getEvidenceByDebateIdPg(debateIdPgNum);
        return NextResponse.json(evidence, { status: 200 });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}