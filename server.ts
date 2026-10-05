import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Server-side Gemini initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// 1. Chat with Lyra (Multi-turn, Thinking Mode, Search Grounding, Mood & Language aware)
app.post('/api/lyra/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      mode = 'general', // 'general' | 'high_thinking' | 'search_grounded' | 'fast'
      lyraSettings,
      userContext,
    } = req.body;

    if (!aiClient) {
      // Graceful offline/local simulated intelligent response if API key is not yet set
      const lastUserMsg = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
      return res.json({
        text: getSimulatedLyraResponse(lastUserMsg, lyraSettings, userContext),
        groundingMetadata: null,
        provider: 'local-intelligence-engine',
      });
    }

    // Determine model and configuration
    let model = 'gemini-3.5-flash';
    let config: any = {
      systemInstruction: systemInstruction || 'You are LYRA, the intelligent personal development assistant for WHO AM I?.',
    };

    if (mode === 'high_thinking') {
      model = 'gemini-3.1-pro-preview';
      config.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    } else if (mode === 'search_grounded') {
      model = 'gemini-3.5-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (mode === 'fast' || mode === 'voice_fast') {
      model = 'gemini-3.1-flash-lite';
      config.maxOutputTokens = 65;
      config.systemInstruction = `${config.systemInstruction} CRITICAL: Real-time spoken call. Reply in exactly 1 brief, warm, conversational sentence (maximum 15-20 words). No markdown, no bullet points, no lists. If in Hindi, speak natural, clear, encouraging conversational Hindi.`;
    }

    // Prepare contents formatted for Gemini
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    if (contents.length === 0) {
      contents.push({ role: 'user', parts: [{ text: 'Namaste Lyra, tell me about my current status.' }] });
    }

    const response = await aiClient.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text || '';
    const groundingMetadata = (response as any).candidates?.[0]?.groundingMetadata || null;

    return res.json({
      text,
      groundingMetadata,
      modelUsed: model,
      provider: 'gemini',
    });
  } catch (error: any) {
    console.error('Lyra chat error:', error);
    // Graceful fallback on API error
    const lastUserMsg = req.body?.messages?.[req.body.messages.length - 1]?.content || '';
    return res.json({
      text: getSimulatedLyraResponse(lastUserMsg, req.body?.lyraSettings, req.body?.userContext),
      errorNotice: error?.message || 'Server processed via local engine fallback.',
      provider: 'fallback',
    });
  }
});

