// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {IIntentBroadcaster} from "./interfaces/IIntentBroadcaster.sol";
import {BroadcastedIntent, Chain, TokenAmount} from "./utils/Types.sol";
import {TokenUtils} from "./utils/TokenUtils.sol";

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

/// @title SimpleIntentBroadcaster
/// @notice A simple example contract demonstrating how to broadcast a Chainrails intent
/// @dev This contract can be used to test the IntentBroadcaster functionality
contract SimpleIntentBroadcaster {
    // The deployed IntentBroadcaster contract address
    IIntentBroadcaster public immutable broadcaster;

    // Event emitted when an intent is broadcasted
    event IntentSent(bytes32 indexed broadcastId, address indexed sender, uint256 amount);

    constructor(address _broadcasterAddress) {
        require(_broadcasterAddress != address(0), "Invalid broadcaster address");
        broadcaster = IIntentBroadcaster(_broadcasterAddress);
    }

    /// @notice Broadcast a simple intent to send USDC from one chain to another
    /// @param sourceChain The chain the intent is being broadcasted from
    /// @param sourceToken The token to send on the source chain (e.g., USDC on Base)
    /// @param amount The amount to send
    /// @param destinationChain The destination chain
    /// @param destinationToken The token address on the destination chain (e.g., USDC on Arbitrum)
    /// @param recipient The recipient address on the destination chain
    /// @param refundAddress The address to receive refunds if the intent is cancelled or fails
    /// @param maxFeeBudget Maximum fee willing to pay (set to 0 to use paymaster)
    /// @param isLive Whether this is a production broadcast (true) or test (false)
    /// @return broadcastId The unique identifier for the broadcast
    function broadcastSimpleIntent(
        Chain sourceChain,
        address sourceToken,
        uint256 amount,
        Chain destinationChain,
        address destinationToken,
        bytes32 recipient,
        address refundAddress,
        uint256 maxFeeBudget,
        bool isLive
    ) external returns (bytes32 broadcastId) {
        uint256 totalDeposit = amount + maxFeeBudget;
        
        // Transfer tokens from sender to this contract
        require(
            IERC20Minimal(sourceToken).transferFrom(msg.sender, address(this), totalDeposit),
            "Token transferFrom failed"
        );

        // Approve the broadcaster to spend the tokens
        require(
            IERC20Minimal(sourceToken).approve(address(broadcaster), totalDeposit),
            "Token approve failed"
        );

        // Create the intent
        BroadcastedIntent memory intent = BroadcastedIntent({
            sourceChain: sourceChain,
            destinationChain: destinationChain,
            bridgeTokenOutOptions: new TokenAmount[](1),
            sender: msg.sender,
            destinationRecipient: recipient,
            refundAddress: refundAddress
        });

        // Set the token amount for bridge output (destination token address)
        intent.bridgeTokenOutOptions[0] =
            TokenAmount({token: TokenUtils.encodeEvmToken(destinationToken), amount: amount});

        // Create deposits array (source token address) - includes amount + fee budget
        TokenAmount[] memory deposits = new TokenAmount[](1);
        deposits[0] = TokenAmount({token: TokenUtils.encodeEvmToken(sourceToken), amount: totalDeposit});

        // Broadcast the intent
        broadcastId = broadcaster.broadcastIntent(intent, deposits, maxFeeBudget, isLive);

        emit IntentSent(broadcastId, msg.sender, amount);

        return broadcastId;
    }

    /// @notice Cancel a previously broadcasted intent
    /// @param broadcastId The unique identifier of the broadcast to cancel
    function cancelIntent(bytes32 broadcastId) external {
        broadcaster.cancelBroadcast(broadcastId);
    }

    /// @notice Check if a broadcast has been executed
    /// @param broadcastId The broadcast identifier
    /// @return executed True if executed, false otherwise
    function isExecuted(bytes32 broadcastId) external view returns (bool) {
        return broadcaster.getBroadcastExecutionStatus(broadcastId);
    }

    /// @notice Get the escrowed amount for a broadcast
    /// @param broadcastId The broadcast identifier
    /// @return amount The total escrowed amount
    function getEscrowedAmount(bytes32 broadcastId) external view returns (uint256) {
        return broadcaster.getEscrowedAmount(broadcastId);
    }
}
