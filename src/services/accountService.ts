import {
  UserProfile,
  IntensityMode,
  Goal,
  TrackMetrics,
  IntensityLockState,
  DailyPlanTask,
  WeekPlanDay,
  ResourceItem,
  BookChapter,
  NexoraProject,
  QuestionItem,
  RevisionItem,
} from '../types';
import {
  initialProfile,
  initialLockState,
  initialTrackMetrics,
  initialGoals,
  initialNexoraProjects,
  initialResources,
  initialBookChapters,
  initialDailyPlanTasks,
  initialWeekPlan,
  initialQuestions,
  initialRevisions,
} from '../data/initialData';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  displayName: string;
  provider: 'google' | 'email_otp' | 'mobile_otp' | 'demo';
  createdAt: string;
  profile: UserProfile;
}

const ACCOUNTS_KEY = 'wai_accounts_v1';
const ACTIVE_USER_ID_KEY = 'wai_active_user_id_v1';

// Seed default Suraj Kumar account if no accounts exist
export function initAccountRegistry(): UserAccount[] {
  if (typeof window === 'undefined') return [];

  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (raw) {
    try {
      const accounts = JSON.parse(raw);
      if (Array.isArray(accounts) && accounts.length > 0) {
        return accounts;
      }
    } catch {}
  }

  // Pre-seed Suraj Kumar as the primary sovereign profile
  const surajAccount: UserAccount = {
    id: 'usr-suraj-01',
    email: 'surajthemartin001@gmail.com',
    name: 'Suraj Kumar',
    displayName: 'Suraj',
    provider: 'google',
    createdAt: new Date().toISOString(),
    profile: {
      ...initialProfile,
      id: 'usr-suraj-01',
      name: 'Suraj Kumar',
      displayName: 'Suraj',
      email: 'surajthemartin001@gmail.com',
    },
  };

  const initialList = [surajAccount];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(initialList));

  // Initialize Suraj's isolated data store
  saveUserDataset('usr-suraj-01', {
    profile: surajAccount.profile,
    lockState: initialLockState,
    trackMetrics: initialTrackMetrics,
    goals: initialGoals,
    nexoraProjects: initialNexoraProjects,
    resources: initialResources,
    bookChapters: initialBookChapters,
    dailyTasks: initialDailyPlanTasks,
    weekPlan: initialWeekPlan,
    questions: initialQuestions,
    revisions: initialRevisions,
  });

  return initialList;
}

export function getAllAccounts(): UserAccount[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) return initAccountRegistry();
  try {
    return JSON.parse(raw);
  } catch {
    return initAccountRegistry();
  }
}

export function getActiveAccount(): UserAccount | null {
  if (typeof window === 'undefined') return null;
  const activeId = localStorage.getItem(ACTIVE_USER_ID_KEY);
  if (!activeId) return null;

  const accounts = getAllAccounts();
  return accounts.find((a) => a.id === activeId) || null;
}

export function setActiveAccount(account: UserAccount): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_USER_ID_KEY, account.id);
}

export function logoutActiveAccount(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_USER_ID_KEY);
}

// Save complete dataset for an independent user
export function saveUserDataset(userId: string, data: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`wai_user_${userId}_data`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save dataset for user ${userId}:`, err);
  }
}

// Load complete dataset for an independent user
export function loadUserDataset(userId: string): any {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(`wai_user_${userId}_data`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Create a brand new, completely independent account with custom personalized goals
export function createNewAccount(params: {
  name: string;
  displayName: string;
  email: string;
  interests: string[];
  learningInterests: string[];
  customGoals: Goal[];
  ageRange: string;
  educationLevel: string;
  dailyHours: number;
  weeklyHours: number;
  preferredStudyTimes: string;
  desiredIntensity: IntensityMode;
  provider: 'google' | 'email_otp' | 'mobile_otp' | 'demo';
}): UserAccount {
  const accounts = getAllAccounts();
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const newProfile: UserProfile = {
    id: newId,
    email: params.email,
    name: params.name,
    displayName: params.displayName || params.name.split(' ')[0],
    interests: params.interests,
    learningInterests: params.learningInterests,
    ageRange: params.ageRange || '22-26',
    educationLevel: params.educationLevel || 'Independent Learner',
    currentSkills: params.interests.slice(0, 4),
    knowledgeLevel: 'Focused Practitioner',
    dailyHours: params.dailyHours || 3.5,
    weeklyHours: params.weeklyHours || 24,
    preferredStudyTimes: params.preferredStudyTimes || 'Morning & Evening Focus Blocks',
    currentResponsibilities: 'Personal Growth & Professional Acceleration',
    existingResources: ['Curated Learning Materials', 'Domain Practice Tracks'],
    goalsSummary: params.customGoals.map((g) => g.name).join(' • '),
    motivation: 'Master chosen craft and remain sovereign on the success track.',
    targetOutcomes: 'Achieve total discipline and execute defined outcomes on time.',
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    financialConstraints: 'Focus on highest-leverage resources and verified tools',
    learningStyle: 'Theory + Guided Practice + Active Real-World Synthesis',
    confidenceLevel: 8,
    desiredIntensity: params.desiredIntensity,
    isOnboarded: true,
  };

  const newAccount: UserAccount = {
    id: newId,
    email: params.email,
    name: params.name,
    displayName: params.displayName || params.name.split(' ')[0],
    provider: params.provider,
    createdAt: new Date().toISOString(),
    profile: newProfile,
  };

  // Generate personalized daily tasks from the user's own goals
  const personalizedDailyTasks: DailyPlanTask[] = params.customGoals.slice(0, 3).map((g, idx) => ({
    id: `task-${newId}-${idx + 1}`,
    title: `Deep Work: ${g.name} - Module 1`,
    topic: g.name,
    category: idx % 2 === 0 ? ('learning' as const) : ('practice' as const),
    scheduledTime: idx === 0 ? '08:00 - 09:30' : idx === 1 ? '10:00 - 11:30' : '19:00 - 20:30',
    estimatedMinutes: 90,
    priority: idx === 0 ? ('High' as const) : ('Medium' as const),
    completed: false,
  }));

  // Initial fresh metrics for this user
  const initialMetrics: TrackMetrics = {
    status: 'GREEN',
    label: 'ON TRACK',
    score: 80,
    distanceToTargetKm: 100,
    progressPercentage: 10,
    consistencyPercentage: 95,
    missedWorkHours: 0,
    accumulatedDelayDays: 0,
    learningVelocityHoursPerWeek: params.weeklyHours,
    recoveryHoursRequired: 0,
    currentTrajectory: 'Steady on trajectory toward declared milestones.',
    riskLevel: 'LOW',
  };

  const lockState: IntensityLockState = {
    mode: params.desiredIntensity,
    lockedAt: new Date().toISOString(),
    lockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    durationDays: 30,
    daysRemaining: 30,
    isLocked: true,
  };

  // Save isolated user dataset
  saveUserDataset(newId, {
    profile: newProfile,
    lockState,
    trackMetrics: initialMetrics,
    goals: params.customGoals,
    nexoraProjects: [],
    resources: [],
    bookChapters: [],
    dailyTasks: personalizedDailyTasks,
    weekPlan: initialWeekPlan.map((d) => ({ ...d, tasksCompleted: 0 })),
    questions: [],
    revisions: [],
  });

  // Save in registry and activate session
  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  setActiveAccount(newAccount);

  return newAccount;
}
