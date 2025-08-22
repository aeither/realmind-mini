
## 🚀 Deployment Commands (Hyperion Testnet)

### Hyperion (Testnet) - Chain ID: 133717

```bash
source .env && rm -rf cache out && forge build && forge script --chain 133717 script/QuizGame.s.sol:QuizGameScript --rpc-url https://hyperion-testnet.metisdevops.link --broadcast -vvvv --private-key ${PRIVATE_KEY}
```

## 🌐 Hyperion (Testnet) Network Details

| Parameter | Value |
|-----------|-------|
| **Network Name** | Hyperion (Testnet) |
| **Chain ID** | 133717 |
| **RPC Endpoint** | https://hyperion-testnet.metisdevops.link |
| **Currency Symbol** | tMETIS |
| **Block Explorer URL** | https://hyperion-testnet-explorer.metisdevops.link |
| **Faucet** | Telegram Bot |

## 📋 Contract Verification

After deployment, verify your contracts on the Hyperion explorer:

```bash
# Verify QuizGame contract on Hyperion
forge verify-contract \
--chain-id 133717 \
--rpc-url https://hyperion-testnet.metisdevops.link \
--verifier blockscout \
--verifier-url 'https://hyperion-testnet-explorer.metisdevops.link/api/' \
<CONTRACT_ADDRESS> \
src/QuizGame.sol:QuizGame

# Verify Token1 contract on Hyperion
forge verify-contract \
--chain-id 133717 \
--rpc-url https://hyperion-testnet.metisdevops.link \
--verifier blockscout \
--verifier-url 'https://hyperion-testnet-explorer.metisdevops.link/api/' \
<TOKEN_CONTRACT_ADDRESS> \
src/QuizGame.sol:Token1
```

## 🔗 Useful Resources

- **Explorer**: https://hyperion-testnet-explorer.metisdevops.link/
- **RPC**: https://hyperion-testnet.metisdevops.link
- **Faucet**: Telegram Bot
