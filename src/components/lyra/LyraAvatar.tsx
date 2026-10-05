import React, { useMemo } from 'react';
import { LyraMood, LyraState } from '../../types';

interface LyraAvatarProps {
  mood: LyraMood;
  state?: LyraState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  isSpeaking?: boolean;
  isListening?: boolean;
  showParticles?: boolean;
  className?: string;
  onClick?: () => void;
}

export const LyraAvatar: React.FC<LyraAvatarProps> = ({
  mood,
  state,
  size = 'md',
  isSpeaking = false,
  isListening = false,
  showParticles = true,
  className = '',
  onClick,
}) => {
  // Resolve actual animated state: explicit prop takes precedence, then legacy boolean flags
  const activeState: LyraState = useMemo(() => {
    if (state) return state;
    if (isSpeaking) return 'speaking';
    if (isListening) return 'listening';
    return 'idle';
  }, [state, isSpeaking, isListening]);

  // Dimensions & scaling
  const sizeConfig = {
    xs: { box: 'w-7 h-7', scale: 0.6, fontSize: 'text-[9px]' },
    sm: { box: 'w-9 h-9', scale: 0.8, fontSize: 'text-[11px]' },
    md: { box: 'w-12 h-12', scale: 1.0, fontSize: 'text-xs' },
    lg: { box: 'w-16 h-16', scale: 1.35, fontSize: 'text-sm' },
    xl: { box: 'w-24 h-24', scale: 2.0, fontSize: 'text-lg' },
    '2xl': { box: 'w-36 h-36', scale: 2.8, fontSize: 'text-xl' },
    hero: { box: 'w-48 h-48 sm:w-56 sm:h-56', scale: 3.5, fontSize: 'text-2xl' },
  }[size];

  // Palette tuned to Lyra's mood
  const moodTheme = {
    Happy: {
      starColor: '#facc15',
      lightningColor: '#34d399',
      wingFill: 'rgba(52, 211, 153, 0.22)',
      wingStroke: '#34d399',
      glow: 'rgba(250, 204, 21, 0.55)',
      haloGradient: 'from-amber-400 via-emerald-400 to-teal-400',
      fairySuit: '#10b981',
      hairColor: '#fef08a',
      symbol: '✨',
      mouthCurve: 'M 17 24 Q 20 27 23 24',
    },
    Playful: {
      starColor: '#f472b6',
      lightningColor: '#38bdf8',
      wingFill: 'rgba(244, 114, 182, 0.25)',
      wingStroke: '#c084fc',
      glow: 'rgba(232, 121, 249, 0.6)',
      haloGradient: 'from-pink-500 via-purple-500 to-cyan-400',
      fairySuit: '#d946ef',
      hairColor: '#fbcfe8',
      symbol: '💫',
      mouthCurve: 'M 17 23 Q 20 28 23 23',
    },
    Calm: {
      starColor: '#38bdf8',
      lightningColor: '#818cf8',
      wingFill: 'rgba(56, 189, 248, 0.2)',
      wingStroke: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.55)',
      haloGradient: 'from-cyan-500 via-blue-500 to-indigo-600',
      fairySuit: '#0284c7',
      hairColor: '#bae6fd',
      symbol: '🌊',
      mouthCurve: 'M 18 24 Q 20 26 22 24',
    },
    Focused: {
      starColor: '#818cf8',
      lightningColor: '#c084fc',
      wingFill: 'rgba(99, 102, 241, 0.25)',
      wingStroke: '#818cf8',
      glow: 'rgba(99, 102, 241, 0.65)',
      haloGradient: 'from-indigo-500 via-blue-600 to-violet-700',
      fairySuit: '#4f46e5',
      hairColor: '#e0e7ff',
      symbol: '🎯',
      mouthCurve: 'M 18 24.5 L 22 24.5',
    },
    Motivational: {
      starColor: '#fbbf24',
      lightningColor: '#fb923c',
      wingFill: 'rgba(245, 158, 11, 0.25)',
      wingStroke: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.65)',
      haloGradient: 'from-amber-500 via-orange-500 to-rose-500',
      fairySuit: '#ea580c',
      hairColor: '#fed7aa',
      symbol: '🔥',
      mouthCurve: 'M 17 23 Q 20 28 23 23',
    },
    Serious: {
      starColor: '#fda4af',
      lightningColor: '#94a3b8',
      wingFill: 'rgba(244, 63, 94, 0.2)',
      wingStroke: '#e2e8f0',
      glow: 'rgba(244, 63, 94, 0.45)',
      haloGradient: 'from-slate-600 via-zinc-700 to-rose-900',
      fairySuit: '#475569',
      hairColor: '#f1f5f9',
      symbol: '🛡️',
      mouthCurve: 'M 18 25 L 22 25',
    },
    Adaptive: {
      starColor: '#2dd4bf',
      lightningColor: '#c084fc',
      wingFill: 'rgba(45, 212, 191, 0.22)',
      wingStroke: '#2dd4bf',
      glow: 'rgba(45, 212, 191, 0.6)',
      haloGradient: 'from-emerald-400 via-cyan-400 to-purple-500',
      fairySuit: '#0d9488',
      hairColor: '#ccfbf1',
      symbol: '🔮',
      mouthCurve: 'M 17 24 Q 20 26.5 23 24',
    },
  }[mood] || {
    starColor: '#38bdf8',
    lightningColor: '#818cf8',
    wingFill: 'rgba(56, 189, 248, 0.2)',
    wingStroke: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.55)',
    haloGradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    fairySuit: '#0284c7',
    hairColor: '#bae6fd',
    symbol: '✨',
    mouthCurve: 'M 18 24 Q 20 26 22 24',
  };

  const isWandActive = activeState === 'thinking' || activeState === 'typing';
  const isSpeakingState = activeState === 'speaking';
  const isListeningState = activeState === 'listening';
  const isErrorState = activeState === 'error';
  const isCompletedState = activeState === 'completed';

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-all duration-300 ${
        sizeConfig.box
      } ${className}`}
      title={`Lyra (${mood} Mood • ${activeState.toUpperCase()})`}
    >
      {/* Outer Pulse Waves during speaking, listening or typing */}
      {(isSpeakingState || isListeningState || isWandActive) && (
        <span
          className={`absolute -inset-1.5 rounded-full animate-ping opacity-35 bg-gradient-to-r ${moodTheme.haloGradient}`}
        />
      )}

      {/* Ambient Celestial Halo */}
      <div
        className={`absolute -inset-1 rounded-full bg-gradient-to-tr ${moodTheme.haloGradient} opacity-60 blur-[3px] transition-all duration-500`}
        style={{
          boxShadow: `0 0 16px ${moodTheme.glow}`,
        }}
      />

      {/* Core Base Surface */}
      <div className="relative w-full h-full rounded-full bg-slate-950/95 p-[1.5px] overflow-visible flex items-center justify-center border border-white/10 shadow-inner">
        {/* Floating Fairy Container with smooth hover motion */}
        <div className="relative w-full h-full flex items-center justify-center animate-fairy-hover">
          <svg
            viewBox="0 0 44 44"
            className="w-full h-full overflow-visible"
            fill="none"
          >
            <defs>
              {/* Radial glow for wand star */}
              <radialGradient id={`starGlow-${mood}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="45%" stopColor={moodTheme.starColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={moodTheme.lightningColor} stopOpacity="0" />
              </radialGradient>

              {/* Wing gradient */}
              <linearGradient id={`wingGrad-${mood}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="100%" stopColor={moodTheme.wingStroke} stopOpacity="0.1" />
              </linearGradient>

              {/* Lightning filter */}
              <filter id={`sparkleFilter-${mood}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* --- HOLOGRAPHIC FAIRY WINGS --- */}
            {/* Left Wing with subtle flutter */}
            <g className="animate-wing-left">
              <path
                d="M 18 20 C 12 12, 3 13, 5 21 C 6 26, 15 25, 18 22 Z"
                fill={`url(#wingGrad-${mood})`}
                stroke={moodTheme.wingStroke}
                strokeWidth="0.8"
                opacity="0.85"
              />
              <path
                d="M 17 21 C 12 16, 7 17, 8 22"
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity="0.5"
                strokeLinecap="round"
              />
            </g>

            {/* Right Wing with subtle flutter */}
            <g className="animate-wing-right">
              <path
                d="M 23 20 C 29 12, 38 13, 36 21 C 35 26, 26 25, 23 22 Z"
                fill={`url(#wingGrad-${mood})`}
                stroke={moodTheme.wingStroke}
                strokeWidth="0.8"
                opacity="0.85"
              />
              <path
                d="M 24 21 C 29 16, 34 17, 33 22"
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity="0.5"
                strokeLinecap="round"
              />
            </g>

            {/* --- FAIRY BODY & DRESS --- */}
            {/* Fairy Tapered Futuristic Bodice */}
            <path
              d="M 18 22 C 17 26, 17 31, 20.5 33 C 24 31, 24 26, 23 22 Z"
              fill={moodTheme.fairySuit}
              opacity="0.9"
            />
            {/* Celestial Belt / Energy Core */}
            <circle cx="20.5" cy="27" r="1.1" fill="#ffffff" opacity="0.9" />

            {/* --- FAIRY HEAD & HAIR --- */}
            {/* Soft Futuristic Hair Backing */}
            <ellipse cx="20.5" cy="16.5" rx="6.2" ry="6.2" fill={moodTheme.hairColor} opacity="0.95" />

            {/* Fairy Face */}
            <circle cx="20.5" cy="18" r="5" fill="#fef2f2" />

            {/* Cute Hair Bangs */}
            <path
              d="M 15 17 Q 20.5 13.5 26 17 C 25.5 15, 23 13, 20.5 13 C 18 13, 15.5 15, 15 17 Z"
              fill={moodTheme.hairColor}
            />

            {/* Celestial Head Halo / Tiny Star Diadem */}
            <circle
              cx="20.5"
              cy="11.5"
              r="1.2"
              fill="#ffffff"
              filter={`url(#sparkleFilter-${mood})`}
            />

            {/* Cheeks Blush */}
            <circle cx="17.2" cy="19.2" r="0.9" fill="#fca5a5" opacity="0.65" />
            <circle cx="23.8" cy="19.2" r="0.9" fill="#fca5a5" opacity="0.65" />

            {/* --- FAIRY EYES --- */}
            {mood === 'Playful' ? (
              // Cute Wink in Playful Mood
              <g stroke="#0f172a" strokeWidth="1.1" strokeLinecap="round">
                <circle cx="18.5" cy="17.2" r="0.9" fill="#0f172a" stroke="none" />
                <path d="M 22 17.5 L 24.5 16.8" />
              </g>
            ) : mood === 'Focused' ? (
              // Sharp attentive gaze
              <g fill="#0f172a">
                <circle cx="18.5" cy="17" r="0.9" />
                <circle cx="22.5" cy="17" r="0.9" />
                <circle cx="18.8" cy="16.7" r="0.3" fill="#ffffff" />
                <circle cx="22.8" cy="16.7" r="0.3" fill="#ffffff" />
              </g>
            ) : (
              // Standard warm sparkling eyes
              <g fill="#0f172a">
                <circle cx="18.5" cy="17" r="0.9" />
                <circle cx="22.5" cy="17" r="0.9" />
                <circle cx="18.8" cy="16.7" r="0.35" fill="#ffffff" />
                <circle cx="22.8" cy="16.7" r="0.35" fill="#ffffff" />
              </g>
            )}

            {/* --- NATURAL ANIMATED FAIRY MOUTH --- */}
            {isSpeakingState ? (
              // Animated mouth cycling naturally and visibly in sync with voice
              <g>
                {/* Lip contour */}
                <path
                  d="M 18.5 20.8 Q 20.5 21.4 22.5 20.8"
                  stroke="#f43f5e"
                  strokeWidth="0.8"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Dynamic natural speaking mouth opening and closing */}
                <path
                  d="M 18.5 21 Q 20.5 23.2 22.5 21 Q 20.5 20.2 18.5 21 Z"
                  fill="#e11d48"
                  opacity="0.9"
                >
                  <animate
                    attributeName="d"
                    values="
                      M 18.5 21 Q 20.5 22.4 22.5 21 Q 20.5 20.9 18.5 21 Z;
                      M 18.5 21 Q 20.5 24.6 22.5 21 Q 20.5 19.6 18.5 21 Z;
                      M 18.5 21 Q 20.5 21.9 22.5 21 Q 20.5 20.8 18.5 21 Z;
                      M 18.5 21 Q 20.5 23.9 22.5 21 Q 20.5 19.9 18.5 21 Z;
                      M 18.5 21 Q 20.5 22.4 22.5 21 Q 20.5 20.9 18.5 21 Z
                    "
                    dur="0.3s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Cute white teeth peek */}
                <rect x="19.7" y="20.7" width="1.6" height="0.6" rx="0.3" fill="#ffffff" opacity="0.85">
                  <animate
                    attributeName="opacity"
                    values="0.4;0.9;0.3;0.85;0.4"
                    dur="0.3s"
                    repeatCount="indefinite"
                  />
                </rect>
              </g>
            ) : isListeningState ? (
              // Attentive slight open circle
              <ellipse cx="20.5" cy="21" rx="0.8" ry="1.0" fill="#f43f5e" opacity="0.8" />
            ) : isErrorState ? (
              // Gentle concern
              <path d="M 18.5 21.5 Q 20.5 20.5 22.5 21.5" stroke="#f43f5e" strokeWidth="0.8" strokeLinecap="round" />
            ) : (
              // Gentle sweet smile
              <path
                d="M 18.5 20.8 Q 20.5 22.5 22.5 20.8"
                stroke="#f43f5e"
                strokeWidth="0.85"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* --- FAIRY HAND & MAGICAL WAND --- */}
            <g className={isWandActive ? 'animate-wand-twirl' : ''}>
              {/* Fairy Arm extending forward */}
              <path
                d="M 23 23 Q 27 23 29 21"
                stroke="#fef2f2"
                strokeWidth="1.2"
                strokeLinecap="round"
              />

              {/* Slender Magical Wand Shaft */}
              <line
                x1="28"
                y1="25"
                x2="34"
                y2="10"
                stroke="#e2e8f0"
                strokeWidth="1.0"
                strokeLinecap="round"
              />

              {/* Wand Handle wrap */}
              <line
                x1="28"
                y1="25"
                x2="29.5"
                y2="21.5"
                stroke={moodTheme.starColor}
                strokeWidth="1.4"
                strokeLinecap="round"
              />

              {/* Soft lightning energy arcs circling around wand tip */}
              <g className="animate-lightning">
                <circle
                  cx="34"
                  cy="10"
                  r="4.5"
                  stroke={moodTheme.lightningColor}
                  strokeWidth="0.65"
                  fill="none"
                  opacity="0.75"
                />
                <path
                  d="M 32 7 Q 34 11 36 8 Q 33 13 35 14"
                  stroke={moodTheme.lightningColor}
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>

              {/* Strong Star-like Magical Glow at Wand Tip */}
              <circle
                cx="34"
                cy="10"
                r="3.5"
                fill={`url(#starGlow-${mood})`}
                className="animate-wand-star"
              />

              {/* Gleaming 4-Pointed Star Crystal */}
              <path
                d="M 34 6.5 Q 34 10 37.5 10 Q 34 10 34 13.5 Q 34 10 30.5 10 Q 34 10 34 6.5 Z"
                fill="#ffffff"
                className="animate-wand-star"
              />
            </g>

            {/* --- FLOATING SPARKLE PARTICLES --- */}
            {showParticles && (isWandActive || isSpeakingState || isCompletedState) && (
              <g className="animate-sparkle-drift">
                <circle cx="36" cy="7" r="0.6" fill="#ffffff" />
                <circle cx="38" cy="9" r="0.8" fill={moodTheme.starColor} />
                <circle cx="35" cy="5" r="0.5" fill={moodTheme.lightningColor} />
              </g>
            )}
          </svg>
        </div>

        {/* Small Corner Mood Badge for instant state verification */}
        <span
          className="absolute -bottom-1 -right-1 text-[9px] pointer-events-none drop-shadow"
          style={{ transform: `scale(${sizeConfig.scale})` }}
        >
          {isCompletedState ? '✅' : isErrorState ? '⚠️' : moodTheme.symbol}
        </span>
      </div>
    </div>
  );
};
