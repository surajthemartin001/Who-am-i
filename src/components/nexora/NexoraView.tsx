import React, { useState } from 'react';
import { NexoraProject } from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import {
  Rocket,
  Plus,
  Cpu,
  Shield,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Terminal,
  Activity,
  Code,
  Network,
} from 'lucide-react';

interface NexoraViewProps {
  projects: NexoraProject[];
  onAddProject: (project: NexoraProject) => void;
  onUpdateProject: (project: NexoraProject) => void;
}

export const NexoraView: React.FC<NexoraViewProps> = ({
  projects,
  onAddProject,
  onUpdateProject,
}) => {
  const [selectedProject, setSelectedProject] = useState<NexoraProject | null>(projects[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectVision, setProjectVision] = useState('');
  const [projectCategory, setProjectCategory] = useState<NexoraProject['category']>('Robotics');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Command prompt for NEXORA Agent
  const [agentPrompt, setAgentPrompt] = useState('');
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentLog, setAgentLog] = useState<string | null>(null);

  const handleCreateNexoraProject = async () => {
    if (!projectName.trim() || !projectVision.trim()) return;
    setIsGeneratingPlan(true);

    try {
      const plan = await executeLyraTask('nexora_plan', {
        projectName,
        vision: projectVision,
      });

      const newProj: NexoraProject = {
        id: `nx-${Date.now()}`,
        title: projectName,
        category: projectCategory,
        vision: projectVision,
        requirements: plan?.requirements || [
          'High reliability real-time communication',
          'Automated regression testing pipeline',
          'Sovereign self-hosted deployment',
        ],
        subsystems: plan?.subsystems || [
          { name: 'Core Architecture', description: 'Deterministic engine pipeline', status: 'Ready' },
          { name: 'Hardware / Edge Interface', description: 'Sensor & actuator telemetry loop', status: 'In Progress' },
        ],
        milestones: (plan?.milestones || []).map((m: any, idx: number) => ({
          id: `nxm-${idx}`,
          title: m.title || `Stage ${idx + 1}`,
          timeframe: m.timeframe || 'Month 1',
          tasks: m.tasks || ['Define architecture', 'Execute integration'],
          completed: false,
        })),
        risks: plan?.risks || ['Component supply latency', 'Interface synchronization'],
        nextAction: plan?.nextAction || 'Initialize CAD schematic and repo scaffold.',
      };

      onAddProject(newProj);
      setSelectedProject(newProj);
      setShowCreateModal(false);
      setProjectName('');
      setProjectVision('');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleRunAgentWorkflow = async () => {
    if (!agentPrompt.trim() || !selectedProject) return;
    setAgentRunning(true);
    setAgentLog(null);

    try {
      const res = await executeLyraTask('nexora_plan', {
        projectName: selectedProject.title,
        vision: `${selectedProject.vision} | USER COMMAND: ${agentPrompt}`,
      });
      setAgentLog(
        `[NEXORA Agent Executed] Milestone generated: ${res?.milestones?.[0]?.title || 'Detailed task breakdown'}. Action logged to project repository.`
      );
      setAgentPrompt('');
    } finally {
      setAgentRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <Rocket size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">MY / NEXORA COMMAND CENTER</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Long-Term Technology & Venture Lab
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Turn radical concepts into concrete hardware, software, robotics & enterprise roadmaps.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus size={15} /> New Technology Project
        </button>
      </div>

      {/* Main Grid: Projects List + Selected Project Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Projects Overview */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 px-1">
            Active Technology Roadmaps ({projects.length})
          </div>

          <div className="space-y-2.5">
            {projects.map((p) => {
              const isSelected = selectedProject?.id === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-indigo-400 border border-slate-700">
                      {p.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {p.milestones.filter((m) => m.completed).length} / {p.milestones.length} Stages
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.vision}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Project Detail & NEXORA Agent Workspace */}
        <div className="lg:col-span-8">
          {selectedProject ? (
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
              {/* Project Header */}
              <div className="pb-4 border-b border-slate-800 flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Category: {selectedProject.category}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedProject.title}</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{selectedProject.vision}</p>
                </div>
              </div>

              {/* Subsystems Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-400" /> Subsystems & Architecture
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedProject.subsystems.map((sub, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                        <span>{sub.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                          {sub.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{sub.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Milestones & Engineering Stages */}
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  Engineering Stages & Milestones
                </h4>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        const updated = {
                          ...selectedProject,
                          milestones: selectedProject.milestones.map((item) =>
                            item.id === m.id ? { ...item, completed: !item.completed } : item
                          ),
                        };
                        onUpdateProject(updated);
                        setSelectedProject(updated);
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2
                          size={16}
                          className={m.completed ? 'text-emerald-400' : 'text-slate-600'}
                        />
                        <div>
                          <div className={`text-xs font-medium ${m.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                            {m.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Tasks: {m.tasks.join(', ')}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-mono shrink-0">
                        {m.timeframe}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immediate Next Action */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-500/30 flex items-start gap-3">
                <Activity size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-indigo-200">Recommended Next Engineering Action</div>
                  <div className="text-xs text-slate-300 mt-0.5">{selectedProject.nextAction}</div>
                </div>
              </div>

              {/* Specialized NEXORA Agent Prompt Runner */}
              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Terminal size={14} className="text-emerald-400" />
                  <span>NEXORA AI Agent Console</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={agentPrompt}
                    onChange={(e) => setAgentPrompt(e.target.value)}
                    placeholder="e.g. Create a 90-day software milestone or analyze interface risks..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleRunAgentWorkflow()}
                  />
                  <button
                    disabled={agentRunning || !agentPrompt.trim()}
                    onClick={handleRunAgentWorkflow}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {agentRunning ? 'Running...' : 'Execute'}
                  </button>
                </div>
                {agentLog && (
                  <div className="p-2.5 rounded-xl bg-slate-900 text-[11px] text-emerald-300 font-mono">
                    {agentLog}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No project selected.
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Define NEXORA Venture / Technology Project</h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Autonomous Household Helper Robot"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Category</label>
              <select
                value={projectCategory}
                onChange={(e) => setProjectCategory(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <option value="Robotics">Robotics & Autonomous Hardware</option>
                <option value="Software">Software & Distributed Systems</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="Cybersecurity">Cybersecurity & Cryptography</option>
                <option value="Business">Deep Tech Business & Venture</option>
                <option value="Electronics">Electronics & Embedded Systems</option>
                <option value="Architecture">System Architecture</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Vision & Requirements</label>
              <textarea
                rows={3}
                value={projectVision}
                onChange={(e) => setProjectVision(e.target.value)}
                placeholder="Describe what the system must achieve, constraints, and target outcomes..."
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                disabled={isGeneratingPlan}
                onClick={handleCreateNexoraProject}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {isGeneratingPlan ? <Sparkles size={13} className="animate-spin" /> : <Rocket size={13} />}
                Synthesize Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
