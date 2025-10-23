# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

RealMind is a blockchain-based educational platform that gamifies learning through quiz games with onchain rewards. Users pay an entry fee to participate in quizzes and earn YUZU tokens based on their performance. The platform is deployed on multiple chains (Base, Celo, EDU Chain) and features leaderboards, seasonal rewards, and a comprehensive progression system.

## Development Commands

### Frontend Development
```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server (Vite)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Lint code with Biome
pnpm run lint

# Development with ngrok tunnel
pnpm run dev:ngrok

# Run both dev server and ngrok concurrently
pnpm run dev:all
```

### Smart Contract Development
```bash
# Navigate to contracts directory first
cd contracts

# Build contracts with Foundry
forge build

# Run tests
forge test

# Format Solidity code
forge fmt

# Gas snapshots
forge snapshot

# Deploy to Base Mainnet (example)
source .env && rm -rf cache out && forge build && forge script --chain 8453 script/QuizGame.s.sol:QuizGameScript --rpc-url https://mainnet.base.org --broadcast -vvvv --private-key ${PRIVATE_KEY}

# Predict contract addresses (CREATE2)
forge script script/QuizGame.s.sol:QuizGameScript --sig "predictAddresses()" --rpc-url https://mainnet.base.org

# Verify contract on Basescan
forge verify-contract \
  --chain-id 8453 \
  --rpc-url https://mainnet.base.org \
  --etherscan-api-key $BASESCAN_API_KEY \
  <CONTRACT_ADDRESS> \
  src/QuizGame.sol:QuizGame
```

### Backend Development
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run local development with Vercel CLI
vc dev

# Build
vc build

# Deploy to Vercel
vc deploy
```

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite, TanStack Router (file-based routing), Wagmi v2 + Viem (Web3), Tailwind CSS v4, Framer Motion
- **Smart Contracts**: Solidity 0.8.24+, Foundry, OpenZeppelin contracts
- **Wallet Integration**: OnchainKit (Coinbase), WalletConnect v2, Farcaster MiniApp SDK
- **Backend**: Node.js + TypeScript, deployed on Vercel

### Frontend Architecture

#### Routing
- Uses TanStack Router with file-based routing in `src/routes/`
- Route tree auto-generated in `src/routeTree.gen.ts`
- Main routes: `/` (home/dashboard), `/quiz-game` (game interface), `/leaderboard`, `/profile`, `/ai-quiz`, `/landing`

#### State Management
- React Context for wallet modal state (`src/contexts/WalletModalContext.tsx`)
- TanStack Query for server state and blockchain data caching
- Local storage for user progress and achievements

#### Web3 Integration
- Wagmi configuration in `src/wagmi.ts`
- Supports multiple chains via `VITE_SUPPORTED_CHAIN_ID` environment variable
- Chain-specific contract addresses managed in `src/libs/constants.ts`
- ABIs stored in `src/libs/` (quizGameABI.ts, token1ABI.ts)

#### Key Services
- `blockchainServices.ts`: Core blockchain utilities, transaction handling, integrations (RedStone Oracle, Goldsky, ThirdWeb NFT)
- `leaderboardService.ts`: Leaderboard data fetching and management
- `progressSystem.ts`: User XP, levels, streaks, achievements tracking (stored in localStorage)
- `supportedChains.ts`: Multi-chain configuration with environment-based chain selection

#### Multi-Chain Deployment Model
The app uses a **single-chain deployment** approach via environment variable:
- Set `VITE_SUPPORTED_CHAIN_ID` to deploy for specific chain (42220=Celo, 8453=Base, 41923=EDU Chain)
- Each deployment URL supports only one chain
- Contract addresses per chain configured in `src/libs/constants.ts`

### Smart Contract Architecture

#### Core Contracts (in `contracts/src/`)
1. **Token1.sol**: Soulbound ERC-20 token (non-transferable) for reward distribution
   - Minted by QuizGame contract based on user performance
   - Cannot be transferred or approved (soulbound)

2. **QuizGame.sol**: Main game logic contract
   - Handles quiz session lifecycle (start/complete)
   - Entry fee collection and vault forwarding
   - Token minting with performance-based bonuses (20% bonus for perfect scores)
   - One active session per user at a time (auto-completes previous session on new start)
   - Uses CREATE2 for deterministic cross-chain addresses

3. **SeasonReward.sol**: Seasonal leaderboard reward distribution
   - Manages top 200 winners per season
   - Automated reward payouts based on rankings

4. **RetentionSystem.sol**: Gamification features (in development)
   - Daily missions, check-ins, referral tracking

#### Deployment Strategy
- Uses Foundry with CREATE2 for predictable contract addresses across chains
- Deployment scripts in `contracts/script/`
- Configurations in `contracts/foundry.toml`

### Configuration Files

#### Environment Variables Required
```bash
# Frontend (.env)
VITE_WALLETCONNECT_PROJECT_ID=     # From cloud.walletconnect.com
VITE_ONCHAINKIT_API_KEY=           # From portal.cdp.coinbase.com
VITE_SUPPORTED_CHAIN_ID=           # 42220 (Celo), 8453 (Base), or 41923 (EDU Chain)
VITE_BACKEND_URL=                  # Optional, defaults to localhost:3000

