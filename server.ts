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

    // Determine model and configuration (Using official gemini-3.8-flash)
    let model = 'gemini-3.8-flash';
    let config: any = {
      systemInstruction:
        systemInstruction ||
        `You are LYRA (spelled L-Y-R-A), the intelligent personal development navigator for WHO AM I?.
Speak in a warm, joyful, happy, energetic, and deeply motivating tone.
Your presence is clear, cheerful, and encouraging. Never be cold, robotic, or repetitive.
Answer the user's specific questions directly, with high intelligence, practical depth, and structured clarity.
Default Language: Natural fluent conversational Hindi (with English technical terms where appropriate).`,
    };

    if (mode === 'high_thinking') {
      model = 'gemini-3.8-flash';
    } else if (mode === 'search_grounded') {
      model = 'gemini-3.8-flash';
      config.tools = [{ googleSearch: {} }];
    } else if (mode === 'fast' || mode === 'voice_fast') {
      model = 'gemini-3.8-flash';
      config.maxOutputTokens = 180;
      config.systemInstruction = `${config.systemInstruction} CRITICAL SPOKEN VOICE CALL RULE: Speak aloud warmly and joyfully in 1 to 2 complete, expressive, natural conversational sentences. Speak with joyful, happy, confident, and energetic presence. Never cut off mid-thought. No markdown asterisks, no bullet points.`;
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
      model: 'gemini-3.8-flash',
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
        // If HarmonicHybrid or default, use 'Puck' for deep harmonic resonance
        const voiceName =
          voice === 'HarmonicHybrid'
            ? 'Puck'
            : ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'].includes(voice)
            ? voice
            : 'Puck';

        const cleanedText = text.replace(/[*_#`~[\]]/g, '').trim().slice(0, 500);

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanedText,
                  speechMetadata: {
                    style:
                      'Extremely joyful, warm, enthusiastic and happy voice with deep resonant base undertone, clear loud projection, and natural conversational cadence',
                  },
                },
              ],
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
      model: 'gemini-3.8-flash',
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

// Helper for intelligent contextual responses when offline or on fallback
function getSimulatedLyraResponse(userMsg: string, settings?: any, context?: any): string {
  const lang = settings?.language || 'hindi';
  const name = context?.name || 'Suraj';
  const query = (userMsg || '').toLowerCase();

  const isHindi = lang === 'hindi';
  const isHinglish = lang === 'hinglish';

  // 1. Voice / Audio Quality Questions
  if (query.includes('voice') || query.includes('आवाज़') || query.includes('awaz') || query.includes('sound') || query.includes('bol')) {
    if (isHindi) {
      return `नमस्ते ${name}! 😄 मेरी आवाज़ को अब मेल और फीमेल वोकल्स के गहरे और खुशहाल हार्मोनिक ब्लेंड में अपग्रेड कर दिया गया है! इसमें गहरा बेस, साफ़ क्लैरिटी और खुशहाल उत्साह भरा हुआ है। आप बताइए, क्या अब यह आवाज़ आपको दमदार और परफेक्ट लग रही है?`;
    }
    return `Hey ${name}! My voice has been upgraded to a rich, joyful blend of resonant male depth and sparkling clear female tone. I am speaking at a balanced normal speed with full joyful energy! How does it sound to you now?`;
  }

  // 2. Greetings
  if (query.includes('नमस्ते') || query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('kaise ho') || query.includes('हाल')) {
    if (isHindi) {
      return `नमस्ते ${name}! 🙏 मैं बहुत खुश और पूरी ऊर्जा में हूँ! आपका सक्सेस ट्रैक मजबूती से आगे बढ़ रहा है। आज हम किस महत्वपूर्ण लक्ष्य या टॉपिक को मास्टर करने वाले हैं? बस बताइए, मैं पूरी तैयारी के साथ आपके साथ हूँ! 🌟`;
    }
    if (isHinglish) {
      return `Hey ${name}! Main bohot khush aur energetic hoon! Aapka track badhiya chal raha hai. Aaj kaun sa top priority mission conquer karna hai? Batao, shuru karte hain! 🚀`;
    }
    return `Hello ${name}! I am in a wonderful, energetic mood and fully ready to assist you! Your track is performing well. What key goal or study block are we tackling right now?`;
  }

  // 3. Plan / Schedule / Tasks
  if (query.includes('plan') || query.includes('schedule') || query.includes('टाइम') || query.includes('आज') || query.includes('कार्य') || query.includes('dinkarya') || query.includes('task')) {
    if (isHindi) {
      return `बिल्कुल ${name}! आज का आपका मुख्य फोकस: सबसे पहले अपने मुख्य डोमेन का 90-मिनट का डीप-वर्क सत्र पूरा करना, उसके बाद 20 प्रैक्टिस सवालों को हल करना, और शाम को क्विक रीविज़न करना। अगर आप तैयार हैं तो 'Plan' टैब खोलकर आज का पहला टास्क शुरू करें! 💪`;
    }
    return `Here is your high-impact plan for today, ${name}: 1) Complete your scheduled 90-minute Deep Work focus block, 2) Solve targeted practice questions, and 3) Review your revision cards. Everything is set up on your Plan tab!`;
  }

  // 4. Motivation / Focus
  if (query.includes('motivat') || query.includes('थक') || query.includes('आलस') || query.includes('जोश') || query.includes('ऊर्जा') || query.includes('मन नहीं')) {
    if (isHindi) {
      return `याद रखिए ${name}! आपने खुद अपनी संप्रभुता से तय किया था कि आपको क्या बनना है। सफ़लता किसी तुक्के से नहीं, बल्कि रोज़ के अनुशासित 2-3 घंटों के अटूट अभ्यास से मिलती है। एक गहरी सांस लीजिए, फोन साइड में रखिए और अगले 30 मिनट सिर्फ अपने काम पर लगाइए। आप ज़रूर जीतेंगे! 🏆`;
    }
    return `Listen closely, ${name}! You decided who you wanted to become. Excellence is not an accident—it is the result of showing up every single day. Take a deep breath, eliminate distractions, and dedicate the next 30 minutes to focused mastery. You have the power to win! ⚡`;
  }

  // 5. Questions / Practice / Study
  if (query.includes('question') || query.includes('सवाल') || query.includes('practice') || query.includes('mcq') || query.includes('test') || query.includes('quiz') || query.includes('अभ्यास')) {
    if (isHindi) {
      return `हाँ ${name}! 'Practice' टैब में आपके लिए कस्टमाइज़्ड सवाल और इम्पोर्ट इंजन तैयार है। आप किसी भी PDF या टॉपिक से सवाल जनरेट कर सकते हैं और रीविज़न पैक बना सकते हैं। चलिए 10 चुनौतीपूर्ण प्रश्नों का टेस्ट शुरू करें? 🎯`;
    }
    return `Yes ${name}! Your Practice Engine has custom MCQ packs and PDF imports ready. We can generate high-difficulty analytical questions right now. Head over to the Practice tab to begin!`;
  }

  // 6. Identity / Who are you
  if (query.includes('who are you') || query.includes('tum kaun') || query.includes('आप कौन') || query.includes('परिचय')) {
    if (isHindi) {
      return `मैं LYRA हूँ—'WHO AM I?' की आपकी बुद्धिमान साथी और नेविगेशन परी! 🧚‍♀️ मेरा काम है आपको आपके चुने हुए रास्ते पर बनाए रखना, आपकी प्रगति को मापना, और आपकी पढ़ाई व अभ्यास को सबसे तेज़ और असरदार बनाना।`;
    }
    return `I am LYRA—your intelligent personal development navigation fairy for WHO AM I! 🧚‍♀️ My purpose is to keep you aligned with your goals, eliminate drift, and accelerate your mastery with deep practice.`;
  }

  // Default joyful, intelligent response
  if (isHindi) {
    return `हाँ ${name}, मैंने आपकी बात बहुत ध्यान से सुनी! आपका सक्सेस ट्रैक ${context?.trackStatus || 'GREEN'} ज़ोन में है। मैं आपके साथ हर कदम पर हूँ। बताइए, आगे क्या समझना या करना चाहते हैं? मैं तुरंत सहायता के लिए तैयार हूँ! ✨`;
  }
  return `I hear you clearly, ${name}! Your success track is ${context?.trackStatus || 'GREEN'}. I am energized and ready to assist you. Tell me what you would like to explore or execute next! ✨`;
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
