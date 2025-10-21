import { http, createConfig } from 'wagmi';
import { cookieStorage, createStorage } from 'wagmi';
import { SUPPORTED_CHAINS } from './libs/supportedChains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { metaMask, walletConnect, injected } from 'wagmi/connectors'

const config = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: SUPPORTED_CHAINS.reduce((acc, chain) => {
    acc[chain.id] = http();
    return acc;
  }, {} as Record<number, ReturnType<typeof http>>),
  connectors: [
    metaMask(),
    miniAppConnector(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
    }),
    injected(),
  ],
  ssr: false,
  storage: createStorage({
    storage: cookieStorage,
  }),
  multiInjectedProviderDiscovery: true,
});

export { config };

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
