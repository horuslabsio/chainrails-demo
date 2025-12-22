import { Controller, Get, Post, Body, Param, Headers, Query } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * COMPLETE TRANSFER APP CONTROLLER
 * 
 * HTTP endpoints for the complete transfer flow.
 * These endpoints demonstrate how to integrate Chainrails into your application.
 * 
 * Endpoints:
 * - POST /app/options - Get multi-source transfer options
 * - POST /app/transfer - Create a transfer intent
 * - GET /app/status/:id - Get transfer status
 * - POST /app/webhook - Receive webhook events
 */
@Controller('app')
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * POST /app/options
   * Get all possible source chains for a transfer
   * 
   * Body params:
   * - destinationChain: Where tokens are going (e.g., ARBITRUM_TESTNET)
   * - amount: Amount to transfer (human-readable, e.g., "10" for 10 USDC)
   * - tokenOut: Token address on destination
   * - recipient: (Optional) Recipient address
   */
  @Post('options')
  async getTransferOptions(
    @Body('destinationChain') destinationChain: string,
    @Body('amount') amount: string,
    @Body('tokenOut') tokenOut: string,
    @Body('recipient') recipient?: string,
  ) {
    return this.appService.getTransferOptions({
      destinationChain,
      amount,
      tokenOut,
      recipient,
    });
  }

  /**
   * POST /app/transfer
   * Create a transfer intent from selected source
   * 
   * Body params:
   * - sourceChain: Selected source chain
   * - destinationChain: Destination chain
   * - amount: Amount in smallest units (e.g., 1000000 for 1 USDC)
   * - tokenIn: Token address on source chain
   * - recipient: Recipient address
   * - sender: (Optional) Sender address
   * - refundAddress: (Optional) Refund address
   * - metadata: (Optional) Custom metadata
   */
  @Post('transfer')
  async createTransfer(
    @Body('sourceChain') sourceChain: string,
    @Body('destinationChain') destinationChain: string,
    @Body('amount') amount: string,
    @Body('tokenIn') tokenIn: string,
    @Body('recipient') recipient: string,
    @Body('sender') sender: string,
    @Body('refundAddress') refundAddress: string,
    @Body('metadata') metadata?: Record<string, any>,
  ) {
    return this.appService.createTransfer({
      sourceChain,
      destinationChain,
      amount,
      tokenIn,
      recipient,
      sender,
      refundAddress,
      metadata,
    });
  }

  /**
   * GET /app/status/:id
   * Get current status of a transfer
   * 
   * Path params:
   * - id: Intent ID
   */
  @Get('status/:id')
  async getTransferStatus(@Param('id') id: string) {
    return this.appService.getTransferStatus(parseInt(id, 10));
  }

  /**
   * POST /app/webhook
   * Receive webhook events from Chainrails
   * 
   * This is where Chainrails will send real-time updates.
   * In production, you should verify the HMAC signature!
   * 
   * Headers:
   * - X-Chainrails-Signature: HMAC signature
   * - X-Chainrails-Event-Type: Event type
   * - X-Chainrails-Event-ID: Event ID
   * - X-Chainrails-Timestamp: Unix timestamp
   */
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-chainrails-signature') signature: string,
    @Headers('x-chainrails-timestamp') timestamp: string,
    @Headers('x-chainrails-event-type') eventType?: string,
    @Headers('x-chainrails-event-id') eventId?: string,
  ) {
    // Convert timestamp string to number
    const timestampNumber = parseInt(timestamp, 10);

    const result = this.appService.handleWebhookEvent(
      payload,
      signature,
      timestampNumber,
    );
    
    // Always return 200 OK to acknowledge receipt
    return {
      received: true,
      eventId: result.eventId,
      eventType: result.eventType,
    };
  }
}