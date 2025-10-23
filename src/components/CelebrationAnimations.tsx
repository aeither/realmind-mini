import { useEffect, useState } from 'react'
import type { Achievement } from '../libs/progressSystem'

// XP Fountain Animation
interface XPFountainProps {
  xp: number
  onComplete?: () => void
}

export function XPFountain({ xp, onComplete }: XPFountainProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; delay: number }[]>([])

  useEffect(() => {
    // Generate particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100, // Spread from -100 to 100
      delay: Math.random() * 0.5
    }))
    setParticles(newParticles)

    // Clean up after animation
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2000)

    return () => clearTimeout(timer)
  }, [xp, onComplete])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 9999
    }}>
      {/* Main XP Display */}
      <div style={{
        fontSize: '4rem',
        fontWeight: 800,
        color: '#58CC02',
        textShadow: '0 4px 12px rgba(88, 204, 2, 0.5)',
        animation: 'xpPop 0.6s ease-out'
      }}>
        +{xp} XP
      </div>

      {/* Particle effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '12px',
            height: '12px',
            background: 'linear-gradient(135deg, #FFD700, #58CC02)',
            borderRadius: '50%',
            animation: `xpParticle 1.5s ease-out ${particle.delay}s forwards`,
            '--particle-x': `${particle.x}px`
          } as React.CSSProperties}
        />
      ))}

      <style>{`
        @keyframes xpPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(-50px);
            opacity: 0;
          }
        }

        @keyframes xpParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--particle-x), -100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Achievement Unlock Popup
interface AchievementPopupProps {
  achievement: Achievement
  onClose?: () => void
}

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      animation: 'achievementSlideIn 0.5s ease-out'
    }}>
      {/* Overlay background */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: -1
        }}
      />

      {/* Achievement Card */}
      <div style={{
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        padding: '2.5rem',
        borderRadius: '24px',
        textAlign: 'center',
        minWidth: '320px',
        boxShadow: '0 20px 60px rgba(255, 215, 0, 0.5)',
        border: '3px solid #FFF',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Sparkle effects */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          fontSize: '1.5rem',
          animation: 'sparkleRotate 2s linear infinite'
        }}>✨</div>
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          fontSize: '1.5rem',
          animation: 'sparkleRotate 2s linear infinite 1s'
        }}>✨</div>

        {/* Achievement content */}
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          color: '#FFF',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Achievement Unlocked!
        </div>

        <div style={{
          fontSize: '5rem',
          marginBottom: '1rem',
          animation: 'iconBounce 0.6s ease-out'
        }}>
          {achievement.icon}
        </div>

        <div style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: '#FFF',
          marginBottom: '0.5rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          {achievement.name}
        </div>

        <div style={{
          fontSize: '1rem',
          color: '#FFF',
          opacity: 0.9,
          textShadow: '0 1px 2px rgba(0,0,0,0.2)'
        }}>
          {achievement.description}
        </div>

        {/* Confetti particles */}
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i % 5],
              borderRadius: '50%',
              animation: `confettiFall 2s ease-out ${i * 0.05}s forwards`,
              left: `${Math.random() * 100}%`,
              top: '0'
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes achievementSlideIn {
          from {
            transform: translate(-50%, -50%) scale(0.5);
            opacity: 0;
          }
          to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes iconBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        @keyframes sparkleRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

// Level Up Animation
interface LevelUpProps {
  level: number
  onComplete?: () => void
}

export function LevelUpAnimation({ level, onComplete }: LevelUpProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'levelUpScale 0.6s ease-out'
      }}>
        {/* Rays of light */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '4px',
              height: '200px',
              background: 'linear-gradient(transparent, #FFD700, transparent)',
              transformOrigin: 'top center',
              transform: `translate(-50%, 0) rotate(${i * 30}deg)`,
              animation: 'rayRotate 2s linear infinite',
              opacity: 0.6
            }}
          />
        ))}

        <div style={{
          fontSize: '6rem',
          marginBottom: '1rem',
          animation: 'bounce 0.6s ease-in-out infinite'
        }}>
          🌟
        </div>

        <div style={{
          fontSize: '3rem',
          fontWeight: 800,
          color: '#FFD700',
          textShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
          marginBottom: '1rem',
          animation: 'glow 1s ease-in-out infinite'
        }}>
          LEVEL UP!
        </div>

        <div style={{
          fontSize: '5rem',
          fontWeight: 800,
          color: '#FFF',
          textShadow: '0 4px 12px rgba(255, 215, 0, 0.6)',
          animation: 'pulse 1s ease-in-out infinite'
        }}>
          {level}
        </div>

        <div style={{
          fontSize: '1.5rem',
          color: '#FFF',
          marginTop: '1rem',
          opacity: 0.9
        }}>
          You're getting stronger! 💪
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes levelUpScale {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes rayRotate {
          from { transform: translate(-50%, 0) rotate(0deg); }
          to { transform: translate(-50%, 0) rotate(360deg); }
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
          50% { text-shadow: 0 0 40px rgba(255, 215, 0, 1); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  )
}

// Streak Fire Animation
interface StreakFireProps {
  streak: number
  onComplete?: () => void
}

export function StreakFireAnimation({ streak, onComplete }: StreakFireProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.()
    }, 2500)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      textAlign: 'center',
      animation: 'streakBounce 0.5s ease-out'
    }}>
      <div style={{
        fontSize: '6rem',
        animation: 'fireFlicker 0.3s ease-in-out infinite',
        marginBottom: '1rem'
      }}>
        🔥
      </div>

      <div style={{
        fontSize: '2.5rem',
        fontWeight: 800,
        color: '#FF6B6B',
        textShadow: '0 0 20px rgba(255, 107, 107, 0.8)',
        marginBottom: '0.5rem'
      }}>
        {streak} Day Streak!
      </div>

      <div style={{
        fontSize: '1.5rem',
        color: '#FFF',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }}>
        Keep it burning! 🔥
      </div>

      <style>{`
        @keyframes streakBounce {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.1); }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }

        @keyframes fireFlicker {
          0%, 100% { transform: scale(1) rotate(-5deg); }
          50% { transform: scale(1.1) rotate(5deg); }
        }
      `}</style>
    </div>
  )
}
