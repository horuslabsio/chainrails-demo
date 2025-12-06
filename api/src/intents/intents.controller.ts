import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { IntentsService } from './intents.service';

/**
 * INTENTS CONTROLLER
 * 
 * HTTP endpoints to create and manage transfer intents.
 * 
 * Try these endpoints:
 * - POST http://localhost:3000/intents - Create new intent
 * - GET http://localhost:3000/intents/:id - Get intent status
 * - GET http://localhost:3000/intents/user/:address - Get user's intents
 */
@Controller('intents')
export class IntentsController {
  constructor(private readonly intentsService: IntentsService) {}

  /**
   * POST /intents
   * Create a new transfer intent
   * 
   * Required body params:
   * - sender: User's wallet address
   * - amount: Amount to transfer (in smallest units)
   * - tokenIn: Source token address
   * - sourceChain: Source chain (e.g., BASE_TESTNET)
   * - destinationChain: Destination chain (e.g., ARBITRUM_TESTNET)
   * - recipient: Recipient address on destination chain
   * - refundAddress: Address for refunds if transfer fails
   * 
   * Optional body params:
   * - metadata: Custom metadata object
   */
  @Post()
  async createIntent(
    @Body('sender') sender: string,
    @Body('amount') amount: number,
    @Body('tokenIn') tokenIn: string,
    @Body('sourceChain') sourceChain: string,
    @Body('destinationChain') destinationChain: string,
    @Body('recipient') recipient: string,
    @Body('refundAddress') refundAddress: string,
    @Body('metadata') metadata?: Record<string, any>,
  ) {
    return this.intentsService.createIntent({
      sender,
      amount,
      tokenIn,
      sourceChain,
      destinationChain,
      recipient,
      refundAddress,
      metadata,
    });
  }

  /**
   * GET /intents/:id
   * Get status of a specific intent
   * 
   * Path params:
   * - id: Intent ID (number)
   */
  @Get(':id')
  async getIntentStatus(@Param('id') id: string) {
    return this.intentsService.getIntentStatus(parseInt(id, 10));
  }

  /**
   * GET /intents/user/:address
   * Get all intents for a specific user
   * 
   * Path params:
   * - address: User's wallet address
   */
  @Get('user/:address')
  async getUserIntents(@Param('address') address: string) {
    return this.intentsService.getUserIntents(address);
  }

  /**
   * GET /intents
   * Get all intents with pagination
   * 
   * Optional query params:
   * - limit: Number of intents to return (default: 50, max: 100)
   * - offset: Number of intents to skip (default: 0)
   * - status: Filter by status (pending, funded, initiated, completed, etc.)
   */
  @Get()
  async getAllIntents(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    return this.intentsService.getAllIntents({
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      status,
    });
  }
}
