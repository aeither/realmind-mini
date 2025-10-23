import { useState, useEffect } from 'react'
import { progressSystem, ACHIEVEMENTS, type Achievement, type UserProgress } from '../libs/progressSystem'

interface AchievementsGalleryProps {
  compact?: boolean
}

export default function AchievementsGallery({ compact = false }: AchievementsGalleryProps) {
  const [progress, setProgress] = useState<UserProgress>(progressSystem.getProgress())
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    setProgress(progressSystem.getProgress())
  }, [])

  const unlockedAchievements = ACHIEVEMENTS.filter(a =>
    progress.achievements.includes(a.id)
  )

  const lockedAchievements = ACHIEVEMENTS.filter(a =>
    !progress.achievements.includes(a.id)
  )

  const filteredAchievements =
    filter === 'unlocked' ? unlockedAchievements :
    filter === 'locked' ? lockedAchievements :
    ACHIEVEMENTS

  if (compact) {
    // Show only recent unlocked achievements
    const recentUnlocked = unlockedAchievements.slice(0, 3)

    if (recentUnlocked.length === 0) {
      return null
    }

    return (
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        borderRadius: '12px',
        padding: '1rem',
        color: '#fff'
      }}>
        <h4 style={{
          fontSize: '0.9rem',
          fontWeight: 700,
          marginBottom: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          🏆 Recent Achievements
        </h4>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          {recentUnlocked.map(achievement => (
            <div
              key={achievement.id}
              style={{
                fontSize: '2rem',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '0.5rem',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}
              title={achievement.name}
            >
              {achievement.icon}
            </div>
          ))}
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
      {/* Header */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <h3 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#111827',
          marginBottom: '0.5rem'
        }}>
          🏆 Achievements
        </h3>
        <p style={{
          fontSize: '0.9rem',
          color: '#6b7280',
          marginBottom: '1rem'
        }}>
          {unlockedAchievements.length} of {ACHIEVEMENTS.length} unlocked
        </p>

        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <FilterButton
            active={filter === 'all'}
            onClick={() => setFilter('all')}
            label="All"
            count={ACHIEVEMENTS.length}
          />
          <FilterButton
            active={filter === 'unlocked'}
            onClick={() => setFilter('unlocked')}
            label="Unlocked"
            count={unlockedAchievements.length}
          />
          <FilterButton
            active={filter === 'locked'}
            onClick={() => setFilter('locked')}
            label="Locked"
            count={lockedAchievements.length}
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#374151'
        }}>
          <span>Overall Progress</span>
          <span>{Math.round((unlockedAchievements.length / ACHIEVEMENTS.length) * 100)}%</span>
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: '#e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(unlockedAchievements.length / ACHIEVEMENTS.length) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
            borderRadius: '6px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>

      {/* Achievements Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            unlocked={progress.achievements.includes(achievement.id)}
          />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          color: '#9ca3af'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <p>No achievements in this category yet</p>
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  label,
  count
}: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        border: 'none',
        background: active ? '#8b5cf6' : '#f3f4f6',
        color: active ? '#fff' : '#6b7280',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#e5e7eb'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f3f4f6'
        }
      }}
    >
      <span>{label}</span>
      <span style={{
        background: active ? 'rgba(255,255,255,0.3)' : '#d1d5db',
        color: active ? '#fff' : '#4b5563',
        padding: '0.125rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 700
      }}>
        {count}
      </span>
    </button>
  )
}

function AchievementCard({
  achievement,
  unlocked
}: {
  achievement: Achievement
  unlocked: boolean
}) {
  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: '12px',
      background: unlocked
        ? 'linear-gradient(135deg, #FFD700, #FFA500)'
        : '#f9fafb',
      border: `2px solid ${unlocked ? '#FFD700' : '#e5e7eb'}`,
      textAlign: 'center',
      transition: 'all 0.3s ease',
      cursor: 'default',
      position: 'relative',
      overflow: 'hidden',
      opacity: unlocked ? 1 : 0.6,
      filter: unlocked ? 'none' : 'grayscale(100%)'
    }}>
      {/* Shine effect for unlocked */}
      {unlocked && (
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
          animation: 'shine 3s infinite',
          pointerEvents: 'none'
        }} />
      )}

      {/* Icon */}
      <div style={{
        fontSize: '3rem',
        marginBottom: '0.75rem',
        filter: unlocked ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' : 'none'
      }}>
        {unlocked ? achievement.icon : '🔒'}
      </div>

      {/* Name */}
      <h4 style={{
        fontSize: '1rem',
        fontWeight: 800,
        color: unlocked ? '#fff' : '#374151',
        marginBottom: '0.5rem',
        textShadow: unlocked ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
      }}>
        {unlocked ? achievement.name : '???'}
      </h4>

      {/* Description */}
      <p style={{
        fontSize: '0.85rem',
        color: unlocked ? 'rgba(255,255,255,0.9)' : '#6b7280',
        lineHeight: 1.4,
        margin: 0
      }}>
        {unlocked ? achievement.description : 'Complete challenges to unlock'}
      </p>

      {/* Unlocked date */}
      {unlocked && achievement.unlockedAt && (
        <div style={{
          marginTop: '0.75rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 600
        }}>
          ✨ Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
        </div>
      )}

      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(45deg);
          }
        }
      `}</style>
    </div>
  )
}
