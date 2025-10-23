// Progress System - Tracks user streaks, XP, levels, and achievements
export interface UserProgress {
  totalXP: number
  level: number
  currentStreak: number
  longestStreak: number
  lastPlayedDate: string | null
  quizzesTaken: number
  perfectScores: number
  achievements: string[]
  topicProgress: Record<string, {
    completed: number
    total: number
    mastery: number // 0-100
  }>
  dailyGoal: number // XP needed per day
  dailyGoalMet: boolean
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_quiz', name: 'Getting Started', description: 'Complete your first quiz', icon: '🎯' },
  { id: 'perfect_score', name: 'Perfect!', description: 'Get 100% on a quiz', icon: '🏆' },
  { id: 'streak_3', name: 'On Fire!', description: 'Maintain a 3-day streak', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡' },
  { id: 'streak_30', name: 'Month Master', description: 'Maintain a 30-day streak', icon: '🌟' },
  { id: 'quiz_10', name: 'Quiz Explorer', description: 'Complete 10 quizzes', icon: '🗺️' },
  { id: 'quiz_50', name: 'Quiz Veteran', description: 'Complete 50 quizzes', icon: '🎖️' },
  { id: 'quiz_100', name: 'Quiz Legend', description: 'Complete 100 quizzes', icon: '👑' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: '⭐' },
  { id: 'level_10', name: 'Knowledge Seeker', description: 'Reach level 10', icon: '💫' },
  { id: 'level_25', name: 'Master Learner', description: 'Reach level 25', icon: '🌠' },
  { id: 'daily_goal_7', name: 'Week Champion', description: 'Meet daily goal for 7 days', icon: '🎊' },
]

// Level system - XP required for each level (exponential growth)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export function getLevelFromXP(xp: number): number {
  let level = 1
  let requiredXP = 0

  while (requiredXP <= xp) {
    level++
    requiredXP += getXPForLevel(level)
  }

  return level - 1
}

export function getXPProgressInCurrentLevel(xp: number): { current: number, required: number, percentage: number } {
  const level = getLevelFromXP(xp)

  // Calculate XP at start of current level
  let xpAtLevelStart = 0
  for (let i = 1; i < level; i++) {
    xpAtLevelStart += getXPForLevel(i)
  }

  const current = xp - xpAtLevelStart
  const required = getXPForLevel(level + 1)
  const percentage = Math.round((current / required) * 100)

  return { current, required, percentage }
}

// Streak management
export function calculateStreak(lastPlayedDate: string | null): { shouldIncrement: boolean, shouldReset: boolean } {
  if (!lastPlayedDate) {
    return { shouldIncrement: true, shouldReset: false }
  }

  const lastPlayed = new Date(lastPlayedDate)
  const today = new Date()

  // Reset time to start of day for comparison
  lastPlayed.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = today.getTime() - lastPlayed.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Already played today
    return { shouldIncrement: false, shouldReset: false }
  } else if (diffDays === 1) {
    // Played yesterday, increment streak
    return { shouldIncrement: true, shouldReset: false }
  } else {
    // Streak broken
    return { shouldIncrement: false, shouldReset: true }
  }
}

// Progress system class
export class ProgressSystem {
  private storageKey = 'realmind-user-progress'

  getProgress(): UserProgress {
    const stored = localStorage.getItem(this.storageKey)
    if (stored) {
      return JSON.parse(stored)
    }

    // Default progress
    return {
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastPlayedDate: null,
      quizzesTaken: 0,
      perfectScores: 0,
      achievements: [],
      topicProgress: {},
      dailyGoal: 50, // Default daily goal
      dailyGoalMet: false
    }
  }

  saveProgress(progress: UserProgress): void {
    localStorage.setItem(this.storageKey, JSON.stringify(progress))
  }

