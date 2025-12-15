# Chainrails SDK Demo

A compact demo that exercises the main features of the local `@chainrails/sdk` package in this repo.

This demo covers the SDK surface with minimal code and safe error handling. It will:

- Configure the SDK via `Chainrails.config()`
- Fetch client info (`crapi.client.getClientInfo`)
- List supported chains (`crapi.chains.getSupported`)
- Request quotes (multi-source, per-bridge, best-across-bridges)
- Use the router APIs (supported bridges, optimal routes)
- Create and manage intents (`crapi.intents.create`, `getById`, `getForSender`, `getForAddress`, `update`, `triggerProcessing`)

All calls are wrapped with safe handlers so the demo can run even without a valid API key; network/auth failures are logged but don't stop the overall run.

## Quick start

1. Install dependencies (we reference the local `chainrails-sdk` package):

```bash
cd sdk-demo
npm install
```

2. Create `.env` from the example and add your API key (or use default demo_key):

```bash
cp .env.example .env
# Edit .env and set CHAINRAILS_API_KEY
```

3. Run the demo:

```bash
npm start
```
