# Chainrails Demo

Welcome to the Chainrails integration examples! This repository contains comprehensive guides and sample code to help you integrate Chainrails into your application.

## 📚 What's Inside

This demo is divided into five main sections:

###  API Guide (`/api`)
Backend integration examples using NestJS. Learn how to:
- Fetch available chains and supported tokens
- Get quotes and routes for cross-chain transfers
- Create and manage transfer intents
- Handle webhook events for real-time updates
- Build a complete end-to-end transfer flow

Perfect for developers building custom backend integrations with full control over the transfer experience.

###  Modal Guide (`/modal`)
Frontend integration examples showing how to use the Chainrails pre-built UI modal. Available in:
- **React** (`/modal/react`) - React implementation with Vite
- **Next.js** (`/modal/nextjs`) - Next.js implementation

Ideal for quickly adding cross-chain transfers to your dApp with a beautiful, ready-to-use interface.

###  SDK Guide (`/sdk`)
Lightweight SDK examples for programmatic transfers without a backend. Learn how to:
- Initialize the Chainrails SDK
- Create transfers programmatically
- Handle intent creation and monitoring

Great for simple integrations or client-side only applications.

### Contracts Guide (`/contracts`)
Contract-level Chainrails integration examples for both Solidity and Starknet. Learn how to:
- Integrate with the Intent Broadcaster from your smart contracts
- Broadcast intents directly on-chain
- Handle escrowed funds and lifecycle status checks
- Configure deployment and whitelisting requirements

Best for protocols that need native smart contract integration instead of API-driven intent creation.

### Mini Apps (`/mini-apps`)
Mini app integration examples for Base/Farcaster.

---

## 🚀 Getting Started

Choose the integration path that best fits your needs:

- **Need full control?** → Start with the [API Guide](./api/README.md)
- **Want a quick UI solution?** → Check out the [Modal Guide](./modal/react/README.md)
- **Building something simple?** → Try the [SDK Guide](./sdk/README.md)
- **Integrating at contract level?** → See the [Contracts Guide](./contracts/README.md)
- **Looking for mini app examples?** → Explore [Mini Apps](./mini-apps)

Each section includes detailed README files, code examples, and step-by-step instructions.