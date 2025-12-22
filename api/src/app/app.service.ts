import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
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
        tokenIn: quote.bestQuote?.route?.tokenIn || params.tokenOut,
        amountInSmallestUnit: quote.bestQuote?.amount || '0',
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
    amount: string;
    tokenIn: string;
    recipient: string;
    sender: string;
    refundAddress: string;
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
   * NB: You must register your webhook URL in the Chainrails dashboard!
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
   * This ensures webhooks are actually from Chainrails and haven't been tampered with.
   */
  private verifyWebhookSignature(
    payload: any,
    signature: string,
    timestamp: number,
  ): boolean {
    const webhookSecret = this.configService.get<string>('CHAINRAILS_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      this.logger.warn('CHAINRAILS_WEBHOOK_SECRET not set. Skipping verification (OK for development, but not recommended).');
      return true;
    }

    // Check timestamp (prevent replay attacks)
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 300) { // 5 minutes
      return false;
    }

    // Compute signature
    const body = JSON.stringify(payload);
    const message = `${timestamp}.${body}`;
    const hmac = createHmac('sha256', webhookSecret);
    hmac.update(message);
    const computed = `sha256=${hmac.digest('hex')}`;

    // Compare
    return computed === signature;
  }
}
