export type IntensityMode = 'TURTLE' | 'RABBIT' | 'CHEETAH' | 'TIGER';

export type TrackStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface UserProfile {
  id?: string;
  email?: string;
  name: string;
  displayName?: string;
  interests?: string[];
  learningInterests?: string[];
  ageRange: string;
  educationLevel: string;
  currentSkills: string[];
  knowledgeLevel: string;
  dailyHours: number;
  weeklyHours: number;
  preferredStudyTimes: string;
  currentResponsibilities: string;
  existingResources: string[];
  goalsSummary: string;
  motivation: string;
  targetOutcomes: string;
  deadline: string;
  financialConstraints: string;
  learningStyle: string;
  confidenceLevel: number; // 1-10
  desiredIntensity: IntensityMode;
  isOnboarded: boolean;
}

export interface IntensityLockState {
  mode: IntensityMode;
  lockedAt: string; // ISO date
  lockedUntil: string; // ISO date
  durationDays: 7 | 30; // Flexible duration chosen by user
  daysRemaining: number;
  isLocked: boolean;
  unlockedEarlyByAssessment?: boolean;
}

export interface MCQAssessmentQuestion {
  id: string;
  section: string;
  sectionIndex: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: 'Challenging' | 'High Rigor';
}

export interface AssessmentResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passingThreshold: number;
  passed: boolean;
  sectionBreakdown: Array<{
    section: string;
    correct: number;
    total: number;
    percentage: number;
  }>;
  targetMode: IntensityMode;
  evaluatedAt: string;
}

export interface TrackMetrics {
  status: TrackStatus;
  label: 'ON TRACK' | 'WARNING' | 'OFF TRACK';
  score: number; // 0-100
  distanceToTargetKm: number;
  progressPercentage: number;
  consistencyPercentage: number;
  missedWorkHours: number;
  accumulatedDelayDays: number;
  learningVelocityHoursPerWeek: number;
  recoveryHoursRequired: number;
  currentTrajectory: string;
  riskLevel: 'LOW' | 'MODERATE' | 'CRITICAL';
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  whyMatters: string;
  targetOutcome: string;
  currentLevel: string;
  targetLevel: string;
  deadline: string;
  availableHoursPerWeek: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low' | 'Optional';
  dependencies: string[];
  resources: string[];
  milestones: Array<{ id: string; title: string; completed: boolean; timeframe: string }>;
  projects: Array<{ id: string; title: string; description: string; status: 'planned' | 'in_progress' | 'completed' }>;
  practiceRequirements: string;
  revisionRequirements: string;
  assessmentMethod: string;
  status: TrackStatus;
  progress: number;
  notes: string;
  aiRecommendations: string[];
  isDemo?: boolean;
}

export interface NexoraProject {
  id: string;
  title: string;
  category: 'Software' | 'Cybersecurity' | 'AI' | 'Machine Learning' | 'Robotics' | 'Electronics' | 'Business' | 'Research' | 'Architecture' | 'Experiments';
  vision: string;
  requirements: string[];
  subsystems: Array<{ name: string; description: string; status: string }>;
  milestones: Array<{ id: string; title: string; timeframe: string; tasks: string[]; completed: boolean }>;
  risks: string[];
  nextAction: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  type: 'PDF' | 'Book' | 'Note' | 'Website' | 'Syllabus' | 'PYQ Paper' | 'Curriculum';
  source: string;
  dateAdded: string;
  relatedGoals: string[];
  topicsDetected: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research';
  estimatedStudyHours: number;
  status: 'analyzed' | 'in_progress' | 'completed';
  tags: string[];
  notes?: string;
}

export interface BookChapter {
  id: string;
  volume: string;
  chapterNumber: number;
  title: string;
  concept: string;
  explanation: string;
  example: string;
  practiceQuestion: string;
  revisionPrompt: string;
  assessmentMethod: string;
  sourceReferences: string[];
}

export interface DailyPlanTask {
  id: string;
  title: string;
  topic: string;
  category: 'learning' | 'practice' | 'revision' | 'project' | 'break';
  estimatedMinutes: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  completed: boolean;
  scheduledTime: string;
}

export interface WeekPlanDay {
  dayName: string;
  dateStr: string;
  learningHours: number;
  practiceHours: number;
  revisionHours: number;
  projectHours: number;
  totalHours: number;
  completed: boolean;
  missedTasksCount: number;
  tasks: DailyPlanTask[];
}

export interface QuestionItem {
  id: string;
  question: string;
  type: 'mcq' | 'conceptual' | 'coding' | 'numerical' | 'pyq';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  isPyq?: boolean;
  pyqYear?: string;
  savedForRevision?: boolean;
  savedReason?: string;
  attemptsCount?: number;
  lastResult?: 'correct' | 'incorrect';
  userNotes?: string;
}

export interface RevisionItem {
  id: string;
  topic: string;
  lastStudiedDate: string;
  lastRevisedDate: string;
  forgettingRisk: 'Low' | 'Medium' | 'High' | 'Critical';
  masteryScore: number;
  recommendedAction: string;
}

export type LyraMood = 'Happy' | 'Playful' | 'Calm' | 'Focused' | 'Motivational' | 'Serious' | 'Adaptive';

export type LyraState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'typing' | 'completed' | 'error';

export interface LyraActionPayload {
  type: 'navigate' | 'create_task' | 'set_reminder' | 'search_resources' | 'open_approved_url';
  target?: string;
  data?: any;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface ExternalTTSConfig {
  connected: boolean;
  provider: 'elevenlabs' | 'openai' | 'azure' | 'none';
  apiKeyMasked: string;
  apiKeyRaw?: string;
  voiceId: string;
  model: string;
}

export interface LyraSettings {
  mood: LyraMood;
  personality: 'Warm & Encouraging' | 'Rigorous & Precise' | 'Philosophical & Direct' | 'Dynamic Companion';
  voice: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon' | 'BrowserDefault';
  language: 'hindi' | 'english' | 'hinglish' | 'spanish' | 'german';
  speakingStyle: 'Warm & Natural' | 'Direct & Crisp' | 'Humorous & Casual' | 'Mentorship Tone';
  speed: number;
  pitch: number;
  volume: number;
  expressiveness: 'Subtle' | 'Natural' | 'High';
  autoSpeak: boolean;
  pushToTalk: boolean;
  externalTTS: ExternalTTSConfig;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingMetadata?: any;
  actionExecuted?: string;
  modelUsed?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  source: 'user' | 'lyra_ai' | 'system';
}
