import React, { useState, useRef, useEffect } from 'react';
import { LyraMood } from '../../types';
import { Sparkles, ChevronDown } from 'lucide-react';

interface LyraMoodSelectorProps {
  currentMood: LyraMood;
  onSelectMood: (mood: LyraMood) => void;
  compact?: boolean;
}

const moods: Array<{ id: LyraMood; label: string; icon: string; desc: string; color: string }> = [
  { id: 'Happy', label: 'Happy', icon: '✨', desc: 'Enthusiastic & celebratory', color: 'text-emerald-400' },
  { id: 'Playful', label: 'Playful', icon: '💫', desc: 'Witty, warm & lighthearted', color: 'text-purple-400' },
  { id: 'Calm', label: 'Calm', icon: '🌊', desc: 'Serene, centered & steady', color: 'text-cyan-400' },
  { id: 'Focused', label: 'Focused', icon: '🎯', desc: 'High structure, zero fluff', color: 'text-indigo-400' },
  { id: 'Motivational', label: 'Motivational', icon: '🔥', desc: 'Purposeful & high energy', color: 'text-amber-400' },
  { id: 'Serious', label: 'Serious', icon: '🛡️', desc: 'Direct, honest & disciplined', color: 'text-rose-400' },
  { id: 'Adaptive', label: 'Adaptive Mood', icon: '🔮', desc: 'Auto-adjusts to your track', color: 'text-teal-300' },
];

export const LyraMoodSelector: React.FC<LyraMoodSelectorProps> = ({
  currentMood,
  onSelectMood,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeMoodObj = moods.find((m) => m.id === currentMood) || moods[2];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 text-xs font-medium text-slate-200 shadow-sm transition-all focus:outline-none"
        title="Change Lyra's Mood"
      >
        <span className="text-sm">{activeMoodObj.icon}</span>
        {!compact && (
          <span className="text-slate-300">
            Mood: <span className={`font-semibold ${activeMoodObj.color}`}>{activeMoodObj.label}</span>
          </span>
        )}
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1">
              <Sparkles size={11} className="text-indigo-400" /> Lyra's Mood State
            </span>
            <span className="text-[10px] text-slate-500">Live expression</span>
          </div>

          <div className="p-1 space-y-0.5 max-h-72 overflow-y-auto">
            {moods.map((m) => {
              const isSelected = m.id === currentMood;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMood(m.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border border-indigo-500/40 text-white'
                      : 'hover:bg-slate-800/70 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <div className={`text-xs font-semibold ${isSelected ? 'text-indigo-300' : m.color}`}>
                        {m.label}
                      </div>
                      <div className="text-[10px] text-slate-400">{m.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
