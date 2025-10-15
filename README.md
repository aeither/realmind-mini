# RealMind

> Interactive blockchain learning platform with gamified quizzes and onchain rewards

## Overview

RealMind transforms blockchain education into an engaging, rewarding experience through gamified quiz games deployed on Base, Celo, and EDU Chain networks.

**Live Demo:** [https://realmind-base.dailywiser.xyz/](https://realmind-base.dailywiser.xyz/)

## What We Do

**RealMind is a play-to-learn onchain quiz platform where users earn crypto rewards for mastering blockchain concepts.**

We've created a Duolingo-style learning experience for Web3, where users:
- Pay a small entry fee to start quiz games
- Answer questions about Web3, DeFi, and blockchain fundamentals
- Earn in tokens based on quiz performance
- Compete on global leaderboards for seasonal rewards
- Track their learning progress with XP points

## Unique Value Proposition

**Learn-to-Earn meets Gamification:**
1. **Financial Incentives:** Unlike traditional education platforms, users earn real crypto rewards (YUZU tokens) for learning
2. **Onchain Verification:** All quiz sessions and rewards are verified on-chain via smart contracts
3. **Multi-Chain Support:** Available on Base (Mainnet), Celo, and EDU Chain
4. **Interactive Learning:** Gamified experience with immediate feedback, leaderboards, and seasonal competitions
5. **Low Barrier to Entry:** Pay-to-play model with micro-stakes (0.001-0.1 ETH) makes it accessible to everyone

**Technical Differentiators:**
- Smart contract-based quiz management with on-chain session tracking
- Transparent reward distribution
- Real-time leaderboards with top winners per season
- Integrated wallet support (RainbowKit, OnchainKit, WalletConnect)

## Ideal Customer Profile

**Primary Users:**
- **Web3 Newcomers:** People learning about blockchain, DeFi, and crypto fundamentals
- **Students & Educators:** Educational institutions teaching blockchain courses
- **Crypto Enthusiasts:** Users who want to test their knowledge while earning rewards
- **Blockchain Developers:** Those seeking to deepen their understanding of Web3 concepts

**Demographics:**
- Age: 18-35 years old
- Tech-savvy individuals interested in cryptocurrency and DeFi
- Users comfortable with crypto wallets and basic transactions
- Global audience (English-speaking initially, multi-language expansion planned)

**User Behavior:**
- Active on crypto Twitter, Discord communities, and Web3 platforms
- Looking for engaging ways to learn blockchain concepts
- Motivated by both knowledge acquisition and financial rewards
- Enjoy gamified experiences and competitive elements

## Technical Stack

**Frontend:**
- React 18 + TypeScript + Vite
- TanStack Router for routing
- Wagmi v2 + Viem for Web3 interactions
- Framer Motion for animations
- Tailwind CSS v4 for styling

**Blockchain:**
- Smart contracts deployed onchain
- ERC-20 token for rewards
- Quiz session management contracts
- Seasonal rewards distribution system

**Wallet Integration:**
- OnchainKit (Coinbase)
- RainbowKit
- WalletConnect v2
- Farcaster MiniApp SDK

## Deployment & Setup

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
```bash
# Install dependencies
pnpm install

# Set environment variables
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_CDP_CLIENT_API_KEY=your_cdp_api_key

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

## Key Features

### 1. Onchain Quiz Games
Pay-to-play quiz system where users:
- Select quiz topics (Web3 Basics, DeFi Fundamentals, Core DAO)
- Complete timed quiz sessions (1 hour time limit)
- Earn rewards based on performance
- All sessions tracked on-chain for transparency

### 2. Learn & Earn
- Master Web3, DeFi, and blockchain concepts
- Instant feedback on answers
- Progressive difficulty levels
- Knowledge base integration

### 3. Global Leaderboards
- Compete with learners worldwide
- Seasonal rankings
- Top 200 winners per season
- Real-time score updates

### 4. Token Rewards
- YUZU token distribution
- Performance-based multipliers
- Automated smart contract payouts
- Transparent reward calculation

## How It Works

1. **Connect Wallet** → Connect to Base, Celo, or EDU Chain
2. **Choose Quiz** → Select from Web3, DeFi, or blockchain topics
3. **Pay Entry Fee** → Stake 0.001-0.1 ETH to start
4. **Answer Questions** → Complete quiz within 1 hour
5. **Earn Rewards** → Receive up to 190% returns in YUZU tokens

## Development Status

**Current Stage:** Live on mainnet with active users

**Deployed Contracts:**
- ✅ Quiz game smart contracts
- ✅ ERC-20 token contracts (YUZU)
- ✅ Season rewards distribution system
- ✅ Leaderboard tracking

**Active Features:**
- ✅ Multi-chain support
- ✅ Wallet connection (RainbowKit, OnchainKit)
- ✅ Quiz game interface with 3 quiz categories
- ✅ On-chain session management
- ✅ Token reward distribution
- ✅ Global leaderboards
- ✅ Responsive UI with animations

**In Development:**
- 🔄 Additional quiz categories
- 🔄 NFT badges for achievements
- 🔄 Guild/team competitions
- 🔄 PvP quiz duels
- 🔄 Daily Check ins
- 🔄 Referral

## Business Model

**Revenue Streams:**
1. **Quiz Entry Fees:** Users pay micro-stakes (0.001-0.1 ETH) to play
2. **Protocol Fees:** Small percentage of entry fees retained by protocol
3. **Sponsored Quizzes:** Blockchain projects sponsor branded quiz content
4. **Premium Features:** Advanced analytics, custom quizzes, NFT badges

## Team

**Founders:**
- Giovanni - Full-stack developer & smart contract engineer
  - Background: Web3 development, DeFi protocols, educational platforms

**Technical Development:**
- Solo founder project with plans to expand team

**Timeline:**
- Current status: Live and actively iterating

## Why?

1. **Scale & Growth:** We want to deepen integration with ecosystem tools, expand our user base, and distribute meaningful rewards to learners on the network.

2. **Technical Support:** Get guidance on optimizing gas costs, improving smart contract security, and leveraging chain-specific features to enhance user experience.

3. **Community & Network:** Connect with other builders in the ecosystem, potential partners for sponsored quizzes, and investors interested in Web3 education.

4. **Product Feedback:** Learn from experienced founders and mentors to refine our product-market fit and growth strategy.

5. **Go-to-Market:** Accelerate user acquisition through ecosystem partnerships with educational institutions, crypto communities, and Web3 projects.

6. **Long-term Vision:** Build RealMind into the go-to learn-to-earn platform for blockchain education, leveraging the best chains and ecosystems to maximize impact.

## Roadmap

**Phase 1 - Foundation (Completed):**
- ✅ Launch on Base, Celo, EDU Chain mainnets
- ✅ Deploy YUZU token and reward contracts
- 🔄 Onboard first 1,000 users
- 🔄 Complete first seasonal leaderboard

**Phase 2 - Engagement Features:**
- Daily tasks and check-in rewards
- Referral system with bonus rewards
- Expand to 10+ quiz categories
- Launch NFT achievement badges

**Phase 3 - Social & Competition:**
- PvP quiz duels
- Introduce guild/team features
- Integration with Farcaster Frames
- Sponsored quiz content from Web3 projects

**Phase 4 - Scale & Enterprise:**
- Multi-language support (5+ languages)
- Advanced analytics dashboard
- Custom quiz builder for educators
- Partnerships with blockchain education platforms
- Enterprise partnerships for corporate training
