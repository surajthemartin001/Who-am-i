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
  OnboardingState,
  OnboardingAnswers,
  SetupConfiguration,
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
  isSetupCompleted: boolean;
  onboardingState: OnboardingState;
  onboardingAnswers?: Partial<OnboardingAnswers>;
  setupConfiguration?: SetupConfiguration;
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
        // Ensure all existing accounts have onboarding flags defined
        let modified = false;
        const normalized = accounts.map((acc: any) => {
          if (acc.isSetupCompleted === undefined) {
            modified = true;
            return {
              ...acc,
              isSetupCompleted: true,
              onboardingState: 'DASHBOARD_READY' as OnboardingState,
            };
          }
          return acc;
        });
        if (modified) {
          localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch {}
  }

  // Pre-seed Suraj Kumar as the primary sovereign profile (Setup Completed)
  const surajAccount: UserAccount = {
    id: 'usr-suraj-01',
    email: 'surajthemartin001@gmail.com',
    name: 'Suraj Kumar',
    displayName: 'Suraj',
    provider: 'google',
    createdAt: new Date().toISOString(),
    isSetupCompleted: true,
    onboardingState: 'DASHBOARD_READY',
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
    isSetupCompleted: true,
    onboardingState: 'CONFIRMED',
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

// Start or sign-in with Google Account (initiates mandatory onboarding if new or incomplete)
export function startGoogleAccount(email: string, name: string): { account: UserAccount; isNew: boolean } {
  const accounts = getAllAccounts();
  const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    setActiveAccount(existing);
    return { account: existing, isNew: false };
  }

  // Brand-new account starting at PROFILE_SETUP
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const cleanName = name || 'Explorer';
  const newAccount: UserAccount = {
    id: newId,
    email,
    name: cleanName,
    displayName: cleanName.split(' ')[0],
    provider: 'google',
    createdAt: new Date().toISOString(),
    isSetupCompleted: false,
    onboardingState: 'PROFILE_SETUP',
    onboardingAnswers: {
      fullName: cleanName,
      displayName: cleanName.split(' ')[0],
      targetRole: '',
      educationLevel: 'Technical / STEM',
      currentStage: 'Active Practitioner',
      rawGoalInput: '',
      goals: [],
      availableDailyHours: 4,
      availableWeeklyHours: 28,
      availableTimeWindows: ['Morning Focus (07:00 - 09:30)', 'Evening Synthesis (19:30 - 21:00)'],
      hasFixedStudyHours: true,
      selectedIntensity: 'RABBIT',
      recommendedIntensity: 'RABBIT',
      weeklyReviewEnabled: true,
      uploadedResources: [],
      skippedResourceStep: false,
      diagnosticTargetField: 'Software & Technology Architecture',
      diagnosticAnswers: {},
      preferredPracticeType: 'MCQ & Conceptual',
      preferredDifficulty: 'Hard',
      revisionFrequencyDays: 3,
      planningStyle: 'Rigorous Daily Schedule',
      trackMetricsPreference: ['Daily Completion %', 'Study Velocity', 'Topic Retention'],
      lyraReminders: ['Morning Plan Briefing', 'Evening Execution Review'],
      lyraAutonomousPermissions: ['Plan Rebalancing', 'Revision Scheduling'],
    },
    profile: {
      id: newId,
      email,
      name: cleanName,
      displayName: cleanName.split(' ')[0],
      interests: [],
      learningInterests: [],
      ageRange: '22-26',
      educationLevel: 'Technical / STEM',
      currentSkills: [],
      knowledgeLevel: 'Foundational',
      dailyHours: 4,
      weeklyHours: 28,
      preferredStudyTimes: 'Morning & Evening Focus Blocks',
      currentResponsibilities: 'Professional Acceleration',
      existingResources: [],
      goalsSummary: '',
      motivation: '',
      targetOutcomes: '',
      deadline: '',
      financialConstraints: '',
      learningStyle: 'Theory + Guided Practice',
      confidenceLevel: 7,
      desiredIntensity: 'RABBIT',
      isOnboarded: false,
    },
  };

  // Initialize empty dataset for the new user (No fake goals, no fake resources!)
  saveUserDataset(newId, {
    profile: newAccount.profile,
    lockState: {
      mode: 'RABBIT',
      lockedAt: new Date().toISOString(),
      lockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      durationDays: 30,
      daysRemaining: 30,
      isLocked: true,
    },
    trackMetrics: {
      status: 'GREEN',
      label: 'ON TRACK',
      score: 80,
      distanceToTargetKm: 100,
      progressPercentage: 0,
      consistencyPercentage: 100,
      missedWorkHours: 0,
      accumulatedDelayDays: 0,
      learningVelocityHoursPerWeek: 28,
      recoveryHoursRequired: 0,
      currentTrajectory: 'Setup phase in progress.',
      riskLevel: 'LOW',
    },
    goals: [],
    nexoraProjects: [],
    resources: [],
    bookChapters: [],
    dailyTasks: [],
    weekPlan: [],
    questions: [],
    revisions: [],
  });

  accounts.push(newAccount);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  setActiveAccount(newAccount);

  return { account: newAccount, isNew: true };
}

