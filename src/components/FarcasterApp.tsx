import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { useAccount, useConnect } from "wagmi";

function FarcasterApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ fid: number; displayName?: string; username?: string; pfpUrl?: string } | null>(
    null,
  );
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const context = await sdk.context;
        if (context.user) {
          setUser(context.user);
          const { token } = await sdk.quickAuth.getToken();
          setAuthToken(token);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
        sdk.actions.ready();
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div style={{ minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, textAlign: "center", padding: "2rem" }}>
        <h1 style={{ marginBottom: "2rem", fontSize: "2.25rem", color: "hsl(var(--primary))", fontWeight: 800 }}>🍋 Realmind Farcaster</h1>
        {user ? <AuthenticatedView user={user} token={authToken} /> : <AuthenticationPrompt onAuth={setUser} />}
      </div>
      {user && <ConnectMenu />}
    </div>
  );
}

function SplashScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "calc(100vh - 80px)",
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          marginBottom: "1rem",
          textAlign: "center",
        }}
      >
        🍋 Realmind
      </div>
      <div
        style={{
          fontSize: "1.2rem",
          marginBottom: "2rem",
          opacity: 0.9,
          textAlign: "center",
        }}
      >
        Interactive Learning Experience
      </div>
      <div
        style={{
          width: "40px",
          height: "40px",
          border: "3px solid rgba(16,24,40,0.1)",
          borderTop: "3px solid hsl(var(--primary))",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <div style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        background: "#ffffff",
        backdropFilter: "blur(2px)",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "0.75rem 1rem",
        fontSize: "0.85rem",
        color: "#374151",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        maxWidth: "250px",
        wordBreak: "break-all"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>💳 Connected</div>
        <div>{address?.substring(0, 6)}...{address?.substring(address.length - 4)}</div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      bottom: "1rem",
      right: "1rem",
    }}>
      <button 
        type="button" 
        onClick={() => connect({ connector: connectors[0] })}
        style={{
          background: "#58CC02",
          color: "#ffffff",
          border: "none",
          borderRadius: "12px",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 12px -1px rgba(88, 204, 2, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(88, 204, 2, 0.25)";
        }}
      >
        💳 Connect Wallet
      </button>
    </div>
  );
}

