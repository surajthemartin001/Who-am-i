import React, { useState } from 'react';
import { UserProfile, IntensityMode } from '../../types';
import { Compass, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  initialProfile: UserProfile;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({ ...initialProfile });

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({ ...profile, isOnboarded: true });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-7 space-y-6 shadow-2xl">
        {/* Branding & Subtitle */}
        <div className="text-center space-y-1.5 pb-2 border-b border-slate-900">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-400">
            Intelligent Personal Development Navigation
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">WHO AM I?</h1>
          <p className="text-xs text-slate-400 italic">
            "Stay on your path. Become who you decided to become."
          </p>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: IDENTITY & CURRENT COMPETENCY */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Step 1 of 3: Where Are You Right Now?
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Age Range</label>
                <select
                  value={profile.ageRange}
                  onChange={(e) => setProfile({ ...profile, ageRange: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="16-18">16 - 18 (Foundation / School)</option>
                  <option value="19-22">19 - 22 (University / Early Builder)</option>
                  <option value="22-26">22 - 26 (Specialized STEM Practitioner)</option>
                  <option value="27-35">27 - 35 (Professional / Career Pivot)</option>
                  <option value="36+">36+ (Executive / Lifelong Polymath)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Education & Knowledge Level</label>
              <input
                type="text"
                value={profile.educationLevel}
                onChange={(e) => setProfile({ ...profile, educationLevel: e.target.value })}
                placeholder="e.g. Undergraduate in Engineering / Independent Researcher"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Existing Skills (comma separated)</label>
              <input
                type="text"
                value={profile.currentSkills.join(', ')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    currentSkills: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Current Primary Responsibilities</label>
              <input
                type="text"
                value={profile.currentResponsibilities}
                onChange={(e) => setProfile({ ...profile, currentResponsibilities: e.target.value })}
                placeholder="e.g. Full-time student thesis, job, family commitments..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* STEP 2: DESTINATION & TIME REALITY */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Step 2 of 3: Where Are You Going & Time Reality?
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Your Declared Ultimate Destination</label>
              <textarea
                rows={2}
                value={profile.goalsSummary}
                onChange={(e) => setProfile({ ...profile, goalsSummary: e.target.value })}
                placeholder="e.g. Master distributed systems, build autonomous robotics, and launch NEXORA enterprise..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Available Daily Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.dailyHours}
                  onChange={(e) => setProfile({ ...profile, dailyHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Available Weekly Hours</label>
                <input
                  type="number"
                  value={profile.weeklyHours}
                  onChange={(e) => setProfile({ ...profile, weeklyHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Milestone Deadline</label>
                <input
                  type="date"
                  value={profile.deadline}
                  onChange={(e) => setProfile({ ...profile, deadline: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Confidence Level (1 - 10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={profile.confidenceLevel}
                  onChange={(e) => setProfile({ ...profile, confidenceLevel: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Core Motivation</label>
              <input
                type="text"
                value={profile.motivation}
                onChange={(e) => setProfile({ ...profile, motivation: e.target.value })}
                placeholder="Why must you achieve this? What happens if you stop?"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>
          </div>
        )}

        {/* STEP 3: INTENSITY MODE & 30-DAY COMMITMENT */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              Step 3 of 3: Choose Your Intensity Mode (Locked 30 Days)
            </div>

            <p className="text-xs text-slate-400">
              Select one mode. Once confirmed, this mode is strictly locked for 30 days to build genuine discipline.
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'TURTLE',
                  title: 'MODE 1 — TURTLE',
                  hours: '1.5 - 2.5h / day',
                  desc: 'Slow & sustainable. Lower cognitive load, high revision buffers.',
                  icon: '🐢',
                },
                {
                  id: 'RABBIT',
                  title: 'MODE 2 — RABBIT',
                  hours: '3.5 - 5.0h / day',
                  desc: 'Balanced high-performance. Serious learners with consistent daily work.',
                  icon: '🐇',
                },
                {
                  id: 'CHEETAH',
                  title: 'MODE 3 — CHEETAH',
                  hours: '6.0 - 9.0h / day',
                  desc: 'Extreme intensive. Aggressive execution, high practice & revision volume.',
                  icon: '🐆',
                },
              ].map((m) => {
                const isSelected = profile.desiredIntensity === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setProfile({ ...profile, desiredIntensity: m.id as IntensityMode })}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{m.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="text-[11px] text-indigo-300 font-mono">{m.hours}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} className="text-indigo-400 shrink-0 ml-2" />}
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
              <Shield size={16} className="shrink-0" />
              <span>
                Lock Rule: You cannot casually switch modes for 30 days once you enter the command center.
              </span>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all"
          >
            {step === 3 ? 'Lock Mode & Enter System' : 'Continue'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
