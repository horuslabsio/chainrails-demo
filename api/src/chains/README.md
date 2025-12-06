# Chains Module

Learn how to query and work with Chainrails supported blockchain networks.

## What You'll Learn

- ✅ Fetch all supported chains
- ✅ Filter chains by environment (testnet vs mainnet)
- ✅ Look up specific chain details
- ✅ Build chain selector UI data
- ✅ Understand chain metadata

## Quick Start

### 1. Set Up Environment

```bash
# .env file
CHAINRAILS_API_KEY=cr_test_xxxxxxxxxxxxx  # Get from your chainrails dashboard
CHAINRAILS_API_URL=https://api.chainrails.io/api/v1
```

### 2. Run the Examples

```bash
# Start the NestJS app
npm run start:dev

# In another terminal, try these requests:
curl http://localhost:3000/chains
curl http://localhost:3000/chains/environment/testnet
curl http://localhost:3000/chains/ETHEREUM_MAINNET
```

## Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `GET /chains` | Get all supported chains | `/chains` |
| `GET /chains/environment/:env` | Filter by testnet/mainnet | `/chains/environment/testnet` |
| `GET /chains/:chainName` | Get specific chain details | `/chains/ETHEREUM_MAINNET` |
| `GET /chains/token` | Chains supporting a token | `/chains/BASE_MAINNET/tokens` |

## Common Use Cases

### 1. Show Chain Options to Users

```typescript
// Get organized chain data
const selectorData = await chainsService.getChainSelectorData();

// Now you can render:
// - Mainnet EVM chains (Ethereum, Polygon, etc.)
// - Mainnet Non-EVM chains (Starknet)
// - Testnet EVM chains (Sepolia, etc.)
// - Testnet Non-EVM chains (Starknet Testnet)
```

### 2. Filter by Environment

```typescript
// Get only testnet chains for development
const testnetChains = await chainsService.getChainsByEnvironment('testnet');

// Get only mainnet chains for production
const mainnetChains = await chainsService.getChainsByEnvironment('mainnet');
```

## Important Notes

### Testnet vs Mainnet

- **Testnet chains**: Free to use, no real money, perfect for testing
  - Examples: `BASE_TESTNET`, `STARKNET_TESTNET`
  
- **Mainnet chains**: Real blockchain networks with real funds
  - Examples: `ETHEREUM_MAINNET`, `POLYGON_MAINNET`, `STARKNET_MAINNET`

### API Key Environment Matching

⚠️ **Important**: Your API key environment must match the chains you use:

- `cr_test_xxx` API keys → Use testnet chains only (supports mainnet too, for chains with no testnet support)
- `cr_live_xxx` API keys → Use mainnet chains only