function AuthenticatedView({
  user,
  token,
}: { user: { fid: number; displayName?: string; username?: string; pfpUrl?: string }; token: string | null }) {
  const [activeView, setActiveView] = useState<'home' | 'quiz'>('home');

  if (activeView === 'quiz') {
    return <QuizGame onExit={() => setActiveView('home')} user={user} />;
  }

  return (
    <div style={{ margin: "2rem 0", padding: "2rem", backgroundColor: "#f0f8ff", borderRadius: "16px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
      <h3 style={{ fontSize: "1.65rem", marginBottom: "1rem", fontWeight: 800, color: "#111827" }}>Welcome, {user.displayName || user.username}!</h3>
      <p style={{ fontSize: "1rem", color: "#6b7280", marginBottom: "1rem" }}>FID: {user.fid}</p>
      {user.pfpUrl && (
        <img
          src={user.pfpUrl}
          alt="Profile"
          style={{ width: "64px", height: "64px", borderRadius: "50%", margin: "1rem 0" }}
        />
      )}
      
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
        <button
          type="button"
          style={{
            backgroundColor: "#58CC02",
            color: "#ffffff",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "12px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: 700,
            boxShadow: "var(--shadow-button)",
            transition: "all 0.3s ease"
          }}
          onClick={() => setActiveView('quiz')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#46a001";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#58CC02";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          Take Quiz 🚀
        </button>
      </div>

      <div style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#f0f9ff", borderRadius: "12px" }}>
        <h4 style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>🎯 Learn & Earn</h4>
        <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>Complete daily quizzes and quests to earn points. Build your knowledge and compete with others!</p>
        <ul style={{ textAlign: "left", marginTop: "1rem", paddingLeft: "1.5rem", lineHeight: "1.8" }}>
          <li>📚 Daily personalized quizzes</li>
          <li>🗺️ Special learning quests</li>
          <li>🏆 Leaderboard competitions</li>
          <li>🍋 Earn Yuzu Points for EDU Chain</li>
        </ul>
      </div>

      {token && <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "1rem", textAlign: "center" }}>Authenticated ✅</p>}
    </div>
  );
}

function AuthenticationPrompt({
  onAuth,
}: { onAuth: (user: { fid: number; displayName?: string; username?: string; pfpUrl?: string }) => void }) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      await sdk.actions.signIn({
        nonce: crypto.randomUUID(),
        acceptAuthAddress: true,
      });

      const context = await sdk.context;
      if (context.user) {
        onAuth(context.user);
      }
    } catch (error) {
      console.error("Sign in failed:", error);
      alert("Sign in failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div style={{ margin: "2rem 0", padding: "3rem", backgroundColor: "#f9f9f9", borderRadius: "16px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
      <h3 style={{ fontSize: "1.65rem", marginBottom: "1rem", fontWeight: 800 }}>Welcome to Realmind Farcaster!</h3>
      <p style={{ fontSize: "1rem", lineHeight: "1.7", marginBottom: "2rem", color: "#374151" }}>Sign in with your Farcaster account to start learning and earning points through interactive quizzes.</p>
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isAuthenticating}
        style={{
          backgroundColor: isAuthenticating ? "#a3e635" : "#58CC02",
          color: "#ffffff",
          border: "none",
          padding: "1rem 2rem",
          borderRadius: "12px",
          fontSize: "1.1rem",
          cursor: isAuthenticating ? "not-allowed" : "pointer",
          fontWeight: 700,
          boxShadow: isAuthenticating ? "none" : "var(--shadow-button)",
          transition: "all 0.3s ease"
        }}
        onMouseEnter={(e) => {
          if (!isAuthenticating) {
            e.currentTarget.style.backgroundColor = "#46a001";
            e.currentTarget.style.transform = "translateY(-2px)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isAuthenticating) {
            e.currentTarget.style.backgroundColor = "#58CC02";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {isAuthenticating ? "Signing in..." : "Sign in with Farcaster"}
      </button>
    </div>
  );
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What is the native token of the Base network?",
    options: ["ETH", "BASE", "USD", "BTC"],
    correctAnswer: 0,
    explanation: "Base uses ETH as its native token, just like Ethereum mainnet.",
  },
  {
    id: 2,
    question: "Which company developed the Base blockchain?",
    options: ["Meta", "Coinbase", "Google", "OpenSea"],
    correctAnswer: 1,
    explanation: "Base is an Ethereum Layer 2 blockchain developed by Coinbase.",
  },
  {
    id: 3,
    question: "What type of blockchain is Base?",
    options: ["Layer 1", "Layer 2", "Sidechain", "Private"],
    correctAnswer: 1,
    explanation: "Base is a Layer 2 blockchain built on top of Ethereum using Optimism's OP Stack.",
  },
  {
    id: 4,
    question: "What is the purpose of Open Campus EDU Chain?",
    options: ["DeFi protocol", "Educational ecosystem", "NFT marketplace", "Gaming platform"],
    correctAnswer: 1,
    explanation: "EDU Chain is a blockchain designed specifically for decentralized education and learning rewards.",
  },
  {
    id: 5,
    question: "What are Yuzu Points used for?",
    options: ["Trading fees", "EDU token rewards", "Gas payments", "Voting rights"],
    correctAnswer: 1,
    explanation: "Yuzu Points can be converted to EDU tokens and used for various rewards in the Open Campus ecosystem.",
  },
];

function QuizGame({
  onExit,
  user,
}: {
  user: { fid: number; displayName?: string; username?: string; pfpUrl?: string };
  onExit: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === SAMPLE_QUESTIONS.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    setShowExplanation(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizCompleted(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
    return (
      <div
        style={{
          margin: "2rem auto",
          padding: "2rem",
          backgroundColor: "#f0f8ff",
          borderRadius: "16px",
          textAlign: "center",
          maxWidth: "600px"
        }}
      >
        <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>🎉 Quiz Completed!</h2>
        <div style={{ fontSize: "4rem", margin: "1rem 0" }}>
          {percentage >= 80 ? "🏆" : percentage >= 60 ? "🥈" : "📚"}
        </div>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          Your Score: {score}/{SAMPLE_QUESTIONS.length}
        </h3>
        <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          {percentage}% - {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good job!" : "Keep learning!"}
        </p>

        <div style={{ marginTop: "1.5rem", padding: "1.5rem", backgroundColor: "#e6f7ff", borderRadius: "12px" }}>
          <h4 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>🍋 Points Earned!</h4>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>You earned <strong>{score * 10}</strong> learning points this session.</p>
          <p style={{ fontSize: "0.95rem", color: "#666" }}>
            Keep completing quizzes to build your leaderboard ranking and earn Yuzu Points!
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              backgroundColor: "#667eea",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Play Again 🔄
          </button>
          <button
            type="button"
            onClick={onExit}
            style={{
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              padding: "0.75rem 1.5rem",
              borderRadius: "12px",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Exit Quiz
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentQuestionIndex + 1) / SAMPLE_QUESTIONS.length) * 100;

  return (
    <div style={{ 
      maxWidth: "700px", 
      margin: "2rem auto", 
      padding: "2rem", 
      backgroundColor: "white", 
      borderRadius: "16px",
      boxShadow: "0 8px 16px rgba(0,0,0,0.1)"
    }}>
      {/* Progress Bar */}
      <div style={{
        width: "100%",
        height: "8px",
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        marginBottom: "2rem",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: "100%",
          backgroundColor: "#667eea",
          borderRadius: "4px",
          transition: "width 0.3s ease"
        }} />
      </div>

      {/* Question */}
      <h3 style={{
        fontSize: "1.4rem",
        marginBottom: "2rem",
        color: "#1f2937",
        lineHeight: "1.6"
      }}>
        {currentQuestion.question}
      </h3>

      {/* Options */}
      <div style={{ marginBottom: "2rem" }}>
        {currentQuestion.options.map((option, index) => {
          let backgroundColor = "#f9fafb";
          let borderColor = "#d1d5db";
          let color = "#374151";
          
          if (selectedAnswer !== null) {
            if (index === currentQuestion.correctAnswer) {
              backgroundColor = "#d1fae5";
              borderColor = "#10b981";
              color = "#065f46";
            } else if (index === selectedAnswer && selectedAnswer !== currentQuestion.correctAnswer) {
              backgroundColor = "#fee2e2";
              borderColor = "#ef4444";
              color = "#991b1b";
            }
          }
          
          return (
            <button
              key={`option-${currentQuestion.id}-${index}`}
              type="button"
              onClick={() => handleAnswerSelect(index)}
              disabled={selectedAnswer !== null}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor,
                border: `2px solid ${borderColor}`,
                borderRadius: "12px",
                fontSize: "1rem",
                cursor: selectedAnswer !== null ? "default" : "pointer",
                textAlign: "left",
                color,
                fontWeight: "500",
                transition: "all 0.2s ease"
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Question Counter */}
      <div style={{
        textAlign: "center",
        fontSize: "0.9rem",
        color: "#6b7280",
        marginBottom: "1rem"
      }}>
        {currentQuestionIndex + 1} of {SAMPLE_QUESTIONS.length} Questions
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div style={{ 
          margin: '1.5rem 0', 
          color: '#0c4a6e', 
          background: '#f0f9ff', 
          border: '2px solid #0ea5e9', 
          borderRadius: '12px', 
          padding: '1.5rem' 
        }}>
          <strong>Explanation:</strong> {currentQuestion.explanation}
        </div>
      )}

      {/* Next Button */}
      {showExplanation && (
        <button
          type="button"
          onClick={handleNext}
          style={{
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "1rem 2rem",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 4px 6px rgba(102, 126, 234, 0.3)"
          }}
        >
          {isLastQuestion ? "Finish Quiz" : "Next Question"}
        </button>
      )}
    </div>
  );
}

export default FarcasterApp;