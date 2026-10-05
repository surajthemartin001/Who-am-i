import React, { useState } from 'react';
import { TrackMetrics } from '../../types';
import { AlertTriangle, Zap, Clock, ShieldCheck, CheckCircle2, X } from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: TrackMetrics;
  onApplyOption: (option: string) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  metrics,
  onApplyOption,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'gradual' | 'aggressive' | 'deadline' | 'scope'>('gradual');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Zap size={22} />
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">RECOVERY ENGINE</h3>
              <p className="text-xs text-slate-400">Trajectory deviation analysis & intervention options</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Calm Objective Status Notice */}
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/35 space-y-1.5">
          <div className="text-xs font-bold text-amber-300">
            Current Telemetry: You are {metrics.recoveryHoursRequired} hours behind your planned trajectory.
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            WHO AM I? does not guilt or punish you. Life has variance. What matters is taking conscious corrective action before the deviation leaves the acceptable success track.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Hours Lost</div>
            <div className="text-base font-bold text-white mt-0.5">{metrics.recoveryHoursRequired} hrs</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Delayed Topics</div>
            <div className="text-base font-bold text-amber-400 mt-0.5">1 Topic</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Track State</div>
            <div className="text-base font-bold text-emerald-400 mt-0.5">Recoverable</div>
          </div>
        </div>

        {/* Recovery Options Selection */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">Select Intelligent Recovery Strategy:</div>

          {[
            {
              id: 'gradual',
              title: 'Option 1: Recover Gradually (Recommended)',
              desc: 'Add 30 minutes to Wednesday, Thursday, and Saturday sessions. Lowest cognitive fatigue.',
            },
            {
              id: 'aggressive',
              title: 'Option 2: Recover Aggressively (Sprint)',
              desc: 'Schedule a single 1.5-hour deep work sprint this Saturday morning to completely clear the delay.',
            },
            {
              id: 'deadline',
              title: 'Option 3: Adjust Deadline Mathematically',
              desc: 'Extend target milestone by 4 calendar days without adding daily workload pressure.',
            },
            {
              id: 'scope',
              title: 'Option 4: Deprioritize Optional Sub-skill',
              desc: 'Temporarily pause secondary reading to maintain 100% velocity on critical core architecture.',
            },
          ].map((opt) => {
            const isSelected = selectedPlan === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedPlan(opt.id as any)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{opt.title}</span>
                  {isSelected && <CheckCircle2 size={16} className="text-indigo-400 shrink-0 ml-2" />}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{opt.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Dismiss
          </button>
          <button
            onClick={() => {
              onApplyOption(selectedPlan);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
          >
            Apply Recovery Plan
          </button>
        </div>
      </div>
    </div>
  );
};
