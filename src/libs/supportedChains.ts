import { hyperionTestnet } from './hyperionTestnetChain';

// Export all supported chains as a reusable array
export const SUPPORTED_CHAINS = [hyperionTestnet] as const;

// Export chain IDs for easy checking
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(chain => chain.id);

// Currency configuration for different chains
export const CURRENCY_CONFIG = {
  133717: { // Hyperion (Testnet)
    symbol: 'tMETIS',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '2.5']
  },
  default: {
    symbol: 'tMETIS',
    multiplier: 1,
    defaultAmounts: ['0.1', '0.5', '2.5']
  }
} as const;