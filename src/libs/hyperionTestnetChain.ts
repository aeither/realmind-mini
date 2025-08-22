import { defineChain } from 'viem'

// Hyperion (Testnet) configuration
export const hyperionTestnet = defineChain({
  id: 133717,
  name: 'Hyperion (Testnet)',
  nativeCurrency: {
    decimals: 18,
    name: 'tMETIS',
    symbol: 'tMETIS',
  },
  rpcUrls: {
    default: {
      http: ['https://hyperion-testnet.metisdevops.link'],
    },
    public: {
      http: ['https://hyperion-testnet.metisdevops.link'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Hyperion Testnet Explorer',
      url: 'https://hyperion-testnet-explorer.metisdevops.link',
    },
  },
  testnet: true,
})


