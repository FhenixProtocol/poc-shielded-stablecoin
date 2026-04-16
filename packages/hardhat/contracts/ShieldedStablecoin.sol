// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20Confidential} from "fhenix-confidential-contracts/contracts/ERC20Confidential/ERC20Confidential.sol";

contract ShieldedStablecoin is ERC20Confidential {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_
    ) ERC20Confidential(name, symbol, decimals_) {}

    // Mint new public tokens for testing
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Mint new encrypted tokens
    function confidentialMint(address to, uint64 amount) public {
        _confidentialMint(to, amount);
    }
}
