import { sdk } from '@farcaster/miniapp-sdk'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import GlobalHeader from '../components/GlobalHeader'
import BottomNavigation from '../components/BottomNavigation'
import { SUPPORTED_CHAIN_IDS } from '../libs/supportedChains'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/pagination'

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: number;
  estimatedTime: string;
  category: string;
}

const AVAILABLE_QUIZZES: Quiz[] = [
  {
    id: "web3-basics",
    title: "Web3 Fundamentals",
    description: "Test your knowledge of blockchain, cryptocurrencies, and decentralized applications",
    icon: "🔗",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "Web3"
  },
  {
    id: "crypto-trading",
    title: "Crypto Trading",
    description: "Learn about trading strategies, market analysis, and risk management",
    icon: "📈",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "Finance"
  },
  {
    id: "defi-protocols",
    title: "DeFi Protocols",
    description: "Explore decentralized finance protocols, yield farming, and liquidity pools",
    icon: "🏦",
    questions: 3,
    estimatedTime: "1-2 min",
    category: "DeFi"
  }
];

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

function HomePage() {
  const { chain, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [hasAttemptedChainSwitch, setHasAttemptedChainSwitch] = useState(false);
  const navigate = useNavigate();

  // Countdown timer state
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [currentQuizDescription, setCurrentQuizDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Mode preference state - default to 'reward' (current behavior)
  const [playMode, setPlayMode] = useState<'free' | 'reward'>(() => {
    const saved = localStorage.getItem('realmind-play-mode')
    return (saved as 'free' | 'reward') || 'reward'
  })
  
  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Function to toggle play mode
  const togglePlayMode = () => {
    const newMode = playMode === 'free' ? 'reward' : 'free'
    setPlayMode(newMode)
    localStorage.setItem('realmind-play-mode', newMode)
  }

  useEffect(() => {
    const initializeFarcasterSDK = async () => {
      try {
        // Initialize any app setup here if needed
        // Only call ready() when your UI is fully loaded
        await sdk.actions.ready();
        setIsAppReady(true);
      } catch (error) {
        console.error('Error initializing Farcaster SDK:', error);
        // Fallback: set app ready even if SDK fails
        setIsAppReady(true);
      }
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      initializeFarcasterSDK();
    }
  }, [isSDKLoaded]);

  // Countdown timer functions - resets at UTC 00:00
  const calculateCountdown = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0); // Next UTC midnight
    
    const timeDiff = tomorrow.getTime() - now.getTime();

    if (timeDiff <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds };
  };

  // Fetch current quiz and set countdown
  const fetchQuizInfo = async () => {
    try {
      const res = await fetch(`${backendUrl}/daily-quiz/cached`);
      const data = await res.json();

      if (data.success && data.quizzes && data.quizzes.length > 0) {
        const quiz = data.quizzes[0];
        setCurrentQuizDescription(quiz.description || 'Test your knowledge');
      }
    } catch (error) {
      console.error('Error fetching quiz info:', error);
    }
  };

  // Update countdown every second - resets at UTC 00:00
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(calculateCountdown());
    };

    updateCountdown(); // Initial update
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Fetch quiz info on component mount
  useEffect(() => {
    fetchQuizInfo();
  }, []);

  // Auto-switch to supported chain if user is connected but on wrong chain
  useEffect(() => {
    const attemptChainSwitch = async () => {
      // Only attempt once to avoid loops
      if (hasAttemptedChainSwitch) return;
      
      // Only if user is connected
      if (!isConnected) return;
      
      // Only if user is on wrong chain
      const currentChainId = chain?.id;
      const supportedChainId = SUPPORTED_CHAIN_IDS[0]; // Get the main supported chain
      
      if (currentChainId && currentChainId !== supportedChainId) {
        try {
          console.log(`Auto-switching from chain ${currentChainId} to supported chain ${supportedChainId}`);
          setHasAttemptedChainSwitch(true); // Set this before switching to avoid loops
          
          await switchChain({ chainId: supportedChainId as 42220 | 8453 | 41923 });
        } catch (error) {
          console.error('Failed to auto-switch chain:', error);
          // Don't reset hasAttemptedChainSwitch on error to avoid retry loops
        }
      }
    };

    attemptChainSwitch();
  }, [isConnected, chain?.id, switchChain, hasAttemptedChainSwitch]);

  // Start Daily Quiz function
  const startDailyQuiz = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/daily-quiz/cached`);
      const data = await res.json();
      
      if (data.success && data.quizzes && data.quizzes.length > 0) {
        const quiz = data.quizzes[0];
        // Convert to frontend format and encode for URL
        const quizConfig = {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          difficulty: quiz.difficulty,
          topic: quiz.topic || quiz.trending_topic,
          questionCount: quiz.questionCount,
          questions: quiz.questions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correct: q.correct,
            explanation: q.explanation
          })),
          createdAt: quiz.createdAt,
          source: quiz.source
        };

        // UTF-8 safe base64 encoding
        const utf8ToBase64 = (str: string): string => {
          return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, 
            (match, p1) => String.fromCharCode(parseInt(p1, 16))
          ));
        };
        
        const encodedQuiz = utf8ToBase64(JSON.stringify(quizConfig));
        const quizUrl = `/quiz-game?quiz=ai-custom&data=${encodedQuiz}`;
        
        // Navigate to quiz with play mode
        const separator = quizUrl.includes('?') ? '&' : '?'
        const finalUrl = `${quizUrl}${separator}playMode=${playMode}`
        navigate({ to: finalUrl });
      } else {
        console.error('No daily quiz available');
      }
    } catch (error) {
      console.error('Error starting daily quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen while SDK initializes
  if (!isAppReady) {
    return <SplashScreen />;
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      paddingBottom: "80px", // Space for bottom nav
      background: "#f9fafb"
    }}>
      <GlobalHeader />

      {/* Main Content */}
      <div style={{
        paddingTop: "70px", // Proper spacing for header
        padding: "1rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Welcome Banner with Larry */}
        <div style={{
          background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          borderRadius: "16px",
          padding: "2rem",
          marginBottom: "2rem",
          boxShadow: "0 8px 24px rgba(255, 215, 0, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
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

          <div style={{ flex: 1, minWidth: "250px", position: "relative", zIndex: 1 }}>
            <h2 style={{
              fontSize: "1.4rem",
              marginBottom: "0.25rem",
              fontWeight: 800,
              color: "#fff",
              textShadow: "0 2px 4px rgba(0,0,0,0.2)",
              textAlign: "left"
            }}>
              Welcome Back!
            </h2>
            <p style={{
              fontSize: "0.85rem",
              color: "rgba(255,255,255,0.95)",
              marginBottom: "1rem",
              textShadow: "0 1px 2px rgba(0,0,0,0.1)",
              textAlign: "left"
            }}>
              Ready to learn and earn rewards?
            </p>

            {/* Play Mode Toggle - More Intuitive */}
          <div style={{
            background: "rgba(255,255,255,0.2)",
            borderRadius: "16px",
            padding: "0.75rem",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.3)"
          }}>
            <div style={{
              fontSize: "0.8rem",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "0.5rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              transition: "all 0.3s ease"
            }}>
              {playMode === 'free' ? '🎮 PLAY MODE' : '🏆 PLAY MODE'}
            </div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "12px",
                padding: "0.25rem"
              }}>
                <button
                  onClick={() => {
                    if (playMode !== 'free') togglePlayMode()
                  }}
                  className={playMode === 'free' ? 'play-mode-button-active' : ''}
                  style={{
                    background: playMode === 'free'
                      ? "linear-gradient(135deg, #fff, #f0f0f0)"
                      : "transparent",
                    color: playMode === 'free' ? "#FFD700" : "rgba(255,255,255,0.7)",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: playMode === 'free' ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <span style={{ fontSize: "1.25rem", transition: "transform 0.3s ease" }}>🎮</span>
                  <span style={{ fontSize: "0.85rem" }}>Free Play</span>
                </button>
                <button
                  onClick={() => {
                    if (playMode !== 'reward') togglePlayMode()
                  }}
                  className={playMode === 'reward' ? 'play-mode-button-active' : ''}
                  style={{
                    background: playMode === 'reward'
                      ? "linear-gradient(135deg, #58CC02, #46a001)"
                      : "transparent",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: playMode === 'reward' ? "0 2px 8px rgba(88, 204, 2, 0.3)" : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  <span style={{ fontSize: "1.25rem", transition: "transform 0.3s ease" }}>🏆</span>
                  <span style={{ fontSize: "0.85rem" }}>Rewards</span>
                </button>
              </div>
              {/* Mode description */}
              <div style={{
                marginTop: "0.75rem",
                padding: "0.5rem",
                background: "rgba(0,0,0,0.1)",
                borderRadius: "8px",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.85)",
                textAlign: "center",
                lineHeight: 1.4,
                transition: "all 0.3s ease"
              }}>
                {playMode === 'free' 
                  ? '🎮 Practice mode - No entry fee required' 
                  : '🏆 Stake to play and earn YUZU rewards'}
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, fontSize: "4rem" }}>
            👋
          </div>
        </div>

        {/* Quick Play Section - Horizontal Scroll */}
        <div style={{ marginBottom: "2rem", overflow: "visible", paddingBottom: "1rem" }}>
          <h3 style={{
            color: "#111827",
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            paddingLeft: "1rem"
          }}>
            🚀 Quick Play
          </h3>
          <Swiper
            modules={[FreeMode, Pagination]}
            spaceBetween={16}
            slidesPerView="auto"
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            freeMode={true}
            style={{
              width: "100vw",
              marginLeft: "calc(-1 * (100vw - 100%) / 2)",
              paddingBottom: "2rem",
              overflow: "visible"
            }}
          >
            {/* Daily Quiz Card */}
            <SwiperSlide style={{ width: "min(350px, calc(100vw - 48px))" }}>
            <div style={{
              background: "linear-gradient(135deg, #58CC02, #46a001)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 8px 24px rgba(88, 204, 2, 0.3)",
              position: "relative",
              overflow: "hidden",
              color: "#fff"
            }}>
              <div style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%"
              }} />
              <div style={{
                position: "relative",
                zIndex: 1
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem"
                }}>
                  <div style={{ fontSize: "3rem" }}>🎯</div>
                  {countdown && (
                    <div style={{
                      background: "rgba(255,255,255,0.2)",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      backdropFilter: "blur(10px)"
                    }}>
                      {countdown.hours.toString().padStart(2, '0')}:{countdown.minutes.toString().padStart(2, '0')}:{countdown.seconds.toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                <h4 style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  Daily Quiz
                </h4>
                <p style={{
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  opacity: 0.95
                }}>
                  {currentQuizDescription || "Complete today's quiz to earn bonus XP!"}
                </p>
                <button
                  onClick={startDailyQuiz}
                  disabled={loading}
                  style={{
                    background: "#fff",
                    color: "#58CC02",
                    border: "none",
                    borderRadius: "12px",
                    padding: "1rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    transition: "all 0.3s ease",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(-2px)"
                      e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(0)"
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
                    }
                  }}
                >
                  {loading ? "Loading..." : "🚀 Start Now"}
                </button>
              </div>
            </div>
            </SwiperSlide>

            {/* AI Quiz Card */}
            <SwiperSlide style={{ width: "min(350px, calc(100vw - 48px))" }}>
            <div style={{
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              borderRadius: "16px",
              padding: "2rem",
              boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
              position: "relative",
              overflow: "hidden",
              color: "#fff"
            }}>
              <div style={{
                position: "absolute",
                bottom: "-50px",
                left: "-50px",
                width: "150px",
                height: "150px",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "50%"
              }} />
              <div style={{
                position: "relative",
                zIndex: 1
              }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🤖</div>
                <h4 style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  marginBottom: "0.5rem",
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                }}>
                  AI Quiz Generator
                </h4>
                <p style={{
                  fontSize: "0.9rem",
                  marginBottom: "1.5rem",
                  opacity: 0.95
                }}>
                  Create custom quizzes on any topic you want to learn!
                </p>
                <button
                  onClick={() => navigate({ to: `/ai-quiz?playMode=${playMode}` })}
                  style={{
                    background: "#fff",
                    color: "#3b82f6",
                    border: "none",
                    borderRadius: "12px",
                    padding: "1rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)"
                    e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.2)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  🧠 Generate Quiz
                </button>
              </div>
            </div>
            </SwiperSlide>
          </Swiper>
        </div>

        {/* Learning Paths - Horizontal Scroll */}
        <div style={{ marginBottom: "2rem", overflow: "visible", paddingBottom: "1rem" }}>
          <h3 style={{
            color: "#111827",
            fontSize: "1.5rem",
            fontWeight: 800,
            marginBottom: "1rem",
            paddingLeft: "1rem"
          }}>
            📚 Learning Paths
          </h3>
          <Swiper
            modules={[FreeMode, Pagination]}
            spaceBetween={16}
            slidesPerView="auto"
            slidesOffsetBefore={16}
            slidesOffsetAfter={16}
            freeMode={true}
            style={{
              width: "100vw",
              marginLeft: "calc(-1 * (100vw - 100%) / 2)",
              paddingBottom: "2rem",
              overflow: "visible"
            }}
          >
            {AVAILABLE_QUIZZES.map((quiz, index) => {
              const gradients = [
                "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              ]
              return (
                <SwiperSlide key={quiz.id} style={{ width: "min(320px, calc(100vw - 48px))" }}>
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    border: "2px solid transparent"
                  }}
                  onClick={() => navigate({ to: '/quiz-game', search: { quiz: quiz.id, playMode } })}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)"
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.15)"
                    e.currentTarget.style.borderColor = "#FFD700"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)"
                    e.currentTarget.style.borderColor = "transparent"
                  }}
                >
                  {/* Colored header */}
                  <div style={{
                    background: gradients[index],
                    padding: "2rem 1.5rem",
                    textAlign: "center",
                    color: "#fff"
                  }}>
                    <div style={{
                      fontSize: "3.5rem",
                      marginBottom: "0.5rem",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                    }}>
                      {quiz.icon}
                    </div>
                    <h4 style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      margin: 0,
                      textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}>
                      {quiz.title}
                    </h4>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.5rem" }}>
                    <p style={{
                      color: "#6b7280",
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                      marginBottom: "1.5rem",
                      minHeight: "60px"
                    }}>
                      {quiz.description}
                    </p>

                    {/* Stats */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e5e7eb"
                    }}>
                      <div style={{
                        display: "flex",
                        gap: "0.5rem",
                        alignItems: "center",
                        color: "#6b7280",
                        fontSize: "0.85rem"
                      }}>
                        <span>📝 {quiz.questions} questions</span>
                        <span>•</span>
                        <span>⏱️ {quiz.estimatedTime}</span>
                      </div>
                      <span style={{
                        background: gradients[index],
                        color: "#fff",
                        padding: "0.3rem 0.75rem",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                      }}>
                        {quiz.category}
                      </span>
                    </div>
                  </div>
                </div>
                </SwiperSlide>
              )
            })}
          </Swiper>
        </div>

        {/* Daily Missions - Greyed Out & at Bottom */}
        <div style={{
          marginBottom: "2rem",
          opacity: 0.5,
          filter: "grayscale(100%)",
          pointerEvents: "none"
        }}>
          <div style={{
            background: "#f3f4f6",
            borderRadius: "16px",
            padding: "1.5rem",
            border: "1px solid #e5e7eb"
          }}>
            <h3 style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#6b7280",
              marginBottom: "0.5rem"
            }}>
              📋 Daily Missions
            </h3>
            <p style={{
              fontSize: "0.85rem",
              color: "#9ca3af",
              marginBottom: "1rem"
            }}>
              Complete tasks to earn bonus XP (Coming Soon)
            </p>
            <div style={{
              background: "#e5e7eb",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
              <div style={{ fontSize: "0.9rem", color: "#6b7280", fontWeight: 600 }}>
                Feature Under Development
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})