import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import GlobalHeader from '../components/GlobalHeader'
import BottomNavigation from '../components/BottomNavigation'
import { leaderboardService, type TokenHolder } from '../libs/leaderboardService'
import { getContractAddresses, getRewardsConfig } from '../libs/constants'

function LeaderboardPage() {
  const { chain } = useAccount()
  const [holders, setHolders] = useState<TokenHolder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalHolders, setTotalHolders] = useState(0)

  // Get contract addresses and rewards config based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : null
  const rewardsConfig = chain ? getRewardsConfig(chain.id) : null

  const fetchLeaderboard = async () => {
    if (!chain || !contractAddresses) return

    setLoading(true)
    setError(null)
    
    try {
      const result = await leaderboardService.getLeaderboard(
        contractAddresses.token1ContractAddress,
        chain.id,
        50 // Top 50 holders
      )

      if (result.success && result.holders) {
        setHolders(result.holders)
        setTotalHolders(result.totalHolders || 0)
      } else {
        setError(result.error || 'Failed to load leaderboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (chain && contractAddresses) {
      fetchLeaderboard()
    }
  }, [chain, contractAddresses])

  const chainName = chain?.name || 'Unknown'

  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingBottom: '80px', // Space for bottom nav
      background: '#f9fafb'
    }}>
      <GlobalHeader />

      {/* Main Content */}
      <div style={{ paddingTop: "80px", padding: "1rem", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", fontSize: "1.4rem", marginBottom: "0.5rem" }}>
            Top Performers
          </h2>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>
            Top XP holders on {chainName}
          </p>
          
          {/* Stats Bar */}
          <div style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "1rem",
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{rewardsConfig?.totalReward || 1000}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Total Rewards</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{chainName}</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Network</div>
              </div>
              {rewardsConfig && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#111827" }}>{rewardsConfig.currency}</div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Currency</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Content Area */}
        {loading ? (
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center", 
            padding: "3rem",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #58CC02",
              borderRadius: "50%",
              animation: "spin 1s linear infinite"
            }}></div>
            <span style={{ marginLeft: "1rem", fontSize: "1rem" }}>Loading leaderboard...</span>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : error ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😕</div>
            <p style={{ color: "#dc2626", fontSize: "1rem", marginBottom: "1rem" }}>{error}</p>
            <button
              onClick={fetchLeaderboard}
              style={{
                padding: "0.5rem 1rem",
                background: "#58CC02",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Try Again
            </button>
          </div>
        ) : holders.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
            <p style={{ color: "#6b7280", fontSize: "1rem" }}>No token holders found</p>
          </div>
        ) : (
          <>
            {/* Leaderboard Table */}
            <div style={{ 
              overflowX: "auto",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>Rank</th>
                    <th style={{ textAlign: "left", padding: "0.75rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>Address</th>
                    <th style={{ textAlign: "right", padding: "0.75rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>XP</th>
                    <th style={{ textAlign: "center", padding: "0.75rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => {
                    const rank = index + 1
                    const getRewardForRank = (rank: number) => {
                      const totalReward = rewardsConfig?.totalReward || 1000
                      if (rank === 1) return Math.floor(totalReward * 0.3) // 30% for 1st place
                      if (rank === 2) return Math.floor(totalReward * 0.2) // 20% for 2nd place
                      if (rank === 3) return Math.floor(totalReward * 0.15) // 15% for 3rd place
                      if (rank <= 10) return Math.floor(totalReward * 0.05) // 5% for top 10
                      return Math.floor(totalReward * 0.01) // 1% for others
                    }
                    
                    return (
                      <tr key={holder.address} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {rank <= 3 && (
                              <span style={{ marginRight: "0.5rem", fontSize: "1rem" }}>
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span style={{ 
                              fontWeight: "600",
                              color: rank <= 3 ? "#58CC02" : "#111827",
                              fontSize: "0.9rem"
                            }}>
                              #{rank}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem" }}>
                          <code style={{
                            background: "#f9fafb",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontFamily: "monospace"
                          }}>
                            {leaderboardService.truncateAddress(holder.address)}
                          </code>
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "right" }}>
                          <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>
                            {leaderboardService.formatBalance(holder.balance)} XP
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>
                          <span style={{
                            background: rank <= 3 ? "#58CC02" : "#f3f4f6",
                            color: rank <= 3 ? "white" : "#374151",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "600"
                          }}>
{getRewardForRank(rank)} {rewardsConfig?.currency || "TOKENS"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "#6b7280" }}>
              <p>Data updates every 5 minutes</p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export const Route = createFileRoute('/leaderboard')({
  component: LeaderboardPage,
})
