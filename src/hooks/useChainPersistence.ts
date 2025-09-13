import { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';
import { celo } from 'viem/chains';

const PREFERRED_CHAIN_KEY = 'realmind-preferred-chain';

/**
 * Custom hook to ensure Celo is the default chain when no chain is selected
 * This helps with chain persistence issues in Farcaster apps
 */
export function useChainPersistence() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    if (isConnected && chain) {
      // Save the current chain preference to localStorage
      localStorage.setItem(PREFERRED_CHAIN_KEY, chain.id.toString());
      
      // If user is on Base, automatically switch to Celo (unless they explicitly chose Base)
      if (chain.id === 8453) { // Base chain ID
        const savedPreference = localStorage.getItem(PREFERRED_CHAIN_KEY);
        // Only auto-switch if there's no saved preference or if the saved preference is Celo
        if (!savedPreference || savedPreference === celo.id.toString()) {
          console.log('Auto-switching from Base to Celo for better UX');
          switchChain({ chainId: celo.id });
        }
      }
    }
  }, [chain, isConnected, switchChain]);

  // Function to manually set chain preference
  const setPreferredChain = (chainId: number) => {
    localStorage.setItem(PREFERRED_CHAIN_KEY, chainId.toString());
  };

  return { setPreferredChain };
}
