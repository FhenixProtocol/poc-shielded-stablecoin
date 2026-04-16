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
    constructor() ERC20("${name}", "${symbol}") {}

    // Mint new public tokens
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}`;
  }

  // Shielded Version
  return `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ERC20Confidential} from "fhenix-confidential-contracts/contracts/ERC20Confidential/ERC20Confidential.sol";

contract ShieldedStablecoin is ERC20Confidential {

    constructor() ERC20Confidential("${name}", "${symbol}", ${decimals}) {}

    // Mint new public tokens
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Mint new shielded tokens
    function confidentialMint(address to, uint64 amount) public {
        _confidentialMint(to, amount);
    }
}`;
};
