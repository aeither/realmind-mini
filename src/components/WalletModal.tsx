import { useConnect } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const { connect, connectors, isPending } = useConnect();

  const getConnectorIcon = (connectorId: string) => {
    switch (connectorId) {
      case 'metaMask':
      case 'io.metamask':
        return '🦊';
      case 'walletConnect':
        return '🔗';
      case 'injected':
        return '💳';
      case 'farcasterMiniApp':
        return '🟣';
      default:
        return '👛';
    }
  };

  const getConnectorName = (connector: any) => {
    if (connector.name === 'MetaMask' || connector.id === 'io.metamask') return 'MetaMask';
    if (connector.id === 'walletConnect') return 'WalletConnect';
    if (connector.id === 'farcasterMiniApp') return 'Farcaster';
    if (connector.name === 'Injected') return 'Browser Wallet';
    return connector.name;
  };

  // Filter connectors: show ready ones and exclude Farcaster (only for browser, not Mini App)
  const availableConnectors = connectors.filter(connector => {
    console.log('connector', connector);
    // Always show WalletConnect (works via QR)
    if (connector.id === 'walletConnect') return true;
    // Don't show Farcaster in browser modal
    if (connector.id === 'farcaster') return false;
    // Show if ready (MetaMask, other injected wallets)
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Realmind
          </DialogDescription>
        </DialogHeader>

        {/* Wallet Options */}
        <div className="flex flex-col gap-3 mt-4">
          {availableConnectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                connect({ connector });
                onClose();
              }}
              disabled={isPending}
              className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#58CC02] hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 disabled:cursor-wait disabled:hover:translate-y-0"
            >
              <span className="text-4xl">
                {getConnectorIcon(connector.id)}
              </span>
              <span className="flex-1 text-left text-lg font-semibold">
                {getConnectorName(connector)}
              </span>
              {isPending && (
                <span className="text-sm">
                  Connecting...
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 leading-relaxed">
            💡 New to Ethereum wallets?{' '}
            <a
              href="https://ethereum.org/en/wallets/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline hover:text-green-900"
            >
              Learn more
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default WalletModal;
