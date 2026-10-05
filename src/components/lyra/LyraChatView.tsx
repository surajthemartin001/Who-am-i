import React, { useState, useRef, useEffect } from 'react';
import { LyraSettings, ChatMessage, UserProfile, TrackMetrics, LyraState, LyraActionPayload } from '../../types';
import { LyraAvatar } from './LyraAvatar';
import { LyraMoodSelector } from './LyraMoodSelector';
import { sendLyraMessage, speakLyraSpeech, stopLyraSpeech } from '../../services/lyraService';
import { parseLyraActions, isApprovedUrl } from '../../services/lyraActionHandler';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Sparkles,
  Search,
  Brain,
  Zap,
  Globe2,
  Settings,
  Maximize2,
  Minimize2,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
  Shield,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface LyraChatViewProps {
  settings: LyraSettings;
  profile: UserProfile;
  trackMetrics: TrackMetrics;
  onUpdateSettings: (newSettings: LyraSettings) => void;
  onOpenSettingsModal: () => void;
  onOpenLiveVoice?: () => void;
  onNavigateSection?: (section: string) => void;
  onAddTask?: (task: any) => void;
}

export const LyraChatView: React.FC<LyraChatViewProps> = ({
  settings,
  profile,
  trackMetrics,
  onUpdateSettings,
  onOpenSettingsModal,
  onOpenLiveVoice,
  onNavigateSection,
  onAddTask,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      role: 'model',
      content:
        settings.language === 'hindi'
          ? `नमस्ते ${profile.name}! 🙏 मैं LYRA हूँ, आपकी बुद्धिमान परी साथी।\n\nमेरा जादुई वैंड आपके सक्सेस ट्रैक (${trackMetrics.label}) को दिशा दे रहा है। कोई भी सवाल पूछें, आज का अभ्यास शुरू करें, या मुझे कोई कार्य करने को कहें!`
          : `Hello ${profile.name}! I am LYRA, your magical navigation fairy. My wand is synchronized with your success track (${trackMetrics.label}). Ask me anything, or instruct me to take action on your plan!`,
      timestamp: 'Just now',
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [fairyState, setFairyState] = useState<LyraState>('idle');
  const [isLiveExpanded, setIsLiveExpanded] = useState(false);
  const [mode, setMode] = useState<'general' | 'high_thinking' | 'search_grounded' | 'fast'>('general');

  // Proposed pending action awaiting confirmation
  const [pendingAction, setPendingAction] = useState<LyraActionPayload | null>(null);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);

  // Wand sparkle emission trail animation state
  const [isWandEmitting, setIsWandEmitting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, fairyState, isWandEmitting]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = settings.language === 'hindi' ? 'hi-IN' : 'en-US';

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue(transcript);
          handleSend(transcript);
        }
        setFairyState('idle');
      };

      recog.onerror = () => {
        setFairyState('idle');
      };

      recog.onend = () => {
        setFairyState('idle');
      };

      recognitionRef.current = recog;
    }
  }, [settings.language]);

  const toggleListening = () => {
    if (fairyState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setFairyState('idle');
    } else {
      stopLyraSpeech();
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recog = new SpeechRecognition();
          recog.continuous = false;
          recog.interimResults = false;
          recog.lang = settings.language === 'hindi' ? 'hi-IN' : 'en-US';

          recog.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            if (transcript) {
              setInputValue(transcript);
              handleSend(transcript);
            }
            setFairyState('idle');
          };

          recog.onerror = () => {
            setFairyState('idle');
          };

          recog.onend = () => {
            setFairyState('idle');
          };

          recognitionRef.current = recog;
          recog.start();
          setFairyState('listening');
        }
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setFairyState('idle');
      }
    }
  };

  const handleSend = async (manualText?: string) => {
    const textToSend = manualText || inputValue;
    if (!textToSend.trim() || fairyState === 'thinking') return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setFairyState('thinking');
    setIsWandEmitting(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendLyraMessage({
        messages: history,
        mode,
        lyraSettings: settings,
        userContext: {
          name: profile.name,
          intensityMode: profile.desiredIntensity,
          trackStatus: trackMetrics.status,
          progressPercentage: trackMetrics.progressPercentage,
          topGoals: ['Distributed Systems', 'Cybersecurity', 'NEXORA Robotics'],
          weakAreas: ['Binary Exploitation', 'Non-linear Kinematics EKF'],
        },
      });

      // Parse safe actions from Lyra's text or intent
      const detectedAction = parseLyraActions(res.text || textToSend);
      if (detectedAction) {
        setPendingAction(detectedAction);
      }

      setFairyState('typing');

      // Brief wand emergence animation before message settles
      setTimeout(() => {
        setIsWandEmitting(false);
        const assistantMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          role: 'model',
          content: res.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          groundingMetadata: res.groundingMetadata,
          modelUsed: res.modelUsed,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        setFairyState('completed');

        // Auto-speak if enabled
        if (settings.autoSpeak) {
          setFairyState('speaking');
          speakLyraSpeech(
            res.text,
            settings,
            () => setFairyState('speaking'),
            () => setFairyState('idle')
          );
        } else {
          setTimeout(() => setFairyState('idle'), 1800);
        }
      }, 550);
    } catch {
      setFairyState('error');
      setIsWandEmitting(false);
      setTimeout(() => setFairyState('idle'), 2500);
    }
  };

  const handlePlayVoice = (text: string) => {
    if (fairyState === 'speaking') {
      stopLyraSpeech();
      setFairyState('idle');
    } else {
      setFairyState('speaking');
      speakLyraSpeech(
        text,
        settings,
        () => setFairyState('speaking'),
        () => setFairyState('idle')
      );
    }
  };

  // Safe Action Execution
  const handleExecuteAction = (action: LyraActionPayload) => {
    if (action.type === 'navigate' && action.target && onNavigateSection) {
      onNavigateSection(action.target);
      setActionSuccessNotice(`Navigated to ${action.target.toUpperCase()}`);
    } else if (action.type === 'create_task' && action.data && onAddTask) {
      onAddTask({
        id: `task-${Date.now()}`,
        title: action.data.title,
        topic: 'Lyra Assigned',
        category: action.data.category || 'learning',
        estimatedMinutes: action.data.minutes || 45,
        priority: 'High',
        completed: false,
        scheduledTime: '18:00',
      });
      setActionSuccessNotice(`Added task "${action.data.title}" to Today's Plan`);
    } else if (action.type === 'set_reminder') {
      setActionSuccessNotice(`Reminder created: "${action.data.reminder}"`);
    } else if (action.type === 'open_approved_url' && action.target) {
      const url = action.target.startsWith('http') ? action.target : `https://${action.target}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setActionSuccessNotice(`Opened approved reference: ${action.target}`);
    }
    setPendingAction(null);
    setTimeout(() => setActionSuccessNotice(null), 4000);
  };

  return (
    <div
      className={`rounded-3xl bg-slate-950 border border-slate-800 flex flex-col transition-all duration-300 ${
        isLiveExpanded ? 'fixed inset-4 z-50 shadow-2xl' : 'h-[660px]'
      }`}
    >
      {/* Top Lyra Bar */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Fairy Avatar with wand */}
          <LyraAvatar
            mood={settings.mood}
            state={fairyState}
            size="md"
            onClick={onOpenSettingsModal}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">LYRA</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Magical Fairy AI
              </span>
              <span className="text-[10px] text-slate-400">
                Lang: <strong className="text-emerald-400 uppercase">{settings.language}</strong>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fairy companion with glowing wand • Natural voice sync • Default: हिन्दी
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Start Live Voice Call Button */}
          {onOpenLiveVoice && (
            <button
              onClick={onOpenLiveVoice}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              title="Start Live Voice Conversation (Hindi Default)"
            >
              <PhoneCall size={13} /> Live Voice Call
            </button>
          )}

          {/* Quick Mood Button */}
          <LyraMoodSelector
            currentMood={settings.mood}
            onSelectMood={(m) => onUpdateSettings({ ...settings, mood: m })}
          />

          {/* Intelligence Model Mode Switcher */}
          <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setMode('general')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mode === 'general' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
              title="Balanced Gemini 3.5 Flash"
            >
              Balanced
            </button>
            <button
              onClick={() => setMode('high_thinking')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mode === 'high_thinking'
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Gemini 3.1 Pro Preview with ThinkingLevel HIGH"
            >
              <Brain size={12} /> High Thinking
            </button>
            <button
              onClick={() => setMode('search_grounded')}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                mode === 'search_grounded'
                  ? 'bg-cyan-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Gemini 3.5 Flash with Google Search Grounding"
            >
              <Search size={12} /> Search
            </button>
          </div>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Lyra Preferences (Mood, Personality, Voice, Language, Style)"
          >
            <Settings size={15} />
          </button>

          {/* Expand Button */}
          <button
            onClick={() => setIsLiveExpanded(!isLiveExpanded)}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          >
            {isLiveExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Action Execution Success Notice */}
      {actionSuccessNotice && (
        <div className="mx-4 mt-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <LyraAvatar mood={settings.mood} size="xs" state={fairyState} />
              )}

              <div
                className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounding Web Links if present */}
                {m.groundingMetadata?.webSearchQueries && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-cyan-300 flex items-center gap-1">
                    <Search size={10} /> Grounded with Google Search: {m.groundingMetadata.webSearchQueries.join(', ')}
                  </div>
                )}

                {/* Audio Play & Timestamp */}
                <div className="flex items-center justify-between pt-1 text-[10px] opacity-70">
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handlePlayVoice(m.content)}
                      className="hover:opacity-100 flex items-center gap-1 transition-opacity text-slate-300"
                      title="Speak Message"
                    >
                      <Volume2 size={12} /> Listen
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Wand Preparing / Response Emergence Beam Effect */}
        {(fairyState === 'thinking' || isWandEmitting) && (
          <div className="flex items-start gap-3 animate-in fade-in duration-300">
            <LyraAvatar mood={settings.mood} size="xs" state="thinking" />
            <div className="relative p-4 rounded-3xl bg-slate-900/90 border border-indigo-500/40 text-xs text-indigo-200 space-y-1.5 shadow-lg shadow-indigo-500/10">
              {/* Wand emission beam indicator */}
              <div className="flex items-center gap-2 font-medium">
                <Sparkles size={14} className="text-amber-300 animate-spin" />
                <span>
                  {mode === 'high_thinking'
                    ? 'Lyra is rotating her wand with deep thinking...'
                    : 'Lyra is casting your response from her star wand...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Sparkling trail emerging into message...</span>
              </div>
            </div>
          </div>
        )}

        {/* Safe Action Confirmation Card */}
        {pendingAction && (
          <div className="p-4 rounded-3xl bg-indigo-950/40 border border-indigo-500/50 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
              <Shield size={16} />
              <span>Safe Action Request: {pendingAction.type.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              {pendingAction.confirmationMessage ||
                `Would you like Lyra to execute action: ${pendingAction.type}?`}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setPendingAction(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs"
              >
                Dismiss
              </button>
              <button
                onClick={() => handleExecuteAction(pendingAction)}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                Approve & Execute <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-1.5 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {[
          'आज मुझे क्या पढ़ना चाहिए?',
          'Add task: Raft snapshot compaction benchmark',
          'Navigate to Goals',
          'How far am I from my target destination?',
          'What should I revise today?',
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Bottom Input Console */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-2xl transition-all ${
              fairyState === 'listening'
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
            }`}
            title={fairyState === 'listening' ? 'Stop Listening' : 'Speak to Lyra (Microphone)'}
          >
            {fairyState === 'listening' ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              settings.language === 'hindi'
                ? 'Lyra से कुछ भी पूछें या कार्य बताएं... (उदा: आज का प्लान क्या है?)'
                : 'Ask Lyra anything or command safe actions (e.g. Navigate to goals)...'
            }
            className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || fairyState === 'thinking'}
            className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all shadow-md shadow-indigo-500/20"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
