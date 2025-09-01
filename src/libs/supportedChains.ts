import { base } from "viem/chains";

// Export all supported chains as a reusable array
export const SUPPORTED_CHAINS = [base] as const;

// Export chain IDs for easy checking
export const SUPPORTED_CHAIN_IDS = SUPPORTED_CHAINS.map(chain => chain.id);

// Currency configuration for different chains
export const CURRENCY_CONFIG = {
  8453: { // Base (Mainnet)
    symbol: 'ETH',
    multiplier: 1,
    defaultAmounts: ['0.001', '0.01', '0.1']
  },
  default: {
    symbol: 'ETH',
    multiplier: 1,
    defaultAmounts: ['0.001', '0.01', '0.1']
  }
} as const;