// 1.1 Audio Voice Input (Direct audio stream speech recognition and response via Gemini)
app.post('/api/lyra/voice-audio', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', lyraSettings, userContext } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (!aiClient) {
      const isHindi = lyraSettings?.language === 'hindi';
      return res.json({
        userSpokenText: isHindi ? 'आपका संदेश प्राप्त हुआ' : 'Speech recognized',
        replyText: isHindi
          ? `हाँ ${userContext?.name || 'साथी'}! मैं सुन रही हूँ। आपका ट्रैक ठीक चल रहा है, आगे क्या करना चाहेंगे?`
          : `Yes ${userContext?.name || 'Explorer'}! I heard you clearly. What is our next move on the track?`,
        provider: 'local-voice-engine',
      });
    }

    const systemInstruction = `You are LYRA, the intelligent personal development assistant for WHO AM I?.
Listen to the user's voice audio.
1. Transcribe what the user said in the language they spoke (Hindi or English).
2. Formulate a brief, warm, natural spoken reply (under 18 words).
Output valid JSON in this exact structure:
{
  "userSpokenText": "...",
  "replyText": "..."
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: 'Listen to my speech and respond in JSON with userSpokenText and replyText.',
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const raw = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {
        userSpokenText: 'Spoken input',
        replyText: raw.replace(/[{}"]/g, '').slice(0, 100),
      };
    }

    return res.json({
      userSpokenText: parsed.userSpokenText || 'Voice message',
      replyText: parsed.replyText || (lyraSettings?.language === 'hindi' ? 'जी, मैं सुन रही हूँ।' : 'I hear you clearly.'),
      provider: 'gemini-audio',
    });
  } catch (error: any) {
    console.error('Lyra voice-audio processing error:', error);
    const isHindi = req.body?.lyraSettings?.language === 'hindi';
    return res.json({
      userSpokenText: isHindi ? 'आवाज़ रिकॉर्ड हुई' : 'Audio captured',
      replyText: isHindi
        ? 'मैंने आपकी बात समझ ली है। आपका लक्ष्य पूरी तरह ट्रैक पर है!'
        : 'I heard you. Keep moving forward on your chosen track!',
      errorNotice: error?.message,
      provider: 'fallback',
    });
  }
});

// 2. Text-to-Speech via Gemini 3.8 Flash Lite TTS or external TTS proxy
app.post('/api/lyra/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore', externalProvider } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    // If external provider is configured and passed securely
    if (externalProvider && externalProvider.apiKey && externalProvider.type === 'elevenlabs') {
      const voiceId = externalProvider.voiceId || '21m00Tcm4TlvDq8ikWAM';
      const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': externalProvider.apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text,
          model_id: externalProvider.model || 'eleven_multilingual_v2',
        }),
      });
      if (elRes.ok) {
        const audioBuffer = Buffer.from(await elRes.arrayBuffer());
        return res.json({ audioBase64: audioBuffer.toString('base64'), mimeType: 'audio/mpeg' });
      }
    }

    if (aiClient) {
      try {
        const voiceName = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'].includes(voice) ? voice : 'Kore';
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: text.slice(0, 500) }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({ audioBase64: base64Audio, mimeType: 'audio/wav' });
        }
      } catch (geminiTtsErr) {
        console.warn('Gemini TTS generation notice:', geminiTtsErr);
      }
    }

    // Client fallback indicator
    return res.json({ audioBase64: null, useClientSynthesis: true });
  } catch (error: any) {
    console.error('TTS error:', error);
    return res.json({ audioBase64: null, useClientSynthesis: true });
  }
});

// 3. Goal Decomposition, Question Generation & Smart Synthesis
app.post('/api/lyra/generate', async (req: Request, res: Response) => {
  try {
    const { task, payload } = req.body;

    if (!aiClient) {
      return res.json({ result: getSimulatedTaskResult(task, payload) });
    }

    let prompt = '';
    if (task === 'decompose_goal') {
      prompt = `You are LYRA, the AI system for "WHO AM I?".
Analyze this goal: "${payload.goalText}".
Break it down into structured JSON:
{
  "primaryObjective": "...",
  "subObjectives": ["...", "..."],
  "skills": ["...", "..."],
  "knowledgeDomains": ["...", "..."],
  "dependencies": ["...", "..."],
  "estimatedDifficulty": "Moderate | High | Very High",
  "suggestedMilestones": ["...", "..."],
  "recommendedSequence": ["...", "..."],
  "measurableOutcomes": ["...", "..."]
}
Respond with valid JSON only.`;
    } else if (task === 'generate_quiz') {
      prompt = `Generate 3 high quality practice questions for the topic: "${payload.topic}". Difficulty: ${payload.difficulty || 'Intermediate'}.
Return JSON array:
[
  {
    "id": "q1",
    "question": "...",
    "type": "mcq",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A",
    "explanation": "...",
    "topic": "${payload.topic}"
  }
]
Respond with valid JSON only.`;
    } else if (task === 'synthesize_book_chapter') {
      prompt = `You are generating a chapter for 'MY BOOK' in 'WHO AM I?' from user resources on: "${payload.topic}".
Create a comprehensive, elegant learning chapter in JSON:
{
  "volume": "I",
  "chapterTitle": "${payload.topic}",
  "sections": [
    {
      "sectionTitle": "Core Architecture & Principles",
      "concept": "...",
      "explanation": "...",
      "example": "...",
      "practiceQuestion": "...",
      "revisionPrompt": "...",
      "assessmentMethod": "..."
    }
  ],
  "sourceReferences": ["Curriculum Standard 2026", "Engineering Reference Manual"]
}
Respond with valid JSON only.`;
    } else if (task === 'nexora_plan') {
      prompt = `You are the NEXORA Strategic Agent in WHO AM I?.
