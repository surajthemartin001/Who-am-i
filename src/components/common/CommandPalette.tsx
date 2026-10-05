import React, { useState, useEffect } from 'react';
import {
  Search,
  Target,
  Calendar,
  Sparkles,
  FileQuestion,
  RotateCcw,
  FolderOpen,
  Rocket,
  BarChart3,
  Settings,
  PhoneCall,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onOpenLyraSettings: () => void;
  onOpenLiveVoice?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenLyraSettings,
  onOpenLiveVoice,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'live_voice', title: 'Start Live Voice Call with Lyra (Real-time)', icon: PhoneCall, action: 'live_voice' },
    { id: 'home', title: 'Open Home Command Center', icon: Sparkles, section: 'home' },
    { id: 'goals', title: 'Define or View Goals', icon: Target, section: 'goals' },
    { id: 'plan', title: "Open Today's Execution Plan", icon: Calendar, section: 'plan' },
    { id: 'practice', title: 'Start Practice in Question Lab', icon: FileQuestion, section: 'practice' },
    { id: 'revision', title: 'Start Smart Spaced Revision', icon: RotateCcw, section: 'practice' },
    { id: 'resources', title: 'Open Resources & MY BOOK', icon: FolderOpen, section: 'resources' },
    { id: 'nexora', title: 'Open MY / NEXORA Technology Workspace', icon: Rocket, section: 'nexora' },
    { id: 'analytics', title: 'View Progress Telemetry & Mastery Scores', icon: BarChart3, section: 'analytics' },
    { id: 'lyra_settings', title: 'Customize Lyra (Mood, Voice, Language & Personality)', icon: Settings, action: 'lyra_settings' },
  ];

  const filtered = commands.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-2.5">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to section (Ctrl+K)..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1">
            <X size={15} />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                if (cmd.action === 'live_voice' && onOpenLiveVoice) {
                  onOpenLiveVoice();
                } else if (cmd.action === 'lyra_settings') {
                  onOpenLyraSettings();
                } else if (cmd.section) {
                  onNavigate(cmd.section);
                }
                onClose();
              }}
              className="w-full p-2.5 rounded-xl hover:bg-slate-900 flex items-center justify-between text-left text-xs text-slate-300 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <cmd.icon size={15} className="text-indigo-400" />
                <span>{cmd.title}</span>
              </div>
              <span className="text-[10px] text-slate-600 font-mono">Jump</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-xs text-slate-500">No matching commands found.</div>
          )}
        </div>
      </div>
    </div>
  );
};
