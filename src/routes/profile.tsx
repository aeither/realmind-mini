import { createFileRoute } from '@tanstack/react-router'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import GlobalHeader from '../components/GlobalHeader'
import BottomNavigation from '../components/BottomNavigation'
import ProgressDashboard from '../components/ProgressDashboard'
import DailyMissions from '../components/DailyMissions'
import AchievementsGallery from '../components/AchievementsGallery'

interface NeynarProfile {
  fid: number
  username: string
  displayName: string
  pfp: { url: string }
  profile: { bio: { text: string } }
  followerCount: number
  followingCount: number
  verifications: string[]
}

function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [neynarProfile, setNeynarProfile] = useState<NeynarProfile | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch Neynar profile data
  useEffect(() => {
    const fetchNeynarProfile = async () => {
      if (!address) return

      setLoading(true)
      try {
        const response = await fetch(
          `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`,
          {
            headers: {
              'api_key': import.meta.env.VITE_NEYNAR_API_KEY || ''
            }
          }
        )

        const data = await response.json()
        if (data && data[address.toLowerCase()]?.length > 0) {
          setNeynarProfile(data[address.toLowerCase()][0])
        }
      } catch (error) {
        console.error('Error fetching Neynar profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isConnected && address) {
      fetchNeynarProfile()
    }
  }, [address, isConnected])

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '80px',
      background: '#f9fafb'
    }}>
      <GlobalHeader />

      <div style={{
        paddingTop: "70px",
        padding: "1rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* User Profile Section */}
        {isConnected ? (
          <div style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "16px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.3)",
            color: "#fff",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* Background pattern */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              background: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"40\" height=\"40\" viewBox=\"0 0 40 40\"><circle cx=\"20\" cy=\"20\" r=\"2\" fill=\"white\"/></svg>') repeat"
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid rgba(255,255,255,0.3)",
                    borderTop: "3px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto"
                  }}></div>
                  <p style={{ marginTop: "1rem" }}>Loading profile...</p>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : neynarProfile ? (
                <div style={{
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                  flexWrap: "wrap"
                }}>
                  {/* Profile Picture */}
                  <img
                    src={neynarProfile.pfp.url}
                    alt={neynarProfile.username}
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      border: "4px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                    }}
                  />

                  {/* Profile Info */}
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <h2 style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.25rem",
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}>
                      {neynarProfile.displayName}
                    </h2>
                    <p style={{
                      fontSize: "1.1rem",
                      opacity: 0.9,
                      marginBottom: "0.75rem"
                    }}>
                      @{neynarProfile.username}
                    </p>

                    {neynarProfile.profile?.bio?.text && (
                      <p style={{
                        fontSize: "0.95rem",
                        opacity: 0.85,
                        marginBottom: "1rem",
                        lineHeight: 1.5
                      }}>
                        {neynarProfile.profile.bio.text}
                      </p>
                    )}

                    {/* Stats */}
                    <div style={{
                      display: "flex",
                      gap: "2rem",
                      flexWrap: "wrap"
                    }}>
                      <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                          {neynarProfile.followerCount}
                        </div>
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          Followers
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                          {neynarProfile.followingCount}
                        </div>
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          Following
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                          FID: {neynarProfile.fid}
                        </div>
                        <div style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                          Farcaster ID
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>👤</div>
                  <h3 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                    No Farcaster Profile Found
                  </h3>
                  <p style={{ opacity: 0.9, fontSize: "1rem" }}>
                    {address ? (
                      <>
                        Connected: {address.slice(0, 6)}...{address.slice(-4)}
                      </>
                    ) : (
                      'Connect your wallet to view your profile'
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "3rem",
            marginBottom: "2rem",
            textAlign: "center",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔐</div>
            <h3 style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "1rem"
            }}>
              Connect Your Wallet
            </h3>
            <p style={{
              color: "#6b7280",
              fontSize: "1rem",
              marginBottom: "2rem"
            }}>
              Connect your wallet to view your profile and track your progress
            </p>
          </div>
        )}

        {/* Progress Dashboard */}
        {isConnected && (
          <div style={{ marginBottom: "2rem" }}>
            <ProgressDashboard />
          </div>
        )}

        {/* Daily Missions */}
        {isConnected && (
          <div style={{ marginBottom: "2rem" }}>
            <DailyMissions />
          </div>
        )}

        {/* Achievements Gallery */}
        {isConnected && (
          <div style={{ marginBottom: "2rem" }}>
            <AchievementsGallery />
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  )
}

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})
