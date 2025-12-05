import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { ChainsService } from '../chains/chains.service';
import { QuotesAndRoutesService } from '../quotes-and-routes/quotes-and-routes.service';
import { IntentsService } from '../intents/intents.service';

/**
 * COMPLETE TRANSFER APP SERVICE
 * 
 * This is the orchestrator that combines all modules into a complete transfer flow.
 * It demonstrates how to build a production-ready cross-chain transfer application.
 * 
 * What you'll learn:
 * - How to present multi-source options to users
 * - How to create intents with selected sources
 * - How to track transfer status
 * - How to handle webhook events
 * 
 * This service REUSES all previous modules:
 * - ChainsService (for chain info)
 * - QuotesAndRoutesService (for multi-source quotes)
 * - IntentsService (for creating and tracking intents)
 */
@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  
  // In-memory storage for webhook events (demo purposes only)
  // In production, use a database
  private webhookEvents = new Map<string, any[]>();

  constructor(
    private readonly chainsService: ChainsService,
    private readonly quotesService: QuotesAndRoutesService,
    private readonly intentsService: IntentsService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Example 1: Get Transfer Options (Multi-Source Quotes)
   * 
   * This shows users ALL possible source chains they can transfer from.
   * Perfect for cases where users have funds on multiple chains.
   * 
   * Flow:
   * 1. Call multi-source quotes API
   * 2. Format results for user presentation
   * 3. Highlight cheapest option
   * 
   * Use case: User wants to send USDC to Arbitrum, you show them
   * which of their wallets (Base, Starknet, etc.) is cheapest
   */
  async getTransferOptions(params: {
    destinationChain: string;
    amount: string;
    tokenOut: string;
    recipient?: string;
  }) {
    const multiSourceQuotes = await this.quotesService.getMultiSourceQuotes({
      destinationChain: params.destinationChain,
      amount: params.amount,
      tokenOut: params.tokenOut,
      recipient: params.recipient,
    });

    // Format for user presentation
    const options = multiSourceQuotes.quotes.map((quote, index) => {
      const isSameChain = quote.sourceChain === params.destinationChain;
      const isCheapest = index === 0; // First one is cheapest (already sorted)

      return {
        index: index + 1,
        sourceChain: quote.sourceChain,
        type: isSameChain ? 'same-chain' : 'cross-chain',
        fee: quote.bestQuote?.totalFee || '0',
        feeFormatted: quote.bestQuote?.totalFeeFormatted || '0',
        bridge: isSameChain
          ? 'None (same chain)'
          : quote.bestQuote?.route?.bridgeToUse || 'Auto-selected',
        recommended: isCheapest,
      };
    });

    return {
      destinationChain: params.destinationChain,
      amount: params.amount,
      options,
      cheapestOption: options[0],
      totalOptions: options.length,
    };
  }

  /**
   * Example 2: Create Transfer Intent
   * 
   * After user selects their preferred source chain, create the intent.
   * This reuses the intents service to create the transfer.
   * 
   * Flow:
   * 1. Create intent using intents service
   * 2. Initialize webhook tracking
   * 3. Return funding instructions
   * 
   * Use case: User selected "Base → Arbitrum" and wants to proceed
   */
  async createTransfer(params: {
    sourceChain: string;
    destinationChain: string;
    amount: number;
    tokenIn: string;
    recipient: string;
    sender?: string;
    refundAddress?: string;
    metadata?: Record<string, any>;
  }) {
    const intent = await this.intentsService.createIntent({
      sender: params.sender,
      amount: params.amount,
      tokenIn: params.tokenIn,
      sourceChain: params.sourceChain,
      destinationChain: params.destinationChain,
      recipient: params.recipient,
      refundAddress: params.refundAddress,
      metadata: {
        ...params.metadata,
        createdVia: 'complete-demo-app',
      },
    });

    // Initialize webhook event storage for this intent
    this.webhookEvents.set(intent.intent_address, []);

    return {
      intent,
      fundingInstructions: {
        address: intent.intent_address,
        amount: intent.totalAmount,
        network: params.sourceChain,
        deadline: intent.expires_at,
      },
      tracking: {
        intentId: intent.id,
        intentAddress: intent.intent_address
      },
    };
  }

  /**
   * Example 3: Get Transfer Status
   * 
   * Track the progress of a transfer in real-time.
   * Shows current status and any webhook events received.
   * 
   * Flow:
   * 1. Get intent status from API
   * 2. Get webhook events from memory
   * 3. Combine into comprehensive status
   * 
   * Use case: User wants to check if their transfer completed
   */
  async getTransferStatus(intentId: number) {
    const intent = await this.intentsService.getIntentStatus(intentId);
    const webhookEvents = this.webhookEvents.get(intent.intent_address) || [];

    const stages = {
      PENDING: 'Waiting for funding',
      FUNDED: 'Funded, processing starting...',
      INITIATED: 'Transfer in progress',
      COMPLETED: 'Transfer completed!',
      EXPIRED: 'Intent expired',
      REFUNDED: 'Transfer refunded',
    };

    const statusMessage = stages[intent.intent_status] || intent.intent_status;

    return {
      intent,
      webhookEvents,
      statusMessage,
      isComplete: intent.intent_status === 'COMPLETED',
      isFailed: ['EXPIRED', 'REFUNDED'].includes(intent.intent_status),
    };
  }

  /**
   * Example 4: Handle Webhook Event
   * 
   * This is called when Chainrails sends a webhook event.
   * Stores the event and makes it available for status queries.
   * 
   * In production, you should:
   * - Verify the HMAC signature (shown below)
   * - Store in database
   * - Trigger notifications to users
   * - Update your app's state
   * 
   * Use case: Chainrails notifies you that an intent was funded
   */
  handleWebhookEvent(
    payload: any,
    signature: string,
    timestamp: number,
  ) {
    // Verify HMAC signature to ensure webhook is from Chainrails
    const isValid = this.verifyWebhookSignature(payload, signature, timestamp);
    if (!isValid) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    const intentAddress = payload.data?.intent_address;
    if (intentAddress) {
      const events = this.webhookEvents.get(intentAddress) || [];
      events.push({
        id: payload.id,
        type: payload.type,
        created_at: payload.created_at,
        data: payload.data,
        receivedAt: new Date().toISOString(),
      });
      this.webhookEvents.set(intentAddress, events);
    }

    return {
      received: true,
      eventId: payload.id,
      eventType: payload.type,
      intentAddress,
    };
  }

  /**
   * Verify Webhook HMAC Signature
   * 
   * This is a critical security measure to ensure webhooks are from Chainrails.
   * 
   * How it works:
   * 1. Chainrails sends: X-Chainrails-Signature header with format "sha256=<hash>"
   * 2. Chainrails sends: X-Chainrails-Timestamp header with Unix timestamp
   * 3. We compute: HMAC-SHA256(timestamp + "." + body, webhook_secret)
   * 4. We compare our computed signature with the received signature
   * 5. We check timestamp is recent (within 5 minutes) to prevent replay attacks
   * 
   * @param payload - The webhook payload body
   * @param receivedSignature - Signature from X-Chainrails-Signature header
   * @param timestamp - Timestamp from X-Chainrails-Timestamp header
   * @returns true if signature is valid, false otherwise
   */
  private verifyWebhookSignature(
    payload: any,
    receivedSignature: string,
    timestamp: number,
  ): boolean {
    // Get webhook secret from environment variables
    const webhookSecret = this.configService.get<string>('CHAINRAILS_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn(
        'CHAINRAILS_WEBHOOK_SECRET not set. Skipping signature verification. ' +
        'This is OK for development but REQUIRED for production!',
      );
      return true; // Allow in development
    }

    // Step 1: Check timestamp to prevent replay attacks
    // Reject webhooks older than 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(now - timestamp);
    const MAX_TIMESTAMP_AGE = 300; // 5 minutes in seconds

    if (timeDifference > MAX_TIMESTAMP_AGE) {
      this.logger.warn(
        `Webhook timestamp too old. Difference: ${timeDifference}s (max: ${MAX_TIMESTAMP_AGE}s)`,
      );
      return false;
    }

    // Step 2: Compute the expected signature
    // Format: HMAC-SHA256(timestamp + "." + JSON.stringify(payload), secret)
    const payloadString = JSON.stringify(payload);
    const signedPayload = `${timestamp}.${payloadString}`;
    
    const hmac = createHmac('sha256', webhookSecret);
    hmac.update(signedPayload);
    const computedSignature = `sha256=${hmac.digest('hex')}`;

    // Step 3: Compare signatures using timing-safe comparison
    // This prevents timing attacks
    try {
      const receivedBuffer = Buffer.from(receivedSignature);
      const computedBuffer = Buffer.from(computedSignature);

      // Both buffers must be same length
      if (receivedBuffer.length !== computedBuffer.length) {
        return false;
      }

      return timingSafeEqual(receivedBuffer, computedBuffer);
    } catch (error) {
      this.logger.error('Error comparing webhook signatures:', error.message);
      return false;
    }
  }
}
