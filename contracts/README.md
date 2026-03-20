# Chainrails Contract Integration Guide

This folder contains examples for integrating Chainrails at the contract level using the Intent Broadcaster.

## What The Intent Broadcaster Does

The Broadcaster enables contract-level integrations with Chainrails.
It allows protocols to create intents directly from their smart contracts instead of via API calls, with funds escrowed on-chain and processed automatically.

## Current Support

- Broadcasting is currently supported only for USDC.

## Required Setup

Before your contract can broadcast intents in production:

1. Ensure your broadcasting contract uses the latest broadcaster contract (check docs).
2. Deploy your broadcasting contract.
3. Add (whitelist) the deployed contract address in the client Chainrails Dashboard:
   - Settings -> Whitelisted Broadcasting Contracts

If your contract is not whitelisted, broadcasts should be expected to fail at runtime.

## Integration Pattern

A broadcasting contract typically performs the following flow:

1. Receive user request to create an intent.
2. Pull USDC from the user into the contract.
3. Approve the Intent Broadcaster to spend the escrow amount.
4. Build BroadcastedIntent and deposit TokenAmount arrays.
5. Call broadcastIntent on the broadcaster.
6. Store or emit the returned broadcastId for tracking.

## Core Interface

The main interface is defined in:

- [contracts/solidity/interfaces/IIntentBroadcaster.sol](solidity/interfaces/IIntentBroadcaster.sol)

Important methods:

- broadcastIntent: Creates an on-chain intent and escrows funds.
- cancelBroadcast: Cancels a pending intent and triggers refund logic.
- getEscrowedAmount: Reads escrowed amount for a broadcast.
- getBroadcastExecutionStatus: Reads execution status.

## Example Contract

Basic Solidity/Starknet integration examples is available in:

- contracts/solidity/SimpleIntentBroadcaster.sol
- contracts/starknet/src/simple_intent_broadcaster.cairo

This example demonstrates:

- Constructing a broadcast intent.
- Encoding token addresses for Chainrails token representation.
- Escrowing source-side token amount plus fee budget.
- Emitting an event with the broadcastId.

## Minimal Integration Checklist

- Use USDC token addresses for source and destination token fields.
- Require successful transferFrom and approve calls.
- Set a valid refund address.
- Decide maxFeeBudget policy (fixed value or caller-provided).
- Emit and index broadcastId so off-chain systems can monitor lifecycle.
- Ensure contract whitelisting in dashboard before production use.

## Troubleshooting

Broadcast failures are commonly caused by:

- Broadcasting contract not whitelisted in Chainrails dashboard.
- Incorrect broadcaster address for the active chain.
- Insufficient USDC balance or allowance.
- Invalid recipient or refund address formatting.
