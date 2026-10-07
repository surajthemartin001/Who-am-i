import React, { useState } from 'react';
import { UserAccount, createNewAccount, getAllAccounts, setActiveAccount } from '../../services/accountService';
import { Goal, IntensityMode } from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Zap,
  Lock,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Compass,
  Layers,
  User,
  Shield,
} from 'lucide-react';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onLoginSuccess: (account: UserAccount) => void;
  canDismiss?: boolean;
  onClose?: () => void;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onLoginSuccess,
  canDismiss = false,
  onClose,
}) => {
  // Mode: 'login' | 'otp' | 'onboard'
  const [viewMode, setViewMode] = useState<'login' | 'otp' | 'onboard'>('login');
  const [authMethod, setAuthMethod] = useState<'google' | 'email_otp' | 'mobile_otp'>('google');
  const [contactInput, setContactInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('482915');
  const [otpSentNotice, setOtpSentNotice] = useState(false);

  // Onboarding wizard steps (1: Identity, 2: Interests & Hours, 3: Goals, 4: Intensity Mode)
  const [onboardStep, setOnboardStep] = useState(1);

  // New Account State
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [ageRange, setAgeRange] = useState('22-26');
  const [educationLevel, setEducationLevel] = useState('Technical University / STEM');
  const [dailyHours, setDailyHours] = useState(4);
  const [weeklyHours, setWeeklyHours] = useState(28);
  const [preferredStudyTimes, setPreferredStudyTimes] = useState('Morning (07:00 - 09:30) & Evening (19:30 - 21:00)');
  const [desiredIntensity, setDesiredIntensity] = useState<IntensityMode>('RABBIT');
  const [formError, setFormError] = useState<string | null>(null);

  // Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Software Architecture',
    'AI & Machine Learning',
    'High-Performance Systems',
  ]);
  const [newInterestInput, setNewInterestInput] = useState('');

  // Learning Interests
  const [selectedLearningInterests, setSelectedLearningInterests] = useState<string[]>([
    'Distributed Systems',
    'Neural Algorithms',
    'Deep Discipline & Execution',
  ]);
  const [newLearningInput, setNewLearningInput] = useState('');

  // Helper to construct fully conforming Goal objects
  const buildGoal = (fields: {
    id: string;
    name: string;
    description: string;
    whyMatters?: string;
    targetOutcome?: string;
    currentLevel?: string;
    targetLevel?: string;
    deadline?: string;
    availableHoursPerWeek?: number;
    priority?: 'Critical' | 'High' | 'Medium' | 'Low' | 'Optional';
    dependencies?: string[];
  }): Goal => ({
    id: fields.id,
    name: fields.name,
    description: fields.description,
    whyMatters: fields.whyMatters || 'Core pillar of your success track.',
    targetOutcome: fields.targetOutcome || 'Achieve measurable mastery and deploy proof of work.',
    currentLevel: fields.currentLevel || 'Intermediate',
    targetLevel: fields.targetLevel || 'Elite Master',
    deadline: fields.deadline || '2027-04-30',
    availableHoursPerWeek: fields.availableHoursPerWeek || 16,
    priority: fields.priority || 'High',
    dependencies: fields.dependencies || [],
    resources: ['Domain Documentation', 'Core Curricula'],
    milestones: [
      { id: `m1-${fields.id}`, title: 'Foundational architecture & core syllabus', completed: false, timeframe: 'Month 1' },
      { id: `m2-${fields.id}`, title: 'Practical drills & advanced synthesis', completed: false, timeframe: 'Month 3' },
    ],
    projects: [
      { id: `p1-${fields.id}`, title: `${fields.name} Capstone`, description: 'Production grade implementation', status: 'planned' },
    ],
    practiceRequirements: '90 mins focused daily practice',
    revisionRequirements: 'Spaced recall every 72 hours',
    assessmentMethod: 'Proof of work & objective quiz benchmark',
    status: 'GREEN',
    progress: 10,
    notes: 'Personalized independent goal initialized during onboarding.',
    aiRecommendations: ['Maintain high consistency on weekly buffer days.'],
  });

  // Goals (Custom or AI Assisted)
  const [goalCreationMode, setGoalCreationMode] = useState<'personal' | 'ai'>('ai');
  const [aiGoalPrompt, setAiGoalPrompt] = useState('Become a world-class AI and robotics systems architect');
  const [isGeneratingGoals, setIsGeneratingGoals] = useState(false);
  const [customGoals, setCustomGoals] = useState<Goal[]>([
    buildGoal({
      id: 'g-init-1',
      name: 'Master Distributed Systems & High-Velocity Engineering',
      description: 'Build enterprise-grade distributed infrastructure and fault-tolerant architecture.',
      whyMatters: 'Core foundation for technical sovereignty and autonomous scale.',
      targetOutcome: 'Deploy production distributed stack with sub-50ms p99 latency.',
      priority: 'Critical',
      dependencies: ['Linux Internals', 'Concurrency Models'],
    }),
  ]);

  if (!isOpen) return null;

  const existingAccounts = getAllAccounts();

  // Instant login for existing account
  const handleSelectExisting = (account: UserAccount) => {
    setActiveAccount(account);
    onLoginSuccess(account);
  };

  // Google 1-Click Login Simulation (Defaults to Suraj Kumar or user email)
  const handleGoogleSignIn = () => {
    // If Suraj Kumar account exists in registry, log into it; otherwise start onboarding with Google email
    const suraj = existingAccounts.find((a) => a.email === 'surajthemartin001@gmail.com' || a.name.includes('Suraj'));
    if (suraj) {
      handleSelectExisting(suraj);
    } else {
      setFullName('Suraj Kumar');
      setDisplayName('Suraj');
      setAccountEmail('surajthemartin001@gmail.com');
      setAuthMethod('google');
      setViewMode('onboard');
    }
  };

  // Start OTP flow
  const handleRequestOtp = (method: 'email_otp' | 'mobile_otp') => {
    if (!contactInput.trim()) return;
    setAuthMethod(method);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSentNotice(true);
    setViewMode('otp');
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (otpInput.trim() === generatedOtp || otpInput.trim() === '123456') {
      setFormError(null);
      // Check if account with contactInput exists
      const existing = existingAccounts.find((a) => a.email === contactInput || a.profile.email === contactInput);
      if (existing) {
        handleSelectExisting(existing);
      } else {
        setAccountEmail(contactInput.includes('@') ? contactInput : `${contactInput}@mobile.user`);
        setFullName(contactInput.includes('@') ? contactInput.split('@')[0] : 'Explorer User');
        setDisplayName(contactInput.includes('@') ? contactInput.split('@')[0] : 'Explorer');
        setViewMode('onboard');
      }
    } else {
      setFormError('Invalid OTP code. Please use the simulated code shown on screen.');
    }
  };

  // Toggle Interest Tag
  const toggleInterest = (tag: string) => {
    if (selectedInterests.includes(tag)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== tag));
    } else {
      setSelectedInterests([...selectedInterests, tag]);
    }
  };

  const addCustomInterest = () => {
    if (newInterestInput.trim() && !selectedInterests.includes(newInterestInput.trim())) {
      setSelectedInterests([...selectedInterests, newInterestInput.trim()]);
      setNewInterestInput('');
    }
  };

  const addCustomLearningInterest = () => {
    if (newLearningInput.trim() && !selectedLearningInterests.includes(newLearningInput.trim())) {
      setSelectedLearningInterests([...selectedLearningInterests, newLearningInput.trim()]);
      setNewLearningInput('');
    }
  };

  // AI-Assisted Goal Generation
  const handleGenerateAiGoals = async () => {
    if (!aiGoalPrompt.trim()) return;
    setIsGeneratingGoals(true);

    try {
      const generated = await executeLyraTask('decompose_goal', { goalText: aiGoalPrompt });
      if (generated && generated.primaryObjective) {
        const newGoal = buildGoal({
          id: `g-ai-${Date.now()}`,
          name: generated.primaryObjective,
          description: (generated.subObjectives || []).join(' • ') || aiGoalPrompt,
          whyMatters: 'Key milestone for accelerated technical sovereignty.',
          targetOutcome: (generated.measurableOutcomes || [])[0] || '100% completion of defined targets',
          currentLevel: 'Initiate',
          targetLevel: 'Expert Master',
          deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availableHoursPerWeek: Math.round(weeklyHours * 0.6),
          priority: 'High',
          dependencies: generated.dependencies || [],
        });
        setCustomGoals([newGoal, ...customGoals]);
      } else {
        // Fallback goal creation
        const fallbackGoal = buildGoal({
          id: `g-ai-${Date.now()}`,
          name: aiGoalPrompt,
          description: `Comprehensive mastery of ${aiGoalPrompt} through structured learning and practice.`,
          whyMatters: 'Self-determined pillar of your success track.',
          targetOutcome: 'Complete all milestones and practical synthesis projects.',
          currentLevel: 'Foundational',
          targetLevel: 'Advanced',
          deadline: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          availableHoursPerWeek: Math.round(weeklyHours * 0.5),
          priority: 'High',
          dependencies: ['Core Foundations'],
        });
        setCustomGoals([fallbackGoal, ...customGoals]);
      }
    } catch {
      // Offline fallback
      const fallbackGoal = buildGoal({
        id: `g-ai-${Date.now()}`,
        name: aiGoalPrompt,
        description: `Deep execution track for ${aiGoalPrompt}`,
        whyMatters: 'Core priority defined during onboarding.',
        targetOutcome: 'Full practical mastery and track completion.',
        currentLevel: 'Practitioner',
        targetLevel: 'Mastery',
        deadline: '2027-06-30',
        availableHoursPerWeek: 14,
        priority: 'High',
      });
      setCustomGoals([fallbackGoal, ...customGoals]);
    } finally {
      setIsGeneratingGoals(false);
    }
  };

  // Add Manual Goal
  const handleAddManualGoal = () => {
    const manualGoal = buildGoal({
      id: `g-man-${Date.now()}`,
      name: 'New Custom Goal',
      description: 'Enter your custom objective description here.',
      whyMatters: 'Vital for personal transformation.',
      targetOutcome: 'Measurable mastery and proof-of-work.',
      currentLevel: 'Beginner',
      targetLevel: 'Expert',
      deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availableHoursPerWeek: 10,
      priority: 'Medium',
    });
    setCustomGoals([...customGoals, manualGoal]);
  };

  // Finalize Onboarding and Create Account
  const handleCompleteOnboarding = () => {
    if (!fullName.trim()) {
      setFormError('Please provide your full name before initializing your success track.');
      return;
    }
    setFormError(null);

    const created = createNewAccount({
      name: fullName.trim(),
      displayName: displayName.trim() || fullName.trim().split(' ')[0],
      email: accountEmail || `${fullName.toLowerCase().replace(/\s+/g, '')}@whomi.app`,
      interests: selectedInterests,
      learningInterests: selectedLearningInterests,
      customGoals: customGoals.length > 0 ? customGoals : [
        buildGoal({
          id: `g-def-${Date.now()}`,
          name: 'Master Core Competencies',
          description: 'Establish foundational mastery in chosen discipline.',
          whyMatters: 'Essential for sustainable velocity.',
          targetOutcome: 'Pass all benchmark drills and deploy capstones.',
          currentLevel: 'Initiate',
          targetLevel: 'Master',
          deadline: '2027-12-31',
          availableHoursPerWeek: weeklyHours,
          priority: 'Critical',
        }),
      ],
      ageRange,
      educationLevel,
      dailyHours,
      weeklyHours,
      preferredStudyTimes,
      desiredIntensity,
      provider: authMethod,
    });

    onLoginSuccess(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* App Title Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-900 text-center space-y-1 bg-gradient-to-b from-indigo-950/20 to-slate-950">
          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold"
              title="Close modal"
            >
              ✕
            </button>
          )}
          <div className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
            Intelligent Personal Development Navigation OS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wider">WHO AM I?</h1>
          <p className="text-xs text-slate-400 italic">
            "Stay on your path. Become who you decided to become."
          </p>
        </div>

        {/* VIEW 1: SIGN IN / SIGN UP PORTAL */}
        {viewMode === 'login' && (
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto">
            <div className="text-center space-y-1.5">
              <h2 className="text-base sm:text-lg font-bold text-white">
                Welcome to WHO AM I?
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Sign in or create your independent development account to unlock your personalized Success Track, AI navigation with LYRA, and real-time execution engine.
              </p>
            </div>

            {/* Preferred Google Sign-In */}
            <div className="space-y-3 max-w-md mx-auto">
              <button
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google / Gmail (Preferred)</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-slate-500">
                  Or use OTP / Custom Login
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Email / Mobile OTP Form */}
              <div className="space-y-2">
                <div className="flex rounded-2xl bg-slate-900 border border-slate-800 p-1">
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder="Enter email address or mobile number..."
                    className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      handleRequestOtp(contactInput.includes('@') ? 'email_otp' : 'mobile_otp')
                    }
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {/* Create Fresh Custom Account Button */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => {
                    setFullName('');
                    setDisplayName('');
                    setAccountEmail('');
                    setAuthMethod('email_otp');
                    setViewMode('onboard');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-indigo-300 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  <span>Create Brand New Account & Personalized Goals</span>
                </button>
              </div>
            </div>

            {/* Quick Switch for Existing Profiles on This Browser */}
            {existingAccounts.length > 0 && (
              <div className="pt-4 border-t border-slate-900 space-y-2.5 max-w-md mx-auto">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Existing Accounts on This Device:
                </div>
                <div className="space-y-2">
                  {existingAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => handleSelectExisting(acc)}
                      className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
                          {acc.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                            {acc.name}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {acc.email}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Launch →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: OTP VERIFICATION */}
        {viewMode === 'otp' && (
          <div className="p-6 sm:p-8 space-y-5 max-w-md mx-auto w-full">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Enter Verification Code</h2>
              <p className="text-xs text-slate-400">
                A 6-digit code has been sent to <strong className="text-indigo-300">{contactInput}</strong>
              </p>
            </div>

            {otpSentNotice && (
              <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-xs text-indigo-300 text-center">
                Demo OTP Code: <strong className="text-white font-mono text-sm tracking-widest">{generatedOtp}</strong> (or 123456)
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="6-digit OTP code"
                className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-2xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-xl transition-all"
              >
                Verify & Continue
              </button>

              <button
                onClick={() => setViewMode('login')}
                className="w-full py-2 text-xs text-slate-400 hover:text-white"
              >
                ← Back to Login Options
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: FULL PERSONALIZED MULTI-STEP ONBOARDING */}
        {viewMode === 'onboard' && (
          <div className="p-6 sm:p-7 space-y-5 overflow-y-auto flex-1">
            {/* Step Progress Indicator */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-900 text-xs">
              <span className="font-bold text-indigo-400">
                Step {onboardStep} of 4: {
                  onboardStep === 1 ? 'Personal Identity' :
                  onboardStep === 2 ? 'Interests & Time' :
                  onboardStep === 3 ? 'Independent Goals' : 'Intensity & 30-Day Lock'
                }
              </span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      onboardStep === s ? 'w-6 bg-indigo-500' : 'w-2 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* STEP 1: IDENTITY */}
            {onboardStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Full Legal / Primary Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!displayName) setDisplayName(e.target.value.split(' ')[0]);
                      }}
                      placeholder="e.g. Suraj Kumar or your full name"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Preferred Display Name (What Lyra calls you)
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Suraj"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      placeholder="surajthemartin001@gmail.com"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Age Range
                    </label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="16-18">16 - 18 (Foundation / Student)</option>
                      <option value="19-22">19 - 22 (University / Early Builder)</option>
                      <option value="22-26">22 - 26 (Specialized STEM Practitioner)</option>
                      <option value="27-35">27 - 35 (Professional / Career Pivot)</option>
                      <option value="36+">36+ (Executive / Lifelong Polymath)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    Current Education / Knowledge Level
                  </label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="e.g. Computer Science, Autonomous Robotics, Medical, Business..."
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 2: INTERESTS & STUDY TIME */}
            {onboardStep === 2 && (
              <div className="space-y-4">
                {/* Interests Tags */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Your Primary Domains of Interest:
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {[
                      'Software Architecture',
                      'Distributed AI Systems',
                      'Robotics & Automation',
                      'Cybersecurity',
                      'High-Performance Systems',
                      'Quantitative Finance',
                      'Productivity Architecture',
                      'Biotech & Medicine',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleInterest(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          selectedInterests.includes(tag)
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      placeholder="Add custom interest..."
                      className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomInterest}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Specific Learning Focus */}
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                    Specific Learning Interests (Topics you want to conquer):
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedLearningInterests.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs border border-emerald-500/30 flex items-center gap-1"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLearningInterests(selectedLearningInterests.filter((_, i) => i !== idx))
                          }
                          className="text-emerald-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLearningInput}
                      onChange={(e) => setNewLearningInput(e.target.value)}
                      placeholder="e.g. Memory Safety, ROS 2, Cryptography..."
                      className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCustomLearningInterest();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={addCustomLearningInterest}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Time Availability */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Available Daily Hours: {dailyHours}h/day
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="0.5"
                      value={dailyHours}
                      onChange={(e) => {
                        const d = parseFloat(e.target.value);
                        setDailyHours(d);
                        setWeeklyHours(Math.round(d * 6));
                      }}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">
                      Weekly Availability: {weeklyHours}h/week
                    </label>
                    <input
                      type="range"
                      min="6"
                      max="80"
                      step="2"
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: INDEPENDENT GOALS (PERSONAL OR AI-ASSISTED) */}
            {onboardStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-white">
                    Define Your Completely Independent Goals
                  </div>
                  {/* Mode Toggle */}
                  <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setGoalCreationMode('ai')}
                      className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                        goalCreationMode === 'ai'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles size={11} /> Use LYRA AI
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalCreationMode('personal')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        goalCreationMode === 'personal'
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Define Personally
                    </button>
                  </div>
                </div>

                {/* AI Assistant Definition Bar */}
                {goalCreationMode === 'ai' && (
                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2.5">
                    <label className="text-xs text-indigo-200 block font-medium">
                      Tell LYRA what you want to achieve or become:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiGoalPrompt}
                        onChange={(e) => setAiGoalPrompt(e.target.value)}
                        placeholder="e.g. Master distributed cloud architecture and launch an autonomous robotics company..."
                        className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={isGeneratingGoals}
                        onClick={handleGenerateAiGoals}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                      >
                        <Sparkles size={13} className={isGeneratingGoals ? 'animate-spin' : ''} />
                        <span>{isGeneratingGoals ? 'Thinking...' : 'AI Generate'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Goals List */}
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {customGoals.map((g, idx) => (
                    <div
                      key={g.id}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={g.name}
                          onChange={(e) => {
                            const updated = [...customGoals];
                            updated[idx].name = e.target.value;
                            setCustomGoals(updated);
                          }}
                          className="font-bold text-xs text-white bg-transparent border-b border-slate-700 pb-0.5 focus:outline-none focus:border-indigo-500 flex-1"
                        />
                        {customGoals.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setCustomGoals(customGoals.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={g.targetOutcome}
                        onChange={(e) => {
                          const updated = [...customGoals];
                          updated[idx].targetOutcome = e.target.value;
                          setCustomGoals(updated);
                        }}
                        placeholder="Target Outcome..."
                        className="text-[11px] text-slate-400 bg-transparent w-full focus:outline-none focus:text-slate-200"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddManualGoal}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} /> Add Another Goal
                </button>
              </div>
            )}

            {/* STEP 4: INTENSITY MODE & COMMITMENT */}
            {onboardStep === 4 && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-white">
                  Choose Your Execution Intensity (30-Day Locked Mode):
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'TURTLE' as IntensityMode,
                      title: 'TURTLE',
                      sub: 'Slow & Sustainable',
                      hours: '1 - 2.5 h/day',
                      desc: 'Gradual learning, strong spaced revision, lower cognitive load.',
                      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
                    },
                    {
                      id: 'RABBIT' as IntensityMode,
                      title: 'RABBIT',
                      sub: 'High Performance',
                      hours: '3 - 5 h/day',
                      desc: 'Balanced learning + daily practice + active project synthesis.',
                      color: 'border-indigo-500/60 bg-indigo-950/30 text-indigo-300',
                    },
                    {
                      id: 'CHEETAH' as IntensityMode,
                      title: 'CHEETAH',
                      sub: 'Extreme Velocity',
                      hours: '6 - 10+ h/day',
                      desc: 'Full-time immersion, rapid capstones, maximal output velocity.',
                      color: 'border-amber-500/50 bg-amber-950/20 text-amber-300',
                    },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setDesiredIntensity(m.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        desiredIntensity === m.id
                          ? `${m.color} ring-2 ring-indigo-500`
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 opacity-60'
                      }`}
                    >
                      <div className="font-black text-sm text-white mb-0.5">{m.title}</div>
                      <div className="text-[10px] font-semibold">{m.sub}</div>
                      <div className="text-[10px] font-mono mt-1 opacity-80">{m.hours}</div>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">{m.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                  <Lock size={15} className="text-amber-400 shrink-0" />
                  <span>
                    Your chosen mode will be <strong>locked for 30 days</strong> to protect focus and build deep discipline on the success track.
                  </span>
                </div>
              </div>
            )}

            {/* Error Notification Banner */}
            {formError && (
              <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-in fade-in">
                <span>{formError}</span>
                <button
                  type="button"
                  onClick={() => setFormError(null)}
                  className="text-rose-400 hover:text-white font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-900">
              {onboardStep > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setOnboardStep(onboardStep - 1);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                >
                  <ArrowLeft size={13} /> Back
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setViewMode('login');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-slate-400"
                >
                  ← Back to Login
                </button>
              )}

              {onboardStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (onboardStep === 1 && !fullName.trim()) {
                      setFormError('Please enter your full name before continuing.');
                      return;
                    }
                    setFormError(null);
                    setOnboardStep(onboardStep + 1);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-emerald-600/25 transition-all"
                >
                  <CheckCircle2 size={15} />
                  <span>Initialize My Success Track</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
