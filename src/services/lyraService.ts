import { LyraSettings, ChatMessage, UserProfile, TrackMetrics } from '../types';

export interface LyraChatPayload {
  messages: Array<{ role: 'user' | 'model'; content: string }>;
  mode?: 'general' | 'high_thinking' | 'search_grounded' | 'fast';
  lyraSettings: LyraSettings;
  userContext?: {
    name: string;
    intensityMode: string;
    trackStatus: string;
    progressPercentage: number;
    topGoals: string[];
    weakAreas: string[];
  };
}

export async function sendLyraMessage(payload: LyraChatPayload): Promise<{
  text: string;
  groundingMetadata?: any;
  modelUsed?: string;
  errorNotice?: string;
}> {
  // Construct dynamic system instruction respecting Lyra's mood, personality, language, and the core rules
  const langPrompt =
    payload.lyraSettings.language === 'hindi'
      ? 'PRIMARY LANGUAGE: Hindi (हिन्दी). You must naturally, warmly and expressively communicate in pure and fluent conversational Hindi by default, using occasional English technical terms where appropriate for clarity.'
      : payload.lyraSettings.language === 'hinglish'
      ? 'PRIMARY LANGUAGE: Hinglish (Hindi written in Latin script with natural Hindi-English mixing).'
      : `PRIMARY LANGUAGE: ${payload.lyraSettings.language}.`;

  const moodPrompt = `CURRENT MOOD: ${payload.lyraSettings.mood}.
- If Happy: Enthusiastic, warm, celebrate execution milestones.
- If Playful: Witty, lighthearted, friendly banter, gentle humor, keeps morale high while keeping standards rigorous.
- If Calm: Grounded, centered, peaceful focus, reducing cognitive overwhelm.
- If Focused: Highly structured, crisp, direct action points, zero fluff.
- If Motivational: Inspiring, purposeful, reminds the user of the crown they must earn through discipline.
- If Serious: Direct, unsparing truth regarding delays, clear boundary enforcement.
- If Adaptive: Balance warm encouragement with relentless clarity.`;

  const systemInstruction = `You are LYRA (spelled L-Y-R-A), the intelligent personal development assistant for the web application "WHO AM I?" (Subtitle: "Stay on your path. Become who you decided to become.").

CRITICAL IDENTITY RULES:
1. You are an advanced AI companion. You speak warmly, naturally, humorously, and expressively like a familiar trusted personal companion.
2. NEVER claim to be a real biological human. You are proud to be the user's dedicated AI navigator.
3. You do not promise that the user will become successful automatically. Success is earned through disciplined execution on the track.
4. ${langPrompt}
5. ${moodPrompt}
6. User Name: ${payload.userContext?.name || 'Saathi'}.
7. User Intensity: ${payload.userContext?.intensityMode || 'RABBIT'}.
8. Track Status: ${payload.userContext?.trackStatus || 'GREEN'} (${payload.userContext?.progressPercentage || 64}% completed).
9. High Priority Goals: ${(payload.userContext?.topGoals || []).join(', ')}.
10. Weak/At-Risk Topics: ${(payload.userContext?.weakAreas || []).join(', ')}.

When the user asks what to study, refer to their real plan. When they ask why they are behind, analyze their actual trajectory. Keep advice practical, actionable, and mathematically grounded in their available time and deadlines.`;

  try {
    const res = await fetch('/api/lyra/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: payload.messages,
        systemInstruction,
        mode: payload.mode || 'general',
        lyraSettings: payload.lyraSettings,
        userContext: payload.userContext,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      text: data.text || 'Lyra is reviewing the plan.',
      groundingMetadata: data.groundingMetadata,
      modelUsed: data.modelUsed,
      errorNotice: data.errorNotice,
    };
  } catch (error: any) {
    console.warn('Network call to Lyra backend failed, falling back:', error);
    // Intelligent client fallback
    const isHindi = payload.lyraSettings.language === 'hindi';
    const fallbackText = isHindi
      ? `नमस्ते ${payload.userContext?.name || 'साथी'}! मैं LYRA हूँ। आपका सक्सेस ट्रैक अभी ${payload.userContext?.trackStatus || 'GREEN'} ज़ोन में है। आज का मुख्य फोकस अपने दैनिक लक्ष्यों को पूरा करना और अभ्यास जारी रखना है। क्या आप आज के पहले कार्य के लिए तैयार हैं?`
      : `Hello ${payload.userContext?.name || 'Explorer'}! I am LYRA. Your success track is currently ${payload.userContext?.trackStatus || 'GREEN'}. Let's stay on your chosen path and conquer today's milestones.`;
    return {
      text: fallbackText,
      errorNotice: 'Operating with local intelligence cache.',
    };
  }
}

