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
  const [daysRemaining, setDaysRemaining] = useState(0)

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
        rewardsConfig?.maxWinners
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

  // Calculate days remaining until October 15, 2025
  useEffect(() => {
    const seasonEndDate = new Date('2025-10-15')
    const today = new Date()
    const timeDiff = seasonEndDate.getTime() - today.getTime()
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24))
    setDaysRemaining(Math.max(0, days))
  }, [])

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
      background: '#f9fafb',
      overflow: 'hidden' // Prevent unnecessary scrolling
    }}>
      <GlobalHeader />

      {/* Main Content */}
      <div style={{ 
        paddingTop: "60px", // Reduced from 80px to match actual header height
        padding: "1rem", 
        maxWidth: "1200px", 
        margin: "0 auto",
        height: 'calc(100vh - 60px - 80px)', // Full height minus header and bottom nav
        overflow: 'auto' // Allow scrolling only within content area
      }}>
        {/* Header Section - Steve Jobs Inspired */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          {/* Main Title */}
          <h1 style={{ 
            color: "#000000", 
            fontSize: "2.5rem", 
            fontWeight: "300",
            marginBottom: "0.5rem",
            letterSpacing: "-0.02em",
            lineHeight: "1.1"
          }}>
            Top Performers
          </h1>
          
          {/* Subtitle */}
          <p style={{ 
            color: "#666666", 
            fontSize: "1rem", 
            fontWeight: "400",
            marginBottom: "2rem",
            letterSpacing: "0.01em"
          }}>
            Season ends in {daysRemaining} days
          </p>
          
          {/* Minimal Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "1.5rem",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            {/* Total Rewards */}
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "200", 
                color: "#000000",
                lineHeight: "1",
                marginBottom: "0.25rem"
              }}>
                {rewardsConfig?.totalReward || 1000}
              </div>
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#666666",
                fontWeight: "400",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                {rewardsConfig?.currency || 'CELO'} Pool
              </div>
            </div>
            
            {/* Max Winners */}
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "200", 
                color: "#000000",
                lineHeight: "1",
                marginBottom: "0.25rem"
              }}>
                {rewardsConfig?.maxWinners || 200}
              </div>
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#666666",
                fontWeight: "400",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Winners
              </div>
            </div>
            
            {/* Network */}
            <div style={{ textAlign: "center" }}>
              <div style={{ 
                fontSize: "2rem", 
                fontWeight: "200", 
                color: "#000000",
                lineHeight: "1",
                marginBottom: "0.25rem"
              }}>
                {chainName}
              </div>
              <div style={{ 
                fontSize: "0.75rem", 
                color: "#666666",
                fontWeight: "400",
                letterSpacing: "0.05em",
                textTransform: "uppercase"
              }}>
                Network
              </div>
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
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
            }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ textAlign: "left", padding: "0.5rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem", width: "80px" }}>Rank</th>
                    <th style={{ textAlign: "left", padding: "0.5rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem" }}>Address</th>
                    <th style={{ textAlign: "right", padding: "0.5rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem", width: "100px" }}>XP</th>
                    <th style={{ textAlign: "center", padding: "0.5rem", fontWeight: "600", color: "#111827", fontSize: "0.85rem", width: "120px" }}>Reward</th>
                  </tr>
                </thead>
                <tbody>
                  {holders.map((holder, index) => {
                    const rank = index + 1
                    const getProportionalReward = (userXP: string) => {
                      const totalReward = rewardsConfig?.totalReward || 1000
                      const maxWinners = rewardsConfig?.maxWinners || 200
                      
                      // Calculate total XP of eligible winners (top N or all if less than N)
                      const eligibleHolders = holders.slice(0, Math.min(holders.length, maxWinners))
                      const totalXP = eligibleHolders.reduce((sum, holder) => {
                        return sum + parseFloat(holder.balance)
                      }, 0)
                      
                      if (totalXP === 0) return 0
                      
                      // Calculate proportional reward: (user_xp / total_xp) * totalReward
                      const userXPValue = parseFloat(userXP)
                      const proportion = userXPValue / totalXP
                      return Math.floor(totalReward * proportion)
                    }
                    
                    return (
                      <tr key={holder.address} style={{ borderTop: "1px solid #e5e7eb" }}>
                        <td style={{ padding: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center" }}>
                            {rank <= 3 && (
                              <span style={{ marginRight: "0.25rem", fontSize: "0.9rem" }}>
                                {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                              </span>
                            )}
                            <span style={{ 
                              fontWeight: "600",
                              color: rank <= 3 ? "#58CC02" : "#111827",
                              fontSize: "0.85rem"
                            }}>
                              #{rank}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <code style={{
                            background: "#f9fafb",
                            padding: "0.2rem 0.4rem",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            fontFamily: "monospace",
                            display: "block",
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}>
                            {leaderboardService.truncateAddress(holder.address)}
                          </code>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "right" }}>
                          <span style={{ fontWeight: "600", color: "#111827", fontSize: "0.8rem" }}>
                            {leaderboardService.formatBalance(holder.balance)} XP
                          </span>
                        </td>
                        <td style={{ padding: "0.5rem", textAlign: "center" }}>
                          {rank <= (rewardsConfig?.maxWinners || 200) ? (
                            <span style={{
                              background: rank <= 3 ? "#58CC02" : "#f3f4f6",
                              color: rank <= 3 ? "white" : "#374151",
                              padding: "0.2rem 0.4rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              display: "inline-block"
                            }}>
                              {rewardsConfig?.symbol || "💰"} {getProportionalReward(holder.balance)}
                            </span>
                          ) : (
                            <span style={{
                              background: "#e5e7eb",
                              color: "#6b7280",
                              padding: "0.2rem 0.4rem",
                              borderRadius: "4px",
                              fontSize: "0.7rem",
                              fontWeight: "600",
                              display: "inline-block"
                            }}>
                              No reward
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.8rem", color: "#6b7280" }}>
              <p>Rewards distributed proportionally by XP share among top {rewardsConfig?.maxWinners || 200} holders</p>
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
