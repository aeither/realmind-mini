import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { groq } from '@ai-sdk/groq'
import { generateObject } from 'ai'
import { z } from 'zod'
import 'dotenv/config'
import { QuizService } from './services/quiz.js'

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
    message: 'Backend2 - AI Quiz Generator with Backlog Scheduler & Redis Cache',
    version: '3.0.0',
    endpoints: [
      '/health', 
      '/generate-quiz', 
      '/daily-quiz', 
      '/daily-quiz/cached',
      '/backlog',
      '/backlog/add',
      '/cron/daily-quiz',
      '/test/insert-quiz',
      '/health/grok',
      '/health/redis'
    ]
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
    const { topic, difficulty = 'medium' } = body
    const questionCount = 3 // Fixed to 3 questions

    if (!topic) {
      return c.json({
        error: 'Topic is required'
      }, 400)
    }

    const { object } = await generateObject({
      model: groq('moonshotai/kimi-k2-instruct'),
      schema: QuizSchema,
      prompt: `Generate a ${difficulty} level quiz about "${topic}" with exactly 3 questions.

Requirements:
- Each question should have exactly 4 multiple choice options
- Only one correct answer per question (index 0-3)
- Include a brief explanation for each correct answer
- Questions should be educational and test understanding
- Title should be descriptive
- Description should explain what the quiz covers

Topic: ${topic}
Difficulty: ${difficulty}
Number of questions: 3`
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

// Initialize services
const quizService = new QuizService()

// Daily Quiz Endpoint - Get the latest daily quiz
app.get('/daily-quiz', async (c) => {
  try {
    const result = await quizService.generateDailyQuiz()
    
    if (result.success) {
      return c.json(result)
    } else {
      return c.json(result, 500)
    }
  } catch (error) {
    console.error('Error in daily quiz endpoint:', error)
    return c.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Cached Daily Quiz Endpoint - Get today's cached quizzes from Redis
app.get('/daily-quiz/cached', async (c) => {
  try {
    const result = await quizService.getCachedDailyQuizzes()
    
    if (result.success) {
      return c.json({
        success: true,
        quizzes: result.quizzes,
        count: result.quizzes?.length || 0,
        timestamp: new Date().toISOString()
      })
    } else {
      return c.json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      }, 404)
    }
  } catch (error) {
    console.error('Error in cached daily quiz endpoint:', error)
    return c.json({
      success: false,
      error: 'Failed to get cached daily quizzes',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Backlog Endpoints
app.post('/backlog/add', async (c) => {
  try {
    const body = await c.req.json()
    const { topic, priority = 1, addedBy = 'api' } = body

    if (!topic || typeof topic !== 'string') {
      return c.json({
        success: false,
        error: 'Topic is required and must be a string'
      }, 400)
    }

    const result = await quizService.addToBacklog(topic.trim(), addedBy, priority)
    
    if (result.success) {
      return c.json({
        success: true,
        message: result.message,
        item: result.item,
        timestamp: new Date().toISOString()
      })
    } else {
      return c.json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      }, 400)
    }
  } catch (error) {
    console.error('Error in add to backlog endpoint:', error)
    return c.json({
      success: false,
      error: 'Failed to add to backlog',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

app.get('/backlog', async (c) => {
  try {
    const result = await quizService.getBacklog()
    
    if (result.success) {
      return c.json({
        success: true,
        items: result.items,
        count: result.count,
        timestamp: new Date().toISOString()
      })
    } else {
      return c.json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      }, 500)
    }
  } catch (error) {
    console.error('Error in get backlog endpoint:', error)
    return c.json({
      success: false,
      error: 'Failed to get backlog',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Cron Job Endpoint - For automated daily quiz generation from backlog (stores in Redis)
app.get('/cron/daily-quiz', async (c) => {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = c.req.header('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    console.log('Cron job triggered: Generating scheduled quiz from backlog')
    const result = await quizService.generateScheduledQuiz()
    
    if (result.success) {
      console.log(`Scheduled quiz generated successfully from ${result.source}`)
      return c.json({
        success: true,
        message: 'Scheduled quiz generated and stored successfully',
        source: result.source,
        quiz_count: result.quizzes?.length || 0,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error('Failed to generate scheduled quiz:', result.error)
      return c.json({
        success: false,
        error: 'Failed to generate scheduled quiz',
        details: result.error,
        timestamp: new Date().toISOString()
      }, 500)
    }
  } catch (error) {
    console.error('Error in cron endpoint:', error)
    return c.json({
      success: false,
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Test endpoint to manually insert a quiz
app.get('/test/insert-quiz', async (c) => {
  try {
    const result = await quizService.insertTestQuiz()
    
    if (result.success) {
      return c.json({
        success: true,
        message: 'Test quiz inserted successfully',
        timestamp: new Date().toISOString()
      })
    } else {
      return c.json({
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      }, 500)
    }
  } catch (error) {
    console.error('Error in test insert endpoint:', error)
    return c.json({
      success: false,
      error: 'Failed to insert test quiz',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Health check for Grok API
app.get('/health/grok', async (c) => {
  try {
    const isConnected = await quizService.testGrokConnection()
    
    return c.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      service: 'grok_api',
      timestamp: new Date().toISOString()
    }, isConnected ? 200 : 503)
  } catch (error) {
    return c.json({
      status: 'error',
      service: 'grok_api',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Health check for Redis
app.get('/health/redis', async (c) => {
  try {
    const isConnected = await quizService.testRedisConnection()
    
    return c.json({
      status: isConnected ? 'healthy' : 'unhealthy',
      service: 'redis',
      timestamp: new Date().toISOString()
    }, isConnected ? 200 : 503)
  } catch (error) {
    return c.json({
      status: 'error',
      service: 'redis',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

export default app