// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {SimpleIntentBroadcaster} from "./SimpleIntentBroadcaster.sol";

contract DeploySimpleIntentBroadcaster {
    function deploy(address broadcasterAddress) external returns (address deployedAt) {
        require(broadcasterAddress != address(0), "Invalid broadcaster address");
        SimpleIntentBroadcaster instance = new SimpleIntentBroadcaster(broadcasterAddress);
        return address(instance);
    }
}
