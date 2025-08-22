import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
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
  const { address, chain } = useAccount();
  
  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(133717); // Default to Hyperion (Testnet)

  // Get Token1 balance using read contract
  const { data: tokenBalance } = useReadContract({
    address: contractAddresses.token1ContractAddress as `0x${string}`,
    abi: token1ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
    },
  });

  // Get Token1 symbol
  const { data: tokenSymbol } = useReadContract({
    address: contractAddresses.token1ContractAddress as `0x${string}`,
    abi: token1ABI,
    functionName: 'symbol',
    query: {
      enabled: !!address,
    },
  });
  
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid hsl(var(--border))",
        padding: "1rem clamp(1rem, 4vw, 2rem)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 10px rgba(16, 24, 40, 0.06)"
      }}
    >
      {/* Left side - Logo and Back button */}
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
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
          🍋 <span className="hidden sm:inline">Realmind</span>
        </Link>
        </motion.div>
      </div>

      {/* Center - Navigation removed (only logo/back remain) */}
      <nav />

      {/* Right side - Token Balance and Connect Button */}
      <motion.div style={{ display: "flex", alignItems: "center", gap: "1rem" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {/* Token Balance Display */}
        {address && tokenBalance !== undefined && tokenBalance !== 0n && tokenSymbol && (
          <div style={{
            background: "hsl(var(--quiz-selected))",
            borderRadius: "8px",
            padding: "0.5rem 1rem",
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
              <span className="hidden sm:inline">{formatEther(tokenBalance)} {tokenSymbol}</span>
              <span className="sm:hidden">{formatEther(tokenBalance)}</span>
            </div>
          </div>
        )}
        
        {/* RainbowKit Connect Button */}
        <motion.div whileHover={{ scale: 1.02 }}>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          style={{
                            background: "hsl(var(--primary))",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            minWidth: "auto"
                          }}
                        >
                          <span className="hidden sm:inline">Connect</span>
                          <span className="sm:hidden">C</span>
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          <span className="hidden sm:inline">Wrong network</span>
                          <span className="sm:hidden">!</span>
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button
                          onClick={openChainModal}
                          type="button"
                          style={{
                            background: "hsl(var(--quiz-selected))",
                            color: "hsl(var(--primary))",
                            border: "1px solid hsl(var(--primary))",
                            borderRadius: "8px",
                            padding: "0.5rem",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                marginRight: "4px",
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              )}
                            </div>
                          )}
                          <span className="hidden sm:inline">{chain.name}</span>
                          <span className="sm:hidden">{chain.name?.charAt(0)}</span>
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          style={{
                            background: "hsl(var(--quiz-selected))",
                            color: "hsl(var(--primary))",
                            border: "1px solid hsl(var(--primary))",
                            borderRadius: "8px",
                            padding: "0.5rem 1rem",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            cursor: "pointer"
                          }}
                        >
                          <span className="hidden sm:inline">
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </span>
                          <span className="sm:hidden">
                            {account.displayName?.charAt(0) || account.address?.slice(2, 4)}
                          </span>
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </motion.div>
      </motion.div>
    </motion.header>
  );
}

export default GlobalHeader; 