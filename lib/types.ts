export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
export type InterviewType = 'technical' | 'behavioral' | 'system_design' | 'coding'
export type InterviewStatus = 'in_progress' | 'completed' | 'abandoned'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Severity = 'low' | 'medium' | 'high'
export type RoadmapStatus = 'pending' | 'in_progress' | 'completed'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  resume_url: string | null
  resume_text: string | null
  target_role: string | null
  experience_level: ExperienceLevel | null
  created_at: string
  updated_at: string
}

export interface Interview {
  id: string
  user_id: string
  title: string
  type: InterviewType
  status: InterviewStatus
  difficulty: Difficulty | null
  overall_score: number | null
  feedback_summary: string | null
  strengths: string[] | null
  weaknesses: any[] | null
  duration_seconds: number | null
  started_at: string
  completed_at: string | null
  created_at: string
}

export interface InterviewQuestion {
  id: string
  interview_id: string
  question_text: string
  question_type: string
  user_answer: string | null
  ai_evaluation: {
    score: number
    feedback: string
    technical_accuracy?: string
  } | null
  sequence_order: number
  created_at: string
}

export interface UserWeakness {
  id: string
  user_id: string
  topic: string
  subtopic: string | null
  weakness_score: number
  occurrence_count: number
  last_tested_at: string
  created_at: string
}

export interface RoadmapItem {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  priority: number
  status: RoadmapStatus
  resources: string[] | null
  estimated_hours: number | null
  completed_at: string | null
  created_at: string
}

export interface QuestionBank {
  id: string
  question_text: string
  category: string
  difficulty: Difficulty
  tags: string[] | null
  expected_topics: string[] | null
  sample_answer: string | null
  created_at: string
}

// Extended types for UI
export interface InterviewWithQuestions extends Interview {
  questions: InterviewQuestion[]
}

export interface DashboardStats {
  totalInterviews: number
  completedInterviews: number
  averageScore: number
  totalPracticeTime: number
  weaknessCount: number
  roadmapProgress: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
}
