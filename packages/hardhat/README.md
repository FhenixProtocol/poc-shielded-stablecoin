# Fhenix CoFHE Hardhat Starter

This project is a starter repository for developing FHE (Fully Homomorphic Encryption) smart contracts on the Fhenix network using CoFHE (Confidential Computing Framework for Homomorphic Encryption).

## Prerequisites

- Node.js (v18 or later)
- pnpm (recommended package manager)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/fhenixprotocol/cofhe-hardhat-starter.git
cd cofhe-hardhat-starter
```

2. Install dependencies:

```bash
pnpm install
```

## Available Scripts

### Development

- `pnpm compile` - Compile the smart contracts
- `pnpm clean` - Clean the project artifacts
- `pnpm test` - Run tests on the local CoFHE network
- `pnpm test:hardhat` - Run tests on the Hardhat network
- `pnpm test:localcofhe` - Run tests on the local CoFHE network

### Local CoFHE Network

- `pnpm localcofhe:start` - Start a local CoFHE network
- `pnpm localcofhe:stop` - Stop the local CoFHE network
- `pnpm localcofhe:faucet` - Get test tokens from the faucet
- `pnpm localcofhe:deploy` - Deploy contracts to the local CoFHE network

### Contract Tasks

- `pnpm task:deploy` - Deploy contracts
- `pnpm task:addCount` - Add to the counter
- `pnpm task:getCount` - Get the current count
- `pnpm task:getFunds` - Get funds from the contract

## Project Structure

- `contracts/` - Smart contract source files
  - `Counter.sol` - Example FHE counter contract
  - `Lock.sol` - Example time-locked contract
- `test/` - Test files
- `ignition/` - Hardhat Ignition deployment modules

## `cofhejs` and `cofhe-hardhat-plugin`

This project uses cofhejs and the CoFHE Hardhat plugin to interact with FHE (Fully Homomorphic Encryption) smart contracts. Here are the key features and utilities:

### cofhejs Features

- **Encryption/Decryption**: Encrypt and decrypt values using FHE

  ```typescript
  import { cofhejs, Encryptable, FheTypes } from 'cofhejs/node'

  // Encrypt a value
  const [encryptedInput] = await cofhejs.encrypt(
  	(step) => {
  		console.log(`Encrypt step - ${step}`)
  	},
  	[Encryptable.uint32(5n)]
  )

  // Decrypt a value
  const decryptedResult = await cofhejs.decrypt(encryptedValue, FheTypes.Uint32)
  ```

- **Unsealing**: Unseal encrypted values from the blockchain
  ```typescript
  const unsealedResult = await cofhejs.unseal(encryptedValue, FheTypes.Uint32)
  ```

### `cofhe-hardhat-plugin` Features

- **Network Configuration**: Automatically configures the cofhe enabled networks
- **Wallet Funding**: Automatically funds wallets on the local network

  ```typescript
  import { localcofheFundWalletIfNeeded } from 'cofhe-hardhat-plugin'
  await localcofheFundWalletIfNeeded(hre, walletAddress)
  ```

- **Signer Initialization**: Initialize cofhejs with a Hardhat signer

  ```typescript
  import { cofhejs_initializeWithHardhatSigner } from 'cofhe-hardhat-plugin'
  await cofhejs_initializeWithHardhatSigner(signer)
  ```

- **Testing Utilities**: Helper functions for testing FHE contracts
  ```typescript
  import { expectResultSuccess, expectResultValue, mock_expectPlaintext, isPermittedCofheEnvironment } from 'cofhe-hardhat-plugin'
  ```

### Environment Configuration

The plugin supports different environments:

- `MOCK`: For testing with mocked FHE operations
- `LOCAL`: For testing with a local CoFHE network (whitelist only)
- `TESTNET`: For testing and tasks using `arb-sepolia` and `eth-sepolia`

You can check the current environment using:

```typescript
if (!isPermittedCofheEnvironment(hre, 'MOCK')) {
	// Skip test or handle accordingly
}
```

## Links and Additional Resources

### `cofhejs`

[`cofhejs`](https://github.com/FhenixProtocol/cofhejs) is the JavaScript/TypeScript library for interacting with FHE smart contracts. It provides functions for encryption, decryption, and unsealing FHE values.

#### Key Features

- Encryption of data before sending to FHE contracts
- Unsealing encrypted values from contracts
- Managing permits for secure contract interactions
- Integration with Web3 libraries (ethers.js and viem)

### `cofhe-mock-contracts`

[`cofhe-mock-contracts`](https://github.com/FhenixProtocol/cofhe-mock-contracts) provides mock implementations of CoFHE contracts for testing FHE functionality without the actual coprocessor.

#### Features

- Mock implementations of core CoFHE contracts:
  - MockTaskManager
  - MockQueryDecrypter
  - MockZkVerifier
  - ACL (Access Control List)
- Synchronous operation simulation with mock delays
- On-chain access to unencrypted values for testing

#### Integration with Hardhat and cofhejs

Both `cofhejs` and `cofhe-hardhat-plugin` interact directly with the mock contracts:

- When imported in `hardhat.config.ts`, `cofhe-hardhat-plugin` injects necessary mock contracts into the Hardhat testnet
- `cofhejs` automatically detects mock contracts and adjusts behavior for test environments

#### Mock Behavior Differences

- **Symbolic Execution**: In mocks, ciphertext hashes point to plaintext values stored on-chain
- **On-chain Decryption**: Mock decryption adds simulated delays to mimic real behavior
- **ZK Verification**: Mock verifier handles on-chain storage of encrypted inputs
- **Off-chain Decryption**: When using `cofhejs.unseal()`, mocks return plaintext values directly from on-chain storage

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