# Smart Contracts (contracts/.env)
PRIVATE_KEY=                        # Deployer private key
BASESCAN_API_KEY=                  # For Base contract verification
```

#### Key Config Files
- `vite.config.ts`: Vite with TanStack Router plugin, Tailwind CSS v4 plugin, path aliases (@/...)
- `tsconfig.json`: TypeScript with strict mode, path mapping for @/* imports
- `biome.json`: Linter/formatter configuration (120 char line width, spaces)
- `contracts/foundry.toml`: Solidity 0.8.30, optimizer enabled, London EVM

### Component Organization
- `src/components/`: Reusable UI components (WalletModal, GlobalHeader, BottomNavigation, etc.)
- `src/components/ui/`: Generic UI primitives (Button, Dialog from Radix UI)
- Gamification components: DailyMissions, AchievementsGallery, ProgressDashboard, GamifiedEndScreen

### Data Flow
1. User connects wallet via WalletModal (OnchainKit or WalletConnect)
2. Frontend reads active chain from wallet, validates against `SUPPORTED_CHAIN`
3. User starts quiz → `startQuiz()` transaction on QuizGame contract
4. User completes quiz → `completeQuiz()` transaction mints tokens based on score
5. Leaderboard data fetched from blockchain events and cached via TanStack Query
6. User progress (XP, achievements) tracked in localStorage, synchronized with onchain stats

### Testing Strategy
- Smart contracts: Use `forge test` for Solidity unit tests
- Frontend: No specific test runner configured yet (consider adding Vitest)
- Manual testing across chains using different `VITE_SUPPORTED_CHAIN_ID` values

## Common Development Patterns

### Adding a New Quiz Category
1. Update quiz questions in appropriate route component
2. Ensure contract addresses exist for target chain in `src/libs/constants.ts`
3. Update leaderboard service if category needs separate tracking

### Supporting a New Chain
1. Add chain definition in `src/libs/supportedChains.ts`
2. Deploy contracts to new chain using Foundry scripts
3. Add contract addresses to `CONTRACT_ADDRESSES` in `src/libs/constants.ts`
4. Add rewards config to `REWARDS_CONFIG` in same file
5. Deploy new frontend instance with updated `VITE_SUPPORTED_CHAIN_ID`

### Modifying Smart Contracts
1. Edit contracts in `contracts/src/`
2. Run `forge build` to verify compilation
3. Run `forge test` to ensure tests pass
4. Deploy using deployment scripts with CREATE2 for consistent addresses
5. Update ABIs in frontend if interface changed (copy from `contracts/out/`)
6. Verify on block explorer after deployment

### Working with Wallet Integration
- Primary wallet modal in `src/components/WalletModal.tsx`
- Opens via custom event: `window.dispatchEvent(new Event('openWalletModal'))`
- Wagmi hooks for blockchain interactions (useAccount, useConnect, useWriteContract, useReadContract)
- OnchainKit components for Coinbase Smart Wallet integration

## Deployment

### Frontend Deployment (Vercel)
- Auto-deploys from GitHub pushes
- Set environment variables in Vercel dashboard
- Configured via `vercel.json` for SPA routing
- See `DEPLOYMENT.md` for detailed steps

### Smart Contract Deployment
- Use Foundry scripts with CREATE2 for deterministic addresses
- Store private keys in `contracts/.env` (NEVER commit)
- Verify contracts on block explorer after deployment
- See `contracts/DEPLOYMENT.md` and `contracts/DEPLOYMENT_GUIDE.md`

## Important Notes

- **Chain-Specific Deployments**: Each deployment URL targets one chain only. Do not try to support multiple chains in a single deployment.
- **Soulbound Tokens**: YUZU tokens are non-transferable by design. Do not attempt to implement transfer functionality.
- **Session Management**: Users can only have one active quiz session at a time. Starting a new session auto-fails the previous one.
- **Gas Optimization**: Contracts use CREATE2 and are optimized for gas efficiency. Be mindful when modifying.
- **LocalStorage**: User progress data (XP, streaks, achievements) is stored locally and not synced across devices.
