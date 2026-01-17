import { Chainrails, crapi } from "@chainrails/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { destinationChain, token, amount, recipient } = await request.json();

    console.log({
      amount,
      recipient,
      destinationChain,
      token,
    });

    Chainrails.config({
      api_key: process.env.CHAINRAILS_API_KEY || "",
      env: "production",
    });

    const session = await crapi.auth.getSessionToken({
      amount,
      recipient,
      destinationChain,
      token,
    });

    return NextResponse.json(session);
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
