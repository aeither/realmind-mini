# 🚀 Smart Contract Deployment Guide

## Quick Deploy to Hyperion (Testnet)

### 1. Setup Environment
```bash
# Create .env file in contracts/ directory
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "HYPERION_RPC_URL=https://hyperion-testnet.metisdevops.link" >> .env
```

### 2. Deploy All Demo Contracts
```bash
cd contracts
forge script script/DeployDemoContracts.s.sol \
  --rpc-url $HYPERION_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### 3. Update Frontend Contract Addresses

After deployment, update `src/libs/constants.ts` with the new addresses:

```typescript
const CONTRACT_ADDRESSES = {
  // Hyperion (Testnet)
  133717: {
    token1ContractAddress: "0x...", // From deployment output
    quizGameContractAddress: "0x...", // From deployment output
  }
}
```

### 4. Test Demo
```bash
cd ..
pnpm run dev
# Navigate to http://localhost:5173
```

## Alternative: Manual Deployment

If you prefer to deploy contracts individually:

### Deploy Token Contract
```bash
forge create src/Token1.sol:Token1 \
  --rpc-url $HYPERION_RPC_URL \
  --private-key $PRIVATE_KEY
```

### Deploy Quiz Game Contract
```bash
forge create src/QuizGame.sol:QuizGame \
  --rpc-url $HYPERION_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <TOKEN_ADDRESS>
```

### Deploy Quiz Duel Contract
```bash
forge create src/QuizDuel.sol:QuizDuel \
  --rpc-url $CORE_TESTNET2_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <TOKEN_ADDRESS>
```

### Deploy Guild System Contract
```bash
forge create src/GuildSystem.sol:GuildSystem \
  --rpc-url $CORE_TESTNET2_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <TOKEN_ADDRESS>
```

### Deploy Quiz NFT Contract
```bash
forge create src/QuizNFT.sol:QuizNFT \
  --rpc-url $CORE_TESTNET2_RPC_URL \
  --private-key $PRIVATE_KEY \
  --constructor-args <TOKEN_ADDRESS>
```

## Hyperion (Testnet) Info

- **Chain ID**: 133717
- **RPC URL**: https://hyperion-testnet.metisdevops.link
- **Explorer**: https://hyperion-testnet-explorer.metisdevops.link/
- **Currency Symbol**: tMETIS
- **Faucet**: Telegram Bot

## Verification

After deployment, verify contracts on the Hyperion explorer:
```bash
forge verify-contract <CONTRACT_ADDRESS> src/QuizGame.sol:QuizGame \
  --chain-id 133717 \
  --rpc-url https://hyperion-testnet.metisdevops.link \
  --verifier blockscout \
  --verifier-url 'https://hyperion-testnet-explorer.metisdevops.link/api/' \
  --constructor-args $(cast abi-encode "constructor(address)" <TOKEN_ADDRESS>)
```

---

**Note**: Make sure you have test tMETIS in your wallet for gas fees before deploying!