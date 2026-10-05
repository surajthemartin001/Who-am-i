import React, { useState } from 'react';
import { LyraSettings, LyraMood } from '../../types';
import { LyraAvatar } from './LyraAvatar';
import { speakLyraSpeech, stopLyraSpeech } from '../../services/lyraService';
import {
  X,
  Sparkles,
  UserCheck,
  Volume2,
  Languages,
  MessageSquare,
  Key,
  CheckCircle,
  Eye,
  EyeOff,
  Radio,
  Play,
  Square,
  Globe2,
  Sliders,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface LyraSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LyraSettings;
  onSaveSettings: (newSettings: LyraSettings) => void;
}

type SettingsTab = 'mood' | 'personality' | 'voice' | 'language' | 'speaking_style';

export const LyraSettingsModal: React.FC<LyraSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [localSettings, setLocalSettings] = useState<LyraSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<SettingsTab>('mood');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Extra speaking style granular parameters
  const [humorLevel, setHumorLevel] = useState<'Minimal' | 'Balanced' | 'Playful'>('Balanced');
  const [formality, setFormality] = useState<'Casual Companion' | 'Balanced Peer' | 'Rigorous Mentor'>('Casual Companion');

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleMoodSelect = (mood: LyraMood) => {
    setLocalSettings((prev) => ({ ...prev, mood }));
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    const testPhrase =
      localSettings.language === 'hindi'
        ? `नमस्ते! मैं आपकी AI साथी LYRA हूँ। मेरी आवाज़ और मूड सेटिंग्स अब बिल्कुल सही लग रही हैं। चलिए आज के लक्ष्य पर आगे बढ़ते हैं!`
        : localSettings.language === 'hinglish'
        ? `Hey! Main Lyra hoon. Aapki voice aur mood settings update ho chuki hain. Ready to make serious progress today!`
        : `Greetings! I am LYRA. Your vocal parameters and companion mood are calibrated and ready to navigate your track.`;

    await speakLyraSpeech(
      testPhrase,
      localSettings,
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false)
    );
  };

  const handleStopVoice = () => {
    stopLyraSpeech();
    setIsTestingVoice(false);
  };

  const handleSaveAndApply = () => {
    // Mask API key if newly entered
    let masked = localSettings.externalTTS.apiKeyMasked;
    if (localSettings.externalTTS.apiKeyRaw) {
      const raw = localSettings.externalTTS.apiKeyRaw.trim();
      masked = raw.length > 8 ? `${raw.slice(0, 4)}••••••••${raw.slice(-4)}` : '••••••••';
    }

    const finalSettings: LyraSettings = {
      ...localSettings,
      externalTTS: {
        ...localSettings.externalTTS,
        apiKeyMasked: masked,
      },
    };

    onSaveSettings(finalSettings);
    showToast('Lyra preferences saved successfully!');
    setTimeout(() => onClose(), 500);
  };

  const handleDisconnectExternal = () => {
    setLocalSettings((prev) => ({
      ...prev,
      externalTTS: {
        connected: false,
        provider: 'none',
        apiKeyMasked: '',
        apiKeyRaw: '',
        voiceId: '',
        model: '',
      },
    }));
    showToast('External TTS provider disconnected.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Reactive Avatar */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <LyraAvatar mood={localSettings.mood} size="sm" isSpeaking={isTestingVoice} />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">LYRA Customization</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI Companion
                </span>
                {localSettings.language === 'hindi' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                    Default: हिन्दी
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Personal development assistant preferences • Mood • Personality • Voice • Language • Speaking Style
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 5 Distinct Tabs: Mood, Personality, Voice, Language, Speaking Style */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-3 sm:px-4 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('mood')}
            className={`py-3 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'mood'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Mood
          </button>

          <button
            onClick={() => setActiveTab('personality')}
            className={`py-3 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'personality'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck size={14} /> Personality
          </button>

          <button
            onClick={() => setActiveTab('voice')}
            className={`py-3 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'voice'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 size={14} /> Voice & TTS
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`py-3 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'language'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Languages size={14} /> Language (हिन्दी)
          </button>

          <button
            onClick={() => setActiveTab('speaking_style')}
            className={`py-3 px-3 border-b-2 font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'speaking_style'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare size={14} /> Speaking Style
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: MOOD */}
          {activeTab === 'mood' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" /> Select Mood
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Lyra’s selected mood immediately influences her interactive avatar expression, conversational tone, and vocal nuance.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(
                    [
                      { id: 'Happy', label: 'Happy', icon: '✨', desc: 'Warm & celebratory' },
                      { id: 'Playful', label: 'Playful', icon: '💫', desc: 'Witty with jokes' },
                      { id: 'Calm', label: 'Calm', icon: '🌊', desc: 'Serene & centered' },
                      { id: 'Focused', label: 'Focused', icon: '🎯', desc: 'High structure & crisp' },
                      { id: 'Motivational', label: 'Motivational', icon: '🔥', desc: 'High-energy push' },
                      { id: 'Serious', label: 'Serious', icon: '🛡️', desc: 'Disciplined & direct' },
                      { id: 'Adaptive', label: 'Adaptive Mood', icon: '🔮', desc: 'Auto-syncs with track' },
                    ] as const
                  ).map((m) => {
                    const isSelected = localSettings.mood === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMoodSelect(m.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xl">{m.icon}</span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                          )}
                        </div>
                        <div>
                          <div className={`text-xs font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-200'}`}>
                            {m.label}
                          </div>
                          <div className="text-[10px] text-slate-400">{m.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reactive Avatar Preview for Selected Mood */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LyraAvatar mood={localSettings.mood} size="md" isSpeaking={isTestingVoice} />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">
                      Avatar Expression: <span className="text-indigo-400">{localSettings.mood}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Visual avatar eyes and ambient aura dynamically shift to reflect this state.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={isTestingVoice ? handleStopVoice : handleTestVoice}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {isTestingVoice ? <Square size={13} /> : <Play size={13} />}
                  {isTestingVoice ? 'Stop' : 'Test Mood Voice'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PERSONALITY */}
          {activeTab === 'personality' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
                  Personality Archetype
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Defines Lyra's underlying demeanor as your dedicated AI companion. She never pretends to be a biological human.
                </p>

                <div className="space-y-2">
                  {[
                    {
                      id: 'Warm & Encouraging',
                      title: 'Warm & Encouraging',
                      desc: 'Familiar, empathetic personal companion with gentle motivation and high psychological safety.',
                    },
                    {
                      id: 'Rigorous & Precise',
                      title: 'Rigorous & Precise',
                      desc: 'Deep STEM and engineering mentor tone. Direct critique of weak areas and clear dependencies.',
                    },
                    {
                      id: 'Philosophical & Direct',
                      title: 'Philosophical & Direct',
                      desc: 'Stoic orientation focusing on sovereign identity, execution integrity, and long-term trajectory.',
                    },
                    {
                      id: 'Dynamic Companion',
                      title: 'Dynamic Companion',
                      desc: 'Adapts seamlessly between lighthearted humor during practice and intense focus during deep work.',
                    },
                  ].map((p) => {
                    const isSelected = localSettings.personality === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings({ ...localSettings, personality: p.id as any })
                        }
                        className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-white">{p.title}</div>
                          <div className="text-[11px] text-slate-400">{p.desc}</div>
                        </div>
                        {isSelected ? (
                          <CheckCircle size={17} className="text-indigo-400 shrink-0 ml-2" />
                        ) : (
                          <Radio size={16} className="text-slate-600 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Anti-Slop Integrity Notice */}
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/25 flex items-start gap-2.5 text-xs text-indigo-300">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <span>
                  Lyra maintains complete honesty: if your goals require 60h/week and you only have 25h/week, she will directly flag the conflict rather than offering hollow encouragement.
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & TTS */}
          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Built-in AI Voices */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Built-in AI Voices (Gemini 3.8 Flash Lite TTS)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Kore', label: 'Kore', desc: 'Warm, balanced female' },
                    { id: 'Puck', label: 'Puck', desc: 'Energetic & bright' },
                    { id: 'Zephyr', label: 'Zephyr', desc: 'Calm & centered' },
                    { id: 'Fenrir', label: 'Fenrir', desc: 'Authoritative deep tone' },
                    { id: 'Charon', label: 'Charon', desc: 'Crisp & technical' },
                    { id: 'BrowserDefault', label: 'Device Engine', desc: 'System synthesis' },
                  ].map((v) => {
                    const isSelected = localSettings.voice === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, voice: v.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm'
                            : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="text-xs font-semibold">{v.label}</div>
                        <div className="text-[10px] text-slate-400">{v.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders: Speed, Pitch, Volume, Expressiveness */}
              <div className="space-y-3.5 pt-2 border-t border-slate-800">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Voice Speed</span>
                    <span className="font-semibold text-indigo-400">{localSettings.speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={localSettings.speed}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, speed: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0.75x</span>
                    <span>1.0x (Default)</span>
                    <span>1.5x</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Voice Pitch</span>
                    <span className="font-semibold text-indigo-400">{localSettings.pitch}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.2"
                    step="0.05"
                    value={localSettings.pitch}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, pitch: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Volume</span>
                    <span className="font-semibold text-indigo-400">
                      {Math.round(localSettings.volume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={localSettings.volume}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, volume: parseFloat(e.target.value) })
                    }
                    className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="text-xs font-medium text-slate-200">Expressiveness</div>
                    <div className="text-[10px] text-slate-400">Controls vocal inflection & enthusiasm</div>
                  </div>
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['Subtle', 'Natural', 'High'] as const).map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setLocalSettings({ ...localSettings, expressiveness: exp })}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          localSettings.expressiveness === exp
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-200">Auto-speak Responses</div>
                    <div className="text-[10px] text-slate-400">Automatically voice chat answers</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.autoSpeak}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, autoSpeak: e.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-200">Push-to-Talk Mode</div>
                    <div className="text-[10px] text-slate-400">Hold microphone button to speak</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.pushToTalk}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, pushToTalk: e.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* EXTERNAL TTS PROVIDER CONFIGURATION WITH API KEY MASKING */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-indigo-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      External Voice / TTS Provider
                    </span>
                  </div>
                  {localSettings.externalTTS.connected ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Connected
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-900 border border-slate-800">
                      Disconnected
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                  {/* Provider Dropdown */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Provider</label>
                    <select
                      value={localSettings.externalTTS.provider}
                      onChange={(e) =>
                        setLocalSettings({
                          ...localSettings,
                          externalTTS: {
                            ...localSettings.externalTTS,
                            provider: e.target.value as any,
                            connected: e.target.value !== 'none',
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="none">None (Use Gemini 3.8 Flash Lite TTS)</option>
                      <option value="elevenlabs">ElevenLabs (High-Fidelity Multilingual)</option>
                      <option value="openai">OpenAI Audio (TTS-1)</option>
                      <option value="azure">Azure Cognitive Speech</option>
                    </select>
                  </div>

                  {/* API Key with Masking */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      API Key (Masked & Server Proxied)
                    </label>
                    <div className="relative">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        placeholder={localSettings.externalTTS.apiKeyMasked || '••••••••••••••••'}
                        value={localSettings.externalTTS.apiKeyRaw || ''}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            externalTTS: {
                              ...localSettings.externalTTS,
                              apiKeyRaw: e.target.value,
                              connected: true,
                            },
                          })
                        }
                        className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                        title={showApiKey ? 'Hide Key' : 'Reveal Key'}
                      >
                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Keys are never exposed in client bundles or public requests.
                    </div>
                  </div>

                  {/* Voice ID and Model ID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Voice ID</label>
                      <input
                        type="text"
                        placeholder="e.g. 21m00Tcm4TlvDq8ikWAM"
                        value={localSettings.externalTTS.voiceId || ''}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            externalTTS: {
                              ...localSettings.externalTTS,
                              voiceId: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-300 block mb-1">Model ID</label>
                      <input
                        type="text"
                        placeholder="e.g. eleven_multilingual_v2"
                        value={localSettings.externalTTS.model || ''}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            externalTTS: {
                              ...localSettings.externalTTS,
                              model: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Test & Disconnect Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleTestVoice}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all"
                    >
                      <Volume2 size={13} /> Test Voice
                    </button>
                    {localSettings.externalTTS.connected && (
                      <button
                        type="button"
                        onClick={handleDisconnectExternal}
                        className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 text-xs font-medium transition-all"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LANGUAGE (HINDI DEFAULT) */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
                <Globe2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-300">
                    Default Language: हिन्दी (Hindi)
                  </div>
                  <p className="text-[11px] text-emerald-400/90 mt-0.5 leading-relaxed">
                    Lyra naturally communicates in Hindi by default. She speaks warmly, humorously, and expressively like a familiar companion, while remaining rigorous on technical terms.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'hindi',
                    name: 'हिन्दी (Hindi)',
                    badge: 'Default Language',
                    desc: 'Pure, fluent and warm conversational Hindi with accurate technical concepts.',
                    sample: '“नमस्ते! आज आपके पास 35 सवालों का अभ्यास और राफ्ट कंसेंसस का अध्ययन है।”',
                  },
                  {
                    id: 'hinglish',
                    name: 'Hinglish (Hindi + English)',
                    badge: 'Bilingual',
                    desc: 'Natural mix of Hindi phrasing and English technical terminology.',
                    sample: '“Hey! Aaj ka success track ekdum steady hai, let us start today’s practice.”',
                  },
                  {
                    id: 'english',
                    name: 'English (Global)',
                    badge: 'Standard',
                    desc: 'Crisp, articulate and direct engineering navigation dialogue.',
                    sample: '“Hello! Your trajectory index is currently 87/100. Review today’s objectives.”',
                  },
                  {
                    id: 'spanish',
                    name: 'Español (Spanish)',
                    badge: 'Multilingual',
                    desc: 'Natural Spanish conversational navigation.',
                    sample: '“¡Hola! Estoy lista para guiar tu progreso de hoy.”',
                  },
                ].map((lang) => {
                  const isSelected = localSettings.language === lang.id;
                  return (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, language: lang.id as any })}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/30'
                          : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{lang.name}</span>
                          <span className={`px-2 py-0.2 rounded-md text-[9px] font-semibold border ${
                            lang.id === 'hindi'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {lang.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{lang.desc}</div>
                        <div className="text-[10px] text-indigo-300 font-medium italic mt-0.5">
                          {lang.sample}
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle size={18} className="text-emerald-400 shrink-0 ml-2" />
                      ) : (
                        <Radio size={16} className="text-slate-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SPEAKING STYLE */}
          {activeTab === 'speaking_style' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
                  Conversational Speaking Style
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Controls how Lyra structures explanations, jokes, metaphors, and interaction cadence.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'Warm & Natural',
                      title: 'Warm & Natural',
                      desc: 'Conversational companion with occasional humor and genuine warmth.',
                    },
                    {
                      id: 'Direct & Crisp',
                      title: 'Direct & Crisp',
                      desc: 'Concise bullet points, zero fluff, immediate execution directives.',
                    },
                    {
                      id: 'Humorous & Casual',
                      title: 'Humorous & Casual',
                      desc: 'Witty banter, lighthearted jokes, keeps morale high during tough problem sets.',
                    },
                    {
                      id: 'Mentorship Tone',
                      title: 'Mentorship Tone',
                      desc: 'Goal-oriented guidance encouraging high personal accountability.',
                    },
                  ].map((style) => {
                    const isSelected = localSettings.speakingStyle === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() =>
                          setLocalSettings({ ...localSettings, speakingStyle: style.id as any })
                        }
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500/40'
                            : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-white">{style.title}</span>
                          {isSelected && <CheckCircle size={15} className="text-indigo-400" />}
                        </div>
                        <div className="text-[10px] text-slate-400 leading-relaxed">{style.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Humor & Formality Controls */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-slate-200">Humor & Friendly Banter</div>
                    <div className="text-[10px] text-slate-400">Frequency of occasional jokes and witty analogies</div>
                  </div>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['Minimal', 'Balanced', 'Playful'] as const).map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setHumorLevel(h)}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          humorLevel === h
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    <div className="text-xs font-medium text-slate-200">Formality Level</div>
                    <div className="text-[10px] text-slate-400">Tone relationship between you and Lyra</div>
                  </div>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['Casual Companion', 'Balanced Peer', 'Rigorous Mentor'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormality(f)}
                        className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${
                          formality === f
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
          <div className="text-xs text-emerald-400 font-medium">
            {toastMessage && <span>{toastMessage}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-1.5"
            >
              <CheckCircle size={14} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
