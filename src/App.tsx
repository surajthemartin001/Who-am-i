import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  IntensityMode,
  IntensityLockState,
  TrackMetrics,
  Goal,
  NexoraProject,
  ResourceItem,
  BookChapter,
  DailyPlanTask,
  WeekPlanDay,
  QuestionItem,
  RevisionItem,
  LyraSettings,
  ActivityLogItem,
} from './types';
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
  initialLyraSettings,
  initialActivityLogs,
} from './data/initialData';
import {
  UserAccount,
  initAccountRegistry,
  getActiveAccount,
  setActiveAccount,
  logoutActiveAccount,
  loadUserDataset,
  saveUserDataset,
} from './services/accountService';

// Core Components
import { SuccessTrack } from './components/track/SuccessTrack';
import { IntensityModeCard } from './components/intensity/IntensityModeCard';
import { GoalsView } from './components/goals/GoalsView';
import { PlanView } from './components/plan/PlanView';
import { ResourcesView } from './components/resources/ResourcesView';
import { PracticeView } from './components/practice/PracticeView';
import { NexoraView } from './components/nexora/NexoraView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

// Lyra Intelligence Components
import { LyraAvatar } from './components/lyra/LyraAvatar';
import { LyraMoodSelector } from './components/lyra/LyraMoodSelector';
import { LyraSettingsModal } from './components/lyra/LyraSettingsModal';
import { LyraChatView } from './components/lyra/LyraChatView';
import { LiveVoiceModal } from './components/lyra/LiveVoiceModal';

// Modals
import { RecoveryModal } from './components/recovery/RecoveryModal';
import { AuthOnboardingModal } from './components/auth/AuthOnboardingModal';
import { CommandPalette } from './components/common/CommandPalette';

// Icons
import {
  Compass,
  Target,
  Calendar,
  FileQuestion,
  FolderOpen,
  Rocket,
  BarChart3,
  MessageSquare,
  Settings as SettingsIcon,
  Flame,
  Zap,
  Play,
  RotateCcw,
  BookOpen,
  Award,
  Search,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  LogOut,
} from 'lucide-react';

