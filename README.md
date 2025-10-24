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

**What Makes RealMind Different from Quest Platforms:**

Unlike Layer3, Galxe, and Zealy where users complete social tasks (follow/retweet/share) for uncertain future airdrops, RealMind offers:

1. **Knowledge-First Rewards**: Users must demonstrate actual comprehension through multi-question quizzes, not just click engagement buttons. Each quiz tests understanding with 10 carefully designed questions.

2. **Transparent Smart Contract Payouts**: All rewards distributed via Base smart contracts with publicly verifiable logic. No blackbox point systems or arbitrary airdrop decisions.

3. **Pay-to-Play Quality Filtering**: Entry fees (0.001-0.01 ETH) ensure committed learners, creating a higher-quality learning environment compared to free-to-spam quest platforms.

4. **Structured Curriculum**: Progressive learning path from Web3 basics to advanced DeFi, not disconnected one-off tasks. Users build genuine blockchain knowledge systematically.

5. **Competitive Seasonality**: Leaderboard-driven seasons create sustained engagement vs. one-time quest completion. Top performers compete over weeks, not hours.

**Educational Value**:
- Comprehensive topic coverage (wallets, gas, DeFi protocols, smart contracts)
- Immediate feedback on quiz answers with explanations
- XP progression system tracking cumulative learning
- Onchain credentials proving quiz completion and scores

**Current Traction:**
- Live on Base mainnet with 100+ quiz sessions completed
- Smart contract-based leaderboard and reward distribution
- Multiple quiz categories with progressive difficulty
- Farcaster MiniApp integration for seamless onboarding

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


## Competitive Analysis: Why Choose RealMind?

### vs. Layer3 & Galxe
**Their Model**: Social engagement tasks (follow, retweet, Discord joins) with future airdrop promises  
**Why RealMind**: 
- Immediate smart contract payouts, not uncertain future airdrops
- Tests actual knowledge, not social media engagement
- Educational depth: users learn blockchain concepts vs. completing vanity metrics
- Higher quality community: pay-to-play filters out bots and farmers

### vs. RabbitHole
**Their Model**: Onchain protocol interaction quests (swap on DEX, provide liquidity, etc.)  
**Why RealMind**:
- Zero protocol interaction risk: no smart contract exploits or impermanent loss
- Lower capital requirement: 0.001 ETH entry vs. $50-500 for protocol tasks
- Faster completion: 15 minutes per quiz vs. 1+ hour protocol interactions
- Learn BEFORE risking capital in actual DeFi protocols

### vs. Zealy
**Their Model**: Community quest management platform (Web2 dashboard with points)  
**Why RealMind**:
- Fully onchain: rewards distributed via smart contracts, not manual admin processes
- Transparent: all quiz sessions and payouts verifiable on Base
- Permissionless: no community admin needed to distribute rewards
- Blockchain-native experience with wallet integration

### vs. Coinbase Learn
**Their Model**: Educational videos with one-time token rewards  
**Why RealMind**:
- Repeatable earning: take multiple quizzes vs. one-time lessons
- Competitive element: leaderboards create engagement beyond passive video watching
- Progressive difficulty: structured curriculum vs. disconnected individual lessons
- Multi-protocol: not locked to Coinbase ecosystem projects

**Core Competitive Edge:**  
RealMind is the only platform combining (1) knowledge-tested quizzes, (2) transparent smart contract rewards, (3) competitive seasonal leaderboards, and (4) progressive curriculum structure—all built natively on Base.

## Alpha Test Plan & Growth Strategy

### Current Baseline (as of Base Batches Midpoint)
- **Total Users**: 100+ unique quiz participants
- **Quiz Sessions**: 100+ completed
- **Contract Interactions**: 95%+ success rate
- **Platform**: Live on Base mainnet with Farcaster MiniApp integration

### Key Metrics to Track

**Engagement Metrics**:
- **Quiz Completion Rate**: Target 70%+ (industry standard: 50%)
- **Avg Quizzes Per User**: Current 2.3 → Target 3.5+ 
- **7-Day Retention**: Track returning users weekly
- **Time to First Quiz**: Measure wallet connection → quiz start friction

**Learning Metrics**:
- **Average Quiz Score**: Track by category (beginner vs. advanced)
- **Score Improvement Rate**: % users improving on retakes
- **Topic Completion**: % users completing full category (3+ quizzes)

**Economic Metrics**:
- **Entry Fee Distribution**: Track which price points (0.001, 0.005, 0.01 ETH) convert best
- **Reward Claim Rate**: % users claiming seasonal rewards
- **User LTV**: Total entry fees paid per user over 30 days

**Growth Metrics**:
- **Referral Rate**: % users sharing quizzes via Farcaster Frames
- **Viral Coefficient**: New users per existing user per week
- **CAC by Channel**: Cost per user from Farcaster vs. Twitter vs. Discord

### Testing Roadmap (Realistic Timeline)

**Phase 1: Product-Market Fit Validation (Next 2-3 weeks)**
- **Focus**: Improve core experience for existing users
- **Goals**: 
  - Increase completion rate from current baseline to 70%+
  - Reach 3.5+ quizzes per user through better onboarding
  - Gather qualitative feedback from 20+ user interviews
- **Key Activities**:
  - Optimize wallet connection flow (reduce friction)
  - Add 3-5 new quizzes across difficulty levels
  - Implement in-app feedback collection
  - Create Discord community for active users

