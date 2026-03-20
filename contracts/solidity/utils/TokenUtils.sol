// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

library TokenUtils {
    /// @notice Convert an EVM address to a universal bytes32 token identifier
    /// @param tokenAddress The EVM token address
    /// @return The address encoded as bytes32
    function encodeEvmToken(address tokenAddress) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(tokenAddress)));
    }
}
