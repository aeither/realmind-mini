import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { toast } from 'sonner'
import { quizGameABI } from '../libs/quizGameABI'
import { getContractAddresses } from '../libs/constants'
import { hyperionTestnet } from '../wagmi'
import GlobalHeader from '../components/GlobalHeader'
import { AIQuizGenerator } from '../libs/aiQuizGenerator'

interface QuizSearchParams {
  quiz?: string
  mode?: string
  data?: string
}

// Quiz configurations
const QUIZ_CONFIGS = {
  'web3-basics': {
    id: 'web3-basics',
    title: 'Web3 Basics',
    description: 'Test your knowledge of blockchain fundamentals',
    questions: [
      {
        question: "What is the primary purpose of a blockchain?",
        options: ["To store data", "To create a decentralized, immutable ledger", "To process payments", "To host websites"],
        correct: 1
      },
      {
        question: "What does 'HODL' mean in cryptocurrency?",
        options: ["Hold On for Dear Life", "Hold", "High Order Data Logic", "Hash of Digital Ledger"],
        correct: 1
      },
      {
        question: "What is a smart contract?",
        options: ["A legal document", "Self-executing code on blockchain", "A cryptocurrency", "A wallet"],
        correct: 1
      }
    ]
  },
  'crypto-trading': {
    id: 'crypto-trading',
    title: 'Crypto Trading',
    description: 'Learn about trading strategies, market analysis, and risk management',
    questions: [
      {
        question: "What is a 'bull market' in cryptocurrency?",
        options: ["A market where prices are falling", "A market where prices are rising", "A market with high volatility", "A market with low trading volume"],
        correct: 1
      },
      {
        question: "What does 'FOMO' stand for in trading?",
        options: ["Fear of Missing Out", "Fear of Market Order", "Fast Order Market Option", "Financial Order Management"],
        correct: 0
      },
      {
        question: "What is 'DCA' in cryptocurrency trading?",
        options: ["Daily Crypto Analysis", "Dollar Cost Averaging", "Digital Currency Arbitrage", "Direct Crypto Access"],
        correct: 1
      }
    ]
  },
  'defi-protocols': {
    id: 'defi-protocols',
    title: 'DeFi Protocols',
    description: 'Explore decentralized finance protocols, yield farming, and liquidity pools',
    questions: [
      {
        question: "What is 'yield farming' in DeFi?",
        options: ["Growing crops on blockchain", "Earning rewards by providing liquidity", "Mining cryptocurrency", "Trading tokens"],
        correct: 1
      },
      {
        question: "What is an 'AMM' in DeFi?",
        options: ["Automated Market Maker", "Advanced Mining Method", "Asset Management Module", "Automated Money Market"],
        correct: 0
      },
      {
        question: "What is 'impermanent loss'?",
        options: ["Loss from holding tokens too long", "Loss from providing liquidity to pools", "Loss from trading fees", "Loss from network fees"],
        correct: 1
      }
    ]
  }
} as const

