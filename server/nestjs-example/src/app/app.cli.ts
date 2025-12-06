#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AppService } from './app.service';
import * as readline from 'readline';

/**
 * CHAINRAILS INTERACTIVE DEMO CLI - YOU DO NOT NEED TO MODIFY/STUDY THIS FILE
 * 
 * This interactive CLI demonstrates the complete Chainrails transfer flow:
 * 1. Get transfer options (shows all possible source chains)
 * 2. Select your preferred source chain
 * 3. Create the transfer intent
 * 4. Display funding instructions
 * 5. Wait for webhook events and show status updates
 * 
 * Run with: npm run app:demo
 */

interface UserInput {
  destinationChain: string;
  amount: string;
  tokenOut: string;
  tokenDecimals: number;
  recipient: string;
  sender: string;
  refundAddress: string;
  selectedSourceIndex?: number;
}

class ChainrailsCLI {
  private rl: readline.Interface;
  private appService: AppService;

  constructor(appService: AppService) {
    this.appService = appService;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Prompts user for input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Displays a styled header
   */
  private header(text: string) {
    const line = '='.repeat(70);
    console.log(`\n${line}`);
    console.log(`🚀 ${text}`);
    console.log(`${line}\n`);
  }

  /**
   * Displays a styled section
   */
  private section(text: string) {
    console.log(`\n${'─'.repeat(70)}`);
    console.log(`📍 ${text}`);
    console.log(`${'─'.repeat(70)}\n`);
  }

  /**
   * Main CLI flow
   */
  async run() {
    try {
      this.header('CHAINRAILS INTERACTIVE DEMO');

      console.log('Welcome to the Chainrails transfer demo!');
      console.log('This interactive guide will walk you through creating a same/cross-chain transfer.\n');

      // Step 1: Collect user input
      const input = await this.collectUserInput();

      // Step 2: Get transfer options
      this.section('STEP 1: Getting Transfer Options');
      const options = await this.getTransferOptions(input);

      // Step 3: Let user select source
      this.section('STEP 2: Select Source Chain');
      const selectedOption = await this.selectSource(options.options);

      // Step 4: Create transfer
      this.section('STEP 3: Creating Transfer Intent');
      const transfer = await this.createTransfer(input, selectedOption);

      // Step 5: Display funding instructions
      this.section('STEP 4: Funding Instructions');
      this.displayFundingInstructions(transfer);

      // Step 6: Monitor status
      this.section('STEP 5: Monitoring Transfer Status');
      await this.monitorTransferStatus(transfer.intent.id);

      console.log('\n✅ Demo completed successfully!');
      console.log('🎉 You now know how to integrate Chainrails into your application!\n');

      this.rl.close();
      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      this.rl.close();
      process.exit(1);
    }
  }

  /**
   * Collects initial user input
   */
  private async collectUserInput(): Promise<UserInput> {
    console.log('Let\'s set up your transfer. You\'ll need:\n');
    console.log('  • Destination chain (where tokens are going)');
    console.log('  • Amount to transfer');
    console.log('  • Token address and decimals');
    console.log('  • Recipient address');
    console.log('  • Sender address (your wallet)\n');

    const destinationChain = await this.prompt(
      '1️⃣  Destination chain (e.g., ARBITRUM_TESTNET): ',
    );

    const amount = await this.prompt(
      '2️⃣  Amount to transfer (e.g., 10 for 10 USDC): ',
    );

    const tokenOut = await this.prompt(
      '3️⃣  Token address on destination: ',
    );

    const tokenDecimalsStr = await this.prompt(
      '4️⃣  Token decimals (e.g., 6 for USDC, 18 for most tokens): ',
    );

    const recipient = await this.prompt(
      '5️⃣  Recipient address: ',
    );

    const sender = await this.prompt(
      '6️⃣  Sender address (your wallet): ',
    );

    const senderFinal = sender || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7';

    console.log(`\n💡 Refund address will be set to sender: ${senderFinal}\n`);

    return {
      destinationChain: destinationChain || 'ARBITRUM_TESTNET',
      amount: amount || '10',
      tokenOut: tokenOut || '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
      tokenDecimals: parseInt(tokenDecimalsStr, 10) || 6,
      recipient: recipient || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
      sender: senderFinal,
      refundAddress: senderFinal,
    };
  }

  /**
   * Gets transfer options from all possible source chains
   */
  private async getTransferOptions(input: UserInput) {
    console.log('🔍 Fetching transfer options...\n');

    const options = await this.appService.getTransferOptions({
      destinationChain: input.destinationChain,
      amount: input.amount,
      tokenOut: input.tokenOut,
      recipient: input.recipient,
    });

    console.log(`✅ Found ${options.totalOptions} transfer option(s):\n`);

    // Display options in a table format
    options.options.forEach((option) => {
      const prefix = option.recommended ? '⭐' : '  ';
      const tag = option.recommended ? ' (CHEAPEST)' : '';
      console.log(`${prefix} ${option.index}. ${option.sourceChain}${tag}`);
      console.log(`     Type: ${option.type}`);
      console.log(`     Fee: ${option.feeFormatted} USDC`);
      console.log(`     Bridge: ${option.bridge}`);
      console.log('');
    });

    return options;
  }

  /**
   * Lets user select a source chain
   */
  private async selectSource(options: any[]): Promise<any> {
    const selection = await this.prompt(
      `Select source chain (1-${options.length}): `,
    );

    const index = parseInt(selection, 10) - 1;

    if (isNaN(index) || index < 0 || index >= options.length) {
      throw new Error('Invalid selection');
    }

    const selected = options[index];
    console.log(`\n✅ Selected: ${selected.sourceChain}`);
    console.log(`   Fee: ${selected.feeFormatted} USDC`);
    console.log(`   Type: ${selected.type}\n`);

    return selected;
  }

  /**
   * Creates the transfer intent
   */
  private async createTransfer(input: UserInput, selectedOption: any) {
    console.log('📝 Creating transfer intent...\n');

    // Convert amount to smallest units using token decimals
    const amountInSmallestUnits = parseFloat(input.amount) * Math.pow(10, input.tokenDecimals);

    const transfer = await this.appService.createTransfer({
      sourceChain: selectedOption.sourceChain,
      destinationChain: input.destinationChain,
      amount: amountInSmallestUnits,
      tokenIn: selectedOption.tokenIn,
      recipient: input.recipient,
      sender: input.sender,
      refundAddress: input.refundAddress,
    });

    console.log('✅ Intent created successfully!\n');
    console.log(`   Intent ID: ${transfer.intent.id}`);
    console.log(`   Intent Address: ${transfer.intent.intent_address}`);
    console.log(`   Status: ${transfer.intent.intent_status}\n`);

    return transfer;
  }

  /**
   * Displays funding instructions
   */
  private displayFundingInstructions(transfer: any) {
    const box = '╔' + '═'.repeat(68) + '╗';
    const boxEnd = '╚' + '═'.repeat(68) + '╝';

    console.log(box);
    console.log('║' + ' '.repeat(20) + '💰 FUNDING INSTRUCTIONS' + ' '.repeat(25) + '║');
    console.log(boxEnd);
    console.log('');
    console.log(`📍 Send exactly ${transfer.fundingInstructions.amount} to:`);
    console.log(`   ${transfer.fundingInstructions.address}`);
    console.log('');
    console.log(`🌐 Network: ${transfer.fundingInstructions.network}`);
    console.log('');
    console.log(`⏰ Deadline: ${transfer.fundingInstructions.deadline}`);
    console.log('');
    console.log('💡 Once you send, Chainrails will automatically:');
    console.log('   1. Detect your transaction');
    console.log('   2. Bridge your tokens');
    console.log('   3. Deliver to recipient');
    console.log('');
  }

  /**
   * Monitors transfer status with periodic checks
   */
  private async monitorTransferStatus(intentId: number) {
    console.log('🔄 Monitoring transfer status...');
    console.log('   (In production, webhook events will notify you automatically)\n');

    let isComplete = false;
    let attempts = 0;
    const maxAttempts = 15; // 3:45 mins max (15 seconds * 15)

    while (!isComplete && attempts < maxAttempts) {
      attempts++;

      try {
        const status = await this.appService.getTransferStatus(intentId);

        // Display status update
        console.log(`[${new Date().toLocaleTimeString()}] Status: ${status.statusMessage}`);

        // Display webhook events if any
        if (status.webhookEvents.length > 0) {
          const latestEvent = status.webhookEvents[status.webhookEvents.length - 1];
          console.log(`   📨 Latest event: ${latestEvent.type}`);
        }

        // Check if complete
        if (status.isComplete) {
          console.log('\n🎉 Transfer completed successfully!');
          if (status.intent.tx_hash) {
            console.log(`📝 Transaction hash: ${status.intent.tx_hash}`);
          }
          isComplete = true;
        } else if (status.isFailed) {
          console.log(`\n❌ Transfer failed: ${status.statusMessage}`);
          isComplete = true;
        } else {
          // Wait 15 seconds before next check
          await new Promise((resolve) => setTimeout(resolve, 15000));
        }
      } catch (error) {
        console.log(`   ⚠️  Error checking status: ${error.message}`);
        await new Promise((resolve) => setTimeout(resolve, 15000));
      }
    }

    if (!isComplete) {
      console.log('\n⏰ Status monitoring timed out.');
      console.log('💡 In production, webhooks will notify you when the transfer completes.');
    }
  }
}

/**
 * Bootstrap and run the CLI
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false, // Disable NestJS logs for cleaner CLI output
  });

  const appService = app.get(AppService);
  const cli = new ChainrailsCLI(appService);

  await cli.run();
  await app.close();
}

bootstrap();
