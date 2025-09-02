import { z } from 'zod'

// Schema for Grok API structured output
export const DailyQuizSchema = z.object({
  title: z.string().describe("Quiz title based on trending topics"),
  description: z.string().describe("Brief description of what the quiz covers"),
  trending_topic: z.string().describe("The main trending topic this quiz is based on"),
  questions: z.array(
    z.object({
      question: z.string().describe("The quiz question"),
      options: z.array(z.string()).length(4).describe("Exactly 4 multiple choice options"),
      correct: z.number().int().min(0).max(3).describe("Index of the correct answer (0-3)"),
      explanation: z.string().describe("Explanation of why this answer is correct"),
      source_context: z.string().describe("Context from the Twitter/X data that inspired this question")
    })
  ).length(3).describe("Exactly 3 quiz questions")
})

export type DailyQuiz = z.infer<typeof DailyQuizSchema>

// Frontend-compatible quiz format (matches AIQuizConfig)
export interface FrontendQuizConfig {
  id: string
  title: string
  description: string
  difficulty: string
  topic: string
  questionCount: number
  questions: Array<{
    question: string
    options: string[]
    correct: number
    explanation?: string
  }>
  createdAt: string
  source: string
}

export interface QuizResponse {
  success: boolean
  quiz?: FrontendQuizConfig
  error?: string
  details?: string
}

// Redis stored quiz list
export interface StoredDailyQuiz {
  id: string
  title: string
  description: string
  trending_topic: string
  questions: Array<{
    question: string
    options: string[]
    correct: number
    explanation: string
    source_context: string
  }>
  difficulty: string
  questionCount: number
  createdAt: string
  source: string
}

export interface DailyQuizList {
  quizzes: StoredDailyQuiz[]
  generatedAt: string
  expiresAt: string
}

// Backlog system types
export interface BacklogItem {
  id: string
  topic: string
  addedBy: string
  addedAt: string
  priority: number // Higher number = higher priority
  status: 'pending' | 'processing' | 'completed'
}

export interface BacklogList {
  items: BacklogItem[]
  totalCount: number
  lastUpdated: string
}

export interface BacklogResponse {
  success: boolean
  items?: BacklogItem[]
  item?: BacklogItem
  count?: number
  error?: string
  message?: string
}