**Phase 2: Viral Mechanics & Community Building (Weeks 4-6)**
- **Focus**: Enable organic growth through sharing
- **Goals**:
  - Launch referral system and Farcaster Frame sharing
  - Achieve 20%+ share rate on quiz completions
  - Build community of 50+ active Discord members
- **Key Activities**:
  - Leaderboard sharing via Farcaster Frames
  - Weekly winner spotlights on social media
  - Partner with 2-3 Base ecosystem projects for co-marketing
  - Host first community quiz tournament

**Phase 3: Sustainable Growth (Ongoing - Post Base Batches)**
- **Focus**: Scale user base through proven channels
- **Goals**:
  - Grow to 500 users in 3 months post-demo (5x current base)
  - Reach 2,000+ users in 6 months (20x current base)
  - Reach 5,000+ users in 9 months (50x current base)
  - **Target: 10,000+ users within 12-18 months**
- **Key Activities**:
  - Content marketing: educational threads, tutorial videos
  - Strategic partnerships with DeFi protocols for sponsored quizzes
  - Paid acquisition when unit economics proven (LTV:CAC > 3:1)
  - Continuous quiz content expansion
  - Community-driven referral programs

### User Feedback Loop

**Qualitative Research**:
- Bi-weekly 1:1 interviews with 3-5 users across segments
- In-app feedback form after quiz completion
- Discord community for feature requests and bug reports

**Quantitative Analysis**:
- Weekly dashboard review of key metrics
- Monthly cohort analysis (retention by signup month)
- Funnel analysis: landing → wallet connect → quiz start → quiz complete

**Iteration Process**:
1. **Daily**: Monitor for critical bugs, fix wallet connection issues
2. **Weekly**: Analyze metrics, deploy UX improvements
3. **Bi-weekly**: Release new quiz content based on demand
4. **Monthly**: Major feature releases (achievements, tournaments, etc.)

**Risk Mitigation**:
- Focus on retention over pure user count growth
- Smart contract monitoring and emergency pause functionality
- Fallback quiz generation if AI service fails
- Customer support via Discord for onboarding issues

### Success Criteria for Base Batches Final Demo
- ✅ **300-500 unique users** (3-5x current baseline - achievable within program timeline)
- ✅ **70%+ quiz completion rate** (quality over quantity)
- ✅ **3.5+ average quizzes per user** (strong engagement)
- ✅ **Clear product-market fit indicators** (retention, NPS, user testimonials)
- ✅ **Proven unit economics** (sustainable cost per user acquisition)
- ✅ **Clear execution plan showing path to 10K users** within 12-18 months

### Long-Term Growth Target
**Goal: 10,000+ users within 12-18 months post-Base Batches**

This requires more time than the program duration to achieve sustainably. Focus during Base Batches is on proving product-market fit and building the foundation (engagement metrics, viral mechanics, unit economics) needed to scale confidently to 10K+ users.

## Target Customer Segmentation

### Segment 1: DeFi Beginners (Primary Target - 60% of users)

**Profile**:
- 0-6 months crypto experience
- Interested in DeFi but intimidated by complexity and capital risk
- Want to understand concepts before interacting with actual protocols
- Motivated by learning + earning small amounts vs. pure speculation

**Current Behavior**: 
- Watch YouTube tutorials, read articles, but lack hands-on practice
- Afraid to use real DeFi protocols due to smart contract risk
- 65% of users currently completing "Web3 Basics" and "DeFi Fundamentals" quizzes

**Content Strategy**: 
- Foundational topics: wallets, gas fees, DEX mechanics, liquidity pools
- Lower entry fees: 0.001-0.005 ETH to reduce barrier
- Detailed answer explanations to reinforce learning
- Achievement badges for completing learning milestones

**Acquisition**: Farcaster education communities, crypto Twitter educational threads, DeFi Discord servers

---

### Segment 2: Quest Platform Power Users (Secondary Target - 25% of users)

**Profile**:
- Active on Layer3, Galxe, Zealy
- 6+ months crypto experience
- Frustrated with low-effort social tasks, seeking skill-based earning
- Understand wallet mechanics and onchain interactions

**Current Behavior**:
- Complete 3.2 quizzes vs. 2.3 average (40% higher engagement)
- 30% of users have transaction history on quest platforms
- Seek higher-ROI opportunities than standard airdrop farming

**Content Strategy**:
- Advanced DeFi: MEV, liquid staking, yield optimization strategies
- Protocol-specific quizzes with higher stakes: 0.01-0.05 ETH entries
- Sponsored content from DeFi protocols (Uniswap, Aave, etc.)
- Exclusive competitions for experienced users

**Acquisition**: Direct outreach in Layer3/Galxe Discord servers, Twitter campaigns targeting quest users

---

### Segment 3: Competitive Learners (Tertiary Target - 15% of users)

**Profile**:
- Leaderboard-obsessed power users
- Motivated by status, recognition, and competitive ranking
- High retention: 80% of top 50 leaderboard users return weekly
- Account for 35% of total quiz volume despite being 15% of user base

**Current Behavior**:
- Multiple quiz attempts to optimize scores
- Active in community discussions about strategies
- Willing to pay premium entry fees for exclusive competitions

**Content Strategy**:
- High-difficulty challenge quizzes with time pressure
- Exclusive seasonal tournaments: 0.05-0.1 ETH entry
- PvP quiz duels (in development)
- Public leaderboard recognition and winner spotlights

**Acquisition**: Competitive gaming communities, esports Discord servers, Twitter leaderboard announcements

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

**Built by Giovanni** | [Live Demo](https://farcaster.xyz/miniapps/QSFpirt1Zyre/realmind/) | Built on Base