// Persist ongoing step and partial answers
export function saveOnboardingProgress(
  userId: string,
  state: OnboardingState,
  answers: Partial<OnboardingAnswers>
): void {
  if (typeof window === 'undefined') return;
  const accounts = getAllAccounts();
  const accIndex = accounts.findIndex((a) => a.id === userId);
  if (accIndex === -1) return;

  accounts[accIndex].onboardingState = state;
  accounts[accIndex].onboardingAnswers = {
    ...(accounts[accIndex].onboardingAnswers || {}),
    ...answers,
  };

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// Finalize onboarding and unlock Dashboard
export function finalizeOnboarding(
  userId: string,
  answers: OnboardingAnswers,
  config: SetupConfiguration
): UserAccount {
  const accounts = getAllAccounts();
  const accIndex = accounts.findIndex((a) => a.id === userId);
  if (accIndex === -1) throw new Error('Account not found');

  const acc = accounts[accIndex];

  acc.isSetupCompleted = true;
  acc.onboardingState = 'DASHBOARD_READY';
  acc.onboardingAnswers = answers;
  acc.setupConfiguration = config;

  // Update profile
  acc.profile = {
    ...acc.profile,
    name: answers.fullName,
    displayName: answers.displayName || answers.fullName.split(' ')[0],
    dailyHours: answers.availableDailyHours,
    weeklyHours: answers.availableWeeklyHours,
    preferredStudyTimes: answers.availableTimeWindows.join(' & '),
    desiredIntensity: answers.selectedIntensity,
    goalsSummary: answers.goals.map((g) => g.name).join(' • '),
    targetOutcomes: answers.goals.map((g) => g.targetOutcome).filter(Boolean).join(' • '),
    isOnboarded: true,
  };

  // Commit isolated dataset
  saveUserDataset(userId, {
    profile: acc.profile,
    lockState: config.lockState,
    trackMetrics: config.trackMetrics,
    goals: config.goals,
    nexoraProjects: [],
    resources: config.resources,
    bookChapters: [],
    dailyTasks: config.dailyTasks,
    weekPlan: config.weekPlan,
    questions: config.questions,
    revisions: config.revisions,
    lyraContextSummary: config.lyraContextSummary,
  });

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  setActiveAccount(acc);

  return acc;
}

// Reset an account to reconfigure setup
export function resetUserToReconfigure(userId: string): void {
  if (typeof window === 'undefined') return;
  const accounts = getAllAccounts();
  const accIndex = accounts.findIndex((a) => a.id === userId);
  if (accIndex === -1) return;

  accounts[accIndex].isSetupCompleted = false;
  accounts[accIndex].onboardingState = 'PROFILE_SETUP';
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
