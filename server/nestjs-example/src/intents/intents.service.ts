import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * INTENTS SERVICE
 * 
 * Purpose: Create and manage transfer intents
 * 
 * You'll learn:
 * - Creating an transfer intent
 * - Track intent status in real-time
 * - Handle the complete intent lifecycle
 * - Manually trigger processing when needed
 * 
 * Key Concepts:
 * - Intent: A transfer instruction
 * - Intent Lifecycle: PENDING → FUNDED → INITIATED → COMPLETED
 * - Intent Address: Unique blockchain address for each intent
 * - Expiration: Intents expire if not funded within the time limit
 */
@Injectable()
export class IntentsService {
  private readonly logger = new Logger(IntentsService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiBaseUrl =
      this.configService.get<string>('CHAINRAILS_API_URL') ||
      'https://api.chainrails.io/api/v1';
    this.apiKey = this.configService.get<string>('CHAINRAILS_API_KEY');

    if (!this.apiKey) {
      throw new Error('CHAINRAILS_API_KEY is required');
    }
  }

  /**
   * Example 1: Create a Cross-Chain Transfer Intent
   * 
   * This is the first step in executing a cross-chain transfer.
   * After creating an intent, the user needs to fund it by sending tokens to the intent_address.
   * 
   * Flow:
   * 1. Create intent (this method)
   * 2. User sends tokens to intent_address
   * 3. Chainrails detects funding and processes the transfer
   * 4. Tokens arrive at destination
   * 
   * Use case: User wants to transfer USDC from Base to Arbitrum
   */
  async createIntent(params: {
    sender: string;
    amount: number;
    tokenIn: string;
    sourceChain: string;
    destinationChain: string;
    recipient: string;
    refundAddress: string;
    metadata?: Record<string, any>;
  }) {
    this.logger.log(
      `Creating cross-chain transfer intent...`,
    );

    try {
      // IMPORTANT: amount should be the INITIAL amount (what user wants to send)
      const requestBody: any = {
        sender: params.sender,
        amount: params.amount,
        tokenIn: params.tokenIn,
        source_chain: params.sourceChain,
        destination_chain: params.destinationChain,
        recipient: params.recipient,
        refund_address: params.refundAddress,
        metadata: params.metadata || {},
      };

      const response = await fetch(`${this.apiBaseUrl}/intents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`,
        );
      }

      const intent = await response.json();

      return intent;
    } catch (error) {
      this.logger.error(`❌ Failed to create intent:`, error.message);
      throw error;
    }
  }

  /**
   * Example 2: Get Intent Status
   * 
   * Track the status of an intent to see if it's been funded, initiated, or completed.
   * 
   * Intent Statuses:
   * - PENDING: Intent created, waiting for funding
   * - FUNDED: User sent tokens to intent address
   * - INITIATED: Chainrails started processing the transfer
   * - COMPLETED: Tokens arrived at destination
   * - EXPIRED: Intent expired before being funded
   * - REFUNDED: Something went wrong (user gets refund)
   * 
   * Use case: Display/Track transfer progress
   */
  async getIntentStatus(intentId: number) {
    this.logger.log(`Checking status for intent #${intentId}...`);

    try {
      const response = await fetch(`${this.apiBaseUrl}/intents/${intentId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const intent = await response.json();

      return intent;
    } catch (error) {
      this.logger.error(`❌ Failed to get intent status:`, error.message);
      throw error;
    }
  }

  /**
   * Example 3: Get All User Intents
   * 
   * Retrieve all intents created by a specific user.
   * Useful for showing transfer history in your app.
   * 
   * Use case: Display user's transaction history
   */
  async getUserIntents(userAddress: string) {
    this.logger.log(`Fetching all intents for user: ${userAddress}...`);

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/intents/user/${userAddress}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const intents = await response.json();

      this.logger.log(`✅ Found ${intents.length} intents for user`);

      return intents;
    } catch (error) {
      this.logger.error(`❌ Failed to get user intents:`, error.message);
      throw error;
    }
  }

  /**
   * Example 4: Get All Intents with Pagination
   * 
   * Retrieve all intents for your application with pagination and filtering.
   * 
   * Use case: Build an admin dashboard to monitor all transfers
   */
  async getAllIntents(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }) {
    this.logger.log(`Fetching all intents...`);

    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await fetch(
        `${this.apiBaseUrl}/intents?${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (params?.status) {
        this.logger.log(`   Filtered by status: ${params.status}`);
      }

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to get all intents:`, error.message);
      throw error;
    }
  }
}
