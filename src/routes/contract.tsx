import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  useAccount, 
  useConnect, 
  useDisconnect, 
  useReadContract, 
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useBalance
} from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { quizGameABI } from '../libs/quizGameABI'
import { getContractAddresses } from '../libs/constants'
import { hyperionTestnet } from '../wagmi'
import Header from '../components/Header'

function ContractDebugPage() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  
  const [selectedAmount, setSelectedAmount] = useState<number>(0.001);
  const [userAnswer, setUserAnswer] = useState<number>(42);
  const [submittedAnswer, setSubmittedAnswer] = useState<number>(42);
  const [newOwnerAddress, setNewOwnerAddress] = useState<string>('');

  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(hyperionTestnet.id);

  // Get user balance
  const { data: balance } = useBalance({
    address,
    chainId: chain?.id || hyperionTestnet.id,
  });

  // Read contract data
  const { data: owner, refetch: refetchOwner } = useReadContract({
    abi: quizGameABI,
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    functionName: 'owner',
    chainId: chain?.id,
  });

  const { data: tokenAddress, refetch: refetchToken } = useReadContract({
    abi: quizGameABI,
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    functionName: 'token',
    chainId: chain?.id,
  });

  const { data: userSession, refetch: refetchSession } = useReadContract({
    abi: quizGameABI,
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    functionName: 'getQuizSession',
    args: address ? [address] : undefined,
    chainId: chain?.id,
  });

  // Write contract hooks
  const { 
    data: startQuizHash, 
    isPending: isStartPending,
    writeContract: startQuiz,
    error: startError,
    reset: resetStart
  } = useWriteContract();

  const { 
    data: completeQuizHash, 
    isPending: isCompletePending,
    writeContract: completeQuiz,
    error: completeError,
    reset: resetComplete
  } = useWriteContract();

  const { 
    data: withdrawHash, 
    isPending: isWithdrawPending,
    writeContract: withdraw,
    error: withdrawError,
    reset: resetWithdraw
  } = useWriteContract();

  const { 
    data: mintTokenHash, 
    isPending: isMintTokenPending,
    writeContract: mintToken,
    error: mintTokenError,
    reset: resetMintToken
  } = useWriteContract();

  const { 
    data: transferOwnershipHash, 
    isPending: isTransferOwnershipPending,
    writeContract: transferOwnership,
    error: transferOwnershipError,
    reset: resetTransferOwnership
  } = useWriteContract();

  const { 
    data: renounceOwnershipHash, 
    isPending: isRenounceOwnershipPending,
    writeContract: renounceOwnership,
    error: renounceOwnershipError,
    reset: resetRenounceOwnership
  } = useWriteContract();

  // Wait for transaction confirmations
  const { isLoading: isStartConfirming, isSuccess: isStartConfirmed } = 
    useWaitForTransactionReceipt({ hash: startQuizHash });

  const { isLoading: isCompleteConfirming, isSuccess: isCompleteConfirmed } = 
    useWaitForTransactionReceipt({ hash: completeQuizHash });

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed } = 
    useWaitForTransactionReceipt({ hash: withdrawHash });

  const { isLoading: isMintTokenConfirming, isSuccess: isMintTokenConfirmed } = 
    useWaitForTransactionReceipt({ hash: mintTokenHash });

  const { isLoading: isTransferOwnershipConfirming, isSuccess: isTransferOwnershipConfirmed } = 
    useWaitForTransactionReceipt({ hash: transferOwnershipHash });

  const { isLoading: isRenounceOwnershipConfirming, isSuccess: isRenounceOwnershipConfirmed } = 
    useWaitForTransactionReceipt({ hash: renounceOwnershipHash });

  // Check if current chain is supported
  const supportedChainIds = [133717, 11155111, 8453, 12345, 1114]; // From CONTRACT_ADDRESSES
  const isCorrectChain = chain ? supportedChainIds.includes(chain.id) : false;

  const handleStartQuiz = () => {
    if (!isConnected) return;
    
    resetStart();
    startQuiz({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'startQuiz',
      args: ["demo-quiz", BigInt(userAnswer)],
      value: parseEther(selectedAmount.toString()),
      chainId: chain?.id,
    });
  };

  const handleCompleteQuiz = () => {
    if (!isConnected) return;
    
    resetComplete();
    completeQuiz({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'completeQuiz',
      args: [BigInt(submittedAnswer)],
      chainId: chain?.id,
    });
  };

  const handleWithdraw = () => {
    if (!isConnected) return;
    
    resetWithdraw();
    withdraw({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'withdraw',
      chainId: chain?.id,
    });
  };

  const handleMintToken = () => {
    if (!isConnected || !address) return;
    
    resetMintToken();
    mintToken({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'mintToken',
      args: [address, parseEther("100")], // Mint 100 tokens
      chainId: chain?.id,
    });
  };

  const handleRefetchAll = () => {
    refetchOwner();
    refetchToken();
    refetchSession();
  };

  const handleTransferOwnership = () => {
    if (!isConnected || !newOwnerAddress) return;
    
    resetTransferOwnership();
    transferOwnership({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'transferOwnership',
      args: [newOwnerAddress as `0x${string}`],
      chainId: chain?.id,
    });
  };

  const handleRenounceOwnership = () => {
    if (!isConnected) return;
    
    resetRenounceOwnership();
    renounceOwnership({
      abi: quizGameABI,
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      functionName: 'renounceOwnership',
      chainId: chain?.id,
    });
  };

  // Calculate token rewards
  const calculateTokenRewards = () => {
    const initialTokens = selectedAmount * 100; // 100x multiplier
    const minBonus = initialTokens * 0.1; // 10% bonus
    const maxBonus = initialTokens * 0.9; // 90% bonus
    const minTotal = initialTokens + minBonus;
    const maxTotal = initialTokens + maxBonus;
    
    return {
      initialTokens,
      minBonus,
      maxBonus,
      minTotal,
      maxTotal
    };
  };

  const rewards = calculateTokenRewards();

  if (!isConnected) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "hsl(var(--background))",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Header 
          title="🔧 Contract Debug"
          subtitle="Debug and test smart contract functions"
          showBackButton={true}
          backTo="/"
          backText="← Back to Home"
        />
        
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          maxWidth: "600px",
          width: "100%",
          boxShadow: "var(--shadow-card)",
          border: "1px solid hsl(var(--border))"
        }}>
          <h2 style={{ fontSize: "1.75rem", marginBottom: "2rem", color: "#111827", fontWeight: 800 }}>
            Connect Wallet to Debug Contract
          </h2>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  backgroundColor: "#58CC02",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#46a001";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#58CC02";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // if (!isCorrectChain) {
  //   return (
  //     <div style={{
  //       minHeight: "100vh",
  //       background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  //       padding: "2rem",
  //       display: "flex",
  //       flexDirection: "column",
  //       alignItems: "center",
  //       justifyContent: "center"
  //     }}>
  //       <Header 
  //         title="🔧 Contract Debug"
  //         subtitle="Debug and test smart contract functions"
  //         showBackButton={true}
  //         backTo="/"
  //         backText="← Back to Home"
  //       />
        
  //       <div style={{
  //         background: "rgba(255, 255, 255, 0.95)",
  //         borderRadius: "16px",
  //         padding: "3rem",
  //         textAlign: "center",
  //         maxWidth: "600px",
  //         width: "100%",
  //         boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
  //       }}>
  //         <h2 style={{ fontSize: "2rem", marginBottom: "2rem", color: "#ef4444" }}>
  //           ⚠️ Wrong Network
  //         </h2>
  //         <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#6b7280" }}>
  //           Please switch to one of the supported networks to debug the contract.
  //         </p>
  //         <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2rem" }}>
  //           <button
  //                             onClick={() => switchChain({ chainId: coreTestnet.id })}
  //             style={{
  //               backgroundColor: "#667eea",
  //               color: "white",
  //               border: "none",
  //               borderRadius: "12px",
  //               padding: "1rem 2rem",
  //               fontSize: "1rem",
  //               fontWeight: "600",
  //               cursor: "pointer",
  //               boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
  //             }}
  //           >
  //                             Switch to Core Testnet
  //           </button>
  //           <button
  //                             // Only Core Testnet is supported now
  //             style={{
  //               backgroundColor: "#22c55e",
  //               color: "white",
  //               border: "none",
  //               borderRadius: "12px",
  //               padding: "1rem 2rem",
  //               fontSize: "1rem",
  //               fontWeight: "600",
  //               cursor: "pointer",
  //               boxShadow: "0 4px 6px rgba(34, 197, 94, 0.3)"
  //             }}
  //           >
  //                             // Only Core Testnet is supported
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <motion.div style={{
      minHeight: "100vh",
      background: "hsl(var(--background))",
      padding: "2rem"
    }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "2rem"
      }}>
        {/* Contract Info */}
        <motion.div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
          border: "1px solid hsl(var(--border))"
        }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            📋 Contract Information
          </h3>
          
          <div style={{ marginBottom: "1rem" }}>
            <strong>Current Chain:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {chain?.name} (ID: {chain?.id})
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>QuizGame Contract:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px",
              wordBreak: "break-all"
            }}>
              {contractAddresses.quizGameContractAddress}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Token1 Contract:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px",
              wordBreak: "break-all"
            }}>
              {contractAddresses.token1ContractAddress}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Connected Wallet:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {address}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Wallet Balance:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {balance ? formatEther(balance.value) : "Loading..."} {chain?.nativeCurrency?.symbol || "ETH"}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Owner:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {owner ? String(owner) : "Loading..."}
            </p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Token Address:</strong>
            <p style={{ 
              fontFamily: "monospace", 
              fontSize: "0.9rem", 
              color: "#374151",
              backgroundColor: "#f9fafb",
              padding: "0.5rem",
              borderRadius: "6px"
            }}>
              {tokenAddress ? String(tokenAddress) : "Loading..."}
            </p>
          </div>

          <button
            onClick={handleRefetchAll}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              cursor: "pointer",
              marginTop: "1rem",
              fontWeight: 700
            }}
          >
            🔄 Refresh Data
          </button>
        </motion.div>

        {/* Token Rewards Calculator */}
        <motion.div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
          border: "1px solid hsl(var(--border))"
        }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            🪙 Token Rewards Calculator
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Entry Amount (ETH):
            </label>
            <input
              type="number"
              step="0.001"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid hsl(var(--border))",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ 
            background: "#f0fdf4", 
            border: "2px solid #22c55e", 
            borderRadius: "12px", 
            padding: "1rem",
            marginBottom: "1rem"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#0c4a6e", fontSize: "1.1rem" }}>
              💰 Reward Breakdown
            </h4>
            <div style={{ fontSize: "0.9rem", color: "#0c4a6e" }}>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Initial Tokens:</strong> {rewards.initialTokens.toFixed(2)} TK1 (100x entry)
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Bonus Range:</strong> {rewards.minBonus.toFixed(2)} - {rewards.maxBonus.toFixed(2)} TK1 (10-90%)
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                <strong>Total Range:</strong> {rewards.minTotal.toFixed(2)} - {rewards.maxTotal.toFixed(2)} TK1
              </p>
            </div>
          </div>

          <div style={{ 
            background: "#ecfeff", 
            border: "2px solid #06b6d4", 
            borderRadius: "12px", 
            padding: "1rem"
          }}>
            <h4 style={{ margin: "0 0 0.5rem 0", color: "#155e75", fontSize: "1.1rem" }}>
              🎯 How It Works
            </h4>
            <ul style={{ margin: 0, paddingLeft: "1rem", fontSize: "0.9rem", color: "#155e75" }}>
              <li>Pay ETH to start quiz</li>
              <li>Get 100x tokens immediately</li>
              <li>Answer correctly for 10-90% bonus</li>
              <li>Keep tokens even if wrong!</li>
            </ul>
          </div>
        </motion.div>

        {/* Quiz Functions */}
        <motion.div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
          border: "1px solid hsl(var(--border))"
        }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            🎮 Quiz Functions
          </h3>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Amount (ETH):
            </label>
            <input
              type="number"
              step="0.001"
              value={selectedAmount}
              onChange={(e) => setSelectedAmount(parseFloat(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid hsl(var(--border))",
                fontSize: "1rem"
              }}
            />
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              User Answer:
            </label>
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isStartPending || isStartConfirming}
            style={{
              backgroundColor: isStartPending || isStartConfirming ? "#a3e635" : "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isStartPending || isStartConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem",
              fontWeight: 700
            }}
          >
            {isStartPending ? "Confirming..." : isStartConfirming ? "Starting Quiz..." : "🚀 Start Quiz"}
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              Submitted Answer:
            </label>
            <input
              type="number"
              value={submittedAnswer}
              onChange={(e) => setSubmittedAnswer(parseInt(e.target.value) || 0)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid hsl(var(--border))",
                fontSize: "1rem"
              }}
            />
          </div>

          <button
            onClick={handleCompleteQuiz}
            disabled={isCompletePending || isCompleteConfirming}
            style={{
              backgroundColor: isCompletePending || isCompleteConfirming ? "#a3e635" : "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isCompletePending || isCompleteConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem",
              fontWeight: 700
            }}
          >
            {isCompletePending ? "Confirming..." : isCompleteConfirming ? "Completing Quiz..." : "✅ Complete Quiz"}
          </button>
        </motion.div>

        {/* Admin Functions */}
        <motion.div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
        }} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            👑 Admin Functions
          </h3>

          <button
            onClick={handleMintToken}
            disabled={isMintTokenPending || isMintTokenConfirming}
            style={{
              backgroundColor: isMintTokenPending || isMintTokenConfirming ? "#9ca3af" : "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isMintTokenPending || isMintTokenConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isMintTokenPending ? "Confirming..." : isMintTokenConfirming ? "Minting Tokens..." : "🪙 Mint 100 Tokens"}
          </button>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawPending || isWithdrawConfirming}
            style={{
              backgroundColor: isWithdrawPending || isWithdrawConfirming ? "#9ca3af" : "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              cursor: isWithdrawPending || isWithdrawConfirming ? "not-allowed" : "pointer",
              width: "100%",
              marginBottom: "1rem"
            }}
          >
            {isWithdrawPending ? "Confirming..." : isWithdrawConfirming ? "Withdrawing..." : "💸 Withdraw Funds"}
          </button>

          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>
              🔐 Ownership Transfer
            </label>
            <input
              type="text"
              placeholder="New owner address (0x...)"
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid hsl(var(--border))",
                fontSize: "1rem",
                marginBottom: "0.5rem"
              }}
            />
            
            <button
              onClick={handleTransferOwnership}
              disabled={isTransferOwnershipPending || isTransferOwnershipConfirming || !newOwnerAddress}
              style={{
                backgroundColor: isTransferOwnershipPending || isTransferOwnershipConfirming || !newOwnerAddress ? "#9ca3af" : "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                cursor: isTransferOwnershipPending || isTransferOwnershipConfirming || !newOwnerAddress ? "not-allowed" : "pointer",
                width: "100%",
                marginBottom: "0.5rem",
                fontWeight: 700
              }}
            >
              {isTransferOwnershipPending ? "Confirming..." : isTransferOwnershipConfirming ? "Transferring..." : "👑 Transfer Ownership"}
            </button>
            
            <button
              onClick={handleRenounceOwnership}
              disabled={isRenounceOwnershipPending || isRenounceOwnershipConfirming}
              style={{
                backgroundColor: isRenounceOwnershipPending || isRenounceOwnershipConfirming ? "#9ca3af" : "#dc2626",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                cursor: isRenounceOwnershipPending || isRenounceOwnershipConfirming ? "not-allowed" : "pointer",
                width: "100%",
                fontWeight: 700
              }}
            >
              {isRenounceOwnershipPending ? "Confirming..." : isRenounceOwnershipConfirming ? "Renouncing..." : "🚫 Renounce Ownership"}
            </button>
          </div>
        </motion.div>

        {/* User Session */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "var(--shadow-card)",
          border: "1px solid hsl(var(--border))"
        }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1f2937" }}>
            👤 User Session
          </h3>

          {userSession ? (
            <div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Active:</strong> {(userSession as any).active ? "✅ Yes" : "❌ No"}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>User Answer:</strong> {(userSession as any).userAnswer?.toString() || "N/A"}
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Amount Paid:</strong> {(userSession as any).amountPaid ? formatEther((userSession as any).amountPaid) : "0"} ETH
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Initial Tokens:</strong> {(userSession as any).amountPaid ? formatEther((userSession as any).amountPaid * BigInt(100)) : "0"} TK1
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Timestamp:</strong> {(userSession as any).timestamp ? new Date(Number((userSession as any).timestamp) * 1000).toLocaleString() : "N/A"}
              </div>
            </div>
          ) : (
            <p style={{ color: "#6b7280" }}>No active session found</p>
          )}
        </div>
      </div>

      {/* Transaction Status */}
      {(isStartPending || isStartConfirming || isCompletePending || isCompleteConfirming || 
        isWithdrawPending || isWithdrawConfirming || isMintTokenPending || isMintTokenConfirming ||
        isTransferOwnershipPending || isTransferOwnershipConfirming || isRenounceOwnershipPending || isRenounceOwnershipConfirming) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          background: "#ecfeff",
          border: "1px solid #06b6d4",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#92400e", fontWeight: "600" }}>
            🔄 Transaction in Progress
          </p>
          <p style={{ margin: 0, color: "#92400e", fontSize: "0.9rem" }}>
            {isStartPending || isStartConfirming ? "Starting quiz..." :
             isCompletePending || isCompleteConfirming ? "Completing quiz..." :
             isWithdrawPending || isWithdrawConfirming ? "Withdrawing funds..." :
             isMintTokenPending || isMintTokenConfirming ? "Minting tokens..." :
             isTransferOwnershipPending || isTransferOwnershipConfirming ? "Transferring ownership..." :
             isRenounceOwnershipPending || isRenounceOwnershipConfirming ? "Renouncing ownership..." : ""}
          </p>
        </div>
      )}

      {/* Error Messages */}
      {(startError || completeError || withdrawError || mintTokenError || transferOwnershipError || renounceOwnershipError) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          background: "#fef2f2",
          border: "1px solid #ef4444",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#991b1b", fontWeight: "600" }}>
            ❌ Transaction Error
          </p>
          <p style={{ margin: 0, color: "#991b1b", fontSize: "0.9rem" }}>
            {startError?.message || completeError?.message || withdrawError?.message || mintTokenError?.message || 
             transferOwnershipError?.message || renounceOwnershipError?.message}
          </p>
        </div>
      )}

      {/* Success Messages */}
      {(isStartConfirmed || isCompleteConfirmed || isWithdrawConfirmed || isMintTokenConfirmed || 
        isTransferOwnershipConfirmed || isRenounceOwnershipConfirmed) && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          background: "#ecfdf5",
          border: "1px solid #10b981",
          borderRadius: "12px",
          padding: "1rem",
          maxWidth: "400px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
        }}>
          <p style={{ margin: "0 0 0.5rem 0", color: "#065f46", fontWeight: "600" }}>
            ✅ Transaction Successful
          </p>
          <p style={{ margin: 0, color: "#065f46", fontSize: "0.9rem" }}>
            {isStartConfirmed ? "Quiz started successfully! Tokens minted!" :
             isCompleteConfirmed ? "Quiz completed successfully! Bonus tokens minted!" :
             isWithdrawConfirmed ? "Funds withdrawn successfully!" :
             isMintTokenConfirmed ? "Tokens minted successfully!" :
             isTransferOwnershipConfirmed ? "Ownership transferred successfully!" :
             isRenounceOwnershipConfirmed ? "Ownership renounced successfully!" : ""}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export const Route = createFileRoute('/contract')({
  component: ContractDebugPage,
}) 