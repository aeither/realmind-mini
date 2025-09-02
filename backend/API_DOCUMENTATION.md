# Daily Quiz API Documentation

## Overview
This API provides endpoints for generating AI-powered quizzes using trending topics from Twitter/X via Grok's live search functionality.

## Environment Variables
```
XAI_API_KEY=your_xai_api_key_here
GROQ_API_KEY=your_groq_api_key_here
CRON_SECRET=your_secret_token_here (optional, for cron job security)
```

## Endpoints

### GET /
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "Backend2 - AI Quiz Generator with Daily Trending Quizzes",
  "version": "1.0.0",
  "endpoints": ["/health", "/generate-quiz", "/daily-quiz", "/cron/daily-quiz"]
}
```

### GET /health
Basic health check for the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-02-10T12:00:00.000Z"
}
```

### GET /health/grok
Health check for Grok API connectivity.

**Response:**
```json
{
  "status": "healthy|unhealthy|error",
  "service": "grok_api",
  "timestamp": "2025-02-10T12:00:00.000Z"
}
```

### POST /generate-quiz
Generate a custom quiz on a specific topic (existing functionality).

**Request Body:**
```json
{
  "topic": "JavaScript",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "quiz_1644512400000",
    "title": "JavaScript Quiz",
    "description": "Test your JavaScript knowledge",
    "questions": [...],
    "difficulty": "medium",
    "topic": "JavaScript",
    "questionCount": 3,
    "createdAt": "2025-02-10T12:00:00.000Z"
  }
}
```

### GET /daily-quiz
Generate a quiz based on trending topics from Twitter/X.

**Features:**
- Uses Grok's live search on Twitter/X
- Filters for posts with minimum engagement (100+ favorites, 1000+ views)
- Creates educational quizzes from trending topics
- Returns 3 questions with multiple choice answers

**Response:**
```json
{
  "success": true,
  "quiz": {
    "id": "daily_quiz_1644512400000",
    "title": "Today's Tech Trends Quiz",
    "description": "Test your knowledge on today's trending technology topics",
    "trending_topic": "AI and Machine Learning",
    "questions": [
      {
        "question": "What recent breakthrough in AI was announced today?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct": 2,
        "explanation": "The correct answer is Option C because...",
        "source_context": "Based on trending Twitter posts about..."
      }
    ],
    "difficulty": "medium",
    "questionCount": 3,
    "createdAt": "2025-02-10T12:00:00.000Z"
  }
}
```

### GET /cron/daily-quiz
Automated endpoint for generating daily quizzes (called by Vercel cron job).

**Schedule:** Daily at midnight UTC (0 0 * * *)

**Security:** 
- Optional Bearer token authentication using CRON_SECRET environment variable
- Only accessible by Vercel's cron service in production

**Response:**
```json
{
  "success": true,
  "message": "Daily quiz generated successfully",
  "quiz_title": "Today's Tech Trends Quiz",
  "timestamp": "2025-02-10T12:00:00.000Z"
}
```

## Grok API Integration

### Live Search Parameters
- **Source:** Twitter/X posts only
- **Max Results:** 10 trending posts
- **Engagement Filter:** Posts with 100+ favorites and 1000+ views
- **Content Focus:** Educational, newsworthy, and culturally significant topics

### Quiz Generation
- Uses structured output with JSON schema validation
- Ensures exactly 3 questions per quiz
- Each question has exactly 4 multiple choice options
- Includes explanations and source context from trending posts
- Avoids controversial political topics and misinformation

## Error Handling
All endpoints return appropriate HTTP status codes:
- 200: Success
- 400: Bad Request (missing required parameters)
- 401: Unauthorized (invalid cron secret)
- 500: Internal Server Error
- 503: Service Unavailable (Grok API connectivity issues)

## Deployment
The API is configured for Vercel deployment with:
- Automatic daily cron jobs
- Node.js 18.x runtime
- API routes under `/api/` path
- Environment variable configuration

## Usage Examples

### Frontend Integration
```javascript
// Get daily quiz
const response = await fetch('/api/daily-quiz');
const data = await response.json();

if (data.success) {
  const quiz = data.quiz;
  // Display quiz to users
}
```

### Manual Cron Trigger (Development)
```bash
curl -X GET http://localhost:3000/cron/daily-quiz \
  -H "Authorization: Bearer your_cron_secret"
```