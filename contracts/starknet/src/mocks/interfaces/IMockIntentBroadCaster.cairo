use starknet::ContractAddress;
use crate::base::types::types::TokenAmount;
use crate::base::types::types::BroadcastedIntent;

/// @title IIntentBroadCaster
/// @notice Interface for broadcasting and managing cross-chain payment intents with escrow
#[starknet::interface]
pub trait IIntentBroadCaster<TState> {
    /// @notice Broadcasts a new payment intent and escrows the required tokens
    /// @param intent The broadcasted intent containing transfer details and destination information
    /// @param deposits Array of token amounts to be escrowed for this broadcast
    /// @param max_fee_budget Maximum fee amount
    /// @return felt252 Unique identifier for the broadcasted intent
    fn broadcast_intent(
        ref self: TState,
        intent: BroadcastedIntent,
        deposits: Array<TokenAmount>,
        max_fee_budget: u256,
        isLive: bool,
    ) -> felt252;

    /// @notice Marks a broadcasted intent as successfully executed
    /// @param broadcast_id The unique identifier of the broadcast to mark as executed
    fn mark_broadcast_executed(ref self: TState, broadcast_id: felt252);

    /// @notice Funds a specific intent by transferring escrowed tokens to the intent contract
    /// @param broadcast_id The unique identifier of the broadcast being funded
    /// @param intent_address The contract address of the intent receiving the funds
    /// @param broadcast_intent_hash  hash for  verification
    fn fund_intent(
        ref self: TState,
        broadcast_id: felt252,
        intent_address: ContractAddress,
        broadcast_intent_hash: felt252,
    );

    /// @notice Cancels a broadcasted intent and returns escrowed tokens to the broadcaster
    /// @param broadcast_id The unique identifier of the broadcast to cancel
    fn cancel_broadcast(ref self: TState, broadcast_id: felt252);

    /// @notice Retrieves the total amount of tokens currently escrowed for a broadcast
    /// @param broadcast_id The unique identifier of the broadcast to query
    /// @return u256 Total amount of tokens held in escrow for this broadcast
    fn get_escrowed_amount(self: @TState, broadcast_id: felt252) -> u256;

    /// @notice Checks whether a broadcasted intent has been executed
    /// @param broadcast_id The unique identifier of the broadcast to query
    /// @return bool True if the broadcast has been executed, false otherwise
    fn get_broadcast_execution_status(self: @TState, broadcast_id: felt252) -> bool;
}
