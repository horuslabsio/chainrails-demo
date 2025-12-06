# Sample App Module

**The grand finale!** This module brings everything together into a production-ready flow.

## What This Module Does

Combines all previous modules (chains, quotes-and-routes, intents) into a complete, end-to-end cross-chain transfer application.

## What You'll Learn

- ✅ How to present multi-source options to users
- ✅ How to create transfers with selected sources  
- ✅ How to track transfer status in real-time
- ✅ How to handle webhook events

## Architecture

```
User Request
     ↓
[Get Transfer Options]  ← Multi-source quotes
     ↓
[User Selects Source]
     ↓
[Create Transfer]       ← Create intent
     ↓
[User Funds Intent]
     ↓
[Webhook Events] ----→  [Your App]
     ↓
[Transfer Complete]
```

## Quick Start

### Run the CLI Playground

```bash
npm run app:demo
```

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/app/options` | POST | Get all source chain options with fees |
| `/app/transfer` | POST | Create transfer from selected source |
| `/app/status/:id` | GET | Get transfer status + webhook events |
| `/app/webhook` | POST | Receive webhook events |

## The Complete Flow

### Step 1: Get Transfer Options

First, show users all possible source chains they can transfer from:

```typescript
// POST /app/options
{
  "destinationChain": "ARBITRUM_TESTNET",
  "amount": "10",
  "tokenOut": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
}

// Response:
{
  "options": [
    {
      "index": 1,
      "sourceChain": "ARBITRUM_TESTNET",
      "type": "same-chain",
      "fee": "500",
      "recommended": true,
    },
    {
      "index": 2,
      "sourceChain": "BASE_TESTNET",
      "type": "cross-chain",
      "fee": "2500",
      "bridge": "CCTP",
    }
    // ... more options
  ],
  "cheapestOption": { /* option 1 */ }
}
```

**Why this matters:**
- Users often have funds on multiple chains
- Shows them the cheapest way to reach destination
- Transparent fee comparison
- Let users choose based on speed vs cost

### Step 2: Create Transfer

After user selects their preferred source:

```typescript
// POST /app/transfer
{
  "sourceChain": "BASE_TESTNET",          // User's choice
  "destinationChain": "ARBITRUM_TESTNET",
  "amount": 10000000,                     // 10 USDC (in smallest units)
  "tokenIn": "0x036...",                  // USDC on Base
  "recipient": "0xRecipient..."
}

// Response:
{
  "intent": {
    "id": 123,
    "intent_address": "0x1234...",        // Where user sends tokens
    "totalAmount": "10002500",             // Amount + fees
    "status": "PENDING",
    "expires_at": "2025-12-05T15:30:00Z"
  },
  "fundingInstructions": {
    "address": "0x1234...",
    "amount": "10002500",
    "network": "BASE_TESTNET",
    "deadline": "2025-12-05T15:30:00Z"
  }
}
```

### Step 3: User Funds Intent

Display clear instructions:

```
📍 Send exactly 10.0025 USDC to:
   0x1234567890abcdef...

🌐 Network: BASE_TESTNET

⏰ Before: December 5, 2025 at 3:30 PM

💡 Once you send, we'll automatically:
   1. Detect your transaction
   2. Bridge your tokens via CCTP
   3. Deliver to recipient on ARBITRUM_TESTNET
```

### Step 4: Webhook Updates

As the transfer progresses, Chainrails sends webhook events:

```typescript
// POST /app/webhook
{
  "id": "evt_abc123",
  "type": "intent.funded",
  "created_at": "2025-12-05T14:35:00Z",
  "data": {
    "intent_id": 123,
    "intent_address": "0x1234...",
    "status": "FUNDED"
  }
}

// Later...
{
  "type": "intent.initiated",
  "data": { "status": "INITIATED" }
}

// Finally...
{
  "type": "intent.completed",
  "data": {
    "status": "COMPLETED",
    "tx_hash": "0xabc..."
  }
}
```

## Setting Up Webhooks
Code example:

```typescript
async handleWebhook(@Body() payload, @Headers() headers) {
  // 1. Verify signature (important!)
  const signature = headers['x-chainrails-signature'];
  const timestamp = headers['x-chainrails-timestamp'];
  const isValid = this.verifySignature(payload, signature, timestamp);
  
  if (!isValid) {
    throw new UnauthorizedException('Invalid signature');
  }

  // 2. Process event
  await this.processEvent(payload);

  // 3. Return 200 OK
  return { received: true };
}
```

### 2. Register Webhook with Chainrails

```bash
curl -X POST https://api.chainrails.io/api/v1/client/webhooks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhook",
    "events": ["intent.funded", "intent.completed"],
    "environment": "live"
  }'
```

### 3. Verify HMAC Signature

```typescript
import { createHmac } from 'crypto';

verifySignature(payload: any, signature: string, timestamp: number): boolean {
  // Check timestamp (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) { // 5 minutes
    return false;
  }

  // Compute signature
  const body = JSON.stringify(payload);
  const message = `${timestamp}.${body}`;
  const hmac = createHmac('sha256', YOUR_WEBHOOK_SECRET);
  hmac.update(message);
  const computed = `sha256=${hmac.digest('hex')}`;

  // Compare
  return computed === signature;
}
```

### 4. Handle Events

```typescript
async processEvent(payload: any) {
  switch (payload.type) {
    case 'intent.funded':
      // Update UI: "Transfer funded, processing..."
      await this.notifyUser(payload.data.intent_id, 'funded');
      break;

    case 'intent.completed':
      // Update UI: "Transfer complete!"
      await this.notifyUser(payload.data.intent_id, 'completed');
      await this.storeTxHash(payload.data.intent_id, payload.data.tx_hash);
      break;

    case 'intent.refunded':
      // Update UI: "Transfer failed, refunded"
      await this.notifyUser(payload.data.intent_id, 'refunded');
      break;
  }
}
```

### Retry Logic

For webhooks, Chainrails automatically retries with exponential backoff:
- Attempt 1: Immediate
- Attempt 2: 10 seconds
- Attempt 3: 1 minute
- Attempt 4: 10 minutes
- Attempt 5: 1 hour
- Attempt 6: 6 hours
- Attempt 7: 24 hours

Always return 200 OK, or Chainrails will keep retrying.

## Testing

### Test Webhooks Locally

Use ngrok to expose localhost:

```bash
# Install ngrok
brew install ngrok

# Expose port 3000
ngrok http 3000

# Use the HTTPS URL for webhook registration
# https://abc123.ngrok.io/app/webhook
```

### Test Events

Send test webhook:

```bash
curl -X POST http://localhost:3000/app/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_123",
    "type": "intent.completed",
    "created_at": "2025-12-05T14:30:00Z",
    "data": {
      "intent_id": 1,
      "intent_address": "0x1234...",
      "status": "COMPLETED"
    }
  }'
```

## Next Steps

You now have a complete, production-ready Chainrails integration!

**Checkout these resources:**
- [Chainrails API Docs](https://docs.chainrails.io)
- [Chainrails Demo](https://chainrails.io/demo)