Create a structured technical engineering roadmap for project: "${payload.projectName}".
Vision: "${payload.vision}".
Return JSON:
{
  "vision": "...",
  "requirements": ["...", "..."],
  "subsystems": [
    { "name": "Software", "description": "..." },
    { "name": "Hardware/Infra", "description": "..." },
    { "name": "AI/Intelligence", "description": "..." }
  ],
  "milestones": [
    { "title": "Stage 1: Core Foundation", "timeframe": "Days 1-30", "tasks": ["..."] },
    { "title": "Stage 2: Integration & Prototype", "timeframe": "Days 31-60", "tasks": ["..."] },
    { "title": "Stage 3: Testing & Deployment", "timeframe": "Days 61-90", "tasks": ["..."] }
  ],
  "risks": ["...", "..."],
  "nextAction": "..."
}
Respond with valid JSON only.`;
    } else {
      prompt = `Execute task "${task}" with data: ${JSON.stringify(payload)}. Respond concisely.`;
    }

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let parsedResult;
    try {
      parsedResult = JSON.parse(response.text || '{}');
    } catch {
      parsedResult = { rawText: response.text };
    }

    return res.json({ result: parsedResult });
  } catch (error: any) {
    console.error('Lyra generate error:', error);
    return res.json({ result: getSimulatedTaskResult(req.body.task, req.body.payload) });
  }
});

// Helper for simulated responses when offline or missing key
function getSimulatedLyraResponse(userMsg: string, settings?: any, context?: any): string {
  const lang = settings?.language || 'hindi';
  const mood = settings?.mood || 'Calm';
  const name = context?.name || 'Saathi';

  if (lang === 'hindi') {
    if (mood === 'Playful') {
      return `नमस्ते ${name}! 😄 अरे वाह, आज आपका जोश देखने लायक है! मैंने आपका ट्रैक चेक किया - आप बढ़िया रफ़्तार में आगे बढ़ रहे हैं। पर ध्यान रहे, 'Cheetah' मोड हो या 'Rabbit', स्थिरता ही असली जीत है। बताइए, आज किस टॉपिक को फोड़ना है?`;
    }
    if (mood === 'Motivational') {
      return `नमस्ते ${name}! याद रखिए, आपने खुद तय किया था कि आपको क्या बनना है। सफलता कोई अचानक मिलने वाली चीज़ नहीं है, यह रोज़ के अनुशासित क़दमों का नतीजा है। आपका ट्रैक अभी ग्रीन ज़ोन में है, इसे ऐसे ही बनाए रखिए। चलिए, आज का प्लान शुरू करते हैं! 🚀`;
    }
    if (mood === 'Focused' || mood === 'Serious') {
      return `नमस्ते ${name}। आपका करंट ट्रैक स्टेटस: ON TRACK (84% कंसिस्टेंसी)। आज के लिए 3 प्रायोरिटी टास्क्स और 25 प्रैक्टिस सवाल शेड्यूल हैं। कोई भी विचलन आपके 90-डे मील के पत्थर को प्रभावित कर सकता है। सीधा काम पर ध्यान केंद्रित करें।`;
    }
    // Calm / Happy / Adaptive default
    return `नमस्ते ${name}! मैं आपकी सहायक LYRA हूँ। मैं देख रही हूँ कि आप अपने निर्धारित पथ पर मजबूती से आगे बढ़ रहे हैं। आज आपके पास मुख्य रूप से सॉफ्टवेयर आर्किटेक्चर और AI सिस्टम्स का अध्ययन है। मैं आपके साथ हूँ, क्या हम पहला सत्र शुरू करें?`;
  }

  if (lang === 'hinglish') {
    return `Hey ${name}! Main Lyra hoon. Aapka progress track abhi ekdum Green zone me chal raha hai. Today's goal is strong practice and completing the planned milestone. Batao, abhi kis topic se start karein?`;
  }

  // English fallback
  return `Hello ${name}. I am LYRA, your personal navigation intelligence. Your trajectory is currently ON TRACK with high execution consistency. Review today's mission when ready, and let's turn your declared goals into concrete mastery.`;
}

