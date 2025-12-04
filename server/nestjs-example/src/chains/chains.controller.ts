import { Controller, Get, Param } from '@nestjs/common';
import { ChainsService } from './chains.service';

/**
 * CHAINS CONTROLLER
 * 
 * HTTP endpoints to explore Chainrails supported chains.
 * These are example endpoints for your backend application.
 * 
 * Try these in your browser or Postman:
 * - GET http://localhost:3000/chains
 * - GET http://localhost:3000/chains/environment/testnet
 * - GET http://localhost:3000/chains/ETHEREUM_MAINNET/tokens
 */
@Controller('chains')
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  /**
   * GET /chains
   * Returns all supported chains
   */
  @Get()
  async getAllChains() {
    return this.chainsService.getAllChains();
  }

  /**
   * GET /chains/environment/:env
   * Filter chains by environment (testnet or mainnet)
   * 
   * Examples:
   * - /chains/environment/testnet
   * - /chains/environment/mainnet
   */
  @Get('environment/:env')
  async getChainsByEnvironment(@Param('env') env: 'testnet' | 'mainnet') {
    return this.chainsService.getChainsByEnvironment(env);
  }

  /**
   * GET /chains/selector
   * Get organized chain data for building UI selectors
   */
  @Get('selector')
  async getChainSelectorData() {
    return this.chainsService.getChainSelectorData();
  }

  /**
   * GET /chains/:chainName/tokens
   * Get supported tokens for a specific chain
   * 
   * Example: /chains/ETHEREUM_MAINNET/tokens
   */
  @Get(':chainName/tokens')
  async getSupportedTokens(@Param('chainName') chainName: string) {
    return this.chainsService.getSupportedTokens(chainName);
  }
}