function QuizGame() {
  const navigate = useNavigate()
  const { quiz: quizId, mode, data } = useSearch({ from: '/quiz-game' }) as QuizSearchParams
  const { address, chain } = useAccount()
  const { switchChain } = useSwitchChain()

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [aiAnswers, setAiAnswers] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(5)
  const [userTimeLeft, setUserTimeLeft] = useState(5)
  const [isAiTurn, setIsAiTurn] = useState(false)
  const [isUserTurn, setIsUserTurn] = useState(true)
  const [gameResult, setGameResult] = useState<'user_wins' | 'ai_wins' | 'tie' | null>(null)
  const [showAiAnswer, setShowAiAnswer] = useState(false)
  const [userTimedOut, setUserTimedOut] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [questionResults, setQuestionResults] = useState<Array<{userAnswered: boolean, userCorrect: boolean, aiCorrect: boolean}>>([])
  const [justCompletedQuiz, setJustCompletedQuiz] = useState(false)
  const FIXED_ENTRY_AMOUNT = '0.0001' // Fixed entry amount in tMETIS

  // Function to restart the quiz in AI challenge mode
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0)
    setUserAnswers([])
    setQuizCompleted(false)
    setScore(0)
    setAiScore(0)
    setAiAnswers([])
    setTimeLeft(5)
    setUserTimeLeft(5)
    setIsAiTurn(false)
    setIsUserTurn(true)
    setGameResult(null)
    setShowAiAnswer(false)
    setUserTimedOut(false)
    setQuizStarted(true)
    setQuestionResults([])
  }

  const contractAddresses = chain ? getContractAddresses(chain.id) : getContractAddresses(hyperionTestnet.id)
  
  // Handle AI-generated quizzes
  let quizConfig = null
  
  // Redirect ai-generated to web3-basics (default fallback)
  if (quizId === 'ai-generated') {
    toast.info('Redirecting to Web3 Basics quiz...')
    navigate({ to: '/quiz-game', search: { quiz: 'web3-basics' } })
    return null
  }
  
  if (quizId === 'ai-custom' && data) {
    try {
      quizConfig = AIQuizGenerator.decodeQuizFromUrl(data)
    } catch (error) {
      console.error('Failed to decode AI quiz data:', error)
      toast.error('Invalid quiz data. Please generate a new quiz.')
    }
  } else if (quizId) {
    quizConfig = QUIZ_CONFIGS[quizId as keyof typeof QUIZ_CONFIGS] || null
  }
  
  const isAiChallengeMode = mode === 'ai-challenge'

  // AI bot logic - simple but effective
  const getAiAnswer = (question: any) => {
    // AI has a 85% chance of getting the answer correct
    const correctChance = 0.85
    const willAnswerCorrectly = Math.random() < correctChance
    
    if (willAnswerCorrectly) {
      return question.options[question.correct]
    } else {
      // Pick a random wrong answer
      const wrongIndices = question.options
        .map((_: any, index: number) => index)
        .filter((index: number) => index !== question.correct)
      const randomWrongIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)]
      return question.options[randomWrongIndex]
    }
  }

  // Contract reads
  const { data: userSession } = useReadContract({
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    abi: quizGameABI,
    functionName: 'getQuizSession',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds instead of constantly
      staleTime: 5000, // Consider data fresh for 5 seconds
      retry: 1, // Reduce retry attempts
    },
  });

  const { data: hasActiveQuiz } = useReadContract({
    address: contractAddresses.quizGameContractAddress as `0x${string}`,
    abi: quizGameABI,
    functionName: 'hasActiveQuiz',
    args: [address as `0x${string}`],
    query: {
      enabled: !!address,
      refetchInterval: 10000, // Refetch every 10 seconds instead of constantly
      staleTime: 5000, // Consider data fresh for 5 seconds
      retry: 1, // Reduce retry attempts
    },
  });

  // Extract quiz ID from user session
  const activeQuizId = userSession && typeof userSession === 'object' && 'quizId' in userSession ? (userSession as any).quizId : '';

  // Contract writes
  const { writeContract: startQuiz, isPending: isStartPending, data: startHash } = useWriteContract()
  const { writeContract: completeQuiz, isPending: isCompletePending, data: completeHash } = useWriteContract()

  // Wait for transaction receipts
  const { isSuccess: isStartSuccess, isLoading: isStartConfirming } = useWaitForTransactionReceipt({
    hash: startHash,
  })

  const { isSuccess: isCompleteSuccess, isLoading: isCompleteConfirming } = useWaitForTransactionReceipt({
    hash: completeHash,
  })

  // Combined transaction states
  const isStartTransactionPending = isStartPending || isStartConfirming
  const isCompleteTransactionPending = isCompletePending || isCompleteConfirming

  // Timer effect for user turn in AI challenge mode
  useEffect(() => {
    if (isAiChallengeMode && isUserTurn && userTimeLeft > 0 && !userTimedOut && (quizStarted || (hasActiveQuiz && activeQuizId === quizId))) {
      const timer = setTimeout(() => {
        setUserTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isAiChallengeMode && isUserTurn && userTimeLeft === 0 && !userTimedOut && (quizStarted || (hasActiveQuiz && activeQuizId === quizId))) {
      // User ran out of time - AI wins by default
      setUserTimedOut(true)
      setIsUserTurn(false)
      
      if (quizConfig) {
        const currentQuestion = quizConfig.questions[currentQuestionIndex]
        const aiAnswer = getAiAnswer(currentQuestion)
        const newAiAnswers = [...aiAnswers]
        newAiAnswers[currentQuestionIndex] = aiAnswer
        setAiAnswers(newAiAnswers)
        
        // Record this question result - user timed out, AI gets the win
        const newQuestionResults = [...questionResults]
        const aiCorrect = aiAnswer === currentQuestion.options[currentQuestion.correct]
        newQuestionResults[currentQuestionIndex] = {
          userAnswered: false,
          userCorrect: false,
          aiCorrect: aiCorrect
        }
        setQuestionResults(newQuestionResults)
        
        if (aiCorrect) {
          setAiScore(prev => prev + 1)
        }
        
        // User loses - restart quiz from beginning
        setTimeout(() => {
          // Reset all state to restart the quiz
          setCurrentQuestionIndex(0)
          setUserAnswers([])
          setScore(0)
          setAiScore(0)
          setAiAnswers([])
          setTimeLeft(5)
          setUserTimeLeft(5)
          setIsAiTurn(false)
          setIsUserTurn(true)
          setUserTimedOut(false)
          setShowAiAnswer(false)
          setQuizStarted(true)
          setQuestionResults([])
        }, 2000)
      }
    }
  }, [isAiChallengeMode, isUserTurn, userTimeLeft, userTimedOut, currentQuestionIndex, quizConfig, aiAnswers, quizStarted, hasActiveQuiz, activeQuizId, quizId])

  // Timer effect for AI challenge mode
  useEffect(() => {
    if (isAiChallengeMode && isAiTurn && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (isAiChallengeMode && isAiTurn && timeLeft === 0) {
      // AI's turn to answer
      if (quizConfig) {
        const currentQuestion = quizConfig.questions[currentQuestionIndex]
        const aiAnswer = getAiAnswer(currentQuestion)
        const newAiAnswers = [...aiAnswers]
        newAiAnswers[currentQuestionIndex] = aiAnswer
        setAiAnswers(newAiAnswers)
        setShowAiAnswer(true)
        
            // Check if AI got it right
        const aiCorrect = aiAnswer === currentQuestion.options[currentQuestion.correct]
        if (aiCorrect) {
          setAiScore(prev => prev + 1)
        }
        
        // Move to next question or end game
        setTimeout(() => {
          setShowAiAnswer(false)
          setIsAiTurn(false)
          setIsUserTurn(true)
          setTimeLeft(5)
          setUserTimeLeft(5)
          setUserTimedOut(false)
          
          if (currentQuestionIndex < quizConfig.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
          } else {
            // Quiz completed - determine winner
            const finalUserScore = userAnswers.reduce((score, ans, index) => {
              const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
              return score + (isCorrect ? 1 : 0)
            }, 0)
            
            const finalAiScore = newAiAnswers.reduce((score, ans, index) => {
              const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
              return score + (isCorrect ? 1 : 0)
            }, 0)
            
            if (finalUserScore > finalAiScore) {
              setGameResult('user_wins')
            } else if (finalAiScore > finalUserScore) {
              setGameResult('ai_wins')
            } else {
              setGameResult('tie')
            }
            setQuizCompleted(true)
          }
        }, 2000)
      }
    }
  }, [isAiChallengeMode, isAiTurn, timeLeft, currentQuestionIndex, quizConfig, aiAnswers, userAnswers])

  // Effects
  useEffect(() => {
    if (isStartSuccess) {
      toast.success(isAiChallengeMode ? 'AI Challenge started! Beat the bot! 🤖' : 'Quiz started! Good luck! 🎮')
      // Start the quiz timer only after transaction success
      setQuizStarted(true)
    }
  }, [isStartSuccess, isAiChallengeMode])

  useEffect(() => {
    if (isCompleteSuccess) {
      toast.success('Rewards claimed! Check your wallet 🎁')
      setJustCompletedQuiz(true) // Mark that user just completed a quiz
      
      // Navigate to home page after successful claim
      setTimeout(() => {
        navigate({ to: '/' })
      }, 2000) // Wait 2 seconds to show the success message
    }
  }, [isCompleteSuccess, navigate])

  // Reset the justCompletedQuiz flag after 10 seconds to prevent permanent bypass
  useEffect(() => {
    if (justCompletedQuiz) {
      const timer = setTimeout(() => {
        setJustCompletedQuiz(false)
      }, 10000) // Reset after 10 seconds
      
      return () => clearTimeout(timer)
    }
  }, [justCompletedQuiz])

  // Handle quiz start
  const handleStartQuiz = () => {
    if (!address || !quizConfig) return
    
    const actualAmount = parseEther(FIXED_ENTRY_AMOUNT)
    const userAnswerValue = BigInt(Math.floor(Math.random() * 100) + 1)
    
    // For AI-generated quizzes, use a generic quiz ID for the contract
    const contractQuizId = quizId === 'ai-custom' ? 'ai-generated' : quizConfig.id
    
    startQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'startQuiz',
      args: [contractQuizId, userAnswerValue],
      value: actualAmount,
    })
  }

  // Handle quiz answer submission
  const handleQuizAnswer = (answer: string) => {
    if (!quizConfig || !isUserTurn || userTimedOut) return
    
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answer
    setUserAnswers(newAnswers)

    // Check if user got it right
    const userCorrect = answer === quizConfig.questions[currentQuestionIndex].options[quizConfig.questions[currentQuestionIndex].correct]
    if (userCorrect) {
      setScore(prev => prev + 1)
    }

    if (isAiChallengeMode) {
      // Record this question result - user answered in time, so AI gets 0
      const newQuestionResults = [...questionResults]
      newQuestionResults[currentQuestionIndex] = {
        userAnswered: true,
        userCorrect: userCorrect,
        aiCorrect: false // AI loses because user answered first
      }
      setQuestionResults(newQuestionResults)
      
      if (currentQuestionIndex < quizConfig.questions.length - 1) {
        // Move to next question
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setUserTimeLeft(5)
        setTimeLeft(5)
        setIsUserTurn(true)
        setIsAiTurn(false)
        setUserTimedOut(false)
      } else {
        // Quiz completed - calculate final scores from question results
        const finalUserScore = newQuestionResults.reduce((score, result) => {
          return score + (result.userCorrect ? 1 : 0)
        }, 0)
        
        const finalAiScore = newQuestionResults.reduce((score, result) => {
          return score + (result.aiCorrect ? 1 : 0)
        }, 0)
        
        setScore(finalUserScore)
        setAiScore(finalAiScore)
        
        if (finalUserScore > finalAiScore) {
          setGameResult('user_wins')
        } else if (finalAiScore > finalUserScore) {
          setGameResult('ai_wins')
        } else {
          setGameResult('tie')
        }
        setQuizCompleted(true)
      }
    } else {
      // Regular quiz mode
      if (currentQuestionIndex < quizConfig.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        // Quiz completed - calculate final score from all answers
        const finalScore = newAnswers.reduce((score, ans, index) => {
          const isCorrect = ans === quizConfig.questions[index].options[quizConfig.questions[index].correct]
          return score + (isCorrect ? 1 : 0)
        }, 0)
        
        setScore(finalScore)
        setQuizCompleted(true)
      }
    }
  }

  // Handle complete quiz on blockchain
  const handleCompleteQuiz = () => {
    if (!address || !quizConfig) return
    
    // Pass the actual score (number of correct answers) to the contract
    const correctAnswerCount = BigInt(score)
    
    completeQuiz({
      address: contractAddresses.quizGameContractAddress as `0x${string}`,
      abi: quizGameABI,
      functionName: 'completeQuiz',
      args: [correctAnswerCount],
    })
  }
  
  // Check if user is on correct chain
  const isCorrectChain = chain?.id === hyperionTestnet.id

  if (!isCorrectChain) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "2rem",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Wrong Network</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            Please switch to Hyperion (Testnet) to play this quiz.
          </p>
          <button 
            onClick={() => switchChain({ chainId: hyperionTestnet.id })}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Switch to Hyperion Testnet
          </button>
        </div>
      </motion.div>
    )
  }

  // Redirect if no quiz ID or invalid quiz ID
  if (!quizId || !quizConfig) {
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Quiz Not Found</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            The requested quiz could not be found.
          </p>
          <button 
            onClick={() => navigate({ to: '/' })}
            style={{
              backgroundColor: "#58CC02",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer"
            }}
          >
            Back to Quiz Selection
          </button>
        </div>
      </motion.div>
    )
  }

  // Check if user has an active quiz session but for a different quiz
  // Special case: Allow web3-basics to load when user has an ai-generated session (completes the AI session)
  const shouldBypassBlockingScreen = activeQuizId === 'ai-generated' && quizId === 'web3-basics'
  
  // Don't show blocking screen if user just completed a quiz (prevents showing after claiming rewards)
  const shouldSkipDueToCompletion = justCompletedQuiz
  
  // Don't show blocking screen during transaction processing (user should see completion screen with "Claiming..." status)
  const shouldSkipDuringTransaction = isCompleteTransactionPending
  
  // Don't show blocking screen during active gameplay (user is already playing a quiz)
  const shouldSkipDuringGameplay = quizStarted || quizCompleted || isStartSuccess
  
  if (hasActiveQuiz && activeQuizId && activeQuizId !== quizId && !shouldBypassBlockingScreen && !shouldSkipDueToCompletion && !shouldSkipDuringTransaction && !shouldSkipDuringGameplay) {
    // Special handling for AI-generated quiz sessions
    if (activeQuizId === 'ai-generated') {
      // Show the AI session recovery screen
      return (
        <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlobalHeader />
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
            <h2 style={{ color: "#111827", marginBottom: "1rem" }}>AI Quiz Session Found</h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
              You have an active AI-generated quiz session, but the original quiz data cannot be recovered. 
              Complete it with the Web3 Basics quiz to earn your rewards.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button 
                onClick={() => {
                  toast.info('Completing your AI session with Web3 Basics quiz...')
                  navigate({ to: '/quiz-game', search: { quiz: 'web3-basics' } })
                }}
                style={{
                  backgroundColor: "#58CC02",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Complete with Web3 Quiz
              </button>
              <button 
                onClick={() => navigate({ to: '/' })}
                style={{
                  backgroundColor: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer"
                }}
              >
                Back to Selection
              </button>
            </div>
          </div>
        </motion.div>
      )
    }
    
    return (
      <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <GlobalHeader />
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
          <h2 style={{ color: "#111827", marginBottom: "1rem" }}>Active Quiz Session</h2>
          <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
            You have an active quiz session for "{String(activeQuizId)}". Please complete it first.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button 
              onClick={() => navigate({ to: '/quiz-game', search: { quiz: activeQuizId } })}
              style={{
                backgroundColor: "#58CC02",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Continue Active Quiz
            </button>
            <button 
              onClick={() => navigate({ to: '/' })}
              style={{
                backgroundColor: "#e5e7eb",
                color: "#111827",
                border: "none",
                borderRadius: "8px",
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: "pointer"
              }}
            >
              Back to Selection
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // If quiz is completed, show end screen
  if (quizCompleted && quizConfig) {
    const percentage = Math.round((score / quizConfig.questions.length) * 100)
    
    if (isAiChallengeMode) {
      // AI Challenge completion screen
      return (
        <div style={{ paddingTop: '80px' }}>
          <GlobalHeader />
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "2rem",
            textAlign: "center"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "3rem",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-card)"
            }}>
              {gameResult === 'ai_wins' && (
                <>
                  <h2 style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🤖 AI Bot Wins!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    The AI bot scored <strong>{aiScore}</strong> while you scored <strong>{score}</strong> out of {quizConfig.questions.length}.
                  </p>
                  <p style={{ color: "#ef4444", marginBottom: "2rem", fontSize: "1.1rem", fontWeight: 600 }}>
                    You must start over! Try again to beat the AI.
                  </p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                      onClick={handleRestartQuiz}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "1rem 2rem",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🔄 Restart Quiz
                    </button>
                    <button
                      onClick={() => navigate({ to: '/' })}
                      style={{
                        backgroundColor: "#6b7280",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        padding: "1rem 2rem",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      🏠 Back to Home
                    </button>
                  </div>
                </>
              )}
              
              {gameResult === 'user_wins' && (
                <>
                  <h2 style={{ color: "#22c55e", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🎉 You Beat the AI!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    You scored <strong>{score}</strong> while the AI scored <strong>{aiScore}</strong> out of {quizConfig.questions.length}.
                  </p>
                  <div style={{
                    background: "#f0fdf4",
                    border: "1px solid #22c55e",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem"
                  }}>
                    <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                       Base Tokens: {FIXED_ENTRY_AMOUNT} tMETIS × 100 = {parseFloat(FIXED_ENTRY_AMOUNT) * 100} TK1
                    </p>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      AI Challenge Bonus: 50% extra for beating the bot!
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={isCompleteTransactionPending}
                    style={{
                      backgroundColor: isCompleteTransactionPending ? "#9ca3af" : "#58CC02",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: isCompleteTransactionPending ? "not-allowed" : "pointer",
                      opacity: isCompleteTransactionPending ? 0.6 : 1
                    }}
                  >
                    {isCompleteTransactionPending ? (isCompletePending ? "Confirm in wallet..." : "Confirming on blockchain...") : "🎁 Claim Rewards"}
                  </button>
                </>
              )}
              
              {gameResult === 'tie' && (
                <>
                  <h2 style={{ color: "#f59e0b", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                    🤝 It's a Tie!
                  </h2>
                  <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                    Both you and the AI scored <strong>{score}</strong> out of {quizConfig.questions.length}. Great job!
                  </p>
                  <div style={{
                    background: "#fff7ed",
                    border: "1px solid #f59e0b",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem"
                  }}>
                    <h3 style={{ color: "#92400e", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                       Base Tokens: {FIXED_ENTRY_AMOUNT} tMETIS × 100 = {parseFloat(FIXED_ENTRY_AMOUNT) * 100} TK1
                    </p>
                    <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                      Tie Bonus: 25% extra for matching the AI!
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteQuiz}
                    disabled={isCompleteTransactionPending}
                    style={{
                      backgroundColor: isCompleteTransactionPending ? "#9ca3af" : "#58CC02",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "1rem 2rem",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      cursor: isCompleteTransactionPending ? "not-allowed" : "pointer",
                      opacity: isCompleteTransactionPending ? 0.6 : 1
                    }}
                  >
                    {isCompleteTransactionPending ? (isCompletePending ? "Confirm in wallet..." : "Confirming on blockchain...") : "🎁 Claim Rewards"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )
    } else {
      // Regular quiz completion screen
      return (
        <div style={{ paddingTop: '80px' }}>
          <GlobalHeader />
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "2rem",
            textAlign: "center"
          }}>
            <div style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "3rem",
              border: "1px solid hsl(var(--border))",
              boxShadow: "var(--shadow-card)"
            }}>
              <h2 style={{ color: "#111827", marginBottom: "1rem", fontSize: "1.75rem", fontWeight: 800 }}>
                🎉 Quiz Completed!
              </h2>
              <p style={{ color: "#374151", marginBottom: "2rem", fontSize: "1.05rem" }}>
                You scored <strong>{score} out of {quizConfig.questions.length}</strong> questions correctly ({percentage}%).
              </p>
              
              <div style={{
                background: "#f0fdf4",
                border: "1px solid #22c55e",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "2rem"
              }}>
                <h3 style={{ color: "#14532d", marginBottom: "1rem", fontWeight: 800 }}>🪙 Your Rewards</h3>
                <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                   Base Tokens: {FIXED_ENTRY_AMOUNT} tMETIS × 100 = {parseFloat(FIXED_ENTRY_AMOUNT) * 100} TK1
                </p>
                <p style={{ color: "#374151", margin: "0.5rem 0" }}>
                  Bonus: {score === quizConfig.questions.length ? '10-90% additional tokens for all correct answers!' : 'Better luck next time!'}
                </p>
              </div>

              <button
                onClick={handleCompleteQuiz}
                disabled={isCompletePending}
                style={{
                  backgroundColor: isCompletePending ? "#9ca3af" : "#58CC02",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "1rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: isCompletePending ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  minWidth: "140px",
                  opacity: isCompletePending ? 0.6 : 1
                }}
              >
                {isCompletePending ? "Claiming..." : "🎁 Claim Rewards"}
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  // If quiz is active and user has started it, show current question
  // Special case: Allow web3-basics to start immediately when user has AI session (no payment needed)
  const shouldStartWebBasicsForAiSession = hasActiveQuiz && activeQuizId === 'ai-generated' && quizId === 'web3-basics'
  
  if ((isStartSuccess || (hasActiveQuiz && activeQuizId === quizId) || shouldStartWebBasicsForAiSession) && quizConfig && !quizCompleted) {
    const currentQuestion = quizConfig.questions[currentQuestionIndex]
    
    return (
      <div style={{ paddingTop: '80px' }}>
        <GlobalHeader />
        <div style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "clamp(1rem, 4vw, 2rem)"
        }}>
          {isAiChallengeMode && (
            <div style={{
              background: "#f8fafc",
              border: "2px solid #3b82f6",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>YOU</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>{score}</div>
                </div>
                <div style={{ fontSize: "1.2rem", color: "#6b7280", fontWeight: 600 }}>VS</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>AI BOT</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#ef4444" }}>{aiScore}</div>
                </div>
              </div>
              {isUserTurn && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: userTimeLeft <= 2 ? "#fef2f2" : "#dbeafe",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  minWidth: "200px"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: userTimeLeft <= 2 ? "#dc2626" : "#1d4ed8" }}>
                    ⏰ Your turn:
                  </span>
                  <div style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: userTimeLeft <= 2 ? "#dc2626" : "#1d4ed8",
                    minWidth: "1.5rem"
                  }}>
                    {userTimeLeft}
                  </div>
                  <div style={{
                    width: "60px",
                    height: "6px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "3px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${(userTimeLeft / 5) * 100}%`,
                      height: "100%",
                      backgroundColor: userTimeLeft <= 2 ? "#dc2626" : "#22c55e",
                      transition: "all 0.3s ease"
                    }}></div>
                  </div>
                </div>
              )}
              {isAiTurn && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#fee2e2",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>
                    🤖 AI thinking...
                  </span>
                  <div style={{
                    fontSize: "1.2rem",
                    fontWeight: 800,
                    color: "#dc2626",
                    minWidth: "1.5rem"
                  }}>
                    {timeLeft}
                  </div>
                </div>
              )}
              {userTimedOut && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "#fef2f2",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid #dc2626"
                }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#dc2626" }}>
                    ⏰ Time's up! Restarting quiz...
                  </span>
                </div>
              )}
            </div>
          )}
          
          <h2 style={{ 
            color: "#111827", 
            marginBottom: "2rem", 
            textAlign: "center", 
            fontWeight: 800,
            fontSize: "clamp(1.25rem, 5vw, 1.5rem)"
          }}>
            {isAiChallengeMode ? '🤖 AI Challenge' : (quizId === 'ai-custom' ? '🤖 ' + quizConfig.title : quizConfig.title)} - Question {currentQuestionIndex + 1} of {quizConfig.questions.length}
          </h2>
          
          {showAiAnswer && aiAnswers[currentQuestionIndex] && (
            <div style={{
              background: "#fef3c7",
              border: "2px solid #f59e0b",
              borderRadius: "12px",
              padding: "1rem",
              marginBottom: "1rem",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "0.9rem", color: "#92400e", fontWeight: 600, marginBottom: "0.5rem" }}>
                🤖 AI Bot answered:
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}>
                {aiAnswers[currentQuestionIndex]}
              </div>
              {aiAnswers[currentQuestionIndex] === currentQuestion.options[currentQuestion.correct] && (
                <div style={{ fontSize: "0.8rem", color: "#15803d", marginTop: "0.25rem" }}>✅ Correct!</div>
              )}
              {aiAnswers[currentQuestionIndex] !== currentQuestion.options[currentQuestion.correct] && (
                <div style={{ fontSize: "0.8rem", color: "#dc2626", marginTop: "0.25rem" }}>❌ Wrong!</div>
              )}
            </div>
          )}
          
          <div style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "clamp(1.5rem, 5vw, 2rem)",
            border: "1px solid hsl(var(--border))",
            boxShadow: "var(--shadow-card)",
            marginBottom: "2rem"
          }}>
            <h3 style={{ 
              color: "#111827", 
              marginBottom: "1.5rem", 
              fontSize: "clamp(1rem, 4vw, 1.25rem)", 
              fontWeight: 700,
              lineHeight: "1.4"
            }}>
              {currentQuestion.question}
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  disabled={isAiTurn || userTimedOut || !isUserTurn}
                  style={{
                    backgroundColor: (isAiTurn || userTimedOut || !isUserTurn) ? "#f3f4f6" : "#ffffff",
                    border: "2px solid hsl(var(--border))",
                    borderRadius: "8px",
                    padding: "clamp(0.75rem, 3vw, 1rem)",
                    fontSize: "clamp(0.9rem, 3.5vw, 1rem)",
                    cursor: (isAiTurn || userTimedOut || !isUserTurn) ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    textAlign: "left",
                    color: (isAiTurn || userTimedOut || !isUserTurn) ? "#9ca3af" : "#111827",
                    lineHeight: "1.4",
                    minHeight: "clamp(3rem, 12vw, 4rem)",
                    opacity: (isAiTurn || userTimedOut || !isUserTurn) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isAiTurn && !userTimedOut && isUserTurn) {
                      e.currentTarget.style.backgroundColor = "hsl(var(--quiz-selected))"
                      e.currentTarget.style.borderColor = "hsl(var(--primary))"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isAiTurn && !userTimedOut && isUserTurn) {
                      e.currentTarget.style.backgroundColor = "#ffffff"
                      e.currentTarget.style.borderColor = "hsl(var(--border))"
                    }
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            {isAiTurn && (
              <div style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "0.9rem",
                color: "#6b7280",
                fontStyle: "italic"
              }}>
                Wait for the AI to answer...
              </div>
            )}
            {userTimedOut && (
              <div style={{
                textAlign: "center",
                marginTop: "1rem",
                fontSize: "1rem",
                color: "#dc2626",
                fontWeight: 600
              }}>
                ⏰ Time expired! Quiz is restarting...
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main quiz start interface
  return (
    <motion.div style={{ paddingTop: '80px' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <GlobalHeader />
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "clamp(1rem, 4vw, 2rem)"
      }}>
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "clamp(1.5rem, 6vw, 3rem)",
          border: "1px solid hsl(var(--border))",
          boxShadow: "var(--shadow-card)",
          textAlign: "center"
        }}>
          <h1 style={{ 
            color: "#111827", 
            marginBottom: "1rem", 
            fontSize: "clamp(1.5rem, 6vw, 2rem)", 
            fontWeight: 800 
          }}>
            {quizId === 'ai-custom' ? '🤖 ' + (quizConfig?.title || "AI Generated Quiz") : (quizConfig?.title || "Quiz")}
          </h1>
          <p style={{ 
            color: "#374151", 
            marginBottom: "2rem", 
            fontSize: "clamp(0.9rem, 4vw, 1.05rem)",
            lineHeight: "1.5"
          }}>
            {quizId === 'ai-custom' ? 
              (quizConfig?.description || "AI-powered personalized quiz created just for you!") + " 🚀" :
              (quizConfig?.description || "Test your knowledge and earn rewards!")
            }
          </p>
          
          <div style={{
            background: "#f0fdf4",
            border: "1px solid #22c55e",
            borderRadius: "12px",
            padding: "clamp(1rem, 4vw, 1.5rem)",
            marginBottom: "2rem",
            textAlign: "left"
          }}>
            <h3 style={{ 
              color: "#14532d", 
              marginBottom: "1rem", 
              fontWeight: 800,
              fontSize: "clamp(1rem, 4vw, 1.1rem)"
            }}>{isAiChallengeMode ? '🤖 AI Challenge Info:' : (quizId === 'ai-custom' ? '🤖 AI Quiz Info:' : '📋 Quiz Info:')}</h3>
            <ul style={{ 
              color: "#374151", 
              lineHeight: "1.6",
              paddingLeft: "1.5rem",
              margin: 0,
              fontSize: "clamp(0.85rem, 3.5vw, 1rem)"
            }}>
              <li>📝 {quizConfig?.questions.length || 0} questions{quizId === 'ai-custom' ? ' generated by AI' : ` about ${(quizConfig?.title || "quiz").toLowerCase()}`}</li>
              {quizId === 'ai-custom' && (
                <li>🤖 Personalized content created by Alith AI</li>
              )}
              {isAiChallengeMode ? (
                <>
                  <li>🤖 Race against AI bot that answers in 5 seconds</li>
                  <li>🏁 If AI wins, you must restart the quiz</li>
                  <li>🎯 Beat the AI to earn 50% bonus rewards</li>
                  <li>🤝 Tie with AI to earn 25% bonus rewards</li>
                </>
              ) : (
                <>
                  <li>✅ Get all answers correct for bonus rewards (10-90%)</li>
                  <li>🪙 Receive Token1 tokens equal to your entry fee × 100</li>
                  <li>⏰ Complete the quiz to claim your rewards</li>
                </>
              )}
            </ul>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div style={{
              background: "#f0f9ff",
              border: "2px solid #0ea5e9",
              borderRadius: "12px",
              padding: "clamp(0.75rem, 3vw, 1rem)",
              textAlign: "center"
            }}>
              <p style={{ 
                color: "#0c4a6e", 
                margin: "0", 
                fontWeight: 600,
                fontSize: "clamp(0.9rem, 3.5vw, 1rem)"
              }}>
                Entry Fee: {FIXED_ENTRY_AMOUNT} tMETIS
              </p>
              <p style={{ 
                color: "#0c4a6e", 
                margin: "0.25rem 0 0 0", 
                fontSize: "clamp(0.8rem, 3vw, 0.9rem)"
              }}>
                Earn up to {parseFloat(FIXED_ENTRY_AMOUNT) * 190} TK1 tokens!
              </p>
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{ 
              color: "#6b7280", 
              marginBottom: "1rem", 
              fontSize: "clamp(0.8rem, 3vw, 0.9rem)",
              fontWeight: "500"
            }}>
              Entry Fee: {FIXED_ENTRY_AMOUNT} tMETIS
            </p>
            
            {!isAiChallengeMode && (
              <div style={{
                background: "#f0f9ff",
                border: "2px solid #3b82f6",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                textAlign: "center"
              }}>
                <h4 style={{ color: "#1e40af", margin: "0 0 0.5rem 0", fontWeight: 700 }}>
                  🤖 Want a Challenge?
                </h4>
                <p style={{ color: "#1e40af", margin: "0 0 1rem 0", fontSize: "0.9rem" }}>
                  Face our AI bot! Answer correctly in 5 seconds before it does, or start over!
                </p>
                <button
                  onClick={() => navigate({ to: '/quiz-game', search: { quiz: quizId, mode: 'ai-challenge', ...(data && { data }) } })}
                  disabled={isStartTransactionPending}
                  style={{
                    backgroundColor: isStartTransactionPending ? "#9ca3af" : "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: isStartTransactionPending ? "not-allowed" : "pointer",
                    marginRight: "0.5rem",
                    opacity: isStartTransactionPending ? 0.6 : 1
                  }}
                >
                  {isStartTransactionPending ? (isStartPending ? "Confirm in wallet..." : "Confirming on blockchain...") : "🤖 AI Challenge Mode"}
                </button>
              </div>
            )}
            
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={handleStartQuiz}
                disabled={isStartTransactionPending || !address}
                style={{
                  backgroundColor: isStartTransactionPending || !address ? "#9ca3af" : (isAiChallengeMode ? "#ef4444" : "#58CC02"),
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2rem)",
                  fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
                  fontWeight: 700,
                  cursor: isStartTransactionPending || !address ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  opacity: isStartTransactionPending || !address ? 0.6 : 1
                }}
              >
                {isStartTransactionPending ? (isStartPending ? "Confirm in wallet..." : "Confirming on blockchain...") : (isAiChallengeMode ? "🤖 Start AI Challenge" : "🎮 Start Quiz")}
              </button>
              
              {isAiChallengeMode && (
                <button
                  onClick={() => navigate({ to: '/quiz-game', search: { quiz: quizId, ...(data && { data }) } })}
                  disabled={isStartTransactionPending}
                  style={{
                    backgroundColor: isStartTransactionPending ? "#9ca3af" : "#6b7280",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 6vw, 2rem)",
                    fontSize: "clamp(0.9rem, 4vw, 1.1rem)",
                    fontWeight: 700,
                    cursor: isStartTransactionPending ? "not-allowed" : "pointer",
                    opacity: isStartTransactionPending ? 0.6 : 1
                  }}
                >
                  🎮 Normal Mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const Route = createFileRoute('/quiz-game')({
  component: QuizGame,
  validateSearch: (search): QuizSearchParams => ({
    quiz: search.quiz as string,
    mode: search.mode as string,
    data: search.data as string,
  }),
})