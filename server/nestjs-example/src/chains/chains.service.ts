import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * CHAINS SERVICE
 * 
 * Purpose: Query supported blockchains and their configurations from Chainrails
 * 
 * You'll learn:
 * - Get list of all supported chains
 * - Filter chains by environment (testnet/mainnet)
 * - Get supported tokens for a specific chain
 */
@Injectable()
export class ChainsService {
  private readonly logger = new Logger(ChainsService.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiBaseUrl =
      this.configService.get<string>('CHAINRAILS_API_URL') ||
      'https://api.chainrails.io/api/v1';
    this.apiKey = this.configService.get<string>('CHAINRAILS_API_KEY');

    if (!this.apiKey) {
      throw new Error(
        'CHAINRAILS_API_KEY is required. Get one from your Chainrails dashboard.',
      );
    }
  }

  /**
   * Example 1: Get All Supported Chains
   * 
   * This is the simplest query - returns all blockchain networks
   * that Chainrails supports for cross-chain transfers.
   * 
   * Returns: Array of chain objects
   */
  async getAllChains() {
    this.logger.log('Fetching all supported chains...');

    try {
      const response = await fetch(`${this.apiBaseUrl}/chains`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const chains = await response.json();

      this.logger.log(`✅ Found ${chains.length} supported chains`);

      // Log a sample for visibility
      if (chains.length > 0) {
        this.logger.log('Sample chain:', chains[0]);
      }

      return chains;
    } catch (error) {
      this.logger.error('❌ Failed to fetch chains:', error.message);
      throw error;
    }
  }

  /**
   * Example 2: Filter Chains by Network Type
   * 
   * Separate testnet chains from mainnet chains using API query parameters.
   * 
   * Testnet chains: Use for development/testing (free, no real money)
   * Mainnet chains: Use for production (real funds)
   */
  async getChainsByEnvironment(environment: 'testnet' | 'mainnet') {
    this.logger.log(`Fetching ${environment} chains...`);

    try {
      // Use the network query parameter to filter on the API side
      const response = await fetch(
        `${this.apiBaseUrl}/chains?network=${environment}`,
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

      const chains = await response.json();

      this.logger.log(`✅ Found ${chains.length} ${environment} chains`);

      return chains;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch ${environment} chains:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Example 3: Get Supported Tokens for a Chain
   * 
   * Find all tokens available on a specific chain.
   * 
   * @param chainName - The chain to query (e.g., 'ETHEREUM_MAINNET')
   */
  async getSupportedTokens(chainName: string) {
    this.logger.log(`Fetching supported tokens for ${chainName}...`);

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/chains/${chainName}/tokens`,
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

      const tokens = await response.json();

      this.logger.log(
        `✅ Found ${tokens.length} supported tokens on ${chainName}`,
      );

      if (tokens.length > 0) {
        this.logger.log('Sample token:', tokens[0]);
      }

      return tokens;
    } catch (error) {
      this.logger.error(
        `❌ Failed to fetch tokens for ${chainName}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * PRACTICAL EXAMPLE: Build a Chain Selector UI
   * 
   * This combines multiple queries to provide all data needed
   * for a user-facing chain selection dropdown.
   * 
   * Returns chains organized by environment (mainnet/testnet),
   * ready for UI rendering.
   */
  async getChainSelectorData() {
    this.logger.log('Building chain selector data...');

    const [mainnetChains, testnetChains] = await Promise.all([
      this.getChainsByEnvironment('mainnet'),
      this.getChainsByEnvironment('testnet'),
    ]);

    const result = {
      mainnet: mainnetChains,
      testnet: testnetChains,
    };

    this.logger.log('✅ Chain selector data ready');
    this.logger.log(`   Mainnet chains: ${result.mainnet.length}`);
    this.logger.log(`   Testnet chains: ${result.testnet.length}`);

    return result;
  }
}
