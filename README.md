# Multisig Wallet Project

## Overview

This project implements a Multisig (multi-signature) wallet system using Solidity smart contracts. It includes a Multisig contract, a MultisigFactory for deploying multiple Multisig wallets, and comprehensive test suites. The system allows for secure management of funds requiring multiple approvals for transactions.

## Features

- Create Multisig wallets with customizable quorum and signers
- Transfer ERC20 tokens from the Multisig wallet
- Approve transactions with multiple signatures
- Update quorum with multi-signature approval
- Factory contract for easy deployment of multiple Multisig wallets

## Smart Contracts

### Multisig.sol

The main contract implementing the Multisig wallet functionality.

Key features:
- Initialize with quorum and valid signers
- Create and approve transactions
- Transfer ERC20 tokens
- Update quorum

### MultisigFactory.sol

A factory contract for deploying multiple Multisig wallets.

Key features:
- Create new Multisig wallets
- Keep track of deployed Multisig wallets

## Testing

The project includes comprehensive test suites for both the Multisig and MultisigFactory contracts.

### Multisig Tests

Located in `test/Multisig.ts`, these tests cover:
- Deployment
- Transfer functionality
- Transaction approval
- Quorum updates

### MultisigFactory Tests

Located in `test/MultisigFactory.ts`, these tests cover:
- Deployment of the factory
- Creation of multiple Multisig wallets
- Retrieval of deployed Multisig addresses

## Deployment Scripts

The project includes a deployment script for  (`ignition/modules/<script_name>`) for deploying and interacting with the contracts on a live network.

Key operations:
- Deploy MultisigFactory
- Create Multisig wallets
- Transfer tokens to Multisig
- Approve and execute transactions
- Update and approve new quorum

## Setup and Usage

1. Install dependencies:
   ```
   npm install
   ```

2. Compile contracts:
   ```
   npx hardhat compile
   ```

3. Run tests:
   ```
   npx hardhat test
   ```

4. Deploy contracts (adjust network as needed):
   ```
   npx hardhat run scripts/deploy.js --network <network_name>
   npx hardhat ignition deploy ./ignition/modules/<script_name> --network <network_name>
   ```

## Security Considerations

- Ensure proper access control for critical functions
- Validate inputs thoroughly to prevent potential exploits
- Consider using OpenZeppelin's security tools for additional safety

## Future Improvements

- Implement event logging for better tracking of wallet activities
- Add a user interface for easier interaction with the Multisig wallets
- Implement time locks for added security on high-value transactions

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This code is provided as-is and should be thoroughly audited before use in any production environment.