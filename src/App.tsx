import { RainbowKitProvider, lightTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { celo } from 'viem/chains'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { routeTree } from './routeTree.gen'
import { config } from './wagmi'
import { useChainPersistence } from './hooks/useChainPersistence'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

// Component to handle chain persistence inside the WagmiProvider
function ChainPersistenceHandler() {
  const { setPreferredChain } = useChainPersistence();
  
  // Initialize with Celo preference if none exists
  useEffect(() => {
    const savedPreference = localStorage.getItem('realmind-preferred-chain');
    if (!savedPreference) {
      setPreferredChain(celo.id);
    }
  }, [setPreferredChain]);
  
  return null;
}

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Get cookie state for wallet persistence
  const cookie = typeof document !== 'undefined' ? document.cookie : ''
  const initialState = cookie ? cookieToInitialState(config, cookie) : undefined

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={lightTheme({
            accentColor: '#58CC02',
            accentColorForeground: '#ffffff',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          initialChain={celo}
          modalSize="compact"
          showRecentTransactions={true}
          appInfo={{
            appName: 'Realmind',
          }}
        >
          <ChainPersistenceHandler />
          <RouterProvider router={router} />
          <Toaster 
            theme="light"
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                color: '#1f2937',
                borderRadius: '12px'
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default App
