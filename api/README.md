# Chainrails API Integration Guide

A complete, production-ready example with NestJs showing how to integrate Chainrails APIs into your application.

## What You'll Learn

- Query supported blockchain networks and tokens
- Get transfer quotes from multiple sources
- Create and track cross-chain transfer intents
- Handle webhook events for real-time updates
- Build complete end-to-end transfer flows

## Quick Start

We've created an interactive CLI playground, you can play around with it to see Chainrails in action before diving into the codes!

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```bash
# Chainrails API Configuration
CHAINRAILS_API_KEY=your_api_key_here
CHAINRAILS_API_URL=https://api.chainrails.io/api/v1

# Webhook Secret (get this when creating a webhook)
CHAINRAILS_WEBHOOK_SECRET=your_webhook_secret_here
```

### 3. Start the Server

```bash
npm run start:dev
```

### 4. Run the Interactive Demo

```bash
npm run app:demo
```

The CLI will guide you through creating a complete cross-chain transfer.

## Module Structure

This example is organized into **4 progressive modules**, each building on the previous:

### 1. **Chains Module** (`src/chains/`)

Learn the basics: query supported chains and tokens.

**What it does:**
- Get all supported blockchain networks
- Filter chains by environment (testnet/mainnet)
- Query supported tokens on each chain

**When to use:** In cases where you need to show users which chains/tokens are available.

[📖 Chains Module Documentation](src/chains/README.md)

**Try it:**
```bash
npm run example:chains
npm run example:chains:testnet
npm run example:chains:mainnet
npm run example:chains:supported_tokens
```

---

### 2. **Quotes & Routes Module** (`src/quotes-and-routes/`)

Get pricing and routing information for transfers.

**What it does:**
- Get transfer quotes from single or multiple bridges
- Find the best quote (lowest fee)
- Get optimal routes between chains
- Get quotes from ALL possible source chains (multi-source)

**When to use:** Show users fee estimates and let them choose the best option.

[📖 Quotes & Routes Module Documentation](src/quotes-and-routes/README.md)

**Try it:**
```bash
npm run example:quote:single
npm run example:quote:multiple
npm run example:quote:multi-source
npm run example:quote:best
npm run example:route:optimal
npm run example:route:supported-bridges
```

---

### 3. **Intents Module** (`src/intents/`)

Create and manage cross-chain transfer intents.

**What it does:**
- Create transfer intents (automatically selects optimal bridge)
- Track intent status (pending, funded, completed, etc.)
- Query user's transfer history

**When to use:** Create the transfer intent after user selects their preferred route.

[📖 Intents Module Documentation](src/intents/README.md)

**Try it:**
```bash
npm run example:intent:create
npm run example:intent:status
npm run example:intent:user
npm run example:intent:all
```

---

### 4. **Complete App Module** (`src/app/`)

**⭐ The full integration** - orchestrates all modules into a production-ready flow.

**What it does:**
- Shows multi-source options (step 1)
- Creates transfer from selected source (step 2)
- Tracks status with webhook events (step 3)
- Handles webhook signature verification (production-ready)

**When to use:** This is the pattern you'll implement in production.

[📖 App Module Documentation](src/app/README.md)

**Try it:**
```bash
# Interactive CLI demo
npm run app:demo

# Or test individual endpoints using curl
curl -X POST http://localhost:3000/app/options -H "Content-Type: application/json" -d '{
  "destinationChain": "ARBITRUM_TESTNET",
  "amount": "10",
  "tokenOut": "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d"
}'
```

---

## 🎓 Learning Path

1. Start with **Chains Module** - understand how to query networks available
2. Move to **Quotes Module** - learn how quotes and routes works
3. Explore **Intents Module** - see how transfer intents are created
4. Study **App Module** - see how everything fits together

## Key Concepts

### Multi-Source Quotes

Instead of users manually selecting source and destination, Chainrails can show ALL possible source chains they can transfer from:

```typescript
// User wants 10 USDC on Arbitrum
// Chainrails shows: "You can transfer from Base (fee: $0.50), Starknet (fee: $0.20), etc."
const options = await POST('/app/options', {
  destinationChain: 'ARBITRUM_TESTNET',
  amount: '10',
  tokenOut: USDC_ADDRESS
});
```

### Intents vs Transactions

- **Intent**: A cross-chain transfer request (created via API)
- **User funds the intent** by sending tokens to the intent address
- **Chainrails executes** the bridge transaction automatically
- **Webhooks notify you** of status changes

### Webhook Security

All webhook endpoints include HMAC signature verification:

```typescript
// Chainrails sends signature in header
const signature = headers['x-chainrails-signature'];
const timestamp = headers['x-chainrails-timestamp'];

// You verify it matches
const isValid = verifySignature(payload, signature, timestamp);
```

See `src/app/app.service.ts` for the complete implementation.

### Development

```bash
npm run start:dev      # Start with hot reload
```

## 🏗️ Project Structure

```
src/
├── chains/              # Query blockchain networks
│   ├── chains.service.ts
│   ├── chains.controller.ts
│   └── README.md
├── quotes-and-routes/   # Get transfer quotes
│   ├── quotes-and-routes.service.ts
│   ├── quotes-and-routes.controller.ts
│   └── README.md
├── intents/            # Create transfer intents
│   ├── intents.service.ts
│   ├── intents.controller.ts
│   └── README.md
├── app/                # Complete integration
│   ├── app.service.ts
│   ├── app.controller.ts
│   ├── app.cli.ts      # Interactive demo
│   └── README.md
└── config/
    └── configuration.ts # Environment config
```

## 🔗 Resources

- **API Documentation**: [docs.chainrails.io](https://docs.chainrails.io)
- **Demo Application**: [chainrails.io/demo](https://chainrails.io/demo)
- **Support**: [Email](contact@horuslabs.co)

## 💡 Tips

1. **Start with testnet** - Use testnet chains while learning
2. **Check the CLI demo** - Run `npm run app:demo` to see everything in action
3. **Read module READMEs** - Each module has detailed documentation
4. **Use multi-source quotes** - Let users choose their source chain for best UX
5. **Verify webhook signatures** - Always verify in production (see app module)

## 🤝 Contributing

Found an issue or have a suggestion? We'd love to hear from you!
