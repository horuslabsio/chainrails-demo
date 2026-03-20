use starknet::ContractAddress;
use crate::base::types::types::{BroadcastedIntent, Chain, TokenAmount};
use crate::interfaces::IERC20::{IERC20Dispatcher, IERC20DispatcherTrait};
use crate::mocks::interfaces::IMockIntentBroadCaster::{
    IIntentBroadCasterDispatcher, IIntentBroadCasterDispatcherTrait,
};
use crate::utils::address_utils::contract_address_to_u256;

#[starknet::interface]
pub trait ISimpleIntentBroadcaster<TContractState> {
    /// Broadcast a simple intent to send tokens from one chain to another.
    fn broadcast_simple_intent(
        ref self: TContractState,
        source_chain: Chain,
        source_token: ContractAddress,
        amount: u256,
        destination_chain: Chain,
        destination_token: ContractAddress,
        recipient: u256,
        refund_address: ContractAddress,
        max_fee_budget: u256,
        is_live: bool,
    ) -> felt252;

    /// Cancel a previously broadcasted intent.
    fn cancel_intent(ref self: TContractState, broadcast_id: felt252);

    /// Check if a broadcast has been executed.
    fn is_executed(self: @TContractState, broadcast_id: felt252) -> bool;

    /// Get the escrowed amount for a broadcast.
    fn get_escrowed_amount(self: @TContractState, broadcast_id: felt252) -> u256;
}

#[starknet::contract]
pub mod SimpleIntentBroadcaster {
    use super::{
        BroadcastedIntent, Chain, TokenAmount, IIntentBroadCasterDispatcher,
        IIntentBroadCasterDispatcherTrait, IERC20Dispatcher, IERC20DispatcherTrait,
        contract_address_to_u256,
    };
    use core::num::traits::Zero;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};

    #[storage]
    struct Storage {
        broadcaster: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        IntentSent: IntentSent,
    }

    #[derive(Drop, starknet::Event)]
    pub struct IntentSent {
        #[key]
        pub broadcast_id: felt252,
        #[key]
        pub sender: ContractAddress,
        pub amount: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, broadcaster_address: ContractAddress) {
        assert(!broadcaster_address.is_zero(), 'Invalid broadcaster address');
        self.broadcaster.write(broadcaster_address);
    }

    #[abi(embed_v0)]
    impl SimpleIntentBroadcasterImpl of super::ISimpleIntentBroadcaster<ContractState> {
        fn broadcast_simple_intent(
            ref self: ContractState,
            source_chain: Chain,
            source_token: ContractAddress,
            amount: u256,
            destination_chain: Chain,
            destination_token: ContractAddress,
            recipient: u256,
            refund_address: ContractAddress,
            max_fee_budget: u256,
            is_live: bool,
        ) -> felt252 {
            let total_deposit = amount + max_fee_budget;
            let caller = get_caller_address();
            let this_contract = get_contract_address();
            let broadcaster_address = self.broadcaster.read();

            // Transfer tokens from caller to this contract
            let token_dispatcher = IERC20Dispatcher { contract_address: source_token };
            token_dispatcher.transfer_from(caller, this_contract, total_deposit);

            // Approve the broadcaster to spend the tokens
            token_dispatcher.approve(broadcaster_address, total_deposit);

            // Build bridge_token_out_options (destination token + amount)
            let bridge_token_out_options = array![
                TokenAmount { token: contract_address_to_u256(destination_token), amount },
            ];

            // Build BroadcastedIntent
            let intent = BroadcastedIntent {
                source_chain,
                destination_chain,
                bridge_token_out_options,
                sender: caller,
                destination_recipient: recipient,
                refund_address,
            };

            // Build deposits array (source token + total_deposit)
            let deposits = array![
                TokenAmount {
                    token: contract_address_to_u256(source_token), amount: total_deposit,
                },
            ];

            // Broadcast the intent
            let broadcast_dispatcher = IIntentBroadCasterDispatcher {
                contract_address: broadcaster_address,
            };
            let broadcast_id = broadcast_dispatcher
                .broadcast_intent(intent, deposits, max_fee_budget, is_live);

            self.emit(IntentSent { broadcast_id, sender: caller, amount });

            broadcast_id
        }

        fn cancel_intent(ref self: ContractState, broadcast_id: felt252) {
            let broadcaster_address = self.broadcaster.read();
            let broadcast_dispatcher = IIntentBroadCasterDispatcher {
                contract_address: broadcaster_address,
            };
            broadcast_dispatcher.cancel_broadcast(broadcast_id);
        }

        fn is_executed(self: @ContractState, broadcast_id: felt252) -> bool {
            let broadcaster_address = self.broadcaster.read();
            let broadcast_dispatcher = IIntentBroadCasterDispatcher {
                contract_address: broadcaster_address,
            };
            broadcast_dispatcher.get_broadcast_execution_status(broadcast_id)
        }

        fn get_escrowed_amount(self: @ContractState, broadcast_id: felt252) -> u256 {
            let broadcaster_address = self.broadcaster.read();
            let broadcast_dispatcher = IIntentBroadCasterDispatcher {
                contract_address: broadcaster_address,
            };
            broadcast_dispatcher.get_escrowed_amount(broadcast_id)
        }
    }
}
