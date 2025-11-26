interface ContractOptions {
  name: string;
  symbol: string;
  decimals: number;
  isShielded: boolean;
}

export const generateContract = ({
  name,
  symbol,
  decimals,
  isShielded,
}: ContractOptions): string => {
  if (!isShielded) {
    // Fallback to standard ERC20 if shielded is somehow off
    return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ${name.replace(/\s+/g, "")} is ERC20 {
    uint8 private immutable _decimals;

    constructor() ERC20("${name}", "${symbol}") {
        _decimals = ${decimals};
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}`;
  }

  // Shielded Version
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {
    ERC20Confidential
} from "fhenix-confidential-contracts/contracts/extensions/ERC20Confidential.sol";

/**
 * @title ${name.replace(/\s+/g, "")}
 * @dev Confidential Token with shielded balances
 */
contract ${name.replace(/\s+/g, "")} is ERC20Confidential {
    uint8 private immutable _CUSTOM_DECIMALS;

    constructor() ERC20Confidential("${name}", "${symbol}") {
        _CUSTOM_DECIMALS = ${decimals};
    }

    /**
     * @dev Override decimals to return custom value
     */
    function decimals() public view virtual override(ERC20) returns (uint8) {
        return _CUSTOM_DECIMALS;
    }

    /**
     * @dev Mint new public tokens for testing
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}`;
};

