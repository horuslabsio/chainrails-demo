import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * QUOTES AND ROUTES SERVICE
 * 
 * Purpose: Get realtime quotes and optimal routes for cross-chain transfers
 * 
 * You'll learn:
 * - Get a single quote from a specific bridge
 * - Compare quotes from multiple bridges
 * - Find the best (cheapest) route automatically
 * - Understand bridge fees and routing
 * 
 * Key Concepts:
 * - Quote: Fee estimate for a transfer
 * - Route: Path from source → destination chain
 * - Bridge: Protocol that handles the cross-chain transfer (CCTP, Across, etc.)
 */
@Injectable()
export class QuotesAndRoutesService {
  private readonly logger = new Logger(QuotesAndRoutesService.name);
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
   * Example 1: Get a Quote from a Specific Bridge
   * 
   * When you know which bridge you want to use, you can get a quote directly for it.
   * 
   * Use case: You have a preference for a specific bridge
   */
  async getSingleQuote(params: {
    tokenIn: string;
    tokenOut: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    bridge: string;
    recipient?: string;
  }) {
    this.logger.log(
      ` Getting quote from ${params.bridge} for Route: ${params.sourceChain} → ${params.destinationChain}`,
    );

    try {
      const queryParams = new URLSearchParams({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
        bridge: params.bridge,
        ...(params.recipient && { recipient: params.recipient }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/quotes/single?${queryParams}`,
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

      const quote = await response.json();

      this.logger.log(`✅ Quote received from ${params.bridge}`);

      return quote;
    } catch (error) {
      this.logger.error(
        `❌ Failed to get quote from ${params.bridge}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Example 2: Get Quotes from Multiple Bridges
   * 
   * Compare fees across all available bridges to see your options.
   * 
   * Use case: You want to compare fees and choose manually
   * 
   * @param excludeBridges - Optional array of bridges to exclude from comparison
   */
  async getMultipleQuotes(params: {
    tokenIn: string;
    tokenOut: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    recipient?: string;
    excludeBridges?: string[];
  }) {
    this.logger.log('Comparing quotes from all available bridges...');
    this.logger.log(
      `   Route: ${params.sourceChain} → ${params.destinationChain}`,
    );

    try {
      const queryParams = new URLSearchParams({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
        ...(params.recipient && { recipient: params.recipient }),
        ...(params.excludeBridges && {
          excludeBridges: params.excludeBridges.join(','),
        }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/quotes/multiple?${queryParams}`,
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

      const quotes = await response.json();

      this.logger.log(`✅ Received ${quotes.length} quotes`);

      return quotes;
    } catch (error) {
      this.logger.error('❌ Failed to get multiple quotes:', error.message);
      throw error;
    }
  }

  /**
   * Example 3: Get the Best Quote
   * 
   * Let Chainrails automatically find the cheapest route for you.
   * 
   * Use case: You want the best price without manually comparing
   */
  async getBestQuote(params: {
    tokenIn: string;
    tokenOut: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    recipient?: string;
    excludeBridges?: string[];
  }) {
    this.logger.log(
      `  Finding the best (cheapest) quote for route: ${params.sourceChain} → ${params.destinationChain}`,
    );

    try {
      const queryParams = new URLSearchParams({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
        ...(params.recipient && { recipient: params.recipient }),
        ...(params.excludeBridges && {
          excludeBridges: params.excludeBridges.join(','),
        }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/quotes/best?${queryParams}`,
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

      const bestQuote = await response.json();

      return bestQuote;
    } catch (error) {
      this.logger.error('❌ Failed to get best quote:', error.message);
      throw error;
    }
  }

  /**
   * Example 4: Find Optimal Route (Quote + Route Info)
   * 
   * Get both the best quote AND routing information in one call.
   * This is what you'll use when creating an intent.
   * 
   * Returns:
   * - Quote details (fees)
   * - Bridge to use
   * - Bridge address
   * - Any extra data needed for the transfer
   */
  async findOptimalRoute(params: {
    tokenIn: string;
    tokenOut: string;
    sourceChain: string;
    destinationChain: string;
    amount: string;
    recipient?: string;
  }) {
    this.logger.log(
      `  Finding optimal route for Route: ${params.sourceChain} → ${params.destinationChain}`,
    );

    try {
      const queryParams = new URLSearchParams({
        tokenIn: params.tokenIn,
        tokenOut: params.tokenOut,
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
        amount: params.amount,
        ...(params.recipient && { recipient: params.recipient }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/router/optimal-route?${queryParams}`,
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

      const route = await response.json();

      this.logger.log(`✅ Optimal route found!`);
      this.logger.log(`   Bridge: ${route.bridgeToUse}`);
      this.logger.log(`   Bridge Address: ${route.bridgeAddress}`);
      this.logger.log(`   Total Fee: ${route.totalFees}`);

      return route;
    } catch (error) {
      this.logger.error('❌ Failed to find optimal route:', error.message);
      throw error;
    }
  }

  /**
   * Example 5: Get Supported Bridges for a Route
   * 
   * Check which bridges support a particular route.
   */
  async getSupportedBridges(params: {
    sourceChain: string;
    destinationChain: string;
  }) {
    this.logger.log(
      `  Checking supported bridges for Route: ${params.sourceChain} → ${params.destinationChain}`,
    );

    try {
      const queryParams = new URLSearchParams({
        sourceChain: params.sourceChain,
        destinationChain: params.destinationChain,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/router/supported-bridges/route?${queryParams}`,
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

      this.logger.log(
        `✅ Found ${result.routeInfo.bridgeCount} supported bridges`,
      );

      if (result.supportedBridges.length > 0) {
        this.logger.log(
          `   Bridges: ${result.supportedBridges.join(', ')}`,
        );
      } else {
        this.logger.warn('  No bridges support this route');
      }

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to get supported bridges:', error.message);
      throw error;
    }
  }

  /**
   * Example 6: Get Multi-Source Quotes
   * 
   * Find the cheapest way to reach your destination from ANY supported source chain.
   * This is useful when you want to show users all the available source chain options so they can pick the cheapest one.
   * 
   * Use case: User has tokens on multiple chains, wants to know which chain gives the best rate, and decide which to pay from.
   * 
   * Returns:
   * - Quotes from ALL possible source chains
   * - Same-chain options included
   * - Cheapest option highlighted
   * 
   * Why this matters:
   * - Sometimes transferring from a different chain is cheaper due to lower fees
   * - Same-chain transfers are included as they have no bridging fees
   * - Helps users make informed decisions about which wallet to use
   */
  async getMultiSourceQuotes(params: {
    destinationChain: string;
    amount: string;
    tokenOut: string;
    recipient?: string;
  }) {
    this.logger.log(
      `Getting quotes from ALL possible source chains to ${params.destinationChain}`,
    );

    try {
      // Build query parameters
      const queryParams = new URLSearchParams({
        destinationChain: params.destinationChain,
        amount: params.amount,
        tokenOut: params.tokenOut,
        ...(params.recipient && { recipient: params.recipient }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/quotes/multi-source?${queryParams}`,
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

      this.logger.log(`✅ Received quotes from ${result.quotes.length} source chains`);

      return result;
    } catch (error) {
      this.logger.error('❌ Failed to get multi-source quotes:', error.message);
      throw error;
    }
  }
}
