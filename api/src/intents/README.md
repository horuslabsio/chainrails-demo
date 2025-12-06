# Intents Module

Learn how to create and manage same/cross-chain transfer intents

## What You'll Learn

- ✅ Create cross-chain transfer intents
- ✅ Track intent status in real-time
- ✅ Get user transfer history
- ✅ Handle the complete intent lifecycle

### The Intent Lifecycle

```
1. PENDING    → Intent created, waiting for user to send tokens
2. FUNDED     → User sent tokens to intent address
3. INITIATED  → Chainrails started processing the transfer
4. COMPLETED  → Transfer successful! Tokens arrived at destination
```

Alternative outcomes:
```
1. EXPIRED    → Intent was not funded before expiration time
2. REFUNDED   → Intent failed to start! Intent refunded
```

## Run The Examples

```bash
# Start the NestJS app first
npm run start:dev

# Example 1: Create a cross-chain transfer intent
curl -X POST http://localhost:3000/intents -H 'Content-Type: application/json' -d '{\"amount\":1000000,\"tokenIn\":\"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\",\"sourceChain\":\"BASE_MAINNET\",\"destinationChain\":\"ARBITRUM_MAINNET\",\"recipient\":\"0xda3ecb2e5362295e2b802669dd47127a61d9ce54\",\"sender\":\"0xb79541be080a59fdce6c0b43219ba56c725ec65e\",\"refundAddress\":\"0xb79541be080a59fdce6c0b43219ba56c725ec65e\"}'

# Example 2: Get intent status by ID
curl http://localhost:3000/intents/1

# Example 3: Get all intents for a user
curl http://localhost:3000/intents/user/0xb79541be080a59fdce6c0b43219ba56c725ec65e

# Example 4: Get all intents with pagination
curl "http://localhost:3000/intents?limit=10&offset=0"
```

## Available Endpoints

| Endpoint | Method | Description | When to Use |
|----------|--------|-------------|-------------|
| `/intents` | POST | Create new intent | Start a cross-chain transfer |
| `/intents/:id` | GET | Get intent status | Track transfer progress |
| `/intents/user/:address` | GET | Get user's intents | Show transfer history |
| `/intents` | GET | Get all intents | Admin dashboard |

## Creating an Intent

```typescript
const intent = await intentsService.createIntent({
  sender: '0xYourWalletAddress',
  amount: 1000000,
  tokenIn: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  sourceChain: 'BASE_TESTNET',
  destinationChain: 'ARBITRUM_TESTNET',
  recipient: '0xRecipientAddress',
  refundAddress: '0xYourWalletAddress', // Where to send refund if transfer fails
  metadata: {
    orderId: '12345',
    description: 'Payment for order #12345',
  },
});
```

### Track Intent Progress

```typescript
// Poll for status updates
const checkStatus = async () => {
  const status = await intentsService.getIntentStatus(intent.id);
  
  if (status.intent_status === 'COMPLETED') {
    console.log('Transfer complete!');
    console.log(`Transaction: ${status.tx_hash}`);
  } else if (status.intent_status === 'INITIATED') {
    console.log('Transfer in progress...');
  } else if (status.intent_status === 'FUNDED') {
    console.log('Funded! Processing will start soon...');
  } else if (status.intent_status === 'PENDING') {
    console.log('Waiting for funding...');
  }
};

// Check every 10 seconds
setInterval(checkStatus, 10000);
```

## Understanding Intent Request Fields

```typescript
{
  sender: string;           // User's wallet address
  amount: number;           // INITIAL amount (not including fees)
  tokenIn: string;          // Source token address
  sourceChain: string;      // Where tokens are coming from
  destinationChain: string; // Where tokens are going
  recipient: string;        // Who receives tokens on destination
  refundAddress: string;    // Where to refund if transfer fails
  metadata?: object;        // Your custom data (optional)
}
```

## Important Notes

### Amount Format

**CRITICAL**: When creating an intent, use the **initial amount in wei format**!

```typescript
// ✅ Correct
amount: 1000000 // User wants to send 1 USDC

// ❌ Wrong
amount: 1 // Human readable format!
```

### Expiration Times

Intents expire after **1 hour** by default. If the user doesn't fund within this time:
- Intent status becomes `EXPIRED`
- If user funded after expiration, they can get a refund
- Always show the `expires_at` timestamp to users

### Refund Address

Always set a valid refund address! This is where tokens go if:
- Transfer fails
- Intent expires after being funded

## Webhook Alternative (Advanced)

Instead of polling for status, you can set up webhooks to receive real-time updates. See the Chainrails webhook documentation for details.

Benefits:
- No polling needed
- Instant notifications
- Lower API usage

## Next Steps

You now know how to:
1. Create cross-chain transfer intents
2. Track their progress
3. Handle the complete lifecycle

**Next**: Check out the `app` module to see a complete integration that combines chains, quotes, and intents into a full working example!
