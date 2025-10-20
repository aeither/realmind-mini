# Token Distribution Script

A TypeScript script to distribute Token1 tokens to multiple addresses using the QuizGame contract's `mintToken` function on EDU Chain.

## Features

- Reads addresses and amounts from CSV file
- Uses viem for blockchain interactions
- Validates contract ownership before minting
- Waits for transaction confirmation
- Updates CSV with explorer links after each successful transaction
- Resumes from last checkpoint (skips already processed addresses)
- Handles errors gracefully and continues with remaining addresses
- Adds 2-second delay between transactions to avoid rate limiting

## Prerequisites

1. Node.js and pnpm installed
2. Private key with contract owner permissions
3. CSV file with addresses and amounts

## CSV Format

Your CSV should have 2 columns (header row is required):

```csv
Address,Airdrop_Amount
0xf7dcc97e4158c756345b7202025648d5ac11cdf4,352.7000060000000000597
0x4d22f5409d0f7ea11b23d7ef8734ba95481fa2e2,205.8000000000000000343
```

After processing, the script adds two more columns:

```csv
Address,Airdrop_Amount,Explorer_Link,Status
0xf7dcc97e...,352.70,https://explorer.edu-chain.raas.gelato.cloud/tx/0x123...,success
```

## Configuration

Edit the configuration section at the top of `distribute.ts`:

```typescript
// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const CSV_FILE_PATH = './sr4airdrop/edu/nft_holders_airdrop.csv';
const TARGET_CHAIN = eduChain; // Change to: base or eduChain
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}`;

// Contract address is automatically loaded based on TARGET_CHAIN
const QUIZ_GAME_CONTRACT_ADDRESS = getContractAddresses(TARGET_CHAIN.id).quizGameContractAddress;
```

- **CSV_FILE_PATH**: Path to your CSV file (relative to project root, e.g., `./scripts/sr4airdrop/edu/nft_holders_airdrop.csv`)
- **TARGET_CHAIN**: The blockchain to deploy on (`base` or `eduChain`)
- **PRIVATE_KEY**: Set via `.env` file in project root

The contract address is automatically loaded from `src/libs/constants.ts` based on the selected chain.

**Note:** All paths are relative to the project root directory. The script should be run from the project root, not from the `scripts` directory.

## Usage

1. Create a `.env` file in the project root (if not already exists):

```bash
# .env
PRIVATE_KEY=0x...
```

2. Update the CSV_FILE_PATH in the script to point to your CSV file (relative to project root)

3. Run the script from the project root:

```bash
# Option 1: Direct execution
pnpm tsx scripts/distribute.ts

# Option 2: Using npm script (recommended)
pnpm distribute
```

## What the Script Does

1. **Validates** your private key is set
2. **Verifies** you are the contract owner
3. **Loads** addresses from CSV
4. **Filters** out already processed addresses (those with explorer links)
5. **Processes** each address:
   - Converts decimal amount to wei (18 decimals)
   - Calls `mintToken(address, amount)` on QuizGame contract
   - Waits for transaction confirmation
   - Updates CSV with explorer link and status
6. **Provides** a summary of successful and failed transactions

## Decimal Formatting

The script uses viem's `parseEther` to convert decimal amounts to wei:

```typescript
// CSV: 352.7 tokens
// Converts to: 352700000000000000000 wei (352.7 × 10^18)
const amountInWei = parseEther(record.amount);
```

Token1 uses 18 decimals (standard ERC20), so:
- 1 token = 1000000000000000000 wei
- 0.001 token = 1000000000000000 wei

## Explorer Links

The script automatically gets the explorer URL from the chain configuration:

```typescript
const explorerUrl = eduChain.blockExplorers.default.url;
// "https://explorer.edu-chain.raas.gelato.cloud"

const explorerLink = `${explorerUrl}/tx/${hash}`;
```

## Error Handling

- If a transaction fails, the script marks it as "failed" in the CSV and continues
- The CSV is updated after each transaction (success or failure)
- You can re-run the script - it will skip addresses that already have explorer links

## Example Output

```
🚀 Starting token distribution...

📍 Using account: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6

🔍 Explorer URL: https://explorer.edu-chain.raas.gelato.cloud

👑 Contract Owner: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6
👤 Your Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb6
✅ Owner verification passed

📊 Loaded 27 records from CSV

⏳ Processing 27 pending airdrops...

[1/27] Processing 0xf7dcc97e4158c756345b7202025648d5ac11cdf4...
   Amount: 352.7000060000000000597 tokens
   Amount in wei: 352700006000000000597
   📤 Sending transaction...
   ⏳ Transaction hash: 0x123...
   ⏳ Waiting for confirmation...
   ✅ Success! Block: 12345678
   🔗 https://explorer.edu-chain.raas.gelato.cloud/tx/0x123...
✅ CSV updated: /path/to/nft_holders_airdrop.csv
   ⏸️  Waiting 2 seconds before next transaction...

[2/27] Processing 0x4d22f5409d0f7ea11b23d7ef8734ba95481fa2e2...
...

============================================================
📊 DISTRIBUTION SUMMARY
============================================================
✅ Successful: 27
❌ Failed: 0
📝 Total processed: 27
============================================================

✅ Distribution complete!
```

## Changing Networks

The script supports Base and EDU Chain out of the box. Simply change the `TARGET_CHAIN` constant:

```typescript
// For Base
const TARGET_CHAIN = base;

// For EDU Chain
const TARGET_CHAIN = eduChain;
```

Contract addresses are automatically loaded from `src/libs/constants.ts` based on the chain ID.

To add support for additional networks:

1. Define the chain using viem's `defineChain`
2. Add the contract addresses to `src/libs/constants.ts`
3. Set `TARGET_CHAIN` to your new chain

```typescript
import { myChain } from 'viem/chains'; // or define it

const TARGET_CHAIN = myChain;
```

## Security Notes

- Never commit your private key
- Use environment variables for sensitive data
- Test with small amounts first
- Verify contract addresses before running
- Keep your CSV file backed up

## Troubleshooting

**"You are not the contract owner"**
- Make sure you're using the correct private key
- Verify the contract address is correct

**"PRIVATE_KEY environment variable is required"**
- Set the environment variable: `export PRIVATE_KEY="0x..."`

**Transaction fails**
- Check you have enough gas
- Verify the recipient address is valid
- Make sure the contract has not been paused

**CSV not updating**
- Check file permissions
- Verify the CSV_FILE_PATH is correct
