# RealMind

> Blockchain quiz platform with seasonal leaderboard competitions on Base

**Live Demo:** [https://farcaster.xyz/miniapps/QSFpirt1Zyre/realmind/](https://farcaster.xyz/miniapps/QSFpirt1Zyre/realmind/)

## The Problem It Solves

RealMind transforms blockchain education into an engaging, rewarding experience through gamified quiz games deployed on Base.

People use it to:
- Learn blockchain, DeFi, and crypto fundamentals through interactive quizzes
- Earn crypto rewards for mastering Web3 concepts
- Compete on global leaderboards for seasonal prizes
- Track their learning progress with XP points

RealMind makes learning:
- **Interactive**: Duolingo-style gamified experience with immediate feedback
- **Fun**: Pay-to-play model with micro-stakes creates excitement
- **Rewarding**: Earn returns based on quiz performance
- **Transparent**: All quiz sessions and rewards verified on-chain via smart contracts

## Unique Value Proposition

RealMind focuses on knowledge verification rather than social engagement tasks common in quest platforms.

**Core Differentiation:**
- Knowledge-based quizzes with verifiable onchain results
- Seasonal leaderboard competitions instead of one-time airdrops
- Progressive curriculum structure from beginner to advanced topics
- Integration with Farcaster for streamlined user onboarding

**Current Status:**
- Live on Base mainnet
- Smart contract-based leaderboard and reward distribution
- XP progression system across multiple quiz categories
- Processed 100+ quiz sessions

## Technical Challenges

**1. Smart Contract Session Management**
- **Issue**: Users could start multiple concurrent quiz sessions, breaking reward calculations
- **Solution**: Implemented auto-completion logic where starting a new quiz automatically completes any previous session with 0 score

**2. Quiz Generation Reliability**
- **Issue**: Scheduled cron jobs for daily quiz generation failed intermittently
- **Solution**: Built fallback system where the `/daily-quiz` endpoint auto-generates content on-the-fly if cached quiz doesn't exist

**3. Wallet Integration**
- **Issue**: Wallet connection flow needed optimization for Farcaster users
- **Solution**: Integrated OnchainKit for Coinbase Smart Wallet and Farcaster MiniApp SDK for seamless onboarding


## Comparison to Similar Platforms

| Platform | Focus | RealMind Difference |
|----------|-------|---------------------|
| **Layer3** | Quest platform for social tasks and airdrops | Knowledge-based quizzes with verifiable onchain results |
| **Galxe** | NFT badge campaigns for social engagement | Structured curriculum with seasonal competitions |
| **RabbitHole** | Onchain protocol interaction quests | Quiz-based learning without protocol interaction risk |
| **Coinbase Learn** | Educational videos with token rewards | Competitive leaderboards and repeatable earning |
| **Zealy** | Community quest management | Smart contract-based reward distribution |

**Key Differentiation:**  
RealMind combines blockchain education with seasonal leaderboard competitions and onchain verification of quiz performance.

## Target Users

### DeFi Beginners
- Learning blockchain fundamentals before interacting with protocols
- Prefer structured curriculum with progressive difficulty
- Content: Web3 basics, wallet mechanics, DeFi fundamentals

### Quest Platform Users
- Familiar with platforms like Layer3, Galxe, Zealy
- Looking for knowledge-based challenges
- Content: Advanced DeFi topics, protocol-specific quizzes

### Competitive Learners
- Motivated by leaderboard rankings and seasonal competitions
- High engagement with repeated quiz attempts
- Content: Challenging quizzes with timed tournaments

## Distribution Strategy

### Community Channels
1. **Farcaster**
   - Farcaster Frames for quiz sharing
   - MiniApp SDK integration for streamlined onboarding
   - Partnership with crypto education communities

2. **Social Media**
   - Leaderboard winner announcements
   - Educational content tied to quiz topics
   - Engagement with Web3 education creators

3. **Discord Communities**
   - Custom branded quizzes for Base ecosystem projects
   - Community-specific educational content

### Partnership Opportunities
1. **Base Ecosystem Grants**
   - User growth incentive programs
   - Co-marketing with Base Foundation

2. **Protocol Sponsorships**
   - DeFi protocols sponsor educational quizzes about their products
   - Custom quiz content for partner communities

3. **Education Platform Integration**
   - Integrate with existing blockchain education platforms
   - Provide assessment layer for structured courses

---

## How It Works

1. **Connect Wallet** - OnchainKit or Farcaster MiniApp integration
2. **Choose Quiz** - Web3 Basics, DeFi Fundamentals, or advanced topics
3. **Complete Quiz** - 10 questions with time limit
4. **Earn Points** - Quiz performance contributes to leaderboard ranking
5. **Seasonal Rewards** - Top performers receive rewards at the end of each season

## Development Status

**Current Stage:** Live on Base mainnet

**Deployed Contracts:** Quiz game logic, YUZU token (ERC-20), seasonal rewards, leaderboard tracking

**Active Features:** Wallet integration (OnchainKit, Farcaster), multiple quiz categories, seasonal leaderboards

**In Development:** Additional quiz categories, NFT achievement badges, referral system

## Quick Start

```bash
# Install dependencies
pnpm install

# Set environment variables
VITE_WALLETCONNECT_PROJECT_ID=your_project_id
VITE_ONCHAINKIT_API_KEY=your_api_key
VITE_SUPPORTED_CHAIN_ID=8453  # Base mainnet

# Run development server
pnpm run dev

# Build for production
pnpm run build
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) and [WARP.md](./WARP.md) for detailed instructions.

---

## Tech Stack

**Frontend:** React 18 + TypeScript + Vite, TanStack Router, Wagmi v2, Tailwind CSS v4, Framer Motion  
**Smart Contracts:** Solidity 0.8.24+, Foundry, OpenZeppelin  
**Wallet:** OnchainKit (Coinbase), WalletConnect v2, Farcaster MiniApp SDK  
**Backend:** Node.js + TypeScript, Vercel

---

**Built by Giovanni** | [Live Demo](https://realmind-base.dailywiser.xyz/) | Built on Base
