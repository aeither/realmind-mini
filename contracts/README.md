## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy with CREATE2 (Predictable Addresses)

The deployment script uses CREATE2 to deploy contracts to the same deterministic address across all blockchains.

#### Deploy to Core Testnet2

```shell
# Core Testnet2
source .env && rm -rf cache out && forge build && forge script --chain 1114 script/QuizGame.s.sol:QuizGameScript --rpc-url https://rpc.test2.btcs.network --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

#### Predict Addresses (Without Deploying)

You can predict the contract addresses before deployment:

```shell
# Predict addresses for Core Testnet2
forge script script/QuizGame.s.sol:QuizGameScript --sig "predictAddresses()" --rpc-url https://rpc.test2.btcs.network
```

### Verify

```shell
# Core Testnet2
forge verify-contract \
  --chain-id 1114 \
  --rpc-url https://rpc.test2.btcs.network \
  --verifier blockscout \
  --verifier-url 'https://scan.test2.btcs.network/api/' \
  <CONTRACT_ADDRESS> \
  src/QuizGame.sol:QuizGame
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
