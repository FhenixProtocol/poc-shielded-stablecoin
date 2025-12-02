// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    ERC20Confidential
} from "fhenix-confidential-contracts/contracts/extensions/ERC20Confidential.sol";
import {euint64, InEuint64, FHE} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract ShieldedStablecoin is ERC20Confidential {
    address private constant CONFIDENTIAL_POOL =
        address(0x1011000000000000000000000000000000000000);

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
        _mint(CONFIDENTIAL_POOL, uint256(amount) * _rate());
        _confidentialUpdate(address(0), to, FHE.asEuint64(amount));
    }
}
