use core::felt252;
use core::integer::u256;
use starknet::ContractAddress;

/// Converts a `ContractAddress` to a `u256` by first converting it to `felt252`.
///
pub fn contract_address_to_u256(address: ContractAddress) -> u256 {
    let felt_value: felt252 = address.try_into().unwrap();
    felt_value.try_into().unwrap()
}
