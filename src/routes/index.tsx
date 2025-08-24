import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
import Header from '../components/Header'
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
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const navigate = useNavigate();

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

  const handleQuizSelect = (quizId: string) => {
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
      <div className="max-w-6xl mx-auto px-3 py-2 sm:p-6 md:p-8">
        {/* Hero Section - Simplified Duolingo-like */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 sm:mb-3 text-foreground">
            Learn by Playing
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-2 sm:px-4">
            Short, fun quizzes to build real crypto knowledge. Pick a topic and start earning points.
          </p>
        </div>

        {/* Leaderboard Section */}
        <div className="text-center mb-4 sm:mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl p-3 sm:p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-2 sm:mb-4">
              <span className="text-2xl sm:text-3xl md:text-4xl mr-2 sm:mr-3">🏆</span>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground text-center">August Initiation Campaign</h2>
            </div>
            <div className="bg-white rounded-xl p-3 sm:p-4 mb-3 sm:mb-4 border border-yellow-200">
              <p className="text-base sm:text-lg md:text-xl font-bold text-primary mb-1">
                Season3 Points + $300 USDC Raffle
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Earn points with every quiz
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center items-center">
              <a
                href="https://basescan.org/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white 
                           rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                🏅 View Leaderboard
              </a>
              <a
                href="https://x.com/DailyWiser_/status/1956651487800783034"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-blue-500 text-white 
                           rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                📖 Learn More
              </a>
            </div>
          </div>
        </div>

        {/* AI Quiz Generator Section */}
        <AIQuizGenerator className="mb-4 sm:mb-8 md:mb-12" />

        {/* Quiz Selection Cards */}
        <div id="topics" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-8 md:mb-12">
          {AVAILABLE_QUIZZES.map((quiz, index) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              isSelected={selectedQuiz === quiz.id}
              onSelect={() => handleQuizSelect(quiz.id)}
              delay={`${index * 200}ms`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuizCard({ quiz, isSelected, onSelect, delay }: {
  quiz: Quiz;
  isSelected: boolean;
  onSelect: () => void;
  delay: string;
}) {
  return (
    <div
      onClick={onSelect}
      className={`quiz-card rounded-2xl p-3 sm:p-4 md:p-6 cursor-pointer transition-all duration-300 animate-bounce-in group
                  ${isSelected 
                    ? 'ring-2 ring-primary quiz-glow scale-105' 
                    : 'hover:scale-105 hover:quiz-button-glow'
                  }`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center mb-2 sm:mb-3 md:mb-4">
        <div className="text-xl sm:text-2xl md:text-4xl mr-2 sm:mr-3 md:mr-4 group-hover:animate-celebrate">
          {quiz.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary mb-1 truncate">
            {quiz.title}
          </h3>
          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
            {quiz.category}
          </div>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-2 sm:mb-3 md:mb-4 leading-relaxed text-xs sm:text-sm line-clamp-2">
        {quiz.description}
      </p>
      
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span className="flex items-center">
          <span className="mr-1">📝</span>
          {quiz.questions} questions
        </span>
        <span className="flex items-center">
          <span className="mr-1">⏱️</span>
          {quiz.estimatedTime}
        </span>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomePage,
})