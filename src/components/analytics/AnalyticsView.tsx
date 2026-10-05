import React from 'react';
import { TrackMetrics, Goal, RevisionItem } from '../../types';
import {
  TrendingUp,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target,
  Award,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface AnalyticsViewProps {
  metrics: TrackMetrics;
  goals: Goal[];
  revisions: RevisionItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  metrics,
  goals,
  revisions,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <BarChart3 size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">PROGRESS & TELEMETRY ENGINE</h2>
              <p className="text-xs text-slate-400">
                Evidence-based mastery scores • Historical velocity • Cognitive retention index
              </p>
            </div>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 flex items-center gap-2">
          <Activity size={14} /> Telemetry Refresh: Real-Time
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Mastery Trajectory Score</div>
          <div className="text-2xl font-black text-white mt-1">{metrics.score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp size={13} /> +4.2% velocity this week
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Execution Consistency</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{metrics.consistencyPercentage}%</div>
          <div className="text-[11px] text-slate-400 mt-1">28 of 30 days active</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Weekly Learning Velocity</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{metrics.learningVelocityHoursPerWeek}h</div>
          <div className="text-[11px] text-slate-400 mt-1">Target: 32.0h / week</div>
        </div>

        <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800">
          <div className="text-xs text-slate-400">Current Track Status</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{metrics.label}</div>
          <div className="text-[11px] text-amber-400 mt-1">
            {metrics.recoveryHoursRequired > 0 ? `${metrics.recoveryHoursRequired}h recovery buffer` : 'Zero delay'}
          </div>
        </div>
      </div>

      {/* Topic Mastery Evidence Scores Table (0-100) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Topic Mastery Evidence Scores (0 - 100)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              WHO AM I? does not mark topics complete from simple checkboxes. Scores are calculated from active practice accuracy, project submissions, and spaced recall stability.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {[
            { topic: 'Distributed Consensus & Raft Protocols', score: 84, level: 'Strong (Evidence Verified)', color: 'bg-emerald-500' },
            { topic: 'Embedded Firmware & ROS 2 Control Nodes', score: 72, level: 'Functional Practitioner', color: 'bg-cyan-500' },
            { topic: 'Deep Tech Financial & BOM Modeling', score: 65, level: 'Functional Practitioner', color: 'bg-indigo-500' },
            { topic: 'Differential Kinematics & EKF Linearization', score: 58, level: 'Developing (Practice Needed)', color: 'bg-amber-500' },
            { topic: 'Binary Buffer Overflow & ROP Gadgets', score: 46, level: 'Developing (Recovery Required)', color: 'bg-rose-500' },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">{item.topic}</span>
                <span className="font-mono font-bold text-slate-200">{item.score}% ({item.level})</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interdisciplinary Knowledge Graph Insight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Layers size={15} className="text-indigo-400" />
            Interdisciplinary Knowledge Synergy
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your strongest domain synergy exists between <strong>Applied Mathematics → Kinematics → ROS 2 Robotics</strong>. By strengthening Matrix transformations, your robotics simulation progress directly accelerates.
          </p>
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
            Next cross-domain bridge: Apply Distributed Consensus algorithms to NEXORA multi-robot mesh swarms.
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <AlertTriangle size={15} className="text-amber-400" />
            Weak Areas Requiring Intervention
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Low practice volume detected in <strong>Binary Exploitation & Memory Safety</strong> (46% Mastery Evidence). You have 2 unattempted labs scheduled for this topic.
          </p>
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300">
            Recommended Action: Allocate a 45-minute focused lab session on Wednesday morning before starting new topics.
          </div>
        </div>
      </div>
    </div>
  );
};
