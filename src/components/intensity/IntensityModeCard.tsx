import React, { useState } from 'react';
import { IntensityMode, IntensityLockState, UserProfile, Goal } from '../../types';
import { IntensityAssessmentModal } from './IntensityAssessmentModal';
import {
  Lock,
  Unlock,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  Award,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface IntensityModeCardProps {
  currentMode: IntensityMode;
  lockState: IntensityLockState;
  profile: UserProfile;
  goals: Goal[];
  onUpdateMode: (newMode: IntensityMode, durationDays?: 7 | 30) => void;
}

export const IntensityModeCard: React.FC<IntensityModeCardProps> = ({
  currentMode,
  lockState,
  profile,
  goals,
  onUpdateMode,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<7 | 30>(lockState.durationDays || 30);
  const [selectedPendingMode, setSelectedPendingMode] = useState<IntensityMode>(currentMode);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentTargetMode, setAssessmentTargetMode] = useState<IntensityMode>(
    currentMode === 'TIGER' ? 'CHEETAH' : currentMode === 'CHEETAH' ? 'TIGER' : 'CHEETAH'
  );

  const modeData: Record<
    IntensityMode,
    {
      title: string;
      subtitle: string;
      icon: string;
      hours: string;
      desc: string;
      color: string;
      accent: string;
      passReq: number;
    }
  > = {
    TURTLE: {
      title: 'MODE 1 — TURTLE',
      subtitle: 'Slow & Sustainable',
      icon: '🐢',
      hours: '1.5 - 2.5 hours / day',
      desc: 'Designed for lower daily availability, sustainable progression, generous recovery buffers, and reduced cognitive load.',
      color: 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300',
      accent: 'emerald',
      passReq: 70,
    },
    RABBIT: {
      title: 'MODE 2 — RABBIT',
      subtitle: 'Balanced High-Performance',
      icon: '🐇',
      hours: '3.5 - 5.0 hours / day',
      desc: 'Designed for serious learners with consistent daily discipline, moderate-to-high velocity, balanced theory, and active practice.',
      color: 'border-indigo-500/60 bg-indigo-950/25 text-indigo-300',
      accent: 'indigo',
      passReq: 75,
    },
    CHEETAH: {
      title: 'MODE 3 — CHEETAH',
      subtitle: 'Extreme Intensive Acceleration',
      icon: '🐆',
      hours: '6.0 - 8.5 hours / day',
      desc: 'Designed for maximum available time, aggressive milestone pacing, high practice volume, and accelerated synthesis.',
      color: 'border-amber-500/60 bg-amber-950/25 text-amber-300',
      accent: 'amber',
      passReq: 80,
    },
    TIGER: {
      title: 'MODE 4 — TIGER',
      subtitle: 'Apex Elite Mastery & Immersion',
      icon: '🐅',
      hours: '9.0 - 12.0+ hours / day',
      desc: 'Full-immersion sovereign deep-work protocol. Relentless execution, minimal latency, elite cognitive stamina, and near-zero distraction.',
      color: 'border-rose-500/60 bg-rose-950/25 text-rose-300',
      accent: 'rose',
      passReq: 85,
    },
  };

  // Determine exact remaining time
  const now = new Date().getTime();
  const lockedUntilTime = new Date(lockState.lockedUntil).getTime();
  const diffMs = Math.max(0, lockedUntilTime - now);
  const remainingDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const isCurrentlyLocked = diffMs > 0 && lockState.isLocked !== false;

  const handleStartUnlockAssessment = (modeToUnlockTo: IntensityMode) => {
    setAssessmentTargetMode(modeToUnlockTo);
    setIsAssessmentModalOpen(true);
  };

  return (
    <div className="rounded-3xl bg-slate-950/80 border border-slate-800/80 p-5 sm:p-7 space-y-6">
      {/* Header and Lock Status Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚙️</span>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
              INTENSITY COMMITMENT SYSTEM
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              4 Disciplined Tiers
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
            Select your operating pace. Commit to a flexible 7-day or 30-day lock to build true neural consistency. Early reassessment requires passing Lyra's 56-question AI assessment.
          </p>
        </div>

        {/* Lock Duration Badge */}
        <div className="flex items-center gap-2">
          {isCurrentlyLocked ? (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs shadow-sm">
              <Lock size={15} className="text-amber-400 animate-pulse" />
              <div>
                <div className="font-bold flex items-center gap-1.5">
                  <span>{currentMode} MODE LOCKED</span>
                  <span className="text-[10px] font-normal text-slate-400">
                    ({lockState.durationDays || 30}-Day Commitment)
                  </span>
                </div>
                <div className="text-[10px] text-amber-200/80 font-mono">
                  {remainingDays}d {remainingHours}h remaining until auto-unlock
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Unlock size={14} />
              <span>Unlocked / Reassessment Window Open</span>
            </div>
          )}
        </div>
      </div>

      {/* Lock Explanation & Unlock Requirements Box */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs leading-relaxed space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <HelpCircle size={14} className="text-indigo-400" />
            <span>Understanding the Lock & Reassessment Engine:</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Locked on: {new Date(lockState.lockedAt).toLocaleDateString()} • Expires: {new Date(lockState.lockedUntil).toLocaleDateString()}
          </div>
        </div>
        <p className="text-slate-300 text-[11px]">
          <strong>Why the lock exists:</strong> Rapid mode-switching is the #1 symptom of procrastination and velocity drift. Enforcing a commitment removes daily deliberative friction and anchors real biological habit formation.
        </p>
        <p className="text-slate-300 text-[11px]">
          <strong>Early Unlock Requirements:</strong> If your schedule, health, or workload has changed, you can trigger an <em>Early Unlock</em> at any time by taking Lyra’s rigorous 56-question assessment. Pass the required score (70%–85% based on target mode) to immediately unlock and recalibrate.
        </p>
      </div>

      {/* 4 Intensity Modes Grid (Turtle, Rabbit, Cheetah, Tiger) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(['TURTLE', 'RABBIT', 'CHEETAH', 'TIGER'] as const).map((modeKey) => {
          const item = modeData[modeKey];
          const isCurrentActive = currentMode === modeKey;

          return (
            <div
              key={modeKey}
              className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? `${item.color} shadow-xl ring-1 ring-white/10`
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{item.icon}</span>
                  {isCurrentActive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                      <CheckCircle2 size={11} /> Active
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-white uppercase tracking-wider">{item.title}</div>
                <div className="text-xs font-medium text-slate-300 mt-0.5">{item.subtitle}</div>
                <div className="text-[11px] font-mono text-cyan-400 font-semibold mt-1">{item.hours}</div>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Reassessment Pass:</span>
                  <span className="font-mono font-bold text-slate-300">≥{item.passReq}%</span>
                </div>

                {isCurrentActive ? (
                  <div className="text-[11px] text-center font-semibold text-slate-200 bg-white/5 py-1.5 rounded-xl border border-white/10">
                    🔒 Locked ({remainingDays}d {remainingHours}h)
                  </div>
                ) : isCurrentlyLocked ? (
                  <button
                    onClick={() => handleStartUnlockAssessment(modeKey)}
                    className="w-full py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                    title={`Take 56-question assessment to unlock early and switch to ${item.subtitle}`}
                  >
                    <Unlock size={12} />
                    <span>Unlock with Assessment</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onUpdateMode(modeKey, selectedDuration)}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    Select {item.subtitle}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Flexible Lock Duration Selector & Immediate Unlock / Reassess Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-slate-900/30 p-4 rounded-2xl border border-slate-800/60">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Clock size={14} className="text-indigo-400" />
            <span>Lock Duration Option:</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedDuration(7)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDuration === 7
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              7-Day Sprint Lock
            </button>
            <button
              onClick={() => setSelectedDuration(30)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedDuration === 30
                  ? 'bg-indigo-600 text-white shadow-sm font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              30-Day Sovereign Lock
            </button>
          </div>
        </div>

        {/* Unlock / Reassess Button */}
        {isCurrentlyLocked ? (
          <button
            onClick={() => handleStartUnlockAssessment(currentMode === 'TIGER' ? 'CHEETAH' : 'TIGER')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition-all flex items-center gap-1.5"
            title="Start Lyra AI Assessment to unlock early"
          >
            <Sparkles size={14} className="text-amber-200" />
            <span>Unlock / Reassess with Lyra AI Assessment</span>
          </button>
        ) : (
          <button
            onClick={() => onUpdateMode(selectedPendingMode, selectedDuration)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Lock size={13} />
            <span>Lock {currentMode} Mode ({selectedDuration} Days)</span>
          </button>
        )}
      </div>

      {/* 56-Question Assessment Modal */}
      <IntensityAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        profile={profile}
        goals={goals}
        currentLockState={lockState}
        targetMode={assessmentTargetMode}
        onAssessmentPassed={(newMode, durationDays) => {
          onUpdateMode(newMode, durationDays);
          setIsAssessmentModalOpen(false);
        }}
      />
    </div>
  );
};
