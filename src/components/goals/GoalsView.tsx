import React, { useState } from 'react';
import { Goal, TrackStatus } from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import {
  Target,
  Plus,
  Sparkles,
  Layers,
  Calendar,
  Clock,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Trash2,
  BookOpen,
  Code,
  Briefcase,
  Cpu,
  Zap,
} from 'lucide-react';

interface GoalsViewProps {
  goals: Goal[];
  onAddGoal: (goal: Goal) => void;
  onUpdateGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onSelectGoalToPlan?: (goal: Goal) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(goals[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [naturalGoalPrompt, setNaturalGoalPrompt] = useState('');
  const [isDecomposing, setIsDecomposing] = useState(false);

  // Quick preset templates from the Educational Goal Library
  const libraryPresets = [
    { title: 'Software Engineering + Distributed Systems + AI', icon: Code },
    { title: 'Cybersecurity + Ethical Hacking + Kernel Security', icon: ShieldCheck },
    { title: 'Robotics + Embedded Systems + ROS 2', icon: Cpu },
    { title: 'Deep Tech Entrepreneurship + Venture Strategy', icon: Briefcase },
    { title: 'Applied Mathematics + Physics + Machine Learning', icon: Layers },
  ];

  const handleDecomposeAndCreate = async () => {
    if (!naturalGoalPrompt.trim()) return;
    setIsDecomposing(true);

    try {
      const parsed = await executeLyraTask('decompose_goal', { goalText: naturalGoalPrompt });
      const newGoal: Goal = {
        id: `goal-${Date.now()}`,
        name: parsed?.primaryObjective || naturalGoalPrompt.slice(0, 40),
        description: naturalGoalPrompt,
        whyMatters: 'Chosen milestone toward long-term identity and sovereign competency.',
        targetOutcome: (parsed?.measurableOutcomes && parsed.measurableOutcomes[0]) || 'Master key competencies and verify with capstone benchmarks.',
        currentLevel: 'Developing Foundation',
        targetLevel: 'Production & Research Grade Mastery',
        deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        availableHoursPerWeek: 8,
        priority: 'High',
        dependencies: parsed?.dependencies || ['Core Principles', 'Mathematics Foundations'],
        resources: ['Primary Curricula 2026', 'Technical Standards Documentation'],
        milestones: (parsed?.suggestedMilestones || ['Foundation', 'Application Lab', 'Capstone Review']).map((m: string, idx: number) => ({
          id: `m-${idx}`,
          title: m,
          completed: false,
          timeframe: `Stage ${idx + 1}`,
        })),
        projects: [
          {
            id: `p-${Date.now()}`,
            title: `${parsed?.primaryObjective || 'Primary'} Capstone Prototype`,
            description: 'Comprehensive applied implementation verifying multi-disciplinary mastery.',
            status: 'planned',
          },
        ],
        practiceRequirements: '20 targeted question lab exercises and 2 weekly lab drills',
        revisionRequirements: 'Active recall and spaced retrieval every 7 days',
        assessmentMethod: 'Evidence-based project submission and problem-solving benchmarks',
        status: 'GREEN',
        progress: 10,
        notes: 'Goal decomposed by Lyra Intelligence. Sequence initialized.',
        aiRecommendations: parsed?.recommendedSequence || [
          'Solidify theoretical foundations first.',
          'Execute targeted question lab exercises to identify early blind spots.',
        ],
      };

      onAddGoal(newGoal);
      setSelectedGoal(newGoal);
      setShowCreateModal(false);
      setNaturalGoalPrompt('');
    } finally {
      setIsDecomposing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <Target size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">DESTINATION GOALS</h2>
              <p className="text-xs text-slate-400">
                Multiple interdisciplinary pathways • AI natural language goal breakdown • Continuous health calculation
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus size={16} /> Define New Goal
        </button>
      </div>

      {/* Main Layout: Left Goal List, Right Goal Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Goals List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Active Destinations ({goals.length})</span>
            <span>Health Status</span>
          </div>

          <div className="space-y-2.5">
            {goals.map((g) => {
              const isSelected = selectedGoal?.id === g.id;
              const statusBadge = {
                GREEN: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                YELLOW: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                RED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
              }[g.status];

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGoal(g)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-xs font-bold text-white leading-tight line-clamp-1">{g.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusBadge}`}>
                      {g.status === 'GREEN' ? 'HEALTHY' : g.status === 'YELLOW' ? 'AT RISK' : 'CRITICAL'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                    {g.description}
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progress</span>
                      <span className="font-semibold text-white">{g.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          g.status === 'GREEN' ? 'bg-emerald-500' : g.status === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock size={11} /> {g.availableHoursPerWeek}h/wk
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Due: {g.deadline}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Goal Detail & Roadmap */}
        <div className="lg:col-span-7">
          {selectedGoal ? (
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300">
                      Priority: {selectedGoal.priority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        selectedGoal.status === 'GREEN'
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          : selectedGoal.status === 'YELLOW'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      Status: {selectedGoal.status}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{selectedGoal.name}</h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      if (confirm('Delete this goal?')) {
                        onDeleteGoal(selectedGoal.id);
                        setSelectedGoal(goals[0] || null);
                      }
                    }}
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Why This Goal Matters & Target Outcome */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Why This Goal Matters
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedGoal.whyMatters}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Measurable Target Outcome
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedGoal.targetOutcome}</p>
                </div>
              </div>

              {/* Levels & Dependencies */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Current Level</div>
                  <div className="text-xs font-semibold text-slate-300 mt-0.5">{selectedGoal.currentLevel}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Target Level</div>
                  <div className="text-xs font-semibold text-indigo-300 mt-0.5">{selectedGoal.targetLevel}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500 uppercase">Target Deadline</div>
                  <div className="text-xs font-semibold text-emerald-400 mt-0.5">{selectedGoal.deadline}</div>
                </div>
              </div>

              {/* Dependencies Pill List */}
              <div>
                <div className="text-xs font-semibold text-slate-300 mb-1.5">Foundational Dependencies</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedGoal.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] text-slate-300"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">Milestones & Verification</span>
                  <span className="text-[11px] text-slate-400">
                    {selectedGoal.milestones.filter((m) => m.completed).length} / {selectedGoal.milestones.length} Done
                  </span>
                </div>
                <div className="space-y-1.5">
                  {selectedGoal.milestones.map((ms) => (
                    <div
                      key={ms.id}
                      onClick={() => {
                        const updated = {
                          ...selectedGoal,
                          milestones: selectedGoal.milestones.map((m) =>
                            m.id === ms.id ? { ...m, completed: !m.completed } : m
                          ),
                        };
                        onUpdateGoal(updated);
                        setSelectedGoal(updated);
                      }}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:bg-slate-800/60 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={16}
                          className={ms.completed ? 'text-emerald-400' : 'text-slate-600'}
                        />
                        <span
                          className={`text-xs ${
                            ms.completed ? 'text-slate-400 line-through' : 'text-slate-200'
                          }`}
                        >
                          {ms.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{ms.timeframe}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Recommendations */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1.5">
                  <Sparkles size={14} /> Lyra Recommendations for This Goal
                </div>
                <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {selectedGoal.aiRecommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-64 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-500">
              <Target size={32} className="mb-2 text-slate-600" />
              <p className="text-xs">No goal selected. Choose a goal on the left or create a new destination.</p>
            </div>
          )}
        </div>
      </div>

      {/* Natural Language Goal Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-slate-950 border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="text-base font-bold text-white">Declare Destination Goal</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Describe your ambitious goal in natural language. Lyra will automatically extract the primary objective, sub-skills, knowledge domains, prerequisites, milestones, and realistic timelines.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Your Natural Language Goal
              </label>
              <textarea
                rows={4}
                value={naturalGoalPrompt}
                onChange={(e) => setNaturalGoalPrompt(e.target.value)}
                placeholder="e.g. I want to become highly skilled in software development, cybersecurity, AI and robotics while building my own autonomous technology company..."
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Educational Library Quick Presets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {libraryPresets.map((lp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNaturalGoalPrompt(lp.title)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <lp.icon size={12} className="text-indigo-400" /> {lp.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDecomposing || !naturalGoalPrompt.trim()}
                onClick={handleDecomposeAndCreate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                {isDecomposing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Decomposing with Lyra...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Analyze & Create Goal
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
