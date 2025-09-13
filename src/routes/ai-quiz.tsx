import { createFileRoute } from '@tanstack/react-router'
import AIQuizGenerator from '../components/AIQuizGenerator'
import BottomNavigation from '../components/BottomNavigation'

function AIQuizPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      paddingTop: '80px', 
      paddingBottom: '80px', // Space for bottom nav
      background: '#f9fafb'
    }}>
      {/* Header */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#ffffff",
        borderBottom: "1px solid #e5e7eb",
        padding: "1rem 2rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        zIndex: 1000
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
            🤖 AI Quiz Generator
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2rem",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
        }}>
          <h2 style={{ color: "#111827", fontSize: "1.8rem", marginBottom: "1rem", textAlign: "center" }}>
            🤖 AI Quiz Generator
          </h2>
          <p style={{ color: "#6b7280", textAlign: "center", marginBottom: "2rem" }}>
            Generate personalized quizzes on any topic using AI!
          </p>
          
          {/* AI Quiz Generator Component */}
          <AIQuizGenerator />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export const Route = createFileRoute('/ai-quiz')({
  component: AIQuizPage,
})