import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { routeTree } from './routeTree.gen'
import { config } from './wagmi'
import { WalletModalProvider } from './contexts/WalletModalContext'
import WalletModal from './components/WalletModal'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const queryClient = new QueryClient()

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
        <WalletModalProvider>
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
          <WalletModalManager />
        </WalletModalProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Separate component to use the wallet modal context
function WalletModalManager() {
  const [isOpen, setIsOpen] = useState(false);

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenWalletModal = () => setIsOpen(true);
    window.addEventListener('openWalletModal', handleOpenWalletModal);
    return () => window.removeEventListener('openWalletModal', handleOpenWalletModal);
  }, []);

  return <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}

export default App