export default function App() {
  // Multi-Account Registry & Active User Session
  const [activeAccount, setActiveAccountState] = useState<UserAccount | null>(() => {
    initAccountRegistry();
    return getActiveAccount();
  });

  // If no account is currently logged in, gate with Auth / Onboarding immediately!
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    initAccountRegistry();
    return !getActiveAccount();
  });

  // Central Application State (Loaded from active account's isolated dataset)
  const [profile, setProfile] = useState<UserProfile>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.profile) return data.profile;
      return acc.profile;
    }
    return initialProfile;
  });

  const [lockState, setLockState] = useState<IntensityLockState>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.lockState) return data.lockState;
    }
    return initialLockState;
  });

  const [trackMetrics, setTrackMetrics] = useState<TrackMetrics>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.trackMetrics) return data.trackMetrics;
    }
    return initialTrackMetrics;
  });

  const [goals, setGoals] = useState<Goal[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.goals) return data.goals;
    }
    return initialGoals;
  });

  const [nexoraProjects, setNexoraProjects] = useState<NexoraProject[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.nexoraProjects) return data.nexoraProjects;
    }
    return initialNexoraProjects;
  });

  const [resources, setResources] = useState<ResourceItem[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.resources) return data.resources;
    }
    return initialResources;
  });

  const [bookChapters, setBookChapters] = useState<BookChapter[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.bookChapters) return data.bookChapters;
    }
    return initialBookChapters;
  });

  const [dailyTasks, setDailyTasks] = useState<DailyPlanTask[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.dailyTasks) return data.dailyTasks;
    }
    return initialDailyPlanTasks;
  });

  const [weekPlan, setWeekPlan] = useState<WeekPlanDay[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.weekPlan) return data.weekPlan;
    }
    return initialWeekPlan;
  });

  const [questions, setQuestions] = useState<QuestionItem[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.questions) return data.questions;
    }
    return initialQuestions;
  });

  const [revisions, setRevisions] = useState<RevisionItem[]>(() => {
    const acc = getActiveAccount();
    if (acc) {
      const data = loadUserDataset(acc.id);
      if (data && data.revisions) return data.revisions;
    }
    return initialRevisions;
  });

  // Lyra Settings: Hindi Default as instructed!
  const [lyraSettings, setLyraSettings] = useState<LyraSettings>(() => {
    const saved = localStorage.getItem('wai_lyra_settings');
    return saved ? JSON.parse(saved) : initialLyraSettings;
  });

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isLyraSettingsOpen, setIsLyraSettingsOpen] = useState(false);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync isolated user dataset whenever active account or key datasets change
  useEffect(() => {
    if (activeAccount) {
      saveUserDataset(activeAccount.id, {
        profile,
        lockState,
        trackMetrics,
        goals,
        nexoraProjects,
        resources,
        bookChapters,
        dailyTasks,
        weekPlan,
        questions,
        revisions,
      });
    }
  }, [
    activeAccount,
    profile,
    lockState,
    trackMetrics,
    goals,
    nexoraProjects,
    resources,
    bookChapters,
    dailyTasks,
    weekPlan,
    questions,
    revisions,
  ]);

  useEffect(() => {
    localStorage.setItem('wai_lyra_settings', JSON.stringify(lyraSettings));
  }, [lyraSettings]);

  // Handle successful login or account onboarding
  const handleLoginSuccess = (account: UserAccount) => {
    setActiveAccount(account);
    setActiveAccountState(account);

    const userDataset = loadUserDataset(account.id);
    if (userDataset) {
      setProfile(userDataset.profile || account.profile);
      setLockState(userDataset.lockState || initialLockState);
      setTrackMetrics(userDataset.trackMetrics || initialTrackMetrics);
      setGoals(userDataset.goals || initialGoals);
      setDailyTasks(userDataset.dailyTasks || []);
      setWeekPlan(userDataset.weekPlan || initialWeekPlan);
      setNexoraProjects(userDataset.nexoraProjects || []);
      setResources(userDataset.resources || []);
      setBookChapters(userDataset.bookChapters || []);
      setQuestions(userDataset.questions || []);
      setRevisions(userDataset.revisions || []);
    } else {
      setProfile(account.profile);
    }

    setIsAuthModalOpen(false);
  };

  const handleSignOut = () => {
    logoutActiveAccount();
    setActiveAccountState(null);
    setIsAuthModalOpen(true);
  };

  // Global Keyboard Shortcuts (Ctrl+K for Command Palette)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleTask = (taskId: string) => {
    setDailyTasks((prev) => {
      const updated = prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
      // Dynamically calculate progress & track score
      const done = updated.filter((t) => t.completed).length;
      const progressDelta = Math.round((done / updated.length) * 10);
      setTrackMetrics((old) => ({
        ...old,
        score: Math.min(100, Math.max(60, old.score + (progressDelta > 5 ? 1 : 0))),
        progressPercentage: Math.min(100, old.progressPercentage + (done > 2 ? 1 : 0)),
      }));
      return updated;
    });
  };

  const handleUpdateMode = (newMode: IntensityMode, durationDays: 7 | 30 = 30) => {
    setProfile((prev) => ({ ...prev, desiredIntensity: newMode }));
    setLockState({
      mode: newMode,
      lockedAt: new Date().toISOString(),
      lockedUntil: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
      durationDays,
      daysRemaining: durationDays,
      isLocked: true,
    });
  };

  const handleRebalancePlan = () => {
    alert('Plan rebalanced: Workload redistributed across Wednesday and Saturday buffers.');
    setTrackMetrics((prev) => ({
      ...prev,
      missedWorkHours: 0,
      recoveryHoursRequired: 0,
      label: 'ON TRACK',
      status: 'GREEN',
    }));
  };

  // Main Navigation Items
  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'plan', label: 'Plan', icon: Calendar },
    { id: 'practice', label: 'Practice', icon: FileQuestion },
    { id: 'resources', label: 'Resources & Book', icon: FolderOpen },
    { id: 'nexora', label: 'MY / NEXORA', icon: Rocket },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'lyra_chat', label: 'Lyra AI', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // Enforce account creation / authentication requirement before accessing personalized app content
  if (!activeAccount) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
        <AuthOnboardingModal
          isOpen={true}
          canDismiss={false}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Universal Command Header */}
      <header className="sticky top-0 z-40 bg-[#07090e]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between">
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div
            onClick={() => setActiveTab('home')}
            className="cursor-pointer group flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-sm shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xs font-black text-white">
                W
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider text-white">WHO AM I?</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Nav-OS
                </span>
              </div>
              <div className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-tight">
                Stay on your path. Become who you decided to become.
              </div>
            </div>
          </div>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 transition-colors"
        >
          <Search size={13} />
          <span>Quick actions & jump...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
            Ctrl + K
          </kbd>
        </button>

        {/* Right: Lyra Avatar, 1-Click Mood Selector, Live Voice Call, Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Direct Live Voice Call Button */}
          <button
            onClick={() => setIsLiveVoiceOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            title="Start Real-Time Voice Conversation with Lyra"
          >
            <PhoneCall size={13} />
            <span className="hidden sm:inline">Live Voice</span>
          </button>

          {/* Quick Mood Button */}
          <LyraMoodSelector
            currentMood={lyraSettings.mood}
            onSelectMood={(newMood) => setLyraSettings({ ...lyraSettings, mood: newMood })}
          />

          {/* Animated Fairy Avatar with click to open settings */}
          <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
            <LyraAvatar
              mood={lyraSettings.mood}
              size="sm"
              onClick={() => setIsLyraSettingsOpen(true)}
            />
            <button
              onClick={() => setIsLyraSettingsOpen(true)}
              className="hidden lg:flex flex-col text-left group"
              title="Open Lyra Customization Settings"
            >
              <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">
                LYRA
              </span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {lyraSettings.language === 'hindi' ? 'हिन्दी (Active)' : lyraSettings.language}
              </span>
            </button>
          </div>

          {/* Active Account Switcher & Profile Badge */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all text-left"
              title="Account Profiles / Switch User"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                {profile.name.slice(0, 1)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-white truncate max-w-[100px]">
                  {profile.displayName || profile.name}
                </div>
                <div className="text-[9px] text-slate-400">Account</div>
              </div>
            </button>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-all"
              title="Sign Out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar on Desktop, Responsive Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-56 bg-slate-950/70 border-r border-slate-800/80 p-3 space-y-1 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
            Navigation System
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-auto border-t border-slate-800/80">
            {/* Trajectory mini widget in sidebar */}
            <div
              onClick={() => setIsRecoveryModalOpen(true)}
              className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Track Status</span>
                <span className="font-bold text-emerald-400">{trackMetrics.label}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${trackMetrics.score}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                <span>Score: {trackMetrics.score}/100</span>
                <span>Mode: {profile.desiredIntensity}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-14 z-30 bg-slate-950/95 border-b border-slate-800 p-4 space-y-1 backdrop-blur-xl">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  activeTab === item.id ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {/* TAB: HOME COMMAND CENTER */}
          {activeTab === 'home' && (
            <div className="space-y-7 animate-in fade-in duration-200">
              {/* TOP SOVEREIGN IDENTITY HERO BANNER */}
              <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-slate-950 border border-slate-800/80 p-6 sm:p-9 overflow-hidden shadow-2xl">
                {/* Subtle Ambient Cosmic Lighting */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                  {/* Left: Dominant Name Typography with Floating Magical Fairy LYRA */}
                  <div className="space-y-3 max-w-3xl">
                    {/* Status & Track Mode Tag */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                        <span>PERSONAL IDENTITY • {profile.desiredIntensity} MODE</span>
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{trackMetrics.label} ({trackMetrics.progressPercentage}% COMPLETE)</span>
                      </span>
                    </div>

                    {/* Dominant Visual Identity: Large, Elegant, Premium Typography Treatment */}
                    <div className="relative flex items-center gap-4 sm:gap-6 flex-wrap py-1">
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />
                        <h1 className="relative text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight uppercase bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm select-none">
                          {profile.name}
                        </h1>
                      </div>

                      {/* Small, Cute, Magical Fairy AI LYRA with glowing wand performing subtle animations */}
                      <div
                        onClick={() => setIsLiveVoiceOpen(true)}
                        className="relative flex items-center justify-center cursor-pointer group p-1.5 transition-all duration-300 hover:scale-105"
                        title="LYRA is navigating with you. Click to start Voice or Video Call!"
                      >
                        {/* Soft ethereal glowing aura */}
                        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500/25 to-purple-500/25 blur-md animate-pulse pointer-events-none" />
                        
                        {/* Fairy Avatar with gentle floating hover animation */}
                        <div className="relative animate-[bounce_3s_ease-in-out_infinite]">
                          <LyraAvatar
                            mood={lyraSettings.mood}
                            size="md"
                          />
                        </div>

                        {/* Subtle sparkling wand stardust particle trail */}
                        <div className="absolute -top-1.5 -right-1 text-xs animate-ping pointer-events-none filter drop-shadow">
                          ✨
                        </div>
                        <div className="absolute -bottom-1 -left-1 text-[10px] animate-pulse pointer-events-none opacity-80">
                          ⭐
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">
                      "Stay on your path. Become who you decided to become." The path toward success is an adaptive wide track — you can accelerate, explore, and revise, provided you stay within the acceptable corridor.
                    </p>

                    {/* Current Position → Destination Trajectory Bar */}
                    <div className="pt-2 flex items-center gap-2 sm:gap-3 text-xs flex-wrap">
                      <div className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        <span>Current Phase: <strong className="text-white font-semibold">Active Execution & Synthesis</strong></span>
                      </div>
                      <span className="text-indigo-400 font-bold text-sm">→</span>
                      <div className="px-3.5 py-1.5 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Destination: <strong className="text-white font-bold">SOVEREIGN MASTERY & SUCCESS</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Clean, Modern High-Tech Telemetry HUD (No crown/cap visual) */}
                  <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-900/70 border border-slate-800/90 min-w-[210px] space-y-3.5 shadow-xl">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Telemetry</span>
                      <span className="text-emerald-400 font-bold text-[11px]">ACTIVE</span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Execution Velocity</div>
                      <div className="text-lg font-black text-white font-mono flex items-baseline gap-1">
                        <span>{trackMetrics.learningVelocityHoursPerWeek}</span>
                        <span className="text-xs font-normal text-slate-400">h / week</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono uppercase text-slate-400">Consistency Streak</div>
                      <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>28 Days Active</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsLiveVoiceOpen(true)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Sparkles size={12} className="text-amber-300" />
                      <span>Speak with LYRA</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 21. HOME QUICK ACTIONS */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Immediate Command Actions
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                  <button
                    onClick={() => setActiveTab('practice')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <Flame size={18} className="text-amber-400 mb-2" />
                    <span className="text-xs font-bold text-white">PRACTICE</span>
                    <span className="text-[10px] text-slate-500">Today's drills</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('practice')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <FileQuestion size={18} className="text-indigo-400 mb-2" />
                    <span className="text-xs font-bold text-white">QUIZ</span>
                    <span className="text-[10px] text-slate-500">AI practice lab</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('practice')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <Award size={18} className="text-cyan-400 mb-2" />
                    <span className="text-xs font-bold text-white">PYQ</span>
                    <span className="text-[10px] text-slate-500">Exam papers</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('resources')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <BookOpen size={18} className="text-emerald-400 mb-2" />
                    <span className="text-xs font-bold text-white">LEARN</span>
                    <span className="text-[10px] text-slate-500">MY BOOK chapters</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('practice')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <RotateCcw size={18} className="text-purple-400 mb-2" />
                    <span className="text-xs font-bold text-white">REVISE</span>
                    <span className="text-[10px] text-slate-500">Spaced recall</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('lyra_chat')}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <MessageSquare size={18} className="text-pink-400 mb-2" />
                    <span className="text-xs font-bold text-white">ASK LYRA</span>
                    <span className="text-[10px] text-slate-500">Fairy dialogue</span>
                  </button>

                  <button
                    onClick={() => setIsLiveVoiceOpen(true)}
                    className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-950/20 transition-all text-left flex flex-col justify-between group"
                  >
                    <PhoneCall size={18} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-white">LIVE CALL</span>
                    <span className="text-[10px] text-emerald-400 font-medium">Real-time voice</span>
                  </button>

                  <button
                    onClick={() => {
                      const el = document.getElementById('my-track-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 hover:bg-slate-900/60 transition-all text-left flex flex-col justify-between"
                  >
                    <Compass size={18} className="text-teal-400 mb-2" />
                    <span className="text-xs font-bold text-white">TRACK</span>
                    <span className="text-[10px] text-slate-500">Status corridor</span>
                  </button>
                </div>
              </div>

              {/* 5. SUCCESS TRACK VISUALIZATION */}
              <div id="my-track-section">
                <SuccessTrack
                  metrics={trackMetrics}
                  goals={goals}
                  onTriggerRecoveryModal={() => setIsRecoveryModalOpen(true)}
                />
              </div>

              {/* 3. THREE INTENSITY MODES (LOCKED 30 DAYS) */}
              <IntensityModeCard
                currentMode={profile.desiredIntensity}
                lockState={lockState}
                profile={profile}
                goals={goals}
                onUpdateMode={handleUpdateMode}
              />

              {/* Today's Mission & Quick Goals Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Today's Mission Card */}
                <div className="lg:col-span-7 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-400" />
                        Today's Mission Sequence
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        What should I do right now?
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('plan')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      Full Plan <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {dailyTasks.slice(0, 3).map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTask(t.id)}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2
                            size={18}
                            className={t.completed ? 'text-emerald-400' : 'text-slate-600'}
                          />
                          <div>
                            <div className={`text-xs font-semibold ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                              {t.title}
                            </div>
                            <div className="text-[10px] text-slate-400">{t.topic} • {t.estimatedMinutes}m</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{t.scheduledTime}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Destination Goals Overview */}
                <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Target size={14} className="text-indigo-400" />
                      Active Destinations ({goals.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('goals')}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      All Goals <ChevronRight size={13} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {goals.slice(0, 3).map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setActiveTab('goals')}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white truncate max-w-[200px]">{g.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              g.status === 'GREEN'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {g.status}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${g.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GOALS */}
          {activeTab === 'goals' && (
            <GoalsView
              goals={goals}
              onAddGoal={(g) => setGoals((prev) => [g, ...prev])}
              onUpdateGoal={(g) => setGoals((prev) => prev.map((item) => (item.id === g.id ? g : item)))}
              onDeleteGoal={(id) => setGoals((prev) => prev.filter((item) => item.id !== id))}
            />
          )}

          {/* TAB: PLAN */}
          {activeTab === 'plan' && (
            <PlanView
              dailyTasks={dailyTasks}
              weekPlan={weekPlan}
              goals={goals}
              intensityMode={profile.desiredIntensity}
              availableDailyHours={profile.dailyHours}
              availableWeeklyHours={profile.weeklyHours}
              onToggleTask={handleToggleTask}
              onAddTask={(t) => setDailyTasks((prev) => [...prev, t])}
              onDynamicRebalance={handleRebalancePlan}
            />
          )}

          {/* TAB: PRACTICE & REVISION */}
          {activeTab === 'practice' && (
            <PracticeView
              questions={questions}
              revisions={revisions}
              intensityMode={profile.desiredIntensity}
              onToggleSaveQuestion={(id) =>
                setQuestions((prev) =>
                  prev.map((q) => (q.id === id ? { ...q, savedForRevision: !q.savedForRevision } : q))
                )
              }
              onRecordAttempt={(id, isCorrect) =>
                setQuestions((prev) =>
                  prev.map((q) =>
                    q.id === id
                      ? {
                          ...q,
                          attemptsCount: (q.attemptsCount || 0) + 1,
                          lastResult: isCorrect ? 'correct' : 'incorrect',
                        }
                      : q
                  )
                )
              }
              onAddGeneratedQuestions={(newQs) => setQuestions((prev) => [...prev, ...newQs])}
            />
          )}

          {/* TAB: RESOURCES & MY BOOK */}
          {activeTab === 'resources' && (
            <ResourcesView
              resources={resources}
              bookChapters={bookChapters}
              goals={goals}
              onAddResource={(res) => setResources((prev) => [res, ...prev])}
              onAddChapter={(chap) => setBookChapters((prev) => [...prev, chap])}
            />
          )}

          {/* TAB: MY / NEXORA WORKSPACE */}
          {activeTab === 'nexora' && (
            <NexoraView
              projects={nexoraProjects}
              onAddProject={(p) => setNexoraProjects((prev) => [p, ...prev])}
              onUpdateProject={(p) =>
                setNexoraProjects((prev) => prev.map((item) => (item.id === p.id ? p : item)))
              }
            />
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === 'analytics' && (
            <AnalyticsView metrics={trackMetrics} goals={goals} revisions={revisions} />
          )}

          {/* TAB: LYRA CHAT */}
          {activeTab === 'lyra_chat' && (
            <LyraChatView
              settings={lyraSettings}
              profile={profile}
              trackMetrics={trackMetrics}
              onUpdateSettings={setLyraSettings}
              onOpenSettingsModal={() => setIsLyraSettingsOpen(true)}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
              onNavigateSection={(sec) => setActiveTab(sec)}
              onAddTask={(task) => setDailyTasks((prev) => [task, ...prev])}
            />
          )}

          {/* TAB: SETTINGS & EXPORT */}
          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              settings={lyraSettings}
              goals={goals}
              lockState={lockState}
              onUpdateProfile={setProfile}
              onOpenLyraSettings={() => setIsLyraSettingsOpen(true)}
              onTriggerRecalibration={() => setIsAuthModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'home', label: 'Home', icon: Compass },
          { id: 'goals', label: 'Goals', icon: Target },
          { id: 'plan', label: 'Plan', icon: Calendar },
          { id: 'practice', label: 'Practice', icon: FileQuestion },
          { id: 'lyra_chat', label: 'Lyra', icon: MessageSquare },
          { id: 'nexora', label: 'Nexora', icon: Rocket },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <item.icon size={18} />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Live Voice Conversation Screen/Modal */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        settings={lyraSettings}
        profile={profile}
        trackMetrics={trackMetrics}
        onUpdateSettings={setLyraSettings}
      />

      {/* Lyra Settings Modal */}
      <LyraSettingsModal
        isOpen={isLyraSettingsOpen}
        onClose={() => setIsLyraSettingsOpen(false)}
        settings={lyraSettings}
        onSaveSettings={setLyraSettings}
      />

      {/* Recovery Modal */}
      <RecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        metrics={trackMetrics}
        onApplyOption={(opt) => {
          alert(`Strategy "${opt}" activated. Telemetry re-centered.`);
          setTrackMetrics((prev) => ({
            ...prev,
            recoveryHoursRequired: 0,
            missedWorkHours: 0,
            status: 'GREEN',
            label: 'ON TRACK',
          }));
        }}
      />

      {/* Account Authentication & Switcher Modal (For Logged-in Sessions) */}
      <AuthOnboardingModal
        isOpen={isAuthModalOpen}
        canDismiss={true}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(sec) => setActiveTab(sec)}
        onOpenLyraSettings={() => setIsLyraSettingsOpen(true)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />
    </div>
  );
}
