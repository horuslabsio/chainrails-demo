import "dotenv/config";
import express, { Request, Response } from "express";
import { createHmac } from "crypto";
import { crapi, Chainrails } from "@chainrails/sdk";

declare const process: any;

// In-memory webhook events storage (intent_address -> events[])
const webhookEvents = new Map<string, any[]>();

async function start() {
  // Configure SDK
  await Chainrails.config({
    api_key: process.env.CHAINRAILS_API_KEY || "demo_key",
    env: (process.env.CHAINRAILS_ENV as any) || "production",
  });

  const app = express();
  app.use(express.json());

  // POST /app/options — multi-source transfer options
  app.post("/app/options", async (req: Request, res: Response) => {
    const { destinationChain, amount, tokenOut, recipient } = req.body;

    try {
      const multiSourceQuotes = await crapi.quotes.getAll({
        destinationChain,
        amount,
        tokenOut,
        recipient,
      } as any);

      const options = (multiSourceQuotes?.quotes || []).map((quote: any, index: number) => {
        const isSameChain = quote.sourceChain === destinationChain;
        return {
          index: index + 1,
          sourceChain: quote.sourceChain,
          type: isSameChain ? "same-chain" : "cross-chain",
          fee: quote.bestQuote?.totalFee || "0",
          feeFormatted: quote.bestQuote?.totalFeeFormatted || "0",
          bridge: isSameChain ? "None (same chain)" : quote.bestQuote?.route?.bridgeToUse || "Auto-selected",
          recommended: index === 0,
          tokenIn: quote.bestQuote?.route?.tokenIn || tokenOut,
          amountInSmallestUnit: quote.bestQuote?.amount || 0,
        };
      });

      return res.json({
        destinationChain,
        amount,
        options,
        cheapestOption: options[0] || null,
        totalOptions: options.length,
      });
    } catch (err) {
      console.warn("options failed", (err as any)?.message ?? err);
      return res.status(500).json({ error: "Failed to fetch options", details: String(err) });
    }
  });

  // POST /app/transfer — create intent
  app.post("/app/transfer", async (req: Request, res: Response) => {
    const { sourceChain, destinationChain, amount, tokenIn, recipient, sender, refundAddress, metadata } = req.body;

    try {
      const intent = await crapi.intents.create({
        sender: sender || "0x0000000000000000000000000000000000000000",
        amount: amount || 0,
        tokenIn,
        source_chain: sourceChain,
        destination_chain: destinationChain,
        recipient,
        refund_address: refundAddress,
        metadata: { ...(metadata || {}), createdVia: "sdk-demo-express" },
      } as any);

      // initialize webhook storage for this intent
      if (intent?.intent_address) {
        webhookEvents.set(intent.intent_address, []);
      }

      return res.json({
        intent,
        fundingInstructions: {
          address: intent?.intent_address || null,
          amount: intent?.totalAmount || null,
          network: sourceChain,
          deadline: intent?.expires_at || null,
        },
        tracking: {
          intentId: intent?.id || null,
          intentAddress: intent?.intent_address || null,
        },
      });
    } catch (err) {
      console.warn("createTransfer failed", (err as any)?.message ?? err);
      return res.status(500).json({ error: "Failed to create intent", details: String(err) });
    }
  });

  // GET /app/status/:id — get transfer status
  app.get("/app/status/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    try {
      const intent = await crapi.intents.getById(String(id));
      const events = webhookEvents.get(intent.intent_address) || [];

      const stages: Record<string, string> = {
        PENDING: "Waiting for funding",
        FUNDED: "Funded, processing starting...",
        INITIATED: "Transfer in progress",
        COMPLETED: "Transfer completed!",
        EXPIRED: "Intent expired",
        REFUNDED: "Transfer refunded",
      };

      const statusMessage = stages[intent.intent_status] || intent.intent_status;

      return res.json({
        intent,
        webhookEvents: events,
        statusMessage,
        isComplete: intent.intent_status === "COMPLETED",
        isFailed: ["EXPIRED", "REFUNDED"].includes(intent.intent_status),
      });
    } catch (err) {
      console.warn("getTransferStatus failed", (err as any)?.message ?? err);
      return res.status(500).json({ error: "Failed to fetch intent status", details: String(err) });
    }
  });

  // POST /app/webhook — receive webhook events
  app.post("/app/webhook", async (req: Request, res: Response) => {
    const payload = req.body;
    const signature = req.headers["x-chainrails-signature"] as string | undefined;
    const timestampHeader = req.headers["x-chainrails-timestamp"] as string | undefined;
    const timestamp = timestampHeader ? parseInt(timestampHeader, 10) : Math.floor(Date.now() / 1000);

    // Verify signature
    const webhookSecret = process.env.CHAINRAILS_WEBHOOK_SECRET;
    if (webhookSecret) {
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - timestamp) > 300) {
        return res.status(400).json({ error: "Invalid timestamp" });
      }

      const body = JSON.stringify(payload);
      const message = `${timestamp}.${body}`;
      const hmac = createHmac("sha256", webhookSecret);
      hmac.update(message);
      const computed = `sha256=${hmac.digest("hex")}`;

      if (computed !== signature) {
        console.warn("Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }
    } else {
      console.warn("CHAINRAILS_WEBHOOK_SECRET not set — skipping verification (dev only)");
    }

    // store event
    const intentAddress = payload?.data?.intent_address;
    if (intentAddress) {
      const arr = webhookEvents.get(intentAddress) || [];
      arr.push({
        id: payload.id,
        type: payload.type,
        created_at: payload.created_at,
        data: payload.data,
        receivedAt: new Date().toISOString(),
      });
      webhookEvents.set(intentAddress, arr);
    }

    return res.json({ received: true, eventId: payload.id, eventType: payload.type, intentAddress });
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
  app.listen(port, () => console.log(`sdk-demo express server listening on http://localhost:${port}`));
}

start().catch((err) => {
  console.error("Failed to start demo server", err);
  process.exit(1);
});
