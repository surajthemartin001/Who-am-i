import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LyraSettings, LyraState, UserProfile, TrackMetrics } from '../../types';
import { LyraAvatar } from './LyraAvatar';
import { sendLyraMessage, speakLyraSpeech, stopLyraSpeech, sendLyraAudioVoice } from '../../services/lyraService';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Sparkles,
  Zap,
  Hand,
  Video,
  VideoOff,
  Camera,
  Send,
  Radio,
  CheckCircle2,
  AlertCircle,
  Activity,
  Sliders,
  Clock,
  Gauge,
} from 'lucide-react';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LyraSettings;
  profile: UserProfile;
  trackMetrics: TrackMetrics;
  onUpdateSettings: (newSettings: LyraSettings) => void;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  settings,
  profile,
  trackMetrics,
  onUpdateSettings,
}) => {
  // Call mode: 'voice' | 'video'
  const [callMode, setCallMode] = useState<'voice' | 'video'>('voice');

  // State-managed Listening ON/OFF toggle (Default: ON)
  const [isListeningActive, setIsListeningActive] = useState<boolean>(true);

  // Audio & Hardware Connection State
  const [micPermission, setMicPermission] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting'>('connecting');
  const [fairyState, setFairyState] = useState<LyraState>('idle');

  // Transcripts & Conversation
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [liveReplies, setLiveReplies] = useState<Array<{ sender: 'user' | 'lyra'; text: string; time: string }>>([]);
  const [manualText, setManualText] = useState<string>('');

  // Video Call State
  const [userCameraActive, setUserCameraActive] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  // Audio & Language Controls
  const [speakerVolume, setSpeakerVolume] = useState<number>(settings.volume || 1.0);
  const [currentLang, setCurrentLang] = useState<'hindi' | 'hinglish' | 'english'>(
    settings.language === 'english' ? 'english' : settings.language === 'hinglish' ? 'hinglish' : 'hindi'
  );

  // Audio Engine Cadence Settings (Natural Conversational Pace, neither too fast nor too slow)
  const [playbackRate, setPlaybackRate] = useState<number>(settings.speed || 1.0);
  const [pauseDurationMs, setPauseDurationMs] = useState<number>(1500);
  const [isCadencePanelOpen, setIsCadencePanelOpen] = useState<boolean>(false);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // Web Audio API High-Performance Nodes & Hardware Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Video Call Refs
  const videoStreamRef = useRef<MediaStream | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  // Speech Recognition & State Refs
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningActiveRef = useRef<boolean>(true);
  const isRecognizingRef = useRef<boolean>(false);
  const isOpenRef = useRef<boolean>(isOpen);
  const silenceTimerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const lastRecognizedTextRef = useRef<string>('');
  const animFrameRef = useRef<number | null>(null);

  const pauseDurationRef = useRef<number>(1500);
  const playbackRateRef = useRef<number>(1.0);

  // Synchronize dynamic refs
  isListeningActiveRef.current = isListeningActive;
  isOpenRef.current = isOpen;
  pauseDurationRef.current = pauseDurationMs;
  playbackRateRef.current = playbackRate;

  // Auto scroll transcript to latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveReplies, currentTranscript]);

  // Call duration counter
  useEffect(() => {
    if (isOpen) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [isOpen]);

  // Clean interruption / barge-in handler
  const handleInterrupt = useCallback(() => {
    stopLyraSpeech();
    isSpeakingRef.current = false;
    if (isListeningActiveRef.current) {
      setFairyState('listening');
    } else {
      setFairyState('idle');
    }
  }, []);

  // Safe SpeechRecognition lifecycle (Instantiates a fresh instance to avoid WebKit reuse bug)
  const safeStartRecognition = useCallback(() => {
    if (typeof window === 'undefined' || !isListeningActiveRef.current || !isOpenRef.current) return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    // Terminate existing instance cleanly before creating a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recog = new SpeechRec();
      recog.continuous = true;
      recog.interimResults = true;
      recog.maxAlternatives = 1;
      recog.lang = currentLang === 'hindi' ? 'hi-IN' : currentLang === 'hinglish' ? 'hi-IN' : 'en-US';

      recog.onstart = () => {
        isRecognizingRef.current = true;
        if (!isSpeakingRef.current && isListeningActiveRef.current) {
          setFairyState('listening');
        }
      };

      recog.onresult = (event: any) => {
        if (!isListeningActiveRef.current) return;

        let interim = '';
        let finalPhrase = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalPhrase += trans;
          } else {
            interim += trans;
          }
        }

        const currentSaid = (finalPhrase || interim).trim();
        if (currentSaid) {
          setCurrentTranscript(currentSaid);
          lastRecognizedTextRef.current = currentSaid;

          // Barge-in: if user spoke while Lyra was speaking, interrupt immediately
          if (isSpeakingRef.current) {
            handleInterrupt();
          }

          // Low-latency silence detector: auto-send after conversational pause (calibrated by audio engine settings)
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (lastRecognizedTextRef.current.trim() && isListeningActiveRef.current) {
              handleUserSpeech(lastRecognizedTextRef.current.trim());
              lastRecognizedTextRef.current = '';
              setCurrentTranscript('');
            }
          }, pauseDurationRef.current);
        }
      };

      recog.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicPermission('denied');
        }
        // Gracefully ignore harmless no-speech or aborted events
        isRecognizingRef.current = false;
      };

      recog.onend = () => {
        isRecognizingRef.current = false;
        // Always instantiate a fresh recognizer on end if still active
        if (isOpenRef.current && isListeningActiveRef.current) {
          setTimeout(() => {
            if (isOpenRef.current && isListeningActiveRef.current && !isRecognizingRef.current) {
              safeStartRecognition();
            }
          }, 140);
        } else {
          setFairyState('idle');
        }
      };

      recognitionRef.current = recog;
      recog.start();
    } catch (err) {
      console.warn('Speech recognition startup exception:', err);
    }
  }, [currentLang, handleInterrupt]);

  // HIGH-PERFORMANCE WEB AUDIO API CONTEXT INITIALIZER
  const initHighPerformanceAudio = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // 1. Acquire MediaStream with noise-suppression and echo-cancellation
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      mediaStreamRef.current = stream;
      setMicPermission('granted');

      // 2. Instantiate high-performance low-latency AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });
      audioContextRef.current = audioCtx;

      // 3. Create MediaStreamSource from hardware stream
      const source = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // 4. Create GainNode to directly control audio processing volume/mute state
      const gainNode = audioCtx.createGain();
      gainNode.gain.setValueAtTime(isListeningActiveRef.current ? 1.0 : 0.0, audioCtx.currentTime);
      gainNodeRef.current = gainNode;

      // 5. Create BiquadFilter (high-pass at 80Hz) to filter out DC rumble, table bumps & breath pops
      const highPassFilter = audioCtx.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.setValueAtTime(80, audioCtx.currentTime);
      highPassFilter.Q.setValueAtTime(0.707, audioCtx.currentTime);
      filterNodeRef.current = highPassFilter;

      // 6. Create high-resolution AnalyserNode for rapid real-time VAD & decibel tracking
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.25;
      analyserRef.current = analyser;

      // 7. Connect audio processing graph:
      // Source -> GainNode -> HighPassFilter -> AnalyserNode
      source.connect(gainNode);
      gainNode.connect(highPassFilter);
      highPassFilter.connect(analyser);

      // Ensure AudioContext is running
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      // 8. Real-time high-performance VAD processing loop
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      const timeData = new Uint8Array(analyser.fftSize);

      const processAudio = () => {
        if (!analyserRef.current || !isOpenRef.current) return;

        if (isListeningActiveRef.current) {
          analyserRef.current.getByteFrequencyData(freqData);
          analyserRef.current.getByteTimeDomainData(timeData);

          // Calculate Root-Mean-Square (RMS) amplitude for accurate vocal intensity
          let sumSquares = 0;
          for (let i = 0; i < timeData.length; i++) {
            const normalizedSample = (timeData[i] - 128) / 128;
            sumSquares += normalizedSample * normalizedSample;
          }
          const rms = Math.sqrt(sumSquares / timeData.length);
          const volumePercent = Math.min(100, Math.round(rms * 280));
          setMicVolume(volumePercent);

          // Vocal energy calculation (Bins concentrated in ~200Hz - ~3400Hz speech band)
          let vocalSum = 0;
          const vocalStartBin = 2; // ~375Hz
          const vocalEndBin = Math.min(freqData.length, 24); // ~3750Hz
          for (let i = vocalStartBin; i < vocalEndBin; i++) {
            vocalSum += freqData[i];
          }
          const vocalAvg = vocalSum / (vocalEndBin - vocalStartBin);

          // Low-latency Barge-in: if Lyra is speaking and user vocal energy exceeds threshold, cut off Lyra in 0ms!
          if (isSpeakingRef.current && vocalAvg > 24) {
            handleInterrupt();
          }
        } else {
          setMicVolume(0);
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      animFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err: any) {
      console.warn('High-performance Web Audio initialization notice:', err);
      setMicPermission('denied');
    }
  }, [handleInterrupt]);

  // STATE-MANAGED LISTENING ON/OFF TOGGLE:
  // Directly controls media stream activity and gain WITHOUT destroying the hardware connection!
  const setListeningState = useCallback((targetActive: boolean) => {
    setIsListeningActive(targetActive);
    isListeningActiveRef.current = targetActive;

    // 1. Directly control MediaStream activity without stopping/destroying the tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = targetActive;
      });
    }

    // 2. Smoothly ramp Web Audio API GainNode to avoid audio pops/clicks
    if (gainNodeRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      gainNodeRef.current.gain.cancelScheduledValues(now);
      // Fast 5ms ramp for seamless transition
      gainNodeRef.current.gain.setTargetAtTime(targetActive ? 1.0 : 0.0, now, 0.005);
    }

    if (!targetActive) {
      // Complete Mute / Listening OFF: Halt speech recognition and reset state
      clearTimeout(silenceTimerRef.current);
      setMicVolume(0);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      isRecognizingRef.current = false;
      setFairyState('idle');
      setCurrentTranscript('');
    } else {
      // Listening ON: Resume AudioContext and restart speech recognition immediately
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
      setFairyState('listening');
      safeStartRecognition();
    }
  }, [safeStartRecognition]);

  const toggleListening = () => {
    setListeningState(!isListeningActive);
  };

  // Main Lifecycle Trigger on modal open
  useEffect(() => {
    if (!isOpen) {
      handleEndCall();
      return;
    }

    const welcome =
      currentLang === 'hindi'
        ? `नमस्ते ${profile.name}! 🙏 मैं LYRA हूँ। मेरा जादुई वैंड आपके सक्सेस ट्रैक से जुड़ा है। मैं सुन रही हूँ, आप जो चाहें पूछ सकते हैं!`
        : currentLang === 'hinglish'
        ? `Hey ${profile.name}! LYRA here. Main aapke success track se connected hoon. Speak freely, I am listening!`
        : `Hello ${profile.name}! I am LYRA. My magical wand is synced to your success track. I am listening, speak whenever you are ready!`;

    setLiveReplies([
      {
        sender: 'lyra',
        text: welcome,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    setConnectionStatus('connecting');

    // Initialize Web Audio API and Speech Recognition
    initHighPerformanceAudio().then(() => {
      setConnectionStatus('connected');
      if (isListeningActiveRef.current) {
        safeStartRecognition();
      }
    });

    return () => {
      handleEndCall();
    };
  }, [isOpen, currentLang]);

  // Language switch
  const handleLanguageSwitch = (newLang: 'hindi' | 'hinglish' | 'english') => {
    setCurrentLang(newLang);
    onUpdateSettings({ ...settings, language: newLang });
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setTimeout(() => {
      if (isListeningActiveRef.current && isOpenRef.current) {
        safeStartRecognition();
      }
    }, 120);
  };

  // User Speech processing with low-latency generation and instant voice synthesis
  const handleUserSpeech = async (spokenText: string) => {
    if (!spokenText.trim()) return;

    handleInterrupt();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLiveReplies((prev) => [...prev, { sender: 'user', text: spokenText, time: timeStr }]);
    setCurrentTranscript('');
    setFairyState('thinking');

    try {
      const history = liveReplies.slice(-4).map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        content: m.text,
      }));
      history.push({ role: 'user', content: spokenText });

      // Fast response via Gemini 3.1 Flash Lite
      const res = await sendLyraMessage({
        messages: history,
        mode: 'fast',
        lyraSettings: { ...settings, language: currentLang },
        userContext: {
          name: profile.name,
          intensityMode: profile.desiredIntensity,
          trackStatus: trackMetrics.status,
          progressPercentage: trackMetrics.progressPercentage,
          topGoals: ['Software Architecture', 'NEXORA Systems'],
          weakAreas: ['Focus Drift'],
        },
      });

      const replyText =
        res.text ||
        (currentLang === 'hindi'
          ? 'हाँ, मैं आपकी बात समझ गई। आपका ट्रैक बिल्कुल सही चल रहा है!'
          : currentLang === 'hinglish'
          ? 'Haan, bilkul sahi! Let us keep moving forward on your path.'
          : 'I hear you clearly! Keep pushing forward on your track.');

      setLiveReplies((prev) => [...prev, { sender: 'lyra', text: replyText, time: timeStr }]);

      // Spoken response with instant low-latency audio and mouth animation
      isSpeakingRef.current = true;
      setFairyState('speaking');

      await speakLyraSpeech(
        replyText,
        {
          ...settings,
          voice: 'HarmonicHybrid',
          speed: playbackRateRef.current,
          pitch: 0.96,
          volume: speakerVolume,
          language: currentLang,
        },
        () => {
          isSpeakingRef.current = true;
          setFairyState('speaking');
        },
        () => {
          isSpeakingRef.current = false;
          setFairyState(isListeningActiveRef.current ? 'listening' : 'idle');
        },
        false // Allow server high-fidelity Gemini TTS or harmonic client fallback
      );
    } catch {
      setFairyState(isListeningActiveRef.current ? 'listening' : 'idle');
    }
  };

  // Video Call: User Camera Toggle
  const toggleUserCamera = async () => {
    if (userCameraActive) {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
      setUserCameraActive(false);
    } else {
      try {
        const vStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        });
        videoStreamRef.current = vStream;
        setUserCameraActive(true);
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = vStream;
        }
      } catch (e) {
        setModalNotice('Camera device unavailable or permission declined. Holographic fairy visual will represent stream.');
        setTimeout(() => setModalNotice(null), 4000);
      }
    }
  };

  // Complete cleanup on call termination (Only here do we tear down streams and close AudioContext)
  const handleEndCall = () => {
    stopLyraSpeech();
    isSpeakingRef.current = false;
    clearTimeout(silenceTimerRef.current);
    clearInterval(callTimerRef.current);

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    // Stop physical hardware audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Stop video tracks
    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((t) => t.stop());
      videoStreamRef.current = null;
    }

    // Close Web Audio API AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    onClose();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200 ${
        callMode === 'video' ? 'p-0 w-screen h-screen' : 'p-2 sm:p-4'
      }`}
    >
      <div
        className={`relative bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          callMode === 'video'
            ? 'w-full h-full max-w-none max-h-none rounded-none border-none'
            : 'w-full max-w-4xl rounded-3xl h-[95vh] max-h-[820px]'
        }`}
      >
        {/* Top Header / Telemetry Bar */}
        <div
          className={`px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-900/85 flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            callMode === 'video' ? 'absolute top-0 left-0 right-0 z-30 bg-slate-950/80 backdrop-blur-md' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>LYRA {callMode === 'video' ? 'Full-Screen Holographic Video Call' : 'Live Voice Call'}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {formatDuration(callDuration)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline flex items-center gap-1">
                  <Activity size={10} /> Web Audio API Active (&lt;100ms)
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>Real-Time Non-Destructive Stream</span>
                <span>•</span>
                <span className={isListeningActive ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {isListeningActive ? 'Listening Active' : 'Listening Suspended (Stream Warm)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher: Voice Call vs Full-Screen Video Call */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setCallMode('voice')}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  callMode === 'voice'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Voice Call
              </button>
              <button
                onClick={() => setCallMode('video')}
                className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                  callMode === 'video'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video size={13} /> Full-Screen Video Call
              </button>
            </div>

            {/* Language Quick-Switch */}
            <div className="hidden sm:flex bg-slate-950 p-0.5 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => handleLanguageSwitch('hindi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'hindi' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => handleLanguageSwitch('hinglish')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'hinglish' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hinglish
              </button>
              <button
                onClick={() => handleLanguageSwitch('english')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  currentLang === 'english' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>

            {/* Audio Engine Cadence & Settings Button */}
            <button
              type="button"
              onClick={() => setIsCadencePanelOpen(!isCadencePanelOpen)}
              className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isCadencePanelOpen
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
              }`}
              title="Adjust Conversational Cadence (Playback Rate & Pause Duration)"
            >
              <Sliders size={13} className={isCadencePanelOpen ? 'text-white' : 'text-indigo-400'} />
              <span className="hidden sm:inline">Cadence: {playbackRate.toFixed(2)}x / {pauseDurationMs}ms</span>
            </button>

            {/* End Call / Close button */}
            <button
              onClick={handleEndCall}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              title="Close Call"
            >
              ✕
            </button>
          </div>
        </div>

        {/* In-Modal Notification Banner */}
        {modalNotice && (
          <div className="px-4 py-2 bg-amber-950/80 border-b border-amber-500/40 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-400 shrink-0" />
              <span>{modalNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setModalNotice(null)}
              className="text-amber-300 hover:text-white text-xs font-bold px-2 py-0.5 rounded"
            >
              ✕
            </button>
          </div>
        )}

        {/* AUDIO ENGINE CADENCE & PLAYBACK SETTINGS PANEL */}
        {isCadencePanelOpen && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-indigo-500/30 text-slate-200 text-xs shadow-xl backdrop-blur-xl animate-in slide-in-from-top-2 duration-150 z-40">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Gauge size={15} className="text-indigo-400" />
                <span className="font-bold text-white text-xs sm:text-sm">Audio Engine & Conversational Cadence</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Harmonic Hybrid Voice ✨
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCadencePanelOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded-lg hover:bg-slate-800"
              >
                Done ✓
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-[11px] text-slate-400 font-medium">Presets:</span>
              <button
                type="button"
                onClick={() => {
                  setPlaybackRate(1.0);
                  setPauseDurationMs(1500);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  playbackRate === 1.0 && pauseDurationMs === 1500
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                🌟 Natural Conversational (1.0x / 1.5s)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaybackRate(1.1);
                  setPauseDurationMs(1000);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  playbackRate === 1.1 && pauseDurationMs === 1000
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                ⚡ Snappy & Rapid (1.1x / 1.0s)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaybackRate(0.95);
                  setPauseDurationMs(2000);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                  playbackRate === 0.95 && pauseDurationMs === 2000
                    ? 'bg-indigo-600 border-indigo-400 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                🧘 Relaxed & Thoughtful (0.95x / 2.0s)
              </button>
            </div>

            {/* Granular Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              {/* Playback Rate Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Activity size={12} className="text-indigo-400" />
                    <span>Playback Speed (बात करने की गति)</span>
                  </span>
                  <span className="font-bold text-indigo-400 font-mono">
                    {playbackRate.toFixed(2)}x {playbackRate === 1.0 ? '(Normal Normal Speed)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={playbackRate}
                  onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.8x (धीमी)</span>
                  <span>1.0x (सामान्य संतुलित)</span>
                  <span>1.3x (तेज़)</span>
                </div>
              </div>

              {/* Pause Duration Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-400" />
                    <span>Pause Detection Duration (विराम समय)</span>
                  </span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {pauseDurationMs}ms ({pauseDurationMs === 1500 ? 'Natural Cadence' : `${(pauseDurationMs / 1000).toFixed(1)}s`})
                  </span>
                </div>
                <input
                  type="range"
                  min="800"
                  max="2400"
                  step="100"
                  value={pauseDurationMs}
                  onChange={(e) => setPauseDurationMs(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>800ms (तुरंत रिप्लाई)</span>
                  <span>1500ms (नेचुरल)</span>
                  <span>2400ms (विचारशील)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CENTER STAGE: LARGE LYRA VISUAL WITH GLOWING WAND & ANIMATED MOUTH */}
        <div
          className={`relative flex flex-col items-center justify-center transition-all overflow-hidden ${
            callMode === 'video'
              ? 'flex-1 w-full h-full py-16 px-4 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-[#07090e] pb-32 sm:pb-28'
              : 'py-6 sm:py-8 bg-gradient-to-b from-slate-900/60 to-slate-950 min-h-[260px] border-b border-slate-900'
          }`}
        >
          {/* Cybernetic Background Grid & Celestial Lighting Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#6366f1_1.2px,transparent_1.2px)] [background-size:20px_20px]" />
          {callMode === 'video' && (
            <>
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
              <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
            </>
          )}

          {/* Holographic Watermark in Video Mode */}
          {callMode === 'video' && (
            <div className="absolute top-16 sm:top-14 left-4 text-[10px] text-cyan-400 font-mono flex items-center gap-2 opacity-90 pointer-events-none z-20">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>FULL-SCREEN HOLOGRAPHIC QUANTUM LINK • 60 FPS • WEB AUDIO VAD ACTIVE</span>
            </div>
          )}

          {/* Centerpiece Container */}
          <div className="relative flex items-center justify-center my-auto">
            {/* Dynamic Soundwave Rings radiating when speaking */}
            {fairyState === 'speaking' && (
              <>
                <div className="absolute w-64 h-64 sm:w-96 sm:h-96 rounded-full border border-indigo-400/40 animate-ping pointer-events-none" />
                <div className="absolute w-52 h-52 sm:w-72 sm:h-72 rounded-full border border-purple-400/35 animate-pulse pointer-events-none" />
                <div className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full border border-cyan-400/30 animate-ping pointer-events-none duration-1000" />
              </>
            )}

            {/* Glowing Emerald VAD Listening Rings matching user mic volume in real-time */}
            {fairyState === 'listening' && (
              <>
                <div
                  className="absolute rounded-full border border-emerald-400/50 transition-all duration-75 pointer-events-none"
                  style={{
                    width: `${callMode === 'video' ? 220 + micVolume * 1.8 : 160 + micVolume * 1.25}px`,
                    height: `${callMode === 'video' ? 220 + micVolume * 1.8 : 160 + micVolume * 1.25}px`,
                    opacity: 0.25 + (micVolume / 100) * 0.75,
                  }}
                />
                <div
                  className="absolute rounded-full border border-teal-400/30 transition-all duration-100 pointer-events-none"
                  style={{
                    width: `${callMode === 'video' ? 260 + micVolume * 2.2 : 190 + micVolume * 1.5}px`,
                    height: `${callMode === 'video' ? 260 + micVolume * 2.2 : 190 + micVolume * 1.5}px`,
                    opacity: 0.15 + (micVolume / 100) * 0.5,
                  }}
                />
              </>
            )}

            {/* Large Hero LYRA Fairy Avatar with glowing wand & natural animated mouth */}
            <div className={`relative p-3 rounded-full bg-slate-950/85 shadow-2xl border ${callMode === 'video' ? 'border-indigo-500/40 ring-4 ring-indigo-500/20 scale-110 sm:scale-125' : 'border-indigo-500/20'}`}>
              <LyraAvatar
                mood={settings.mood}
                state={fairyState}
                size="hero"
              />
            </div>
          </div>

          {/* Interactive State Badge */}
          <div className="mt-4 flex items-center gap-2 z-10">
            {fairyState === 'speaking' && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/25 text-indigo-200 border border-indigo-500/40 flex items-center gap-2 shadow-xl animate-pulse">
                <Sparkles size={14} className="text-amber-300 animate-spin" />
                <span>LYRA is speaking... (Mouth synchronized with speech)</span>
              </span>
            )}
            {fairyState === 'listening' && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 flex items-center gap-2 shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>LYRA is actively listening... Speak naturally</span>
              </span>
            )}
            {fairyState === 'thinking' && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-500/25 text-amber-200 border border-amber-500/40 flex items-center gap-2 shadow-xl">
                <Zap size={14} className="text-amber-300 animate-spin" />
                <span>Preparing response from glowing star wand...</span>
              </span>
            )}
            {fairyState === 'idle' && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Listening is currently PAUSED. MediaStream is warmed and ready.
              </span>
            )}
          </div>

          {/* Real-time Web Audio API Decibel Level & VU Frequency Meter */}
          <div className="mt-3 flex items-center gap-2.5 z-10">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
              <Mic size={11} className={micVolume > 20 ? 'text-emerald-400' : 'text-slate-500'} />
              <span>Web Audio Sensor:</span>
            </span>
            <div className="w-32 sm:w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex items-center">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  micVolume > 35 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : micVolume > 15 ? 'bg-indigo-400' : 'bg-slate-700'
                }`}
                style={{ width: `${isListeningActive ? micVolume : 0}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-300 w-12 text-right">
              {isListeningActive ? `${micVolume}%` : 'MUTED'}
            </span>
          </div>

          {/* Floating Video Subtitles / Live Captions in Full-Screen Video Mode */}
          {callMode === 'video' && (
            <div className="absolute bottom-28 sm:bottom-24 left-4 right-4 max-w-xl mx-auto z-20 pointer-events-none text-center">
              {fairyState === 'speaking' && liveReplies.length > 0 && (
                <div className="inline-block p-4 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-indigo-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold mb-1 flex items-center justify-center gap-1.5">
                    <Sparkles size={11} className="text-amber-300" />
                    <span>LYRA SPEAKING</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                    {liveReplies[liveReplies.length - 1]?.text}
                  </p>
                </div>
              )}
              {currentTranscript && (
                <div className="inline-block p-3.5 rounded-2xl bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/50 shadow-2xl animate-pulse">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold mb-0.5 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>YOU ARE SAYING</span>
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-100 italic">
                    "{currentTranscript}"
                  </p>
                </div>
              )}
              {fairyState === 'listening' && !currentTranscript && (
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 font-medium shadow-md">
                  ✨ LYRA is viewing your video call and listening... Speak to her directly!
                </div>
              )}
            </div>
          )}

          {/* Video PIP Corner Box (In Video Call Mode) */}
          {callMode === 'video' && (
            <div className="absolute top-16 right-4 sm:top-14 sm:right-6 w-32 sm:w-44 h-24 sm:h-28 rounded-2xl bg-slate-900/95 border border-indigo-500/30 overflow-hidden shadow-2xl flex items-center justify-center z-20">
              {userCameraActive ? (
                <video
                  ref={videoElementRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Holographic User Avatar representation when camera is off */
                <div className="text-center p-2 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg mb-1 relative">
                    {profile.name.slice(0, 1)}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border border-slate-950" />
                  </div>
                  <div className="text-[10px] text-slate-300 font-semibold truncate max-w-[110px]">
                    {profile.name}
                  </div>
                  <div className="text-[8px] text-cyan-400 font-mono">Hologram Feed</div>
                </div>
              )}

              {/* Camera Switcher Button on PIP */}
              <button
                onClick={toggleUserCamera}
                className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/70 hover:bg-black text-slate-200 hover:text-white transition-all"
                title={userCameraActive ? 'Turn Off Physical Camera' : 'Turn On Physical Camera'}
              >
                <Camera size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript Stream (Shown in Voice Call Mode) */}
        {callMode === 'voice' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-slate-950/90">
            {liveReplies.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'lyra' && (
                  <LyraAvatar mood={settings.mood} size="xs" state={fairyState} />
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                    m.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <div>{m.text}</div>
                  <div className="text-[9px] opacity-60 text-right">{m.time}</div>
                </div>
              </div>
            ))}

            {/* User Live Interim Transcript */}
            {currentTranscript && (
              <div className="flex justify-end items-center gap-2">
                <div className="max-w-[75%] p-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 text-indigo-100 text-xs sm:text-sm italic flex items-center gap-2 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>"{currentTranscript}"</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (currentTranscript.trim()) {
                      handleUserSpeech(currentTranscript.trim());
                      setCurrentTranscript('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-lg flex items-center gap-1.5 transition-all"
                  title="Send recognized speech immediately"
                >
                  <Send size={12} />
                  <span>भेजें</span>
                </button>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>
        )}

        {/* Quick Manual Text Input Fallback Bar (Shown in Voice Call Mode) */}
        {callMode === 'voice' && (
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-900 flex items-center gap-2">
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && manualText.trim()) {
                  handleUserSpeech(manualText.trim());
                  setManualText('');
                }
              }}
              placeholder={
                currentLang === 'hindi'
                  ? 'यदि माइक में आवाज़ साफ न आए तो यहाँ टाइप करके Enter दबाएं...'
                  : 'Or type a quick response here if in a noisy environment...'
              }
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            {manualText.trim() && (
              <button
                onClick={() => {
                  handleUserSpeech(manualText.trim());
                  setManualText('');
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Send size={12} /> Send
              </button>
            )}
          </div>
        )}

        {/* STATE-MANAGED LISTENING ON/OFF & CALL CONTROL DECK */}
        <div
          className={`p-4 sm:p-5 border-t border-slate-800/80 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            callMode === 'video' ? 'absolute bottom-0 left-0 right-0 z-30 bg-slate-950/85 backdrop-blur-xl' : ''
          }`}
        >
          {/* STATE-MANAGED LISTENING ON / OFF BUTTON (Directly controls MediaStream activity without destroying connection) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-xl transition-all ${
                isListeningActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                  : 'bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/50'
              }`}
              title="Toggle whether Lyra actively listens to you (Preserves warm MediaStream connection)"
            >
              {isListeningActive ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                  </span>
                  <Mic size={18} />
                  <span>LISTENING: ON</span>
                </>
              ) : (
                <>
                  <MicOff size={18} className="text-rose-400" />
                  <span>LISTENING: OFF</span>
                </>
              )}
            </button>

            {/* Interruption / Barge-in trigger */}
            <button
              onClick={handleInterrupt}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Interrupt Lyra immediately"
            >
              <Hand size={14} className="text-amber-400" />
              <span className="hidden sm:inline">Interrupt</span>
            </button>
          </div>

          {/* Quick Speech Trigger if user wants immediate submission */}
          {currentTranscript && (
            <button
              onClick={() => {
                handleUserSpeech(currentTranscript);
                setCurrentTranscript('');
              }}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 animate-bounce"
            >
              <Send size={13} />
              <span>Send Spoken Now</span>
            </button>
          )}

          {/* Right Controls: Video Toggle, Speaker Volume, End Call */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Video Call button */}
            <button
              onClick={() => setCallMode(callMode === 'voice' ? 'video' : 'voice')}
              className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                callMode === 'video'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Toggle Advanced Holographic Video Call"
            >
              {callMode === 'video' ? <Video size={17} /> : <VideoOff size={17} />}
              <span className="hidden md:inline">{callMode === 'video' ? 'Video ON' : 'Video Call'}</span>
            </button>

            {/* Speaker Volume Slider */}
            <div className="hidden lg:flex items-center gap-1.5 w-24">
              <Volume2 size={14} className="text-slate-400 shrink-0" />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={speakerVolume}
                onChange={(e) => setSpeakerVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                title="Speaker Volume"
              />
            </div>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-rose-600/35 transition-all"
              title="End Live Voice Call"
            >
              <PhoneOff size={16} />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
