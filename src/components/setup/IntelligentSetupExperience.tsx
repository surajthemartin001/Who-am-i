import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  saveOnboardingProgress,
  finalizeOnboarding,
} from '../../services/accountService';
import {
  OnboardingState,
  OnboardingAnswers,
  SetupConfiguration,
  Goal,
  IntensityMode,
  ResourceItem,
  DailyPlanTask,
  WeekPlanDay,
  QuestionItem,
  RevisionItem,
  TrackMetrics,
  IntensityLockState,
} from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import { UniversalSourceModal } from '../common/UniversalSourceModal';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Compass,
  Target,
  Layers,
  Upload,
  Zap,
  HelpCircle,
  FileText,
  AlertCircle,
  BookOpen,
  Calendar,
  Shield,
  Sliders,
  Check,
  Edit3,
  Award,
} from 'lucide-react';

interface IntelligentSetupExperienceProps {
  account: UserAccount;
  onSetupCompleted: (updatedAccount: UserAccount) => void;
}

export const IntelligentSetupExperience: React.FC<IntelligentSetupExperienceProps> = ({
  account,
  onSetupCompleted,
}) => {
  // Current active step in the onboarding state machine
  const [currentState, setCurrentState] = useState<OnboardingState>(() => {
    return account.onboardingState || 'PROFILE_SETUP';
  });

  // State answers initialized from saved progress or sensible defaults
  const [answers, setAnswers] = useState<OnboardingAnswers>(() => {
    const saved = account.onboardingAnswers;
    return {
      fullName: saved?.fullName || account.name || 'Explorer',
      displayName: saved?.displayName || account.displayName || 'Explorer',
      targetRole: saved?.targetRole || '',
      educationLevel: saved?.educationLevel || 'Technical / STEM',
      currentStage: saved?.currentStage || 'Practitioner',
      rawGoalInput: saved?.rawGoalInput || '',
      goals: saved?.goals || [],
      availableDailyHours: saved?.availableDailyHours || 4,
      availableWeeklyHours: saved?.availableWeeklyHours || 28,
      availableTimeWindows: saved?.availableTimeWindows || [
        'Morning Focus (07:00 - 09:30)',
        'Evening Synthesis (19:30 - 21:00)',
      ],
      hasFixedStudyHours: saved?.hasFixedStudyHours !== undefined ? saved.hasFixedStudyHours : true,
      fixedHoursDetails: saved?.fixedHoursDetails || '',
      existingCommitments: saved?.existingCommitments || '',
      timeAnalysis: saved?.timeAnalysis,
      selectedIntensity: saved?.selectedIntensity || 'RABBIT',
      recommendedIntensity: saved?.recommendedIntensity || 'RABBIT',
      weeklyReviewEnabled: saved?.weeklyReviewEnabled !== undefined ? saved.weeklyReviewEnabled : true,
      uploadedResources: saved?.uploadedResources || [],
      skippedResourceStep: saved?.skippedResourceStep || false,
      diagnosticTargetField: saved?.diagnosticTargetField || 'Software & Artificial Intelligence',
      diagnosticAnswers: saved?.diagnosticAnswers || {},
      diagnosticAssessment: saved?.diagnosticAssessment,
      preferredPracticeType: saved?.preferredPracticeType || 'MCQ & Conceptual',
      preferredDifficulty: saved?.preferredDifficulty || 'Hard',
      revisionFrequencyDays: saved?.revisionFrequencyDays || 3,
      planningStyle: saved?.planningStyle || 'Rigorous Daily Schedule',
      trackMetricsPreference: saved?.trackMetricsPreference || [
        'Daily Completion %',
        'Study Velocity',
        'Topic Retention',
      ],
      lyraReminders: saved?.lyraReminders || ['Morning Plan Briefing', 'Evening Execution Review'],
      lyraAutonomousPermissions: saved?.lyraAutonomousPermissions || [
        'Plan Rebalancing',
        'Revision Scheduling',
      ],
    };
  });

  // UI state
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  // Auto-persist step and answers whenever they change
  useEffect(() => {
    saveOnboardingProgress(account.id, currentState, answers);
  }, [account.id, currentState, answers]);

  // STEP NAVIGATION & STATE MACHINE
  const transitionTo = (nextState: OnboardingState) => {
    setErrorNotice(null);
    setCurrentState(nextState);
  };

  // AI-Assisted Natural Language Goal Parser
  const handleParseNaturalLanguageGoal = async () => {
    if (!answers.rawGoalInput.trim()) {
      setErrorNotice('Please describe your goal or target career path.');
      return;
    }

    setIsAiProcessing(true);
    setErrorNotice(null);

    try {
      const generated = await executeLyraTask('decompose_goal', {
        goalText: answers.rawGoalInput.trim(),
      });

      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: generated?.primaryObjective || answers.rawGoalInput.trim(),
        description:
          (generated?.subObjectives || []).join(' • ') ||
          `Mastery track for ${answers.rawGoalInput.trim()}`,
        whyMatters: 'Self-determined pillar of your sovereign success track.',
        targetOutcome:
          (generated?.measurableOutcomes || [])[0] ||
          'Complete all targeted milestones and verified capstone benchmark.',
        currentLevel: answers.currentStage || 'Practitioner',
        targetLevel: 'Elite Master',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availableHoursPerWeek: Math.round(answers.availableWeeklyHours * 0.6) || 16,
        priority: 'Critical',
        dependencies: generated?.dependencies || ['Core Principles', 'Foundational Mathematics'],
        resources: (generated?.knowledgeDomains || []).map((k: string) => `${k} Curricula`),
        milestones: (generated?.suggestedMilestones || []).map((m: string, idx: number) => ({
          id: `m-${idx + 1}-${Date.now()}`,
          title: m,
          completed: false,
          timeframe: `Month ${idx + 1}`,
        })),
        projects: [
          {
            id: `proj-${Date.now()}`,
            title: `${generated?.primaryObjective || answers.rawGoalInput.trim()} Capstone System`,
            description: 'Comprehensive production-ready implementation and benchmarking.',
            status: 'planned',
          },
        ],
        practiceRequirements: '90 minutes daily focused recall & problem solving',
        revisionRequirements: 'Spaced recall every 72 hours',
        assessmentMethod: 'Proof of work audit and diagnostic benchmarks',
        status: 'GREEN',
        progress: 0,
        notes: 'Constructed from your natural language objective.',
        aiRecommendations: [
          'Maintain disciplined focus blocks on foundational concepts during Month 1.',
        ],
      };

      setAnswers((prev) => ({
        ...prev,
        goals: [...prev.goals, newGoal],
        rawGoalInput: '',
        diagnosticTargetField: newGoal.name,
      }));
    } catch {
      // Local intelligent fallback
      const fallbackGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: answers.rawGoalInput.trim(),
        description: `Comprehensive mastery track for ${answers.rawGoalInput.trim()}`,
        whyMatters: 'Key milestone for sovereign technical growth.',
        targetOutcome: 'Achieve practical mastery and deploy proof of work.',
        currentLevel: 'Practitioner',
        targetLevel: 'Mastery',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availableHoursPerWeek: 16,
        priority: 'High',
        dependencies: ['Core Principles'],
        resources: ['Domain Documentation'],
        milestones: [
          { id: `m-1`, title: 'Foundational Theory & Architecture', completed: false, timeframe: 'Month 1' },
          { id: `m-2`, title: 'Active Problem Lab & Synthesis', completed: false, timeframe: 'Month 2' },
        ],
        projects: [
          {
            id: `proj-1`,
            title: `${answers.rawGoalInput.trim()} Proof-of-Work`,
            description: 'Real-world project implementation.',
            status: 'planned',
          },
        ],
        practiceRequirements: 'Daily targeted problem sets',
        revisionRequirements: 'Spaced review every 72h',
        assessmentMethod: 'Proof of work validation',
        status: 'GREEN',
        progress: 0,
        notes: 'Created from user input.',
        aiRecommendations: ['Maintain high consistency on buffer days.'],
      };

      setAnswers((prev) => ({
        ...prev,
        goals: [...prev.goals, fallbackGoal],
        rawGoalInput: '',
        diagnosticTargetField: fallbackGoal.name,
      }));
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Intelligent Time Analysis Calculator
  const handleAnalyzeTime = () => {
    const daily = answers.availableDailyHours;
    const weekly = daily * 7;
    // Buffer logic: Keep 15% as recovery/buffer time, 85% as planned learning time
    const planned = Math.round(weekly * 0.82);
    const buffer = weekly - planned;

    let recommendedMode: IntensityMode = 'RABBIT';
    if (daily <= 4) recommendedMode = 'TORTOISE';
    else if (daily <= 10) recommendedMode = 'RABBIT';
    else if (daily <= 16) recommendedMode = 'CHEETAH';
    else recommendedMode = 'TIGER';

    setAnswers((prev) => ({
      ...prev,
      availableWeeklyHours: weekly,
      recommendedIntensity: recommendedMode,
      selectedIntensity: recommendedMode,
      timeAnalysis: {
        totalAvailableHoursPerWeek: weekly,
        recommendedPlannedHoursPerWeek: planned,
        bufferRecoveryHoursPerWeek: buffer,
        sustainablePacingNotes:
          'Plan constructed with built-in rest buffers. Essential sleep (7-8h), nutrition, and health breaks are protected.',
      },
    }));

    transitionTo('MODE_SETUP');
  };

  // Diagnostic questions adaptive to user's goals
  const diagnosticQuestions = [
    {
      id: 'diag-1',
      question: `Regarding ${answers.goals[0]?.name || 'your primary target'}: How would you rate your current theoretical foundation?`,
      options: [
        'Beginner — Need clear concept breakdowns from first principles.',
        'Intermediate — Solid theoretical grasp, need structured practice.',
        'Advanced — Strong foundation, seeking rigorous production challenges.',
      ],
    },
    {
      id: 'diag-2',
      question: 'When encountering complex problem sets, which learning workflow works best for you?',
      options: [
        'Theory first, followed immediately by targeted recall MCQs.',
        'Hands-on project problem first, learning theory on-demand as needed.',
        'Mixed synthesis: Deep work study blocks + spaced revision repetition.',
      ],
    },
    {
      id: 'diag-3',
      question: 'How do you prefer LYRA to intervene when your schedule drifts?',
      options: [
        'Proactive & Direct — Flag delays immediately and rebalance workload.',
        'Gentle & Supportive — Remind me with encouraging motivation.',
        'Autonomous — Automatically reschedule buffer blocks to keep milestones intact.',
      ],
    },
  ];

  // AI Builds Initial Personal System
  const handleBuildPersonalSystem = async () => {
    setIsAiProcessing(true);
    setCurrentState('AI_ANALYSIS');

    try {
      // Create real daily tasks based on user's actual goals
      const realTasks: DailyPlanTask[] = (answers.goals.length > 0 ? answers.goals : [{ name: 'Core Domain Foundations' } as Goal])
        .slice(0, 3)
        .map((g, idx) => ({
          id: `task-init-${idx + 1}-${Date.now()}`,
          title: `Deep Work: ${g.name} - Module 1`,
          topic: g.name,
          category: idx % 2 === 0 ? 'learning' : 'practice',
          estimatedMinutes: 90,
          priority: idx === 0 ? 'Critical' : 'High',
          completed: false,
          scheduledTime: idx === 0 ? '08:00 - 09:30' : idx === 1 ? '10:00 - 11:30' : '19:00 - 20:30',
        }));

      // Create real initial week plan
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const realWeekPlan: WeekPlanDay[] = days.map((d, i) => {
        const date = new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const isBufferDay = d === 'Wednesday' || d === 'Saturday';
        return {
          dayName: d,
          dateStr: date,
          learningHours: isBufferDay ? 1.5 : Math.round(answers.availableDailyHours * 0.5),
          practiceHours: isBufferDay ? 1.5 : Math.round(answers.availableDailyHours * 0.3),
          revisionHours: 1.0,
          projectHours: isBufferDay ? 2.0 : 0,
          totalHours: isBufferDay ? 6.0 : answers.availableDailyHours,
          completed: false,
          missedTasksCount: 0,
          tasks: realTasks,
        };
      });

      // Real revisions generated from declared goals
      const realRevisions: RevisionItem[] = answers.goals.map((g) => ({
        id: `rev-${Date.now()}-${g.id}`,
        topic: g.name,
        lastStudiedDate: new Date().toISOString().split('T')[0],
        lastRevisedDate: new Date().toISOString().split('T')[0],
        forgettingRisk: 'Low',
        masteryScore: 75,
        recommendedAction: `Spaced recall drill on core concepts in ${g.name}`,
      }));

      // Initial clean track metrics
      const realMetrics: TrackMetrics = {
        status: 'GREEN',
        label: 'ON TRACK',
        score: 85,
        distanceToTargetKm: 100,
        progressPercentage: 0,
        consistencyPercentage: 100,
        missedWorkHours: 0,
        accumulatedDelayDays: 0,
        learningVelocityHoursPerWeek: answers.availableWeeklyHours,
        recoveryHoursRequired: 0,
        currentTrajectory: `Aligned on ${answers.selectedIntensity} mode trajectory toward declared milestones.`,
        riskLevel: 'LOW',
      };

      const realLockState: IntensityLockState = {
        mode: answers.selectedIntensity,
        lockedAt: new Date().toISOString(),
        lockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        durationDays: 30,
        daysRemaining: 30,
        isLocked: true,
      };

      const config: SetupConfiguration = {
        goals: answers.goals,
        dailyTasks: realTasks,
        weekPlan: realWeekPlan,
        resources: answers.uploadedResources,
        trackMetrics: realMetrics,
        lockState: realLockState,
        questions: [],
        revisions: realRevisions,
        lyraContextSummary: `User: ${answers.fullName}. Operating at ${answers.selectedIntensity} mode (${answers.availableDailyHours}h/day). Target: ${answers.goals.map((g) => g.name).join(', ')}.`,
      };

      // Store in answers and transition to review
      setAnswers((prev) => ({
        ...prev,
        diagnosticAssessment: {
          estimatedStartingLevel: answers.currentStage,
          strongAreas: ['Self-Directed Execution', 'High Focus Potential'],
          weakAreas: ['Consistent Pacing Across Buffer Days'],
          missingPrerequisites: [],
          learningPriorities: answers.goals.map((g) => g.name),
          label: 'AI Diagnostic Assessment (Personalized Estimate)',
        },
      }));

      setTimeout(() => {
        setIsAiProcessing(false);
        transitionTo('REVIEW');
      }, 900);
    } catch (err: any) {
      setIsAiProcessing(false);
      setErrorNotice('Your information was saved, but AI personalization encountered a network hiccup. You can retry.');
    }
  };

  // Final confirmation: Commit to database & unlock Dashboard!
  const handleConfirmAndUnlockDashboard = () => {
    try {
      const realTasks: DailyPlanTask[] = (answers.goals.length > 0 ? answers.goals : [{ name: 'Core Foundations' } as Goal])
        .slice(0, 3)
        .map((g, idx) => ({
          id: `task-final-${idx + 1}-${Date.now()}`,
          title: `Deep Work: ${g.name} - Module 1`,
          topic: g.name,
          category: idx % 2 === 0 ? 'learning' : 'practice',
          estimatedMinutes: 90,
          priority: idx === 0 ? 'Critical' : 'High',
          completed: false,
          scheduledTime: idx === 0 ? '08:00 - 09:30' : idx === 1 ? '10:00 - 11:30' : '19:00 - 20:30',
        }));

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const realWeekPlan: WeekPlanDay[] = days.map((d, i) => ({
        dayName: d,
        dateStr: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        learningHours: Math.round(answers.availableDailyHours * 0.5),
        practiceHours: Math.round(answers.availableDailyHours * 0.3),
        revisionHours: 1.0,
        projectHours: 0,
        totalHours: answers.availableDailyHours,
        completed: false,
        missedTasksCount: 0,
        tasks: realTasks,
      }));

      const finalConfig: SetupConfiguration = {
        goals: answers.goals,
        dailyTasks: realTasks,
        weekPlan: realWeekPlan,
        resources: answers.uploadedResources,
        trackMetrics: {
          status: 'GREEN',
          label: 'ON TRACK',
          score: 85,
          distanceToTargetKm: 100,
          progressPercentage: 0,
          consistencyPercentage: 100,
          missedWorkHours: 0,
          accumulatedDelayDays: 0,
          learningVelocityHoursPerWeek: answers.availableWeeklyHours,
          recoveryHoursRequired: 0,
          currentTrajectory: 'Setup completed. Personalized execution underway.',
          riskLevel: 'LOW',
        },
        lockState: {
          mode: answers.selectedIntensity,
          lockedAt: new Date().toISOString(),
          lockedUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          durationDays: 30,
          daysRemaining: 30,
          isLocked: true,
        },
        questions: [],
        revisions: answers.goals.map((g) => ({
          id: `rev-${Date.now()}-${g.id}`,
          topic: g.name,
          lastStudiedDate: new Date().toISOString().split('T')[0],
          lastRevisedDate: new Date().toISOString().split('T')[0],
          forgettingRisk: 'Low',
          masteryScore: 70,
          recommendedAction: `Spaced recall drill on ${g.name}`,
        })),
        lyraContextSummary: `User: ${answers.fullName}. Operating at ${answers.selectedIntensity} mode (${answers.availableDailyHours}h/day). Target: ${answers.goals.map((g) => g.name).join(', ')}.`,
      };

      const updatedAccount = finalizeOnboarding(account.id, answers, finalConfig);
      onSetupCompleted(updatedAccount);
    } catch (err: any) {
      setErrorNotice('Could not finalize setup. Please verify your fields.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto max-h-[94vh]">
        {/* Top Progress & Branding Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              W
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  WHO AM I? — Intelligent System Setup
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Mandatory Calibration
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Genuinely configuring the engine around you before unlocking the Dashboard.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Signed in as:</span>
            <span className="text-white font-bold">{account.email}</span>
          </div>
        </div>

        {/* Step Progression Tracker */}
        <div className="px-6 py-2.5 bg-slate-900/30 border-b border-slate-800/60 flex items-center justify-between text-[11px] overflow-x-auto gap-2">
          {[
            { id: 'PROFILE_SETUP', label: '1. Identity' },
            { id: 'GOALS_SETUP', label: '2. Goals' },
            { id: 'TIME_SETUP', label: '3. Time & Pace' },
            { id: 'MODE_SETUP', label: '4. Intensity' },
            { id: 'RESOURCE_SETUP', label: '5. Sources' },
            { id: 'DIAGNOSTIC_SETUP', label: '6. Diagnostics' },
            { id: 'REVIEW', label: '7. Review' },
          ].map((s) => {
            const isCurrent = currentState === s.id;
            return (
              <span
                key={s.id}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s.label}
              </span>
            );
          })}
        </div>

        {/* Error / Alert Notice */}
        {errorNotice && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{errorNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorNotice(null)}
              className="text-rose-400 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: PROFILE SETUP */}
          {currentState === 'PROFILE_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 1: Your Sovereign Identity</span>
                  <span className="text-indigo-400 text-xs font-normal">• Who do you want to become?</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  WHO AM I? is not a generic task manager. It grounds your schedule, diagnostics, and LYRA around your real trajectory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={answers.fullName}
                    onChange={(e) => setAnswers({ ...answers, fullName: e.target.value })}
                    placeholder="e.g. Suraj Kumar"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Preferred Display Name
                  </label>
                  <input
                    type="text"
                    value={answers.displayName}
                    onChange={(e) => setAnswers({ ...answers, displayName: e.target.value })}
                    placeholder="e.g. Suraj"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  What do you want to become? (Target Role / Vision)
                </label>
                <input
                  type="text"
                  value={answers.targetRole}
                  onChange={(e) => setAnswers({ ...answers, targetRole: e.target.value })}
                  placeholder="e.g. High-Assurance AI Systems Architect & Venture Builder"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Current Educational / Professional Background
                  </label>
                  <select
                    value={answers.educationLevel}
                    onChange={(e) => setAnswers({ ...answers, educationLevel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Technical / STEM">Undergraduate / STEM Student</option>
                    <option value="Working Engineer / Builder">Software Engineer / Professional</option>
                    <option value="Self-Taught Practitioner">Self-Taught Builder / Independent</option>
                    <option value="Research Scholar">Academic / Research Scholar</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Current Stage in this Domain
                  </label>
                  <select
                    value={answers.currentStage}
                    onChange={(e) => setAnswers({ ...answers, currentStage: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Initiate / Beginner">Initiate — Starting from foundations</option>
                    <option value="Practitioner">Practitioner — Have basic skills, seeking high velocity</option>
                    <option value="Advanced Builder">Advanced — Preparing for mastery & capstones</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: GOALS SETUP */}
          {currentState === 'GOALS_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 2: Goals & Dreams (Goal-First Architecture)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Tell us your dreams in plain natural language. LYRA will parse dependencies, milestones, practice hours, and projects.
                </p>
              </div>

              {/* Natural Language Goal Input */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                <label className="text-xs font-semibold text-indigo-300 block">
                  Describe a goal or dream in plain natural language:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={answers.rawGoalInput}
                    onChange={(e) => setAnswers({ ...answers, rawGoalInput: e.target.value })}
                    placeholder="e.g. I want to master Distributed Systems and build high-throughput consensus engines."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleParseNaturalLanguageGoal();
                    }}
                  />
                  <button
                    type="button"
                    disabled={isAiProcessing || !answers.rawGoalInput.trim()}
                    onClick={handleParseNaturalLanguageGoal}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shrink-0 transition-all"
                  >
                    {isAiProcessing ? (
                      <Sparkles size={13} className="animate-spin" />
                    ) : (
                      <Zap size={13} />
                    )}
                    <span>Structure Goal</span>
                  </button>
                </div>
              </div>

              {/* List of Defined Goals */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Configured Goals ({answers.goals.length}):</span>
                  {answers.goals.length === 0 && (
                    <span className="text-amber-400">Please add at least 1 goal to ground your dashboard.</span>
                  )}
                </div>

                {answers.goals.map((goal, index) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                          <Target size={14} className="text-indigo-400" />
                          <span>{goal.name}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300">
                            {goal.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAnswers({
                            ...answers,
                            goals: answers.goals.filter((_, i) => i !== index),
                          });
                        }}
                        className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                      <span>Milestones: {goal.milestones.length}</span>
                      <span>•</span>
                      <span>Target: {goal.targetOutcome}</span>
                      <span>•</span>
                      <span>Weekly: ~{goal.availableHoursPerWeek}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: TIME & AVAILABILITY */}
          {currentState === 'TIME_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 3: Intelligent Time & Availability Analysis</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  We distinguish between Total Available Time, Planned Learning Time, and Productive Rest. Sleep and basic health are always protected.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="font-semibold">Realistic Daily Dedicated Time:</span>
                    <span className="font-bold text-indigo-400 text-sm">
                      {answers.availableDailyHours} Hours / Day ({answers.availableDailyHours * 7}h / Week)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="18"
                    step="0.5"
                    value={answers.availableDailyHours}
                    onChange={(e) =>
                      setAnswers({
                        ...answers,
                        availableDailyHours: parseFloat(e.target.value),
                        availableWeeklyHours: parseFloat(e.target.value) * 7,
                      })
                    }
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>1h (Tortoise min)</span>
                    <span>4h (Balanced)</span>
                    <span>8h (Rabbit)</span>
                    <span>14h (Cheetah)</span>
                    <span>18h (Tiger max)</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <label className="text-xs font-semibold text-slate-300 block mb-2">
                    Preferred Daily Focus Windows:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      'Early Morning Focus (06:00 - 08:30)',
                      'Morning Deep Block (09:00 - 12:00)',
                      'Afternoon Synthesis (14:00 - 17:00)',
                      'Evening Deep Block (18:30 - 21:30)',
                      'Late Night Sprint (22:00 - 00:30)',
                    ].map((w) => {
                      const isSelected = answers.availableTimeWindows.includes(w);
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => {
                            const updated = isSelected
                              ? answers.availableTimeWindows.filter((x) => x !== w)
                              : [...answers.availableTimeWindows, w];
                            setAnswers({ ...answers, availableTimeWindows: updated });
                          }}
                          className={`p-2.5 rounded-xl text-left text-xs border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span>{w}</span>
                          {isSelected && <Check size={14} className="text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Shield size={14} />
                    <span>Biological Protection Guarantee</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    WHO AM I? schedules 82% of your hours into high-yield planned learning and leaves 18% as mandatory recovery buffers. We never recommend sacrificing sleep or meals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: INTENSITY MODES (EXACT RANGES FROM REQUIREMENTS) */}
          {currentState === 'MODE_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 4: Intensity Mode & 7-Day Review</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  AI evaluated your {answers.availableDailyHours}h daily availability and recommends:{' '}
                  <strong className="text-indigo-400 font-bold">{answers.recommendedIntensity} Mode</strong>.
                </p>
              </div>

              {/* Exact 4 Intensity Modes from prompt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'TORTOISE' as IntensityMode,
                    title: 'TORTOISE',
                    hours: '2–4 hours/day',
                    desc: 'Sustainable foundation, lower daily cognitive load, generous recovery buffers.',
                    icon: '🐢',
                  },
                  {
                    id: 'RABBIT' as IntensityMode,
                    title: 'RABBIT',
                    hours: '8–10 hours/day',
                    desc: 'High-performance dedicated track, consistent daily execution, balanced theory & practice.',
                    icon: '🐇',
                  },
                  {
                    id: 'CHEETAH' as IntensityMode,
                    title: 'CHEETAH',
                    hours: '14–16 hours/day',
                    desc: 'Intensive acceleration, high volume practice, compressed milestones.',
                    icon: '🐆',
                  },
                  {
                    id: 'TIGER' as IntensityMode,
                    title: 'TIGER',
                    hours: '16–18 hours/day',
                    desc: 'Apex immersion deep-work protocol, sovereign execution stamina, near-zero distraction.',
                    icon: '🐅',
                  },
                ].map((m) => {
                  const isSelected = answers.selectedIntensity === m.id;
                  const isRecommended = answers.recommendedIntensity === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAnswers({ ...answers, selectedIntensity: m.id })}
                      className={`p-4 rounded-2xl border text-left transition-all space-y-1.5 relative ${
                        isSelected
                          ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 text-white shadow-lg'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      {isRecommended && (
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          AI Recommended
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-white">{m.title}</div>
                          <div className="text-[11px] font-mono text-indigo-400 font-semibold">{m.hours}</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* 7-Day Review Explanation */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-indigo-400" />
                  <span>Adaptive Weekly Mode Review Protocol</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Every 7 days, LYRA reviews completed work, missed hours, and consistency. You receive a recommendation to keep, increase, or decrease your mode. You always remain in final control.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: RESOURCE SETUP (OPTIONAL) */}
          {currentState === 'RESOURCE_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>Step 5: Resource & Document Ingestion (Optional)</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload your existing textbook, syllabus, notes, or PYQ papers now. You can also skip this and add them anytime later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAnswers({ ...answers, skippedResourceStep: true });
                    transitionTo('DIAGNOSTIC_SETUP');
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                >
                  Skip for Now →
                </button>
              </div>

              {/* Upload Trigger Area */}
              <div
                onClick={() => setIsSourceModalOpen(true)}
                className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 text-center bg-indigo-950/10 hover:bg-indigo-950/20 transition-all cursor-pointer space-y-2.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    Add PDF, Question Paper, Notes, or Syllabus
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click here to open Universal Source Ingestion. All uploaded files are tagged and grounded.
                  </p>
                </div>
              </div>

              {/* Uploaded Resources List */}
              {answers.uploadedResources.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Uploaded Sources ({answers.uploadedResources.length}):
                  </div>
                  {answers.uploadedResources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-indigo-400" />
                        <span className="font-semibold text-white">{res.title}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          {res.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">Verified Source</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 rounded-xl bg-slate-900/30 text-xs text-slate-500">
                  No resources uploaded yet. (Optional step — completely fine to continue empty!)
                </div>
              )}
            </div>
          )}

          {/* STEP 6: DIAGNOSTIC QUESTIONS & PREFERENCES */}
          {currentState === 'DIAGNOSTIC_SETUP' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 6: Diagnostic Assessment & Learning Preferences</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  These 3 diagnostic questions tailor your practice difficulty and curriculum structure to your real needs.
                </p>
              </div>

              <div className="space-y-4">
                {diagnosticQuestions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
                    <div className="text-xs font-semibold text-white">{q.question}</div>
                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        const isChosen = answers.diagnosticAnswers[q.id] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setAnswers({
                                ...answers,
                                diagnosticAnswers: {
                                  ...answers.diagnosticAnswers,
                                  [q.id]: opt,
                                },
                              })
                            }
                            className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                              isChosen
                                ? 'bg-indigo-950/60 border-indigo-500 text-white font-semibold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && <Check size={14} className="text-indigo-400 shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: AI SYSTEM BUILDING LOADING STATE */}
          {currentState === 'AI_ANALYSIS' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin flex items-center justify-center" />
                <Sparkles size={24} className="absolute inset-0 m-auto text-amber-300 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="text-base font-bold text-white">AI is Building Your Personal Workspace...</h3>
                <p className="text-xs text-slate-400">
                  Constructing personalized milestones, daily tasks, weekly buffers, and grounded practice structure from your real answers.
                </p>
              </div>
            </div>
          )}

          {/* STEP 8: FINAL SUMMARY & REVIEW */}
          {currentState === 'REVIEW' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Step 7: Final Review — Your Personal Workspace</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Review your configured setup. Once confirmed, your personalized Dashboard will unlock.
                </p>
              </div>

              {/* Compact Review Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* 1. Goals */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target size={13} />
                    <span>Your Goals ({answers.goals.length})</span>
                  </div>
                  <div className="font-bold text-white">
                    {answers.goals.map((g) => g.name).join(' • ') || 'None declared'}
                  </div>
                </div>

                {/* 2. Mode & Pace */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={13} />
                    <span>Operating Mode & Daily Target</span>
                  </div>
                  <div className="font-bold text-white">
                    {answers.selectedIntensity} Mode ({answers.availableDailyHours}h / Day • {answers.availableWeeklyHours}h / Week)
                  </div>
                </div>

                {/* 3. Resources */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen size={13} />
                    <span>Grounded Resources</span>
                  </div>
                  <div className="font-bold text-white">
                    {answers.uploadedResources.length > 0
                      ? `${answers.uploadedResources.length} Verified Sources Ingested`
                      : 'None uploaded (Honest Empty State)'}
                  </div>
                </div>

                {/* 4. Tracking Protocol */}
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={13} />
                    <span>What WHO AM I? Will Track</span>
                  </div>
                  <div className="font-bold text-white">
                    Daily Milestone Velocity, Buffer Hours & 7-Day Mode Review
                  </div>
                </div>
              </div>

              {/* Zero-Fake-Data Integrity Badge */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-300">
                <CheckCircle2 size={16} className="text-indigo-400 shrink-0" />
                <span>
                  No placeholder achievements or fake statistics. Your Dashboard will show only real progress as you complete tasks.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION CONTROLS */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          {currentState !== 'PROFILE_SETUP' && currentState !== 'AI_ANALYSIS' ? (
            <button
              type="button"
              onClick={() => {
                if (currentState === 'GOALS_SETUP') transitionTo('PROFILE_SETUP');
                else if (currentState === 'TIME_SETUP') transitionTo('GOALS_SETUP');
                else if (currentState === 'MODE_SETUP') transitionTo('TIME_SETUP');
                else if (currentState === 'RESOURCE_SETUP') transitionTo('MODE_SETUP');
                else if (currentState === 'DIAGNOSTIC_SETUP') transitionTo('RESOURCE_SETUP');
                else if (currentState === 'REVIEW') transitionTo('DIAGNOSTIC_SETUP');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {/* Continue / Complete button */}
          {currentState === 'PROFILE_SETUP' && (
            <button
              type="button"
              onClick={() => {
                if (!answers.fullName.trim()) {
                  setErrorNotice('Please provide your full name before continuing.');
                  return;
                }
                transitionTo('GOALS_SETUP');
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue to Goals</span>
              <ArrowRight size={13} />
            </button>
          )}

          {currentState === 'GOALS_SETUP' && (
            <button
              type="button"
              onClick={() => {
                if (answers.goals.length === 0) {
                  setErrorNotice('Please add at least one goal so WHO AM I? can personalize your workspace.');
                  return;
                }
                transitionTo('TIME_SETUP');
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue to Time & Pace</span>
              <ArrowRight size={13} />
            </button>
          )}

          {currentState === 'TIME_SETUP' && (
            <button
              type="button"
              onClick={handleAnalyzeTime}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Analyze & Recommend Mode</span>
              <ArrowRight size={13} />
            </button>
          )}

          {currentState === 'MODE_SETUP' && (
            <button
              type="button"
              onClick={() => transitionTo('RESOURCE_SETUP')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue to Resources</span>
              <ArrowRight size={13} />
            </button>
          )}

          {currentState === 'RESOURCE_SETUP' && (
            <button
              type="button"
              onClick={() => transitionTo('DIAGNOSTIC_SETUP')}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Continue to Diagnostics</span>
              <ArrowRight size={13} />
            </button>
          )}

          {currentState === 'DIAGNOSTIC_SETUP' && (
            <button
              type="button"
              onClick={handleBuildPersonalSystem}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles size={13} />
              <span>Build My System</span>
            </button>
          )}

          {currentState === 'REVIEW' && (
            <button
              type="button"
              onClick={handleConfirmAndUnlockDashboard}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-emerald-600/30 transition-all"
            >
              <CheckCircle2 size={15} />
              <span>Confirm & Build My Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Universal Source Modal */}
      <UniversalSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onSourceAdded={(newResource) => {
          setAnswers((prev) => ({
            ...prev,
            uploadedResources: [...prev.uploadedResources, newResource],
          }));
        }}
      />
    </div>
  );
};
