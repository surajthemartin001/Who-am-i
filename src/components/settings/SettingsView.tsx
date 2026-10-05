import React, { useState } from 'react';
import { UserProfile, LyraSettings, Goal, IntensityLockState } from '../../types';
import {
  Settings,
  Download,
  Upload,
  User,
  Shield,
  Bell,
  Lock,
  Moon,
  Volume2,
  FileText,
  Key,
  Database,
  CheckCircle2,
} from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile;
  settings: LyraSettings;
  goals: Goal[];
  lockState: IntensityLockState;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenLyraSettings: () => void;
  onTriggerRecalibration: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  settings,
  goals,
  lockState,
  onUpdateProfile,
  onOpenLyraSettings,
  onTriggerRecalibration,
}) => {
  const [copiedNotice, setCopiedNotice] = useState(false);

  const handleExportDataJSON = () => {
    const data = {
      profile,
      settings,
      goals,
      lockState,
      exportedAt: new Date().toISOString(),
      system: 'WHO AM I? Personal Development Navigation System',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `who-am-i-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const content = `# WHO AM I? — Personal Development Trajectory Report
**User:** ${profile.name}
**Mode:** ${lockState.mode} (${lockState.daysRemaining} days remaining in 30-day lock)
**Generated:** ${new Date().toLocaleDateString()}

## Active Goals
${goals.map((g) => `- **${g.name}** [Status: ${g.status} | Progress: ${g.progress}%] - Deadline: ${g.deadline}`).join('\n')}

## Weekly Allocation
- Available Weekly Hours: ${profile.weeklyHours}h
- Available Daily Hours: ${profile.dailyHours}h

*“Stay on your path. Become who you decided to become.”*
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `who-am-i-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-2.5">
        <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
          <Settings size={20} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide">SYSTEM SETTINGS & EXPORT</h2>
          <p className="text-xs text-slate-400">
            Profile calibration • Privacy & sovereign data export • Discipline parameters
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Profile Configuration */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <User size={15} className="text-indigo-400" />
            Identity Profile
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Daily Available Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={profile.dailyHours}
                  onChange={(e) => onUpdateProfile({ ...profile, dailyHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Weekly Available Hours</label>
                <input
                  type="number"
                  value={profile.weeklyHours}
                  onChange={(e) => onUpdateProfile({ ...profile, weeklyHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Preferred Study Periods</label>
              <input
                type="text"
                value={profile.preferredStudyTimes}
                onChange={(e) => onUpdateProfile({ ...profile, preferredStudyTimes: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={onTriggerRecalibration}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-all"
              >
                Re-run Identity Onboarding Flow
              </button>
            </div>
          </div>
        </div>

        {/* LYRA Customization Shortcut Card */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Volume2 size={15} className="text-indigo-400" />
              LYRA Customization Center
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Default: हिन्दी
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Customize Lyra’s mood (Happy, Playful, Calm, Focused, Motivational, Serious, Adaptive), personality archetypes, speaking style, built-in voices, and external TTS providers (ElevenLabs, OpenAI, Azure).
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div>
              Current Mood: <strong className="text-white">{settings.mood}</strong>
            </div>
            <div>
              Voice & Lang: <strong className="text-white">{settings.voice}</strong> ({settings.language})
            </div>
            <div>
              External TTS: <strong className="text-white">{settings.externalTTS.connected ? 'Connected' : 'Gemini 3.8 Flash Lite TTS'}</strong>
            </div>
          </div>

          <button
            onClick={onOpenLyraSettings}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            Open Lyra Settings
          </button>
        </div>

        {/* Data Ownership & Sovereign Export */}
        <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Database size={15} className="text-indigo-400" />
            Sovereign Data Export & Ownership
          </div>

          <p className="text-xs text-slate-400">
            You retain absolute ownership of all personal planning, goals, milestones, and telemetry data. You can export complete backups at any time.
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={handleExportDataJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Download size={14} /> Export Full JSON Backup
            </button>
            <button
              onClick={handleExportMarkdown}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <FileText size={14} /> Export Trajectory Markdown Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
