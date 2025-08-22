import { MiniKitProvider } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';
import { base } from 'wagmi/chains';

export function MiniKitContextProvider({ children }: { children: ReactNode }) {
  // Handle both Vite and Next.js environment variable patterns
  const apiKey = import.meta.env.VITE_CDP_CLIENT_API_KEY || 
                 (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_CDP_CLIENT_API_KEY) || 
                 undefined;

  return (
    <MiniKitProvider 
      apiKey={apiKey} 
      chain={base}
    >
      {children}
    </MiniKitProvider>
  );
}
