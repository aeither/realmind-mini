import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useAccount, useReadContract, useConnect, useDisconnect } from 'wagmi';
import { formatEther } from 'viem';
import { getContractAddresses, token1ABI } from '../libs/constants';

interface GlobalHeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
}

function GlobalHeader({
  showBackButton = false,
  backTo = "/",
  backText = "← Back"
}: GlobalHeaderProps) {
  const { address, chain, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : null;

  // Get Token1 balance using read contract
  const { data: tokenBalance } = useReadContract({
    address: contractAddresses?.token1ContractAddress as `0x${string}`,
    abi: token1ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address && !!contractAddresses,
    },
  });

  // Get Token1 symbol
  const { data: tokenSymbol } = useReadContract({
    address: contractAddresses?.token1ContractAddress as `0x${string}`,
    abi: token1ABI,
    functionName: 'symbol',
    query: {
      enabled: !!address && !!contractAddresses,
    },
  });
  
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "0.75rem clamp(0.5rem, 3vw, 2rem)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(16, 24, 40, 0.06)"
      }}
    >
      {/* Left side - Realmind text and Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "clamp(0.5rem, 4vw, 2rem)" }}>
        {showBackButton && (
          <Link
            to={backTo}
            style={{
              color: "hsl(var(--primary))",
              textDecoration: "none",
              fontSize: "clamp(0.9rem, 3vw, 1rem)",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#3aaa00";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(var(--primary))";
            }}
          >
            <span className="hidden sm:inline">{backText}</span>
            <span className="sm:hidden">←</span>
          </Link>
        )}
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Link
          to="/"
          style={{
            color: "hsl(var(--primary))",
            textDecoration: "none",
            fontSize: "clamp(1rem, 4vw, 1.5rem)",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          Realmind
        </Link>
        </motion.div>
      </div>

      {/* Right side - Token Balance and Connect Button */}
      <motion.div style={{ display: "flex", alignItems: "center", gap: "clamp(0.5rem, 2vw, 1rem)" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* Token Balance Display */}
        {address && tokenBalance !== undefined && tokenBalance !== 0n && tokenSymbol && (
          <div style={{
            background: "hsl(var(--quiz-selected))",
            borderRadius: "8px",
            padding: "clamp(0.25rem, 1vw, 0.5rem) clamp(0.5rem, 2vw, 1rem)",
            border: "1px solid hsl(var(--primary))"
          }}>
            <div style={{
              color: "hsl(var(--primary))",
              fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <span>🟢</span>
              <span className="hidden sm:inline">{parseFloat(formatEther(tokenBalance)).toFixed(2)} {tokenSymbol}</span>
              <span className="sm:hidden">{parseFloat(formatEther(tokenBalance)).toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {/* Farcaster Connect Button */}
        <motion.div whileHover={{ scale: 1.02 }}>
          {isConnected ? (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{
                background: 'hsl(var(--quiz-selected))',
                borderRadius: '8px',
                padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.6rem, 2.5vw, 1rem)',
                border: '1px solid hsl(var(--primary))',
                color: 'hsl(var(--primary))',
                fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                fontWeight: '600',
              }}>
                <span className="hidden sm:inline">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <span className="sm:hidden">{address?.slice(0, 4)}...{address?.slice(-2)}</span>
              </div>
              <button
                onClick={() => disconnect()}
                style={{
                  background: 'hsl(var(--primary))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.6rem, 2.5vw, 1rem)',
                  fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              style={{
                background: 'hsl(var(--primary))',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: 'clamp(0.4rem, 1.5vw, 0.6rem) clamp(0.6rem, 2.5vw, 1rem)',
                fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Connect Wallet
            </button>
          )}
        </motion.div>
      </motion.div>
    </header>
  );
}

export default GlobalHeader; 