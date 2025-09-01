import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { SUPPORTED_CHAINS } from './libs/supportedChains';

// Use getDefaultConfig which automatically includes proper wallet connectors
const config = getDefaultConfig({
  appName: 'Realmind',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: SUPPORTED_CHAINS,
  ssr: true,
});

export { config };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
