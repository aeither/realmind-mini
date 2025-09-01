import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import {
  zerionWallet,
  okxWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { createConfig, http } from 'wagmi';
import { SUPPORTED_CHAINS } from './libs/supportedChains';

// Custom wallet configuration prioritizing WalletConnect for Zerion mobile support
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        injectedWallet,
        walletConnectWallet,
      ],
    },
    {
      groupName: 'Others',
      wallets: [
        okxWallet,
        zerionWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    appName: 'Realmind',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  }
);

// Create transports for all supported chains
const transports = SUPPORTED_CHAINS.reduce((acc, chain) => {
  acc[chain.id] = http();
  return acc;
}, {} as Record<number, ReturnType<typeof http>>);

const config = createConfig({
  connectors,
  chains: SUPPORTED_CHAINS,
  transports,
  ssr: true,
});

export { config };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
