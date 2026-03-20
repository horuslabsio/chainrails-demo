// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

struct TokenAmount {
    bytes32 token;
    uint256 amount;
}

// Represents an external call to be executed (e.g., DEX swap)
struct Call {
    address to;
    uint256 value;
    bytes data;
}

struct Metadata {
    uint8 sourceDecimals;
    uint8 destinationDecimals;
    uint256 protocolFee;
    address protocolFeeRecipient;
    uint256 appFee;
    address appFeeRecipient;
    bool usePaymaster;
    uint256 paymasterFee;
    string clientId;
}

// Represents a user's intent to perform a payment action
struct PayIntent {
    Chain sourceChain;
    Chain destinationChain;
    TokenAmount[] bridgeTokenOutOptions;
    bytes32 destinationRecipient;
    address payable coordinator;
    address bridger;
    address refundAddress;
    uint256 nonce;
    uint256 expirationTimestamp;
    bool needsRelay;
    bytes metadata;
}

// Represents essential details needed for broadcasting an intent
struct BroadcastedIntent {
    Chain sourceChain;
    Chain destinationChain;
    TokenAmount[] bridgeTokenOutOptions;
    address sender;
    bytes32 destinationRecipient;
    address refundAddress;
}

// Blockchain networks
enum Chain {
    ARBITRUM_MAINNET,
    ARBITRUM_TESTNET,
    BASE_MAINNET,
    BASE_TESTNET,
    STARKNET_MAINNET,
    STARKNET_TESTNET,
    AVALANCHE_MAINNET,
    AVALANCHE_TESTNET,
    ETHEREUM_MAINNET,
    ETHEREUM_TESTNET,
    POLYGON_MAINNET,
    POLYGON_TESTNET,
    OPTIMISM_MAINNET,
    OPTIMISM_TESTNET,
    UNICHAIN_MAINNET,
    UNICHAIN_TESTNET,
    HYPEREVM_MAINNET,
    HYPEREVM_TESTNET,
    BSC_TESTNET,
    BSC_MAINNET,
    LISK_MAINNET,
    LISK_TESTNET,
    SOLANA_TESTNET,
    SOLANA_MAINNET,
    TRON_TESTNET,
    TRON_MAINNET,
    CELO_TESTNET,
    CELO_MAINNET,
    ZKSYNC_MAINNET,
    ZKSYNC_TESTNET,
    SCROLL_MAINNET,
    SCROLL_TESTNET,
    WORLD_CHAIN_MAINNET,
    WORLD_CHAIN_TESTNET,
    LINEA_MAINNET,
    LINEA_TESTNET,
    SEI_MAINNET,
    SEI_TESTNET,
    SONIEUM_MAINNET,
    SONIEUM_TESTNET,
    BLAST_MAINNET,
    BLAST_TESTNET,
    MODE_MAINNET,
    MODE_TESTNET,
    XDC_MAINNET,
    XDC_TESTNET,
    INK_MAINNET,
    INK_TESTNET,
    PLUME_MAINNET,
    PLUME_TESTNET,
    LENS_MAINNET,
    LENS_TESTNET,
    ZORA_MAINNET,
    ZORA_TESTNET,
    SUI_MAINNET,
    SUI_TESTNET,
    NEAR_MAINNET,
    NEAR_TESTNET,
    APTOS_MAINNET,
    APTOS_TESTNET,
    STELLAR_MAINNET,
    STELLAR_TESTNET,
    MONAD_MAINNET,
    MONAD_TESTNET
}
