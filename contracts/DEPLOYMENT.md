## 🚀 Deployment Commands (Base Mainnet)

### Base Mainnet - Chain ID: 8453

```bash
source .env && rm -rf cache out && forge build && forge script --chain 8453 script/QuizGame.s.sol:QuizGameScript --rpc-url https://mainnet.base.org --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

```bash
source .env && rm -rf cache out && forge build && forge script --chain 8453 script/QuizGame.s.sol:QuizGameScript --rpc-url https://mainnet.base.org --broadcast -vvvv --private-key ${PRIVATE_KEY} --slow --batch-size 1
```

## 🌐 Base Mainnet Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Base |
| **Chain ID** | 8453 |
| **RPC Endpoint** | https://mainnet.base.org |
| **Alternative RPC** | https://base.llamarpc.com |
| **Currency Symbol** | ETH |
| **Block Explorer URL** | https://basescan.org |
| **Bridge** | https://bridge.base.org |

## 📋 Contract Verification

After deployment, verify your contracts on Basescan:

```bash
# Verify QuizGame contract on Base
forge verify-contract \
--chain-id 8453 \
--rpc-url https://mainnet.base.org \
--etherscan-api-key $BASESCAN_API_KEY \
<CONTRACT_ADDRESS> \
src/QuizGame.sol:QuizGame

# Verify Token1 contract on Base
forge verify-contract \
--chain-id 8453 \
--rpc-url https://mainnet.base.org \
--etherscan-api-key $BASESCAN_API_KEY \
<TOKEN_CONTRACT_ADDRESS> \
src/QuizGame.sol:Token1
```

## 🔗 Useful Resources

- **Explorer**: https://basescan.org/
- **RPC**: https://mainnet.base.org
- **Bridge**: https://bridge.base.org/
- **Docs**: https://docs.base.org/
- **Status**: https://status.base.org/
