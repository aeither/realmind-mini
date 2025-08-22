import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  // Use Vite environment variables only
  const apiKey = import.meta.env.VITE_CDP_CLIENT_API_KEY;

  return (
    <MiniKitProvider 
      apiKey={apiKey} 
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
}
