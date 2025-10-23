import { useState, useEffect } from 'react'
import { progressSystem, type UserProgress } from '../libs/progressSystem'

interface Mission {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  progress: number
  target: number
  completed: boolean
}

export default function DailyMissions() {
  const [progress, setProgress] = useState<UserProgress>(progressSystem.getProgress())
  const [missions, setMissions] = useState<Mission[]>([])

  useEffect(() => {
    const updatedProgress = progressSystem.getProgress()
    setProgress(updatedProgress)

    // Check if played today
    const lastPlayed = updatedProgress.lastPlayedDate ? new Date(updatedProgress.lastPlayedDate) : null
    const today = new Date()
    const playedToday = lastPlayed &&
      lastPlayed.getDate() === today.getDate() &&
      lastPlayed.getMonth() === today.getMonth() &&
      lastPlayed.getFullYear() === today.getFullYear()

    // Generate daily missions
    const dailyMissions: Mission[] = [
      {
        id: 'play_quiz',
        title: 'Play Today',
        description: 'Complete at least one quiz today',
        icon: '🎯',
        xpReward: 10,
        progress: playedToday ? 1 : 0,
        target: 1,
        completed: playedToday || false
      },
      {
        id: 'maintain_streak',
        title: 'Keep the Fire Burning',
        description: 'Maintain your daily streak',
        icon: '🔥',
        xpReward: 15,
        progress: playedToday ? 1 : 0,
        target: 1,
        completed: playedToday && updatedProgress.currentStreak > 0
      },
      {
        id: 'perfect_score',
        title: 'Perfection',
        description: 'Get 100% on any quiz',
        icon: '💯',
        xpReward: 25,
        progress: 0, // Would need to track daily perfect scores
        target: 1,
        completed: false
      },
      {
        id: 'three_quizzes',
        title: 'Triple Threat',
        description: 'Complete 3 quizzes today',
        icon: '⚡',
        xpReward: 30,
        progress: 0, // Would need to track daily quiz count
        target: 3,
        completed: false
      }
    ]

    setMissions(dailyMissions)
  }, [])

  const completedCount = missions.filter(m => m.completed).length
  const totalXP = missions.reduce((sum, m) => sum + (m.completed ? m.xpReward : 0), 0)

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            📋 Daily Missions
          </h3>
          <p style={{
            fontSize: '0.85rem',
            color: '#6b7280'
          }}>
            {completedCount}/{missions.length} completed • {totalXP} XP earned
          </p>
        </div>

        {/* Reset timer */}
        <ResetTimer />
      </div>

      {/* Mission List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {missions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>

      {/* All Complete Message */}
      {completedCount === missions.length && missions.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #58CC02, #46a001)',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎉</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            All Missions Complete!
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
            Come back tomorrow for new challenges!
          </div>
        </div>
      )}
    </div>
  )
}

function MissionCard({ mission }: { mission: Mission }) {
  const progressPercentage = Math.round((mission.progress / mission.target) * 100)

  return (
    <div style={{
      padding: '1rem',
      background: mission.completed ? '#f0fdf4' : '#f9fafb',
      borderRadius: '12px',
      border: `2px solid ${mission.completed ? '#22c55e' : '#e5e7eb'}`,
      transition: 'all 0.3s ease',
      opacity: mission.completed ? 0.8 : 1
    }}>
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '2rem',
          flexShrink: 0
        }}>
          {mission.completed ? '✅' : mission.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            gap: '0.5rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: mission.completed ? '#16a34a' : '#111827',
              margin: 0
            }}>
              {mission.title}
            </h4>

            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#58CC02',
              background: 'rgba(88, 204, 2, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              whiteSpace: 'nowrap'
            }}>
              +{mission.xpReward} XP
            </span>
          </div>

          <p style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            margin: '0 0 0.5rem 0'
          }}>
            {mission.description}
          </p>

          {/* Progress bar */}
          {!mission.completed && (
            <div style={{
              width: '100%',
              height: '6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progressPercentage}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #58CC02, #46a001)',
                borderRadius: '3px',
                transition: 'width 0.5s ease-out'
              }} />
            </div>
          )}

          {mission.completed && (
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#16a34a'
            }}>
              ✨ Completed!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResetTimer() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setTimeLeft(`${hours}h ${minutes}m`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      fontSize: '0.75rem',
      color: '#6b7280',
      fontWeight: 600,
      background: '#f3f4f6',
      padding: '0.5rem 0.75rem',
      borderRadius: '8px',
      whiteSpace: 'nowrap'
    }}>
      🔄 Resets in {timeLeft}
    </div>
  )
}
