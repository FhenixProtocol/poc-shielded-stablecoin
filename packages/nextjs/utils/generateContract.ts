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
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Confidential} from "fhenix-confidential-contracts/contracts/extensions/ERC20Confidential.sol";
import {euint64, InEuint64, FHE} from "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract ShieldedStablecoin is ERC20, ERC20Confidential {
     address private constant CONFIDENTIAL_POOL =
        address(0x1011000000000000000000000000000000000000);

    constructor() ERC20Confidential("${name}", "${symbol}", ${decimals}) {}

    // Mint new public tokens
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    // Mint new encrypted tokens
    function confidentialMint(address to, uint64 amount) public {
        _mint(CONFIDENTIAL_POOL, uint256(amount) * _rate());
        _confidentialUpdate(address(0), to, FHE.asEuint64(amount));
    }
}`;
};
