import { sdk } from '@farcaster/miniapp-sdk'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { getContractAddresses } from '../libs/constants'
import AIQuizGenerator from '../components/AIQuizGenerator'
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

function HomePage() {
  const { chain } = useAccount();
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  
  // Get contract addresses based on current chain
  const contractAddresses = chain ? getContractAddresses(chain.id) : null;
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const navigate = useNavigate();

  // Countdown timer state
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [quizCreatedAt, setQuizCreatedAt] = useState<string | null>(null);
  const [currentQuizTitle, setCurrentQuizTitle] = useState<string>('');
  const [currentQuizDescription, setCurrentQuizDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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
        setQuizCreatedAt(quiz.createdAt);
        setCurrentQuizTitle(quiz.title || 'Daily Quiz');
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
        
        // Navigate to quiz
        navigate({ to: quizUrl });
      } else {
        console.error('No daily quiz available');
      }
    } catch (error) {
      console.error('Error starting daily quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSelect = (quizId: string) => {
    if (!chain) {
      return; // Don't allow quiz selection without wallet connection
    }
    setSelectedQuiz(quizId);
    // Navigate to quiz using TanStack Router
    navigate({ to: '/quiz-game', search: { quiz: quizId } });
  };

  // Show nothing while loading - Farcaster shows splash screen
  if (!isAppReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-2 py-1 sm:px-4 sm:py-3 md:p-8">
        {/* Hero Section - Clear User Goals */}
        <div className="text-center mb-3 sm:mb-6">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold mb-1 sm:mb-3 text-foreground">
            Welcome to Realmind! 🧠
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-6 max-w-2xl mx-auto px-1 sm:px-4">
            Learn blockchain daily, earn XP, and climb the leaderboard. Choose your learning path:
          </p>
          
          {/* Clear Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-2">🎯</div>
              <h3 className="font-bold text-orange-700 text-sm sm:text-base mb-1">Daily Quiz</h3>
              <p className="text-xs sm:text-sm text-orange-600">Complete today's quiz to earn XP and climb the leaderboard</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-2">🤖</div>
              <h3 className="font-bold text-blue-700 text-sm sm:text-base mb-1">AI Custom Quiz</h3>
              <p className="text-xs sm:text-sm text-blue-600">Generate personalized quizzes on any topic you want to learn</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-green-700 text-sm sm:text-base mb-1">Leaderboard</h3>
              <p className="text-xs sm:text-sm text-green-600">See your ranking and compete with other learners globally</p>
            </div>
          </div>
        </div>

        {/* Wallet Connection Prompt */}
        {!chain && (
          <div className="mb-3 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg shadow-lg p-4 sm:p-6 text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h2 className="text-lg sm:text-xl font-semibold mb-2 text-blue-700">Connect Your Wallet</h2>
              <p className="text-sm text-blue-600 mb-4">
                Connect your wallet to start earning XP, taking quizzes, and climbing the leaderboard!
              </p>
              <div className="flex justify-center">
                <ConnectButton
                  accountStatus={{
                    smallScreen: 'avatar',
                    largeScreen: 'full',
                  }}
                  chainStatus={{
                    smallScreen: 'icon',
                    largeScreen: 'full',
                  }}
                  showBalance={{
                    smallScreen: false,
                    largeScreen: true,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* XP & Leaderboard System - Clear Explanation */}
        <div className="text-center mb-2 sm:mb-6 md:mb-8">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-4 md:p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-1 sm:mb-2 md:mb-3">
              <span className="text-lg sm:text-2xl md:text-3xl mr-1 sm:mr-2">🏆</span>
              <h2 className="text-xs sm:text-lg md:text-xl font-bold text-foreground text-center">Earn XP & Climb Leaderboard</h2>
            </div>
            <div className="bg-white rounded-md sm:rounded-lg md:rounded-xl p-1 sm:p-2 md:p-3 mb-1 sm:mb-2 md:mb-3 border border-yellow-200">
              <p className="text-xs sm:text-sm md:text-lg font-bold text-primary mb-0.5 sm:mb-1">
                How XP Works
              </p>
              <p className="text-xs text-muted-foreground">
                Daily Quiz: 100 XP • Custom Quiz: 50 XP • Perfect Score: +50% bonus
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 md:gap-3 justify-center items-center">
              {contractAddresses ? (
                <a
                  href={chain?.id === 8453 
                    ? `https://basescan.org/token/${contractAddresses.token1ContractAddress}#balances`
                    : `https://celoscan.io/token/${contractAddresses.token1ContractAddress}#balances`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white 
                             rounded-md sm:rounded-lg font-bold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base"
                >
                  🏅 View Leaderboard
                </a>
              ) : (
                <div className="inline-block px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-gray-300 text-gray-500 
                               rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-base cursor-not-allowed">
                  🏅 Connect Wallet
                </div>
              )}
              <a
                href="https://x.com/DailyWiser_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 bg-blue-500 text-white 
                           rounded-md sm:rounded-lg font-bold hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base"
              >
                📖 Learn More
              </a>
            </div>
          </div>
        </div>

        {/* AI Quiz Generator Section */}
        <AIQuizGenerator className="mb-3 sm:mb-8 md:mb-12" />

        {/* Daily Quiz - Primary Action */}
        <div className="mb-3 sm:mb-8 md:mb-12 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-600 text-center">🎯 Today's Daily Quiz</h2>
            <p className="text-sm text-orange-600 text-center mb-4">Complete to earn XP and climb the leaderboard!</p>
            
            {countdown ? (
              <div className="text-center">
                <div className="flex justify-center space-x-2 sm:space-x-4 mb-4">
                  <div className="bg-orange-100 rounded-lg p-2 sm:p-3 min-w-12 sm:min-w-16">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">{countdown.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-orange-500">Hours</div>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-2 sm:p-3 min-w-12 sm:min-w-16">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">{countdown.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-orange-500">Minutes</div>
                  </div>
                  <div className="bg-orange-100 rounded-lg p-2 sm:p-3 min-w-12 sm:min-w-16">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">{countdown.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-orange-500">Seconds</div>
                  </div>
                </div>
                
                {/* Quiz Title and Description */}
                {currentQuizTitle && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 mb-4 border border-orange-200">
                    <h3 className="text-base sm:text-lg font-semibold text-orange-700 mb-2">
                      {currentQuizTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {currentQuizDescription.length > 100 
                        ? `${currentQuizDescription.substring(0, 100)}...` 
                        : currentQuizDescription}
                    </p>
                  </div>
                )}
                
                {quizCreatedAt && (
                  <div className="text-xs text-gray-500 mb-3">
                    Current quiz created: {new Date(quizCreatedAt).toLocaleString()}
                  </div>
                )}
                <button
                  onClick={startDailyQuiz}
                  className={`px-4 sm:px-6 py-2 sm:py-3 font-bold rounded-lg transition-all duration-300 shadow-lg text-sm sm:text-base ${
                    !chain 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 hover:shadow-xl'
                  }`}
                  disabled={loading || !chain}
                >
                  {!chain ? '🔗 Connect Wallet First' : '🎯 Start Daily Quiz'}
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-500">Loading countdown...</p>
              </div>
            )}
          </div>
        </div>

        {/* Learning Topics - Alternative to Daily Quiz */}
        <div className="mb-3 sm:mb-8 md:mb-12">
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">📚 Or Learn Specific Topics</h2>
            <p className="text-sm text-muted-foreground">Choose from these curated learning paths (50 XP each)</p>
          </div>
          <div id="topics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            {AVAILABLE_QUIZZES.map((quiz, index) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                isSelected={selectedQuiz === quiz.id}
                onSelect={() => handleQuizSelect(quiz.id)}
                delay={`${index * 200}ms`}
                isDisabled={!chain}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, isSelected, onSelect, delay, isDisabled = false }: {
  quiz: Quiz;
  isSelected: boolean;
  onSelect: () => void;
  delay: string;
  isDisabled?: boolean;
}) {
  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={`quiz-card rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 transition-all duration-300 animate-bounce-in group
                  ${isDisabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isSelected 
                      ? 'ring-2 ring-primary quiz-glow scale-105 cursor-pointer' 
                      : 'hover:scale-105 hover:quiz-button-glow cursor-pointer'
                  }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center mb-1 sm:mb-3 md:mb-4">
        <div className="text-lg sm:text-2xl md:text-4xl mr-1 sm:mr-3 md:mr-4 group-hover:animate-celebrate">
          {quiz.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-lg md:text-xl font-bold text-primary mb-1 truncate">
            {quiz.title}
          </h3>
          <div className={`inline-block px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {quiz.category}
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-1 sm:mb-3 md:mb-4 leading-relaxed text-xs sm:text-sm line-clamp-2">
        {quiz.description}
      </p>
      
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="flex items-center">
          <span className="mr-0.5 sm:mr-1">📝</span>
          {quiz.questions} questions
        </span>
        <span className="flex items-center">
          <span className="mr-0.5 sm:mr-1">⏱️</span>
          {quiz.estimatedTime}
        </span>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})