function getSimulatedTaskResult(task: string, payload: any): any {
  if (task === 'decompose_goal') {
    return {
      primaryObjective: payload.goalText || 'Master Technical Domain and Build High-Impact Systems',
      subObjectives: [
        'Establish deep foundational theory and mathematical intuition',
        'Build high-performance real-world production projects',
        'Implement system security, scalability, and verification benchmarks',
      ],
      skills: ['System Design', 'Algorithmic Thinking', 'Modern Frameworks', 'Security Verification'],
      knowledgeDomains: ['Computer Science', 'Artificial Intelligence', 'Software Architecture'],
      dependencies: ['Core Programming Fundamentals', 'Data Structures & Algorithms'],
      estimatedDifficulty: 'High',
      suggestedMilestones: [
        'Milestone 1: Core Foundation & Practice (Days 1-30)',
        'Milestone 2: Prototype Architecture (Days 31-60)',
        'Milestone 3: Production System & Review (Days 61-90)',
      ],
      recommendedSequence: ['Theory & Concepts', 'Targeted Question Lab', 'Hands-on Project Lab', 'Revision Assessment'],
      measurableOutcomes: ['Complete 250+ targeted challenges', 'Deploy 2 verified capstone projects', 'Pass 90% benchmark review'],
    };
  }
  if (task === 'generate_quiz') {
    return [
      {
        id: 'q1',
        question: `In the context of ${payload.topic || 'System Design'}, what is the primary benefit of decoupling state management from presentation layers?`,
        type: 'mcq',
        options: [
          'A) Minimizes component re-renders and isolates side effects for higher predictability',
          'B) Eliminates the need for any local variables',
          'C) Automatically compiles code into native machine assembly',
          'D) Reduces database network bandwidth to zero',
        ],
        correctAnswer: 'A',
        explanation: 'Decoupling state ensures predictable data flow, modular testing, and deterministic component updates.',
        topic: payload.topic || 'General',
      },
      {
        id: 'q2',
        question: `When optimizing high-throughput distributed systems, what does the CAP theorem dictate?`,
        type: 'mcq',
        options: [
          'A) You can achieve Consistency, Availability, and Partition Tolerance simultaneously at all times',
          'B) In the presence of a network partition, you must trade off between Consistency and Availability',
          'C) CPU speed is inversely proportional to memory bus width',
          'D) Cryptographic keys must be rotated every 24 hours',
        ],
        correctAnswer: 'B',
        explanation: 'CAP theorem proves that when network partitions occur, distributed databases must choose between returning consistent data or remaining available.',
        topic: payload.topic || 'General',
      },
    ];
  }
  if (task === 'synthesize_book_chapter') {
    return {
      volume: 'Volume I',
      chapterTitle: payload.topic || 'Advanced Computational Systems',
      sections: [
        {
          sectionTitle: 'Foundational Principles',
          concept: 'Adaptive State Representation and Execution Pipelines',
          explanation: 'Every high-reliability personal system relies on clear state boundaries, continuous telemetry, and adaptive feedback loops.',
          example: 'Tracking learning velocity through weighted rolling averages rather than raw cumulative hours.',
          practiceQuestion: 'How does an adaptive velocity metric protect against burnout compared to fixed quotas?',
          revisionPrompt: 'Recall the 3 parameters of the Success Track: velocity, consistency, and accumulated deviation.',
          assessmentMethod: 'Evidence-based project submission and conceptual verification quiz.',
        },
      ],
      sourceReferences: ['Computer Systems Architecture, 2026 Edition', 'Cognitive Ergonomics & Spaced Retrieval Journal'],
    };
  }
  if (task === 'nexora_plan') {
    return {
      vision: payload.vision || 'Build next-generation intelligent robotics and autonomous systems.',
      requirements: ['Low-latency edge inference', 'Real-time telemetry pipeline', 'Modular actuator controllers', 'Fail-safe supervisor'],
      subsystems: [
        { name: 'Perception & Vision', description: 'Real-time sensor fusion with dual RGB-D cameras and LiDAR' },
        { name: 'Core Compute & RTOS', description: 'Embedded Linux running deterministic task schedulers' },
        { name: 'AI Decision Engine', description: 'Reinforcement learning model for path optimization and obstacle avoidance' },
      ],
      milestones: [
        { title: 'Stage 1: System Architecture & CAD', timeframe: 'Month 1', tasks: ['Component selection', 'Schematic drafting', 'Power budget audit'] },
        { title: 'Stage 2: Subsystem Simulation', timeframe: 'Month 2', tasks: ['ROS 2 simulation environment', 'Kinematics verification', 'Firmware skeleton'] },
        { title: 'Stage 3: Physical Assembly & Lab Test', timeframe: 'Month 3', tasks: ['PCB fabrication', 'Motor bench calibration', 'Autonomous waypoint test'] },
      ],
      risks: ['Thermal throttling on edge compute', 'Supply chain lead time on precision motors'],
      nextAction: 'Finalize kinematics equations and review power distribution schematic in NEXORA workspace.',
    };
  }
  return { status: 'success', data: payload };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WHO AM I? server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
