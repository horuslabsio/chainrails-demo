use starknet::ContractAddress;

/// @notice Represents blockchain networks for cross-chain intents to be supported now/in the
/// future.
/// @dev Used in `PayIntent` to define the source and destination chains for bridging.
#[derive(Drop, Serde, Hash, Copy, starknet::Store, Default, PartialEq)]
pub enum Chain {
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
    MONAD_TESTNET,
    #[default]
    UNKNOWN,
}

/// @notice Represents a token and its corresponding amount for transfers.
/// @dev Used to describe bridge outputs, payment tokens, and refund balances.
#[derive(Debug, Drop, Copy, Serde, Hash, PartialEq, starknet::Store)]
pub struct TokenAmount {
    /// Token contract address (ERC20 equivalent) rep as u256 to allow for cross-chain compatibility
    pub token: u256,
    /// Amount of tokens (in smallest units, e.g., wei)
    pub amount: u256,
}

#[derive(Drop, Serde, Clone, PartialEq)]
pub struct BroadcastedIntent {
    /// @notice The blockchain where the payment originates
    pub source_chain: Chain,
    /// @notice The blockchain where the payment will be received
    pub destination_chain: Chain,
    /// @notice Array of token amounts that can be used for bridging on the destination chain
    pub bridge_token_out_options: Array<TokenAmount>,
    /// @notice The address initiating the cross-chain payment
    pub sender: ContractAddress,
    /// @notice The recipient address on the destination chain (as u256 for cross-chain
    /// compatibility)
    pub destination_recipient: u256,
    /// @notice The address to receive refunds if the transaction fails or is cancelled
    pub refund_address: ContractAddress,
}
