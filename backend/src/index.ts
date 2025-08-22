import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import 'dotenv/config'

const app = new Hono()

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  })
)

app.get('/', (c) => {
  return c.json({
    message: 'Backend2 - Simple AI Quiz Generator',
    version: '1.0.0',
    endpoints: ['/health', '/generate-quiz']
  })
})

app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

const QuizSchema = z.object({
  title: z.string(),
  description: z.string(),
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correct: z.number().int().min(0).max(3),
      explanation: z.string()
    })
  )
})

app.post('/generate-quiz', async (c) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return c.json({
        error: 'Groq API key not configured'
      }, 500)
    }

    const body = await c.req.json()
    const { topic, difficulty = 'medium', questionCount = 5 } = body

    if (!topic) {
      return c.json({
        error: 'Topic is required'
      }, 400)
    }

    const { object } = await generateObject({
      model: groq('moonshotai/kimi-k2-instruct'),
      schema: QuizSchema,
      prompt: `Generate a ${difficulty} level quiz about "${topic}" with exactly ${questionCount} questions.

Requirements:
- Each question should have exactly 4 multiple choice options
- Only one correct answer per question (index 0-3)
- Include a brief explanation for each correct answer
- Questions should be educational and test understanding
- Title should be descriptive
- Description should explain what the quiz covers

Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: ${questionCount}`
    })

    return c.json({
      success: true,
      quiz: {
        id: `quiz_${Date.now()}`,
        ...object,
        difficulty,
        topic,
        questionCount: object.questions.length,
        createdAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Error generating quiz:', error)
    return c.json({
      error: 'Failed to generate quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app