  addXP(xp: number, topic?: string): {
    progress: UserProgress,
    leveledUp: boolean,
    newLevel: number,
    newAchievements: Achievement[]
  } {
    const progress = this.getProgress()
    const oldLevel = progress.level

    progress.totalXP += xp
    progress.level = getLevelFromXP(progress.totalXP)

    // Update topic progress
    if (topic) {
      if (!progress.topicProgress[topic]) {
        progress.topicProgress[topic] = { completed: 0, total: 0, mastery: 0 }
      }
      progress.topicProgress[topic].completed++
      progress.topicProgress[topic].total++
      progress.topicProgress[topic].mastery = Math.min(100,
        Math.floor((progress.topicProgress[topic].completed / progress.topicProgress[topic].total) * 100)
      )
    }

    // Check for new achievements
    const newAchievements = this.checkAchievements(progress)

    this.saveProgress(progress)

    return {
      progress,
      leveledUp: progress.level > oldLevel,
      newLevel: progress.level,
      newAchievements
    }
  }

  recordQuizCompletion(score: number, totalQuestions: number, topic?: string): {
    progress: UserProgress
    streakIncreased: boolean
    newAchievements: Achievement[]
  } {
    const progress = this.getProgress()

    // Update streak
    const streakStatus = calculateStreak(progress.lastPlayedDate)
    const oldStreak = progress.currentStreak

    if (streakStatus.shouldReset) {
      progress.currentStreak = 1
    } else if (streakStatus.shouldIncrement) {
      progress.currentStreak++
      if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak
      }
    }

    progress.lastPlayedDate = new Date().toISOString()
    progress.quizzesTaken++

    if (score === totalQuestions) {
      progress.perfectScores++
    }

    // Check achievements
    const newAchievements = this.checkAchievements(progress)

    this.saveProgress(progress)

    return {
      progress,
      streakIncreased: progress.currentStreak > oldStreak,
      newAchievements
    }
  }

  private checkAchievements(progress: UserProgress): Achievement[] {
    const newAchievements: Achievement[] = []

    // Check each achievement
    ACHIEVEMENTS.forEach(achievement => {
      if (progress.achievements.includes(achievement.id)) {
        return // Already unlocked
      }

      let unlocked = false

      switch (achievement.id) {
        case 'first_quiz':
          unlocked = progress.quizzesTaken >= 1
          break
        case 'perfect_score':
          unlocked = progress.perfectScores >= 1
          break
        case 'streak_3':
          unlocked = progress.currentStreak >= 3
          break
        case 'streak_7':
          unlocked = progress.currentStreak >= 7
          break
        case 'streak_30':
          unlocked = progress.currentStreak >= 30
          break
        case 'quiz_10':
          unlocked = progress.quizzesTaken >= 10
          break
        case 'quiz_50':
          unlocked = progress.quizzesTaken >= 50
          break
        case 'quiz_100':
          unlocked = progress.quizzesTaken >= 100
          break
        case 'level_5':
          unlocked = progress.level >= 5
          break
        case 'level_10':
          unlocked = progress.level >= 10
          break
        case 'level_25':
          unlocked = progress.level >= 25
          break
      }

      if (unlocked) {
        progress.achievements.push(achievement.id)
        newAchievements.push({ ...achievement, unlockedAt: new Date().toISOString() })
      }
    })

    return newAchievements
  }

  setDailyGoal(xp: number): void {
    const progress = this.getProgress()
    progress.dailyGoal = xp
    this.saveProgress(progress)
  }

  checkDailyGoal(): boolean {
    const progress = this.getProgress()
    const lastPlayed = progress.lastPlayedDate ? new Date(progress.lastPlayedDate) : null
    const today = new Date()

    if (!lastPlayed) return false

    // Check if played today
    lastPlayed.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    if (lastPlayed.getTime() === today.getTime()) {
      // Check if daily goal met
      return progress.totalXP >= progress.dailyGoal
    }

    return false
  }
}

export const progressSystem = new ProgressSystem()
