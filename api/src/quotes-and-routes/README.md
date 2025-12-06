# Quotes and Routes Module

Learn how to get realtime quotes and find optimal routes for cross-chain transfers.

## What You'll Learn

- ✅ Get quotes from specific bridges
- ✅ Compare quotes across all bridges
- ✅ Find the best (cheapest) route automatically
- ✅ Check which bridges support a route
- ✅ Retrieve multi-source quotes for a particular destination chain

## Run The Examples

```bash
# Start the NestJS app first
npm run start:dev

# Example 1: Get a quote from a specific bridge 
npm run example:quote:single

# Example 2: Get quotes from multiple bridges and compare
npm run example:quote:multiple

# Example 3: Get the best (cheapest) quote automatically
npm run example:quote:best

# Example 4: Get optimal route with full routing information
npm run example:route:optimal

# Example 5: Check which bridges support a specific route
npm run example:route:supported-bridges

# Example 6: Get quotes from all possible source chains to a destination
npm run example:quote:multi-source
```

## Available Endpoints

| Endpoint | Description | When to Use |
|----------|-------------|-------------|
| `GET /quotes-and-routes/single` | Quote from specific bridge | You know which bridge you want |
| `GET /quotes-and-routes/multiple` | Compare all bridges | You want to see all options |
| `GET /quotes-and-routes/best` | Best (cheapest) quote | **Recommended** - Let API choose |
| `GET /quotes-and-routes/optimal-route` | Full route info | **Before creating intent** |
| `GET /quotes-and-routes/supported-bridges` | Check route support | Validate if transfer is possible |
| `GET /quotes-and-routes/multi-source` | Quotes from all source chains | Find cheapest source to transfer from |

## Common Use Cases

### 1. Find the Cheapest Option (Recommended)

```typescript
// Get the best quote - let Chainrails optimize for you
const bestQuote = await quotesAndRoutesService.getBestQuote({
  tokenIn: '0x...',
  tokenOut: '0x...',
  sourceChain: 'BASE_TESTNET',
  destinationChain: 'ARBITRUM_TESTNET',
  amount: '1000000', // 1 USDC
});
```

### 2. Compare All Options

```typescript
// Get quotes from all bridges to show user
const allQuotes = await quotesAndRoutesService.getMultipleQuotes({
  tokenIn: '0x...',
  tokenOut: '0x...',
  sourceChain: 'BASE_TESTNET',
  destinationChain: 'ARBITRUM_TESTNET',
  amount: '1000000',
});

// Show comparison table to user
allQuotes.forEach(quote => {
  console.log(`${quote.bridge}: ${quote.totalFees} fees, ${quote.estimatedTime}`);
});
```

### 3. Obtain optimal route (quote + route details)

```typescript
// Get full routing info before creating an intent
const route = await quotesAndRoutesService.findOptimalRoute({
  tokenIn: '0x...',
  tokenOut: '0x...',
  sourceChain: 'BASE_TESTNET',
  destinationChain: 'ARBITRUM_TESTNET',
  amount: '1000000',
  recipient: '0xRecipientAddress...',
});

// You'll use route.bridgeAddress and route.bridgeExtraData when creating the intent
```

### 4. Find Best Source Chain (Multi-Source Quotes)

```typescript
// User has USDC on multiple chains - which one should they use?
const multiSourceQuotes = await quotesAndRoutesService.getMultiSourceQuotes({
  destinationChain: 'ARBITRUM_TESTNET',
  amount: '1', // 1 USDC
  tokenOut: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
});

// Note: Same-chain transfers appear first (they have lowest fees)
```

## Important Notes

### Understanding Amount Format

Amounts must be in the token's **smallest unit** except when getting multi-source quotes

```typescript
// ✅ Correct
amount: '1000000' // = 1 USDC

// ❌ Wrong (exception is the multi-source quotes)
amount: '1' // = 0.000001 USDC (way too small!)
```

### Quote Caching

Quotes are cached for a short time (~5 minutes) to improve performance. If you need fresh quotes, just wait a bit or the cache will auto-refresh.
