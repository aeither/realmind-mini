import { useState, useEffect } from 'react'

export type LemonMood =
  | 'happy'
  | 'excited'
  | 'thinking'
  | 'celebrating'
  | 'encouraging'
  | 'sad'
  | 'waving'
  | 'sleeping'

interface LemonLarryProps {
  mood?: LemonMood
  message?: string
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  onClick?: () => void
}

const LEMON_FACES = {
  happy: '😊',
  excited: '🤩',
  thinking: '🤔',
  celebrating: '🎉',
  encouraging: '💪',
  sad: '😔',
  waving: '👋',
  sleeping: '😴'
}

const MOTIVATIONAL_MESSAGES = {
  morning: [
    "Good morning! Ready to learn something new? ☀️",
    "Rise and shine! Let's make today count! 🌅",
    "New day, new knowledge! Let's go! 🚀"
  ],
  afternoon: [
    "Keep up the great work! 🌟",
    "You're doing amazing! Stay focused! 💫",
    "Halfway through the day - you've got this! 🎯"
  ],
  evening: [
    "Great effort today! 🌙",
    "Finish strong! 💪",
    "Almost there - let's complete that streak! ⭐"
  ],
  streak: [
    "🔥 Your streak is on fire! Keep it burning!",
    "🔥 Don't break that streak! Come back tomorrow!",
    "⚡ Streak power activated! You're unstoppable!"
  ],
  levelUp: [
    "🎊 LEVEL UP! You're getting stronger!",
    "🌟 New level unlocked! Amazing progress!",
    "🚀 To the next level! Keep soaring!"
  ],
  achievement: [
    "🏆 Achievement unlocked! You're incredible!",
    "🎖️ New badge earned! You're a star!",
    "👑 Legendary achievement! You're the best!"
  ],
  encouragement: [
    "Don't give up! Every mistake is a lesson! 📚",
    "Keep trying! You're making progress! 💪",
    "Believe in yourself! You can do this! ⭐"
  ],
  perfect: [
    "🏆 PERFECT SCORE! You're a genius!",
    "💯 Flawless! Absolutely incredible!",
    "🌟 Perfect! You're mastering this!"
  ]
}

function LemonLarry({
  mood = 'happy',
  message,
  size = 'medium',
  animated = true,
  onClick
}: LemonLarryProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [displayMessage, setDisplayMessage] = useState(message)

  useEffect(() => {
    setDisplayMessage(message)
  }, [message])

  useEffect(() => {
    if (animated) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [mood, animated])

  const sizeStyles = {
    small: { width: '60px', height: '60px', fontSize: '2rem' },
    medium: { width: '100px', height: '100px', fontSize: '3rem' },
    large: { width: '150px', height: '150px', fontSize: '4.5rem' }
  }

  const containerSize = {
    small: '80px',
    medium: '140px',
    large: '200px'
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        maxWidth: containerSize[size]
      }}
    >
      {/* Lemon Character */}
      <div
        onClick={onClick}
        style={{
          ...sizeStyles[size],
          background: 'linear-gradient(135deg, #FFF44F 0%, #FFD700 100%)',
          borderRadius: '45% 55% 50% 50% / 55% 45% 55% 45%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4), inset 0 -5px 10px rgba(0,0,0,0.1)',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          position: 'relative',
          animation: isAnimating ? getMoodAnimation(mood) : 'none'
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1.05)'
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1)'
          }
        }}
      >
        {/* Face */}
        <div style={{
          fontSize: size === 'small' ? '1.5rem' : size === 'medium' ? '2.5rem' : '3.5rem',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
        }}>
          {LEMON_FACES[mood]}
        </div>

        {/* Sparkles for celebrating mood */}
        {mood === 'celebrating' && (
          <>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '1.5rem',
              animation: 'sparkle 1s ease-in-out infinite'
            }}>✨</div>
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              left: '-10px',
              fontSize: '1.5rem',
              animation: 'sparkle 1s ease-in-out infinite 0.5s'
            }}>✨</div>
          </>
        )}
      </div>

      {/* Speech Bubble */}
      {displayMessage && (
        <div style={{
          background: '#ffffff',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
          maxWidth: '250px',
          animation: 'fadeInUp 0.3s ease-out',
          border: '2px solid #FFD700'
        }}>
          {/* Speech bubble arrow */}
          <div style={{
            position: 'absolute',
            top: '-10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom: '10px solid #FFD700'
          }} />
          <div style={{
            position: 'absolute',
            top: '-7px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #ffffff'
          }} />

          <p style={{
            fontSize: size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem',
            color: '#1f2937',
            margin: 0,
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.4
          }}>
            {displayMessage}
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes celebrate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-15deg) scale(1.1); }
          50% { transform: rotate(15deg) scale(1.2); }
          75% { transform: rotate(-15deg) scale(1.1); }
        }

        @keyframes thinking {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }

        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

function getMoodAnimation(mood: LemonMood): string {
  switch (mood) {
    case 'excited':
    case 'celebrating':
      return 'celebrate 0.8s ease-in-out'
    case 'happy':
    case 'waving':
      return 'bounce 0.6s ease-in-out'
    case 'thinking':
      return 'thinking 1s ease-in-out'
    case 'encouraging':
      return 'pulse 0.6s ease-in-out'
    default:
      return 'none'
  }
}

// Helper function to get random message by category
export function getRandomMessage(category: keyof typeof MOTIVATIONAL_MESSAGES): string {
  const messages = MOTIVATIONAL_MESSAGES[category]
  return messages[Math.floor(Math.random() * messages.length)]
}

// Helper function to get message based on time of day
export function getTimeBasedMessage(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return getRandomMessage('morning')
  } else if (hour < 18) {
    return getRandomMessage('afternoon')
  } else {
    return getRandomMessage('evening')
  }
}

export default LemonLarry
