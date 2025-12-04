import { Controller, Get, Query } from '@nestjs/common';
import { QuotesAndRoutesService } from './quotes-and-routes.service';

/**
 * QUOTES AND ROUTES CONTROLLER
 * 
 * HTTP endpoints to explore Chainrails quotes and routing.
 * These are sample endpoints utilizing Chainrails APIs.
 */
@Controller('quotes-and-routes')
export class QuotesAndRoutesController {
  constructor(
    private readonly quotesAndRoutesService: QuotesAndRoutesService,
  ) {}

  /**
   * GET /quotes-and-routes/single
   * Get a quote from a specific bridge
   * 
   * Required params:
   * - tokenIn: Input token address
   * - tokenOut: Output token address
   * - sourceChain: Source chain (e.g., BASE_TESTNET)
   * - destinationChain: Destination chain (e.g., ARBITRUM_TESTNET)
   * - amount: Amount in smallest token units (e.g., 1000000 for 1 USDC)
   * - bridge: Bridge to use (CCTP, ACROSS, GATEWAY, RHINOFI)
   * 
   * Optional params:
   * - recipient: Recipient address
   */
  @Get('single')
  async getSingleQuote(
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('sourceChain') sourceChain: string,
    @Query('destinationChain') destinationChain: string,
    @Query('amount') amount: string,
    @Query('bridge') bridge: string,
    @Query('recipient') recipient?: string,
  ) {
    return this.quotesAndRoutesService.getSingleQuote({
      tokenIn,
      tokenOut,
      sourceChain,
      destinationChain,
      amount,
      bridge,
      recipient,
    });
  }

  /**
   * GET /quotes-and-routes/multiple
   * Compare quotes from all available bridges
   * 
   * Required params: same as /single except no bridge
   * Optional params:
   * - excludeBridges: Comma-separated bridges to exclude (e.g., GATEWAY,CCTP)
   */
  @Get('multiple')
  async getMultipleQuotes(
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('sourceChain') sourceChain: string,
    @Query('destinationChain') destinationChain: string,
    @Query('amount') amount: string,
    @Query('recipient') recipient?: string,
    @Query('excludeBridges') excludeBridges?: string,
  ) {
    return this.quotesAndRoutesService.getMultipleQuotes({
      tokenIn,
      tokenOut,
      sourceChain,
      destinationChain,
      amount,
      recipient,
      excludeBridges: excludeBridges?.split(','),
    });
  }

  /**
   * GET /quotes-and-routes/best
   * Get the best (cheapest) quote automatically
   */
  @Get('best')
  async getBestQuote(
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('sourceChain') sourceChain: string,
    @Query('destinationChain') destinationChain: string,
    @Query('amount') amount: string,
    @Query('recipient') recipient?: string,
    @Query('excludeBridges') excludeBridges?: string,
  ) {
    return this.quotesAndRoutesService.getBestQuote({
      tokenIn,
      tokenOut,
      sourceChain,
      destinationChain,
      amount,
      recipient,
      excludeBridges: excludeBridges?.split(','),
    });
  }

  /**
   * GET /quotes-and-routes/optimal-route
   * Get optimal route with full routing information
   */
  @Get('optimal-route')
  async findOptimalRoute(
    @Query('tokenIn') tokenIn: string,
    @Query('tokenOut') tokenOut: string,
    @Query('sourceChain') sourceChain: string,
    @Query('destinationChain') destinationChain: string,
    @Query('amount') amount: string,
    @Query('recipient') recipient?: string,
  ) {
    return this.quotesAndRoutesService.findOptimalRoute({
      tokenIn,
      tokenOut,
      sourceChain,
      destinationChain,
      amount,
      recipient,
    });
  }

  /**
   * GET /quotes-and-routes/supported-bridges
   * Check which bridges support a specific route
   */
  @Get('supported-bridges')
  async getSupportedBridges(
    @Query('sourceChain') sourceChain: string,
    @Query('destinationChain') destinationChain: string,
  ) {
    return this.quotesAndRoutesService.getSupportedBridges({
      sourceChain,
      destinationChain,
    });
  }

  /**
   * GET /quotes-and-routes/multi-source
   * Get quotes from ALL possible source chains to a destination
   * (Find the cheapest source chain to transfer from)
   */
  @Get('multi-source')
  async getMultiSourceQuotes(
    @Query('destinationChain') destinationChain: string,
    @Query('amount') amount: string,
    @Query('tokenOut') tokenOut: string,
    @Query('recipient') recipient?: string,
  ) {
    return this.quotesAndRoutesService.getMultiSourceQuotes({
      destinationChain,
      amount,
      tokenOut,
      recipient,
    });
  }
}
