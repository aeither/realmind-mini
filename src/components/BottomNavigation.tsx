import { useNavigate, useLocation } from '@tanstack/react-router'

export default function BottomNavigation() {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: '🏆',
      path: '/leaderboard'
    },
    {
      id: 'ai-quiz',
      label: 'AI Quiz',
      icon: '🤖',
      path: '/ai-quiz'
    }
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      padding: '0.5rem 0',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
    }}>
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => navigate({ to: item.path })}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: isActive(item.path) ? '#58CC02' : '#6b7280',
            transition: 'color 0.2s ease',
            minWidth: '60px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: isActive(item.path) ? '600' : '400' 
          }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}
