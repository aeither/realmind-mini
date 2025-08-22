import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { aiQuizGenerator } from '../libs/aiQuizGenerator';
import { toast } from 'sonner';

interface AIQuizGeneratorProps {
  className?: string;
}

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', icon: '🌱' },
  { value: 'intermediate', label: 'Intermediate', icon: '📚' },
  { value: 'advanced', label: 'Advanced', icon: '🚀' }
] as const;

const QUESTION_COUNT_OPTIONS = [3, 5, 7, 10];

const POPULAR_TOPICS = [
  'Bitcoin Fundamentals',
  'Ethereum & Smart Contracts', 
  'DeFi Protocols',
  'NFTs & Digital Art',
  'Cryptocurrency Trading',
  'Blockchain Security',
  'Layer 2 Solutions',
  'Staking & Yield Farming',
  'Web3 Development',
  'Crypto Regulations'
];

export default function AIQuizGenerator({ className = '' }: AIQuizGeneratorProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<{
    topic: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questionCount: number;
    userInterests: string[];
  }>({
    topic: '',
    difficulty: 'intermediate',
    questionCount: 5,
    userInterests: []
  });

  const handleTopicSelect = (topic: string) => {
    setFormData(prev => ({ ...prev, topic }));
  };

  const handleGenerateQuiz = async () => {
    if (!formData.topic.trim()) {
      toast.error('Please enter a topic for your quiz');
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info('🤖 AI is creating your personalized quiz...', {
        duration: 3000
      });

      const quizConfig = await aiQuizGenerator.generateQuiz({
        topic: formData.topic,
        difficulty: formData.difficulty,
        questionCount: formData.questionCount,
        userInterests: formData.userInterests
      });

      const quizUrl = aiQuizGenerator.generateQuizUrl(quizConfig);
      
      toast.success('🎉 Your AI quiz is ready!');
      
      // Navigate to the generated quiz using the safe URL generation
      navigate({ to: quizUrl });
      
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <div className={`${className}`}>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <span className="text-4xl mr-3">🤖</span>
              <h2 className="text-2xl font-bold text-foreground">AI Quiz Generator</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Generate personalized quizzes on any topic using AI! Get questions tailored to your interests and skill level.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white 
                         rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🎯 Create Custom Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white border-2 border-purple-300 rounded-2xl p-6 max-w-4xl mx-auto shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <span className="text-3xl mr-3">🤖</span>
            <h2 className="text-2xl font-bold text-foreground">Create AI Quiz</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Quiz Topic
            </label>
            <input
              type="text"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter any topic (e.g., 'Bitcoin for beginners', 'Advanced DeFi strategies')"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
            
            {/* Popular Topics */}
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">Popular topics:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTopicSelect(topic)}
                    className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-xs rounded-full 
                               border border-gray-200 hover:border-purple-300 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, difficulty: option.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.difficulty === option.value
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="font-semibold text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-3">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => setFormData(prev => ({ ...prev, questionCount: count }))}
                  className={`p-3 rounded-lg border-2 transition-all font-semibold ${
                    formData.questionCount === count
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || !formData.topic.trim()}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                isGenerating || !formData.topic.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Generating Quiz...
                </div>
              ) : (
                <>🚀 Generate AI Quiz</>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            🤖 Powered by Alith AI • Generate unlimited personalized quizzes
          </div>
        </div>
      </div>
    </div>
  );
}
