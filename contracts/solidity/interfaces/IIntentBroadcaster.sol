// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {BroadcastedIntent, Chain, TokenAmount} from "../utils/Types.sol";

/// @title IIntentBroadcaster
/// @notice Interface for the IntentBroadcaster contract used to interact with Chainrails on the contract level
interface IIntentBroadcaster {
    /// @notice Broadcasts a Chainrails intent and escrows funds
    /// @param intent The Chainrails intent to broadcast
    /// @param deposits Array of token amounts to deposit
    /// @param maxFeeBudget The maximum fee budget the sender is willing to pay (0 to use paymaster)
    /// @param isLive Whether this is a production broadcast (true) or test broadcast (false)
    /// @return broadcastId The unique identifier for this broadcast
    function broadcastIntent(
        BroadcastedIntent calldata intent,
        TokenAmount[] calldata deposits,
        uint256 maxFeeBudget,
        bool isLive
    ) external returns (bytes32 broadcastId);

    /// @notice Marks a broadcast as executed
    /// @dev Only callable by the Chainrails coordinator contract
    /// @param broadcastId The unique identifier of the broadcast
    function markBroadcastExecuted(bytes32 broadcastId) external;

    /// @notice Transfers escrowed funds from broadcaster to intent contract
    /// @dev Only callable by the Chainrails coordinator contract
    /// @param broadcastId The unique identifier of the broadcast
    /// @param intentAddress The intent contract address to transfer funds to
    /// @param broadcastedIntentHash Hash of the broadcast intent parameters to verify integrity
    function fundIntent(bytes32 broadcastId, address intentAddress, bytes32 broadcastedIntentHash) external;

    /// @notice Allows initiator to cancel a broadcast and retrieve escrowed funds
    /// @dev Automatically refunds all payment tokens used in the broadcast
    /// @param broadcastId The unique identifier of the broadcast to cancel
    function cancelBroadcast(bytes32 broadcastId) external;

    /// @notice Returns the total escrowed amount for a specific broadcast across all tokens
    /// @param broadcastId The broadcast identifier
    /// @return amount The total escrowed amount
    function getEscrowedAmount(bytes32 broadcastId) external view returns (uint256 amount);

    /// @notice Returns whether a broadcast has been executed
    /// @param broadcastId The broadcast identifier
    /// @return executed True if the broadcast has been executed, false otherwise
    function getBroadcastExecutionStatus(bytes32 broadcastId) external view returns (bool executed);

    /// @notice Emitted when an intent is broadcasted
    /// @param broadcastId The unique identifier for this broadcast
    /// @param sender The address to use as sender
    /// @param sourceChain The source blockchain
    /// @param destinationChain The destination blockchain
    /// @param recipient The recipient address on destination chain
    /// @param refundAddress The address to refund to if needed
    /// @param deposits Array of token amounts deposited for this broadcast
    /// @param bridgeTokenOutOptions The bridge token output options
    /// @param broadcaster The IntentBroadcaster contract address
    /// @param broadcastingContract The contract that initiated the broadcast
    /// @param isLive Whether this is a production broadcast (true) or test (false)
    event IntentBroadcasted(
        bytes32 indexed broadcastId,
        address indexed sender,
        Chain sourceChain,
        Chain destinationChain,
        bytes32 recipient,
        address refundAddress,
        TokenAmount[] deposits,
        TokenAmount[] bridgeTokenOutOptions,
        address broadcaster,
        address indexed broadcastingContract,
        bool isLive
    );

    /// @notice Emitted when a broadcast is executed
    /// @param broadcastId The unique identifier of the broadcast
    /// @param executor The address that executed the broadcast
    event BroadcastExecuted(bytes32 indexed broadcastId, address indexed executor);

    /// @notice Emitted when a broadcast is cancelled
    /// @param broadcastId The unique identifier of the broadcast
    /// @param caller The address that triggered the cancellation
    /// @param refundAddress The address that received the escrowed funds
    event BroadcastCancelled(bytes32 indexed broadcastId, address indexed caller, address indexed refundAddress);

    /// @notice Thrown when an unauthorized address attempts to cancel a broadcast
    error UnauthorizedCancellation();

    /// @notice Thrown when attempting to execute or cancel an already executed broadcast
    error BroadcastAlreadyExecuted();
}
