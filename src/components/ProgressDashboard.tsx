import { useState, useEffect } from 'react'
import { progressSystem, getXPProgressInCurrentLevel, type UserProgress } from '../libs/progressSystem'
import LemonLarry, { getTimeBasedMessage } from './LemonLarry'

interface ProgressDashboardProps {
  compact?: boolean
}

export default function ProgressDashboard({ compact = false }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<UserProgress>(progressSystem.getProgress())
  const [xpProgress, setXpProgress] = useState(getXPProgressInCurrentLevel(progress.totalXP))

  useEffect(() => {
    const updatedProgress = progressSystem.getProgress()
    setProgress(updatedProgress)
    setXpProgress(getXPProgressInCurrentLevel(updatedProgress.totalXP))
  }, [])

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
      }}>
        {/* Streak */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: progress.currentStreak > 0 ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)' : '#e5e7eb',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: progress.currentStreak > 0 ? '#fff' : '#6b7280',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: progress.currentStreak > 0 ? '0 4px 12px rgba(255, 107, 107, 0.3)' : 'none'
        }}>
          <span>🔥</span>
          <span>{progress.currentStreak} day streak</span>
        </div>

        {/* Level */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
        }}>
          <span>⭐</span>
          <span>Level {progress.level}</span>
        </div>

        {/* XP */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'linear-gradient(135deg, #58CC02, #46a001)',
          padding: '0.5rem 1rem',
          borderRadius: '12px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)'
        }}>
          <span>⚡</span>
          <span>{progress.totalXP} XP</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '2rem',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
    }}>
      {/* Header with Larry */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '0.5rem'
          }}>
            Your Progress
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: '#6b7280'
          }}>
            Keep learning every day!
          </p>
        </div>

        <LemonLarry
          mood="happy"
          size="small"
          message={getTimeBasedMessage()}
        />
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {/* Streak Card */}
        <div style={{
          background: progress.currentStreak > 0
            ? 'linear-gradient(135deg, #FF6B6B, #FF8E53)'
            : '#f3f4f6',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: progress.currentStreak > 0 ? '#fff' : '#6b7280',
          boxShadow: progress.currentStreak > 0 ? '0 4px 12px rgba(255, 107, 107, 0.3)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔥</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {progress.currentStreak}
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.9
          }}>
            Day Streak
          </div>
        </div>

        {/* Level Card */}
        <div style={{
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⭐</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {progress.level}
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.9
          }}>
            Level
          </div>
        </div>

        {/* Quizzes Taken Card */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📚</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {progress.quizzesTaken}
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.9
          }}>
            Quizzes
          </div>
        </div>

        {/* Achievements Card */}
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          padding: '1.5rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.25rem' }}>
            {progress.achievements.length}
          </div>
          <div style={{
            fontSize: '0.85rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.9
          }}>
            Achievements
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div style={{
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#374151'
          }}>
            Level {progress.level} → {progress.level + 1}
          </div>
          <div style={{
            fontSize: '0.85rem',
            color: '#6b7280',
            fontWeight: 500
          }}>
            {xpProgress.current}/{xpProgress.required} XP
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '24px',
          background: '#e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: `${xpProgress.percentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #58CC02, #46a001)',
            borderRadius: '12px',
            transition: 'width 0.5s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shine 2s infinite'
            }} />

            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 1
            }}>
              {xpProgress.percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '12px',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💯</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            {progress.perfectScores}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Perfect Scores
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🔥</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            {progress.longestStreak}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Longest Streak
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚡</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            {progress.totalXP}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Total XP
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shine {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }
      `}</style>
    </div>
  )
}
