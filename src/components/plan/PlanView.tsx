import React, { useState } from 'react';
import { DailyPlanTask, WeekPlanDay, Goal, IntensityMode } from '../../types';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  RefreshCw,
  Plus,
  Play,
  Flame,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface PlanViewProps {
  dailyTasks: DailyPlanTask[];
  weekPlan: WeekPlanDay[];
  goals: Goal[];
  intensityMode: IntensityMode;
  availableDailyHours: number;
  availableWeeklyHours: number;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: DailyPlanTask) => void;
  onDynamicRebalance: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  dailyTasks,
  weekPlan,
  goals,
  intensityMode,
  availableDailyHours,
  availableWeeklyHours,
  onToggleTask,
  onAddTask,
  onDynamicRebalance,
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'time_engine'>('today');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTopic, setNewTaskTopic] = useState('Distributed Systems');
  const [newTaskCategory, setNewTaskCategory] = useState<'learning' | 'practice' | 'revision' | 'project' | 'break'>('learning');
  const [newTaskMinutes, setNewTaskMinutes] = useState(45);

  // Calculate planned hours today
  const totalPlannedMinutes = dailyTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);
  const totalPlannedHours = (totalPlannedMinutes / 60).toFixed(1);
  const completedTasksCount = dailyTasks.filter((t) => t.completed).length;

  // Time Engine calculation for Goal Conflict
  const totalRequiredGoalHoursPerWeek = goals.reduce((acc, g) => acc + g.availableHoursPerWeek, 0);
  const isConflict = totalRequiredGoalHoursPerWeek > availableWeeklyHours;
  const conflictDeficit = totalRequiredGoalHoursPerWeek - availableWeeklyHours;

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: DailyPlanTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      topic: newTaskTopic,
      category: newTaskCategory,
      estimatedMinutes: Number(newTaskMinutes),
      priority: 'High',
      completed: false,
      scheduledTime: '18:00 - 18:45',
    };
    onAddTask(task);
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Category badges
  const categoryConfig = {
    learning: { label: 'LEARN', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    practice: { label: 'PRACTICE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    revision: { label: 'REVISE', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    project: { label: 'BUILD', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    break: { label: 'RESET', color: 'bg-slate-700/40 text-slate-400 border-slate-700/50' },
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Mode and Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <CalendarDays size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">EXECUTION PLAN</h2>
              <p className="text-xs text-slate-400">
                What to do right now • Dynamic rebalancing • Realistic Time Engine
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'today'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            TODAY (Daily Mission)
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'week'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            WEEK (7-Day Distribution)
          </button>
          <button
            onClick={() => setActiveTab('time_engine')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'time_engine'
                ? 'bg-indigo-600 text-white shadow-md'
                : isConflict
                ? 'text-amber-400 hover:text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isConflict && <AlertTriangle size={13} className="text-amber-400" />}
            TIME ENGINE
          </button>
        </div>
      </div>

      {/* TODAY TAB */}
      {activeTab === 'today' && (
        <div className="space-y-4">
          {/* Daily Mission Header Card */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Flame size={14} /> Today's Mission Sequence
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">Mode: {intensityMode}</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {completedTasksCount === dailyTasks.length
                  ? 'All Missions Completed! Excellent Execution.'
                  : `Next Up: ${dailyTasks.find((t) => !t.completed)?.title || 'All clear'}`}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Completed: {completedTasksCount} of {dailyTasks.length} tasks • Total: {totalPlannedHours}h planned
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onDynamicRebalance}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Redistribute remaining tasks based on velocity"
              >
                <RefreshCw size={13} /> Rebalance Plan
              </button>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all"
              >
                <Plus size={14} /> Add Objective
              </button>
            </div>
          </div>

          {/* Actionable Objectives List */}
          <div className="space-y-2.5">
            {dailyTasks.map((t, idx) => {
              const cat = categoryConfig[t.category] || categoryConfig.learning;

              return (
                <div
                  key={t.id}
                  onClick={() => onToggleTask(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    t.completed
                      ? 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-70'
                      : 'bg-slate-950 border-slate-800/90 hover:bg-slate-900/60 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 transition-transform active:scale-95"
                    >
                      {t.completed ? (
                        <CheckCircle2 size={22} className="text-emerald-400" />
                      ) : (
                        <Circle size={22} className="text-slate-600 hover:text-slate-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">{t.topic}</span>
                        {t.priority === 'Critical' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300">
                            Critical
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-semibold truncate ${t.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                        {t.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-300">{t.estimatedMinutes}m</div>
                      <div className="text-[10px] text-slate-500">{t.scheduledTime}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK TAB */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">7-Day Intelligent Workload</h3>
              <p className="text-xs text-slate-400">
                Workload dynamically balances between Theory, Practice, Revision, and Project Execution.
              </p>
            </div>
            <div className="text-xs text-indigo-400 font-mono font-semibold">
              Weekly Allocation: {weekPlan.reduce((acc, d) => acc + d.totalHours, 0)} Hours
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekPlan.map((d, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{d.dayName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.dateStr}</span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-400 font-mono mb-2">
                    {d.totalHours} hrs
                  </div>

                  {/* Hour breakdown */}
                  <div className="space-y-1 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span>Learn:</span>
                      <span className="text-slate-300">{d.learningHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Practice:</span>
                      <span className="text-slate-300">{d.practiceHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revision:</span>
                      <span className="text-slate-300">{d.revisionHours}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build:</span>
                      <span className="text-slate-300">{d.projectHours}h</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  {d.tasks.length} scheduled items
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TIME ENGINE & MULTI-GOAL CONFLICT TAB */}
      {activeTab === 'time_engine' && (
        <div className="space-y-5">
          {/* Conflict Flag if needed */}
          {isConflict ? (
            <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-500/40 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle size={20} />
                <h3 className="text-sm font-bold text-white">Multi-Goal Timeline Conflict Detected</h3>
              </div>
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Your declared goals require approximately <strong>{totalRequiredGoalHoursPerWeek} hours/week</strong>, while you have configured <strong>{availableWeeklyHours} hours/week</strong> available. That is a shortfall of {conflictDeficit} hours/week.
              </p>
              <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/30 text-xs text-slate-300 space-y-2">
                <div className="font-semibold text-amber-300">Recommended System Options:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-white block">Option A: Sequential Phases</strong>
                    Focus on Distributed Systems first (Month 1-3), then activate Robotics & Security.
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                    <strong className="text-white block">Option B: Extend Deadlines</strong>
                    Extend target capstone completion dates by 60 days to match your 32h/wk pace.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-300">
                Goal timeline alignment is mathematically viable. Total goal load ({totalRequiredGoalHoursPerWeek}h/wk) fits comfortably inside available time ({availableWeeklyHours}h/wk).
              </div>
            </div>
          )}

          {/* Time Engine Plausibility Matrix */}
          <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Mathematical Timeline Plausibility Matrix
            </h3>
            <p className="text-xs text-slate-400">
              WHO AM I? never promises 5-day mastery for complex engineering goals. Below is the mathematically calculated timeline distribution:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Minimum Plausible Timeline</div>
                <div className="text-base font-bold text-white mt-1">4.5 Months</div>
                <p className="text-[10px] text-slate-400 mt-1">Requires 38h/wk in Cheetah mode with zero missed sessions.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/40">
                <div className="text-[10px] text-indigo-300 uppercase font-semibold">Recommended Timeline</div>
                <div className="text-base font-bold text-indigo-200 mt-1">7.0 Months</div>
                <p className="text-[10px] text-indigo-300/80 mt-1">Sustainable balance under Rabbit mode (30-32h/wk) with revision buffers.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Gradual Mastery Timeline</div>
                <div className="text-base font-bold text-slate-300 mt-1">11.0 Months</div>
                <p className="text-[10px] text-slate-400 mt-1">Deep spaced retention under Turtle mode (18h/wk).</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Add Objective to Today's Plan</h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Implement Raft Log Serialization Test"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="learning">Learn (Theory)</option>
                  <option value="practice">Practice (Questions)</option>
                  <option value="revision">Revise (Recall)</option>
                  <option value="project">Build (Project)</option>
                  <option value="break">Reset (Break)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={newTaskMinutes}
                  onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add Objective
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