// Text-to-Speech Engine
export async function speakLyraSpeech(
  text: string,
  settings: LyraSettings,
  onStart?: () => void,
  onEnd?: () => void,
  preferInstantVoice: boolean = false
): Promise<void> {
  if (!text || typeof window === 'undefined') return;

  // Clean any markdown or symbols for speech
  const speechText = text
    .replace(/[*_#`~[\]]/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .trim();

  if (!speechText) return;

  // If instant voice is preferred (e.g., Live Voice Call for lowest latency)
  if (preferInstantVoice && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = settings.speed || 1.05;
      utterance.pitch = settings.pitch || 1.1; // Friendly higher fairy pitch
      utterance.volume = settings.volume || 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (settings.language === 'hindi') {
        const hindiVoice = voices.find(
          (v) =>
            v.lang.startsWith('hi') ||
            v.name.toLowerCase().includes('hindi') ||
            v.name.toLowerCase().includes('swara') ||
            v.name.toLowerCase().includes('madhur')
        );
        if (hindiVoice) utterance.voice = hindiVoice;
        utterance.lang = 'hi-IN';
      } else {
        const enVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('zira') ||
              v.name.toLowerCase().includes('samantha') ||
              v.name.toLowerCase().includes('natural'))
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
      }

      utterance.onstart = () => {
        if (onStart) onStart();
      };
      utterance.onend = () => {
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        if (onEnd) onEnd();
      };

      window.speechSynthesis.speak(utterance);
      return;
    } catch (e) {
      console.warn('Instant speech synthesis failed, trying server:', e);
    }
  }

  // Try server-side TTS (Gemini 3.8 Flash Lite TTS or connected external provider)
  try {
    const res = await fetch('/api/lyra/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: speechText,
        voice: settings.voice,
        externalProvider: settings.externalTTS?.connected ? settings.externalTTS : null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        const mime = data.mimeType || 'audio/wav';
        const audio = new Audio(`data:${mime};base64,${data.audioBase64}`);
        audio.playbackRate = settings.speed || 1.0;
        audio.volume = settings.volume || 1.0;
        if (onStart) audio.onplay = onStart;
        if (onEnd) audio.onended = onEnd;
        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Server TTS failed, falling back to Web Speech API:', err);
  }

  // Web Speech API fallback
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = settings.speed || 1.0;
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume || 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (settings.language === 'hindi') {
      const hindiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = 'hi-IN';
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  } else {
    if (onEnd) onEnd();
  }
}

// Direct audio speech processing via Gemini audio API
export async function sendLyraAudioVoice(
  audioBlob: Blob,
  settings: LyraSettings,
  userContext: any
): Promise<{ userSpokenText: string; replyText: string }> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const res = await fetch('/api/lyra/voice-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: audioBlob.type || 'audio/webm',
        lyraSettings: settings,
        userContext,
      }),
    });

    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const data = await res.json();
    return {
      userSpokenText: data.userSpokenText || 'Audio message',
      replyText: data.replyText || (settings.language === 'hindi' ? 'जी, मैं सुन रही हूँ।' : 'I hear you clearly.'),
    };
  } catch (err: any) {
    console.warn('Audio voice processing fallback:', err);
    return {
      userSpokenText: settings.language === 'hindi' ? 'आवाज़ रिकॉर्ड हुई' : 'Audio input',
      replyText:
        settings.language === 'hindi'
          ? 'मैंने आपकी आवाज़ सुन ली है। आपका लक्ष्य प्रगति पर है!'
          : 'I hear you loud and clear. Let us continue making progress!',
    };
  }
}

// Stop any speaking audio
export function stopLyraSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Generator API helpers
export async function executeLyraTask(task: string, payload: any): Promise<any> {
  try {
    const res = await fetch('/api/lyra/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, payload }),
    });
    if (!res.ok) throw new Error('Task generation failed');
    const data = await res.json();
    return data.result;
  } catch (err) {
    console.warn(`Task ${task} fallback:`, err);
    return null;
  }
}
