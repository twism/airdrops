import { NextRequest, NextResponse } from "next/server";
import { validateAddress } from "@/lib/address";
import { checkEligibility } from "@/lib/eligibility";
import type { Chain } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, chains } = body as {
      address?: string;
      chains?: Chain[];
    };

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid address" },
        { status: 400 }
      );
    }

    if (!chains || !Array.isArray(chains) || chains.length === 0) {
      return NextResponse.json(
        { error: "Missing or empty chains array" },
        { status: 400 }
      );
    }

    const validation = validateAddress(address.trim());
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    const results = await checkEligibility(address.trim(), chains);

    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
