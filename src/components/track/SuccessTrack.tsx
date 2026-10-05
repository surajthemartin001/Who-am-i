import React, { useState } from 'react';
import { TrackMetrics, Goal } from '../../types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Compass,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface SuccessTrackProps {
  metrics: TrackMetrics;
  goals: Goal[];
  onTriggerRecoveryModal?: () => void;
}

export const SuccessTrack: React.FC<SuccessTrackProps> = ({
  metrics,
  goals,
  onTriggerRecoveryModal,
}) => {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<number | null>(2);
  const [isExpanded, setIsExpanded] = useState(false);

  // Status visual mapping
  const statusConfig = {
    GREEN: {
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      glow: 'shadow-emerald-500/20',
      icon: ShieldCheck,
      color: '#10b981',
      label: 'ON TRACK',
      desc: 'Healthy velocity. You are securely inside your adaptive success corridor.',
    },
    YELLOW: {
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      glow: 'shadow-amber-500/20',
      icon: AlertTriangle,
      color: '#f59e0b',
      label: 'WARNING',
      desc: 'Approaching boundary. 1.5h recovery effort required to regain central trajectory.',
    },
    RED: {
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      glow: 'shadow-rose-500/20',
      icon: AlertOctagon,
      color: '#f43f5e',
      label: 'OFF TRACK',
      desc: 'Significant deviation. Structured recovery intervention recommended.',
    },
  }[metrics.status];

  const StatusIcon = statusConfig.icon;

  // Checkpoints along the adaptive path
  const checkpoints = [
    { id: 0, title: 'Identity & Inception', progress: 0, x: 80, y: 150, completed: true },
    { id: 1, title: 'Core Foundations (Theory & Math)', progress: 25, x: 250, y: 80, completed: true },
    { id: 2, title: 'Current Position (Consensus & Firmware)', progress: 64, x: 500, y: 170, active: true },
    { id: 3, title: 'Recovery Zone Alpha (Buffer Check)', progress: 75, x: 720, y: 95, recovery: true },
    { id: 4, title: 'Capstone Verification (Production)', progress: 90, x: 890, y: 160, completed: false },
    { id: 5, title: 'DESTINATION: SUCCESS', progress: 100, x: 1040, y: 100, isGoal: true },
  ];

  return (
    <div className={`relative rounded-3xl bg-slate-950/90 border border-slate-800/80 p-5 sm:p-6 transition-all duration-300 ${isExpanded ? 'col-span-full' : ''}`}>
      {/* Background glow behind track */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-32 blur-3xl opacity-20 pointer-events-none rounded-full"
        style={{ backgroundColor: statusConfig.color }}
      />

      {/* Header bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <Compass size={18} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">MY TRACK</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusConfig.badge}`}
                >
                  <StatusIcon size={13} /> {statusConfig.label}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {metrics.score}/100 Trajectory Index
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Wide adaptive corridor • Continuous trajectory verification • Never guaranteed, always earned
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {metrics.recoveryHoursRequired > 0 && (
            <button
              onClick={onTriggerRecoveryModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Zap size={13} /> {metrics.recoveryHoursRequired}h Recovery Required
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={isExpanded ? 'Collapse View' : 'Expand View'}
          >
            {isExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* The Wide Adaptive Track Visual Canvas (SVG) */}
      <div className="relative w-full overflow-x-auto rounded-2xl bg-slate-950/80 border border-slate-800/70 p-2 sm:p-4 my-2">
        <svg
          viewBox="0 0 1120 250"
          className="w-full min-w-[760px] h-48 sm:h-56 select-none"
          fill="none"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#065f46" stopOpacity="0.4" />
              <stop offset="40%" stopColor="#047857" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#0d9488" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.6" />
            </linearGradient>

            <linearGradient id="dangerZoneTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>

            {/* Glowing marker filter */}
            <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines in background for navigation feeling */}
          <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
            {Array.from({ length: 12 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="250" />
            ))}
            <line x1="0" y1="60" x2="1120" y2="60" />
            <line x1="0" y1="125" x2="1120" y2="125" />
            <line x1="0" y1="190" x2="1120" y2="190" />
          </g>

          {/* Outer Boundary Danger Band (Red Zone) */}
          <path
            d="M 50 150 Q 250 10 500 170 T 900 140 T 1070 100"
            stroke="rgba(244, 63, 94, 0.25)"
            strokeWidth="86"
            strokeLinecap="round"
            fill="none"
          />

          {/* Warning Boundary Band (Yellow Zone) */}
          <path
            d="M 50 150 Q 250 10 500 170 T 900 140 T 1070 100"
            stroke="rgba(245, 158, 11, 0.3)"
            strokeWidth="62"
            strokeLinecap="round"
            fill="none"
          />

          {/* Core Safe Success Track (Wide Green / Cyan Corridor) */}
          <path
            d="M 50 150 Q 250 10 500 170 T 900 140 T 1070 100"
            stroke="url(#trackGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            fill="none"
          />

          {/* Central Trajectory Ideal Line */}
          <path
            d="M 50 150 Q 250 10 500 170 T 900 140 T 1070 100"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="2"
            strokeDasharray="6 6"
            fill="none"
          />

          {/* Trajectory Traversed Path (Solid Bright Glow) */}
          <path
            d="M 50 150 Q 250 10 500 170"
            stroke={statusConfig.color}
            strokeWidth="4"
            fill="none"
            filter="url(#glowFilter)"
          />

          {/* Branch / Exploration Alternative Track */}
          <path
            d="M 500 170 Q 600 220 720 200 Q 820 180 890 160"
            stroke="rgba(99, 102, 241, 0.25)"
            strokeWidth="12"
            strokeDasharray="4 4"
            fill="none"
          />
          <text x="640" y="225" fill="#818cf8" fontSize="10" opacity="0.7">
            Exploration Branch: Hardware Sub-system
          </text>

          {/* Recovery Zone Beacon */}
          <g transform="translate(720, 95)">
            <circle cx="0" cy="0" r="22" fill="rgba(245, 158, 11, 0.15)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="6" fill="#f59e0b" />
            <text x="-40" y="-12" fill="#fbbf24" fontSize="10" fontWeight="bold">
              Recovery Buffer Zone
            </text>
          </g>

          {/* Checkpoints & Nodes */}
          {checkpoints.map((cp) => {
            const isCurrent = cp.active;
            const isTarget = cp.isGoal;

            return (
              <g
                key={cp.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => setSelectedCheckpoint(cp.id)}
              >
                {/* Node Outer Halo */}
                {isCurrent && (
                  <circle
                    cx={cp.x}
                    cy={cp.y}
                    r="20"
                    fill={statusConfig.color}
                    opacity="0.25"
                    className="animate-ping"
                  />
                )}

                {/* Node Body */}
                <circle
                  cx={cp.x}
                  cy={cp.y}
                  r={isCurrent ? 12 : isTarget ? 14 : 8}
                  fill={isCurrent ? statusConfig.color : isTarget ? '#6366f1' : cp.completed ? '#10b981' : '#1e293b'}
                  stroke="#ffffff"
                  strokeWidth={isCurrent || isTarget ? 3 : 1.5}
                  filter={isCurrent ? 'url(#glowFilter)' : undefined}
                />

                {/* Node Labels */}
                <text
                  x={cp.x}
                  y={cp.y + (cp.y > 130 ? 28 : -18)}
                  textAnchor="middle"
                  fill={isCurrent ? '#ffffff' : '#94a3b8'}
                  fontSize={isCurrent || isTarget ? '11' : '10'}
                  fontWeight={isCurrent || isTarget ? 'bold' : 'normal'}
                >
                  {cp.title}
                </text>
                <text
                  x={cp.x}
                  y={cp.y + (cp.y > 130 ? 40 : -6)}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                >
                  {cp.progress}%
                </text>
              </g>
            );
          })}

          {/* Glowing Moving User Marker Indicator */}
          <g transform="translate(500, 170)">
            <circle cx="0" cy="0" r="16" fill="rgba(255,255,255,0.2)" />
            <polygon points="0,-12 9,6 -9,6" fill="#ffffff" />
            <text x="0" y="-18" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              YOU ARE HERE
            </text>
          </g>

          {/* Goal Destination Indicator */}
          <g transform="translate(1040, 75)">
            <text x="0" y="-8" textAnchor="middle" fontSize="16">
              ✨
            </text>
            <text x="0" y="8" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">
              DESTINATION
            </text>
            <text x="0" y="20" textAnchor="middle" fill="#e0e7ff" fontSize="11" fontWeight="extrabold">
              SUCCESS
            </text>
          </g>
        </svg>
      </div>

      {/* Trajectory Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Track Position</div>
          <div className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusConfig.color }} />
            {metrics.progressPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Along corridor</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Consistency</div>
          <div className="text-base font-bold text-emerald-400 mt-0.5">
            {metrics.consistencyPercentage}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Rolling 30 days</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Learning Velocity</div>
          <div className="text-base font-bold text-cyan-400 flex items-center gap-1 mt-0.5">
            <TrendingUp size={14} />
            {metrics.learningVelocityHoursPerWeek}h/wk
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Actual pace</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Accumulated Delay</div>
          <div className="text-base font-bold text-amber-400 flex items-center gap-1 mt-0.5">
            <Clock size={14} />
            {metrics.accumulatedDelayDays} Day
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{metrics.missedWorkHours}h missed work</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Risk Assessment</div>
          <div className="text-base font-bold text-slate-200 mt-0.5">
            {metrics.riskLevel}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Within tolerance</div>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400">Destination Distance</div>
          <div className="text-base font-bold text-indigo-400 mt-0.5">
            {metrics.distanceToTargetKm} Units
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Target: 2027</div>
        </div>
      </div>

      {/* Trajectory explanation statement */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
        <Info size={15} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-300">Philosophical Notice: </span>
          {statusConfig.desc} WHO AM I? continuously measures your execution against your declared destination. You are currently here → moving toward your destination → Earn the crown through consistent work.
        </div>
      </div>
    </div>
  );
};
