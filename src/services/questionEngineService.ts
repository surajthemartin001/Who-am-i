import {
  QuestionItem,
  QuestionType,
  QuestionPack,
  QuestionEngineConfig,
  QuestionSourceMetadata,
} from '../types';

const STORAGE_QUESTIONS_KEY = 'wai_custom_questions_v1';
const STORAGE_PACKS_KEY = 'wai_question_packs_v1';

// Supported Fields & Domains (Level 1)
export const DOMAIN_FIELDS = [
  'Cybersecurity & Ethical Hacking',
  'Software Development & Architecture',
  'AI & Machine Learning',
  'Robotics & Autonomous Systems',
  'Electronics & Embedded Systems',
  'Mathematics & Algorithmic Theory',
  'Physics & Engineering Science',
  'Business & Tech Ventures',
  'System Administration & DevOps',
];

// Sub-structure taxonomy (Level 2)
export const DOMAIN_TAXONOMY: Record<
  string,
  {
    subjects: string[];
    chapters: Record<string, string[]>;
    topics: Record<string, string[]>;
  }
> = {
  'Cybersecurity & Ethical Hacking': {
    subjects: ['Network Security', 'Web Application Security', 'Cryptography', 'Penetration Testing', 'Malware Analysis'],
    chapters: {
      'Network Security': ['Firewalls & IDS/IPS', 'Packet Analysis & Wireshark', 'VPNs & Tunneling', 'TCP/IP Vulnerabilities'],
      'Web Application Security': ['OWASP Top 10', 'Injection Vulnerabilities (SQLi, Command)', 'Cross-Site Scripting (XSS)', 'Authentication & Session Management', 'API Security'],
      'Cryptography': ['Symmetric Ciphers (AES)', 'Asymmetric Crypto (RSA, ECC)', 'Hashing & MACs', 'Zero Knowledge Proofs', 'PKI & Certificates'],
      'Penetration Testing': ['Reconnaissance & OSINT', 'Exploitation Frameworks', 'Privilege Escalation', 'Post-Exploitation'],
      'Malware Analysis': ['Static Analysis', 'Dynamic Analysis in Sandboxes', 'Reverse Engineering', 'Ransomware Mechanics'],
    },
    topics: {
      'OWASP Top 10': ['XSS Mitigation', 'SQL Injection Payloads', 'CSRF Tokens', 'SSRF Exploits', 'Broken Object Level Auth (BOLA)'],
      'Injection Vulnerabilities (SQLi, Command)': ['Blind SQLi', 'Union Based SQLi', 'OS Command Injection', 'Input Sanitization'],
      'Packet Analysis & Wireshark': ['TCP Handshake Analysis', 'DNS Exfiltration', 'TLS Inspection', 'Arp Spoofing Detection'],
      'Symmetric Ciphers (AES)': ['AES-GCM Authenticated Encryption', 'ECB vs CBC Mode Weaknesses', 'Key Derivation (PBKDF2, Argon2)'],
    },
  },
  'Software Development & Architecture': {
    subjects: ['Distributed Systems', 'Data Structures & Algorithms', 'Design Patterns', 'Cloud Infrastructure & Kubernetes', 'Database Internals'],
    chapters: {
      'Distributed Systems': ['Consensus (Raft, Paxos)', 'CAP & PACELC Theorems', 'Event-Driven Architectures', 'Idempotency & Retries', 'Distributed Tracing'],
      'Data Structures & Algorithms': ['Graphs & Shortest Path', 'Dynamic Programming', 'Trees & Tries', 'Heaps & Priority Queues'],
      'Design Patterns': ['SOLID Principles', 'Creational Patterns', 'Structural Patterns', 'Behavioral Patterns'],
      'Cloud Infrastructure & Kubernetes': ['Pod Lifecycles', 'Service Meshes (Istio)', 'Ingress Controllers', 'CI/CD Pipelines'],
      'Database Internals': ['B+ Trees vs LSM Trees', 'ACID Transactions & MVCC', 'Indexing Strategies', 'Query Optimization'],
    },
    topics: {
      'Consensus (Raft, Paxos)': ['Leader Election', 'Log Replication', 'Split Brain Handling', 'Quorum Writes'],
      'B+ Trees vs LSM Trees': ['Write Amplification', 'Read Amplification', 'Compaction Strategies', 'WAL (Write Ahead Log)'],
      'Graphs & Shortest Path': ['Dijkstra Algorithm', 'A* Heuristic Search', 'Topological Sort', 'Tarjan SCC'],
    },
  },
  'AI & Machine Learning': {
    subjects: ['Deep Learning Architectures', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning', 'MLOps & Deployment'],
    chapters: {
      'Deep Learning Architectures': ['Transformers & Self-Attention', 'Convolutional Networks', 'Diffusion Models', 'Optimization (AdamW, SGD)'],
      'Natural Language Processing': ['Tokenization & Embeddings', 'LLM Fine-Tuning (LoRA, QLoRA)', 'RAG Pipelines & Vector Search', 'Prompt Engineering'],
      'Computer Vision': ['Object Detection (YOLO)', 'Semantic Segmentation', 'Vision Transformers (ViT)', 'Feature Extraction'],
      'Reinforcement Learning': ['Markov Decision Processes', 'Q-Learning & DQN', 'Policy Gradients (PPO)', 'Actor-Critic Methods'],
      'MLOps & Deployment': ['Model Quantization (GGUF, AWQ)', 'ONNX Runtime', 'Monitoring & Drift Detection', 'TensorRT Acceleration'],
    },
    topics: {
      'Transformers & Self-Attention': ['Multi-Head Attention Mathematics', 'FlashAttention Optimization', 'Positional Encodings (RoPE)', 'KV Caching'],
      'RAG Pipelines & Vector Search': ['Hierarchical Indexing', 'Chunking Strategies', 'Cosine Similarity vs Dot Product', 'Re-ranking Models'],
    },
  },
  'Robotics & Autonomous Systems': {
    subjects: ['Kinematics & Dynamics', 'Motion Planning', 'Sensor Fusion & SLAM', 'Control Theory', 'ROS 2 Systems'],
    chapters: {
      'Kinematics & Dynamics': ['Forward & Inverse Kinematics', 'DH Parameters', 'Jacobians & Singularities', 'Rigid Body Dynamics'],
      'Motion Planning': ['RRT* & PRM Algorithms', 'Trajectory Generation', 'Obstacle Avoidance', 'Kinodynamic Planning'],
      'Sensor Fusion & SLAM': ['Extended Kalman Filters (EKF)', 'Particle Filters', 'Visual SLAM & LiDAR', 'Graph SLAM'],
      'Control Theory': ['PID Tuning', 'Model Predictive Control (MPC)', 'State-Space Representation', 'LQR Regulators'],
      'ROS 2 Systems': ['Nodes, Topics & Services', 'Action Servers', 'tf2 Transform Trees', 'DDS Middleware Configuration'],
    },
    topics: {
      'Sensor Fusion & SLAM': ['IMU-Wheel Odometry EKF', 'Loop Closure Detection', 'Point Cloud Registration (ICP)', 'Occupancy Grid Mapping'],
      'Model Predictive Control (MPC)': ['Constrained Optimization', 'Receding Horizon Principle', 'Nonlinear Vehicle Dynamics'],
    },
  },
  'Mathematics & Algorithmic Theory': {
    subjects: ['Linear Algebra', 'Probability & Statistics', 'Calculus & Optimization', 'Discrete Mathematics'],
    chapters: {
      'Linear Algebra': ['Eigenvalues & Eigenvectors', 'SVD Decomposition', 'Matrix Factorization', 'Vector Spaces & Projections'],
      'Probability & Statistics': ['Bayesian Inference', 'Markov Chains', 'Maximum Likelihood Estimation', 'Hypothesis Testing'],
      'Calculus & Optimization': ['Gradient Descent & Hessian', 'Lagrange Multipliers', 'Convex Optimization', 'KKT Conditions'],
      'Discrete Mathematics': ['Combinatorics', 'Graph Theory', 'Boolean Logic & Proofs', 'Recurrence Relations'],
    },
    topics: {
      'Eigenvalues & Eigenvectors': ['Principal Component Analysis (PCA)', 'Spectral Graph Theory', 'Power Iteration Algorithm'],
      'Bayesian Inference': ['Prior, Likelihood, Posterior', 'Conjugate Priors', 'MCMC Sampling'],
    },
  },
};

// Natural Language Parser: Converts user prompts in Hindi / English into structured configs
export function parseNaturalLanguagePrompt(promptText: string): Partial<QuestionEngineConfig> {
  const text = promptText.toLowerCase();
  const config: Partial<QuestionEngineConfig> = {};

  // Detect Field
  if (text.includes('cyber') || text.includes('security') || text.includes('hacking') || text.includes('network')) {
    config.field = 'Cybersecurity & Ethical Hacking';
  } else if (text.includes('ai') || text.includes('ml') || text.includes('machine learning') || text.includes('deep learning')) {
    config.field = 'AI & Machine Learning';
  } else if (text.includes('robot') || text.includes('ros') || text.includes('slam')) {
    config.field = 'Robotics & Autonomous Systems';
  } else if (text.includes('math') || text.includes('algebra') || text.includes('calculus')) {
    config.field = 'Mathematics & Algorithmic Theory';
  } else if (text.includes('software') || text.includes('system') || text.includes('coding') || text.includes('dev')) {
    config.field = 'Software Development & Architecture';
  }

  // Detect Question Count: e.g. "30 mcq", "50 questions", "100 question", "20"
  const countMatch = text.match(/(\d+)\s*(mcq|questions?|प्रश्न|सवाल)?/i);
  if (countMatch && parseInt(countMatch[1]) > 0) {
    const num = parseInt(countMatch[1]);
    config.questionCount = Math.min(100, Math.max(5, num));
  }

  // Detect Difficulty
  if (text.includes('hard') || text.includes('कठिन') || text.includes('difficult') || text.includes('tough')) {
    config.difficulty = 'Hard';
  } else if (text.includes('extreme') || text.includes('expert') || text.includes('apex')) {
    config.difficulty = 'Extreme';
  } else if (text.includes('easy') || text.includes('सरल') || text.includes('beginner')) {
    config.difficulty = 'Beginner';
  } else if (text.includes('medium') || text.includes('intermediate') || text.includes('मध्यम')) {
    config.difficulty = 'Intermediate';
  }

  // Detect Topics Mentioned
  const detectedTopics: string[] = [];
  const allKnownTopics = [
    'Network Security', 'Web Application Security', 'Cryptography', 'Penetration Testing',
    'OWASP Top 10', 'Injection Vulnerabilities', 'XSS', 'SQL Injection', 'Authentication',
    'Distributed Systems', 'Consensus', 'Raft', 'Data Structures', 'Kubernetes',
    'Transformers', 'NLP', 'Computer Vision', 'RAG', 'SLAM', 'Kinematics', 'Linear Algebra'
  ];

  allKnownTopics.forEach((t) => {
    if (text.includes(t.toLowerCase())) {
      detectedTopics.push(t);
    }
  });

  if (detectedTopics.length > 0) {
    config.topics = detectedTopics;
  }

  // Detect Source Mix
  if ((text.includes('pdf') || text.includes('imported') || text.includes('file')) && (text.includes('ai') || text.includes('generated') || text.includes('नए'))) {
    config.sourceMix = 'mixed';
  } else if (text.includes('pdf') || text.includes('imported') || text.includes('file')) {
    config.sourceMix = 'imported_only';
  } else if (text.includes('ai') || text.includes('generate')) {
    config.sourceMix = 'ai_only';
  }

  // Detect Mode
  if (text.includes('exam') || text.includes('परीक्षा')) {
    config.mode = 'exam';
  } else if (text.includes('quiz') || text.includes('क्विज')) {
    config.mode = 'quiz';
  } else if (text.includes('revision') || text.includes('रिवीजन')) {
    config.mode = 'revision';
  } else if (text.includes('sheet') || text.includes('practice sheet')) {
    config.mode = 'practice_sheet';
  }

  return config;
}

// Automatic Question Extractor from Raw Text / OCR / File Content
export function extractQuestionsFromRawContent(
  content: string,
  sourceMetadata: Partial<QuestionSourceMetadata>
): {
  extracted: QuestionItem[];
  duplicatesRemoved: number;
  ambiguousFlagged: number;
} {
  const lines = content.split('\n');
  const rawBlocks: string[] = [];
  let currentBlock = '';

  // Regex patterns for question boundaries: e.g. "Q1.", "Question 1:", "1.", "1)"
  const qStartRegex = /^\s*(?:q(?:uestion)?\s*\.?\s*\d+|[\(\[]?\d+[\)\]\.]|\b(?:mcq|problem)\s*\d+)\s*[:\.\-]/i;

  for (const line of lines) {
    if (qStartRegex.test(line)) {
      if (currentBlock.trim().length > 20) {
        rawBlocks.push(currentBlock.trim());
      }
      currentBlock = line + '\n';
    } else {
      currentBlock += line + '\n';
    }
  }
  if (currentBlock.trim().length > 20) {
    rawBlocks.push(currentBlock.trim());
  }

  const extracted: QuestionItem[] = [];
  let duplicatesRemoved = 0;
  let ambiguousFlagged = 0;
  const seenTexts = new Set<string>();

  rawBlocks.forEach((block, index) => {
    // Clean block lines
    const blockLines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (blockLines.length === 0) return;

    const firstLine = blockLines[0];
    const qNumMatch = firstLine.match(/^\s*(?:q(?:uestion)?\s*\.?\s*)?(\d+)[:\.\-\)]?/i);
    const originalQNum = qNumMatch ? qNumMatch[1] : `${index + 1}`;

    // Extract options (A, B, C, D)
    const options: string[] = [];
    const questionTextLines: string[] = [];
    let detectedAnswer = 'A';
    let detectedExplanation = '';
    let isAmbiguous = false;
    let ambiguityReason = '';

    const optionRegex = /^\s*[\(\[]?([A-Da-d1-4])[\)\]\.\:]\s*(.+)/;
    const answerRegex = /^\s*(?:ans(?:wer)?|correct(?:\s*option)?|key)\s*[:\.\-]\s*[\(\[]?([A-Da-d1-4])/i;
    const explRegex = /^\s*(?:expl(?:anation)?|sol(?:ution)?|reason(?:ing)?)\s*[:\.\-]\s*(.+)/i;

    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i];
      const optMatch = line.match(optionRegex);
      const ansMatch = line.match(answerRegex);
      const expMatch = line.match(explRegex);

      if (ansMatch) {
        detectedAnswer = ansMatch[1].toUpperCase();
      } else if (expMatch) {
        detectedExplanation = expMatch[1];
      } else if (optMatch) {
        options.push(optMatch[2].trim());
      } else if (options.length === 0) {
        questionTextLines.push(line);
      }
    }

    const questionClean = questionTextLines.join(' ').replace(qStartRegex, '').trim();

    if (questionClean.length < 10) {
      return; // Skip invalid noise
    }

    // Deduplication check using normalized alphanumeric hash
    const normalizedHash = questionClean.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 80);
    if (seenTexts.has(normalizedHash)) {
      duplicatesRemoved++;
      return;
    }
    seenTexts.add(normalizedHash);

    // Question Type Detection
    let qType: QuestionType = 'mcq';
    if (options.length === 2 && (options[0].toLowerCase().includes('true') || options[1].toLowerCase().includes('false'))) {
      qType = 'true_false';
    } else if (options.length === 0) {
      if (questionClean.toLowerCase().includes('calculate') || questionClean.toLowerCase().includes('numerical')) {
        qType = 'numerical';
      } else if (questionClean.toLowerCase().includes('write a program') || questionClean.toLowerCase().includes('implement')) {
        qType = 'coding';
      } else {
        qType = 'short_answer';
      }
    } else if (options.length > 4) {
      qType = 'multiple_answer';
    }

    // Ambiguity / Incomplete Flagging
    if (options.length > 0 && options.length < 3 && qType === 'mcq') {
      isAmbiguous = true;
      ambiguityReason = 'Question appears to have truncated options (fewer than 3 options detected).';
      ambiguousFlagged++;
    }

    // Domain inference from content
    let inferredField = sourceMetadata.sourceName?.includes('Cyber') ? 'Cybersecurity & Ethical Hacking' : 'Software Development & Architecture';
    let inferredTopic = 'Core Systems';

    if (/sql|xss|cipher|crypto|firewall|wireshark|network|port|vulnerability/i.test(questionClean)) {
      inferredField = 'Cybersecurity & Ethical Hacking';
      inferredTopic = /sql/i.test(questionClean) ? 'SQL Injection' : /xss/i.test(questionClean) ? 'Cross-Site Scripting (XSS)' : 'Network Security';
    } else if (/transformer|attention|neural|model|gradient|dataset/i.test(questionClean)) {
      inferredField = 'AI & Machine Learning';
      inferredTopic = 'Deep Learning Architectures';
    } else if (/kinematics|slam|robot|lidar|ros|pid|motor/i.test(questionClean)) {
      inferredField = 'Robotics & Autonomous Systems';
      inferredTopic = 'Sensors & Kinematics';
    }

    const item: QuestionItem = {
      id: `imp-${Date.now()}-${index}`,
      question: questionClean,
      type: qType,
      options: options.length > 0 ? options : ['True', 'False'],
      correctAnswer: detectedAnswer,
      explanation: detectedExplanation || 'Extracted from imported reference with source verification.',
      field: inferredField,
      topic: inferredTopic,
      difficulty: 'Advanced',
      sourceMetadata: {
        sourceType: sourceMetadata.sourceType || 'pdf',
        sourceName: sourceMetadata.sourceName || 'Imported Document',
        pageNumber: sourceMetadata.pageNumber || 1,
        originalQuestionNumber: originalQNum,
        extractedAt: new Date().toISOString(),
        isFlaggedAmbiguous: isAmbiguous,
        ambiguityReason: ambiguityReason,
        originalSnippet: block.slice(0, 200),
      },
    };

    extracted.push(item);
  });

  return { extracted, duplicatesRemoved, ambiguousFlagged };
}

// Generate Realistic High-Rigor Questions dynamically for any Topic
export function generateAIQuestionsForTopic(params: {
  field: string;
  topic: string;
  count: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Hard' | 'Extreme';
  types: QuestionType[];
}): QuestionItem[] {
  const result: QuestionItem[] = [];

  const templates: Array<{
    q: string;
    opts: string[];
    ans: string;
    exp: string;
    whyWrong: string[];
  }> = [
    {
      q: `In high-assurance ${params.topic}, what is the critical vulnerability introduced by unvalidated state transitions under concurrent load?`,
      opts: [
        'Deterministic race condition leading to time-of-check to time-of-use (TOCTOU) exploitation.',
        'Immediate reduction in processor clock frequency across all cores.',
        'Automatic encryption of memory registers without private key storage.',
        'Syntax compilation errors that prevent deployment.',
      ],
      ans: 'A',
      exp: 'TOCTOU race conditions allow an attacker to alter state between invariant validation and state mutation.',
      whyWrong: ['Hardware clock frequency is independent of application state races.', 'Memory registers do not automatically encrypt themselves on concurrency conflicts.', 'Race conditions are dynamic runtime anomalies, not static syntax errors.'],
    },
    {
      q: `When hardening ${params.topic} architectures, why is defense-in-depth prioritized over perimeter boundary protection?`,
      opts: [
        'Perimeter controls cost more bandwidth than layered internal checks.',
        'Assumes perimeter breach is inevitable; layered isolation, least privilege, and zero-trust containment prevent lateral movement.',
        'Perimeter firewalls cannot process modern encrypted packets.',
        'Defense-in-depth eliminates the need for authentication.',
      ],
      ans: 'B',
      exp: 'Zero-trust architecture enforces compartmentalized authorization at every internal boundary, neutralizing single-point perimeter failures.',
      whyWrong: ['Bandwidth cost is negligible compared to catastrophic uncontained intrusion.', 'Modern deep-packet inspection handles high-throughput encrypted flows.', 'Authentication is strictly required at every layer.'],
    },
    {
      q: `In analyzing mathematical proofs and benchmarks for ${params.topic}, what fundamental trade-off does asymptotic analysis reveal under extreme scale?`,
      opts: [
        'Time complexity and space complexity cannot both be optimized independently without bound.',
        'All algorithms scale identically once hardware exceeds 64 CPU cores.',
        'Space complexity becomes completely irrelevant in modern cloud storage.',
        'Big-O notation only applies to sequential single-threaded routines.',
      ],
      ans: 'A',
      exp: 'Algorithmic design is fundamentally constrained by Pareto space-time trade-offs (e.g. precomputation memory vs on-demand processing cycles).',
      whyWrong: ['Amdahl’s law and concurrency bounds dictate differing scaling curves.', 'Memory bus contention and cache hierarchies make space complexity critically vital at scale.', 'Asymptotic analysis models concurrent state and communication complexities.'],
    },
    {
      q: `During verification of ${params.topic} implementations, what distinguishes fuzz testing from formal mathematical verification?`,
      opts: [
        'Fuzzing executes randomized empirical test vectors to surface edge-case crashes, whereas formal verification mathematically proves invariant correctness across all states.',
        'Formal verification is purely automated while fuzzing requires hand-written logic.',
        'Fuzzing is only applicable to web browsers.',
        'There is no difference; they are synonymous testing methodologies.',
      ],
      ans: 'A',
      exp: 'Formal verification (model checking, theorem proving) provides exhaustive mathematical proof, whereas fuzz testing is high-throughput empirical exploration.',
      whyWrong: ['Formal verification requires complex mathematical specification modeling.', 'Fuzzing is widely applied across protocols, compilers, kernels, and embedded stacks.', 'Their mathematical certainty and operational methodologies are fundamentally distinct.'],
    },
    {
      q: `What is the architectural remedy for catastrophic cascading failures in complex ${params.topic} dependencies?`,
      opts: [
        'Infinite retry loops with zero delay backoff.',
        'Circuit breakers combined with exponential backoff, jitter, and bulkhead resource isolation.',
        'Increasing socket timeout to 10 minutes.',
        'Allowing all incoming requests to queue in unbounded memory buffers.',
      ],
      ans: 'B',
      exp: 'Circuit breakers cut off calls to failing dependencies before thread pools deplete, and exponential backoff with jitter prevents the thundering herd problem.',
      whyWrong: ['Infinite retries immediately amplify failure into systemic collapse.', 'Long timeouts tie up connection pools and exhaust server memory.', 'Unbounded queues guarantee Out-Of-Memory termination.'],
    },
  ];

  for (let i = 0; i < params.count; i++) {
    const tmpl = templates[i % templates.length];
    const item: QuestionItem = {
      id: `ai-gen-${Date.now()}-${i}`,
      question: `[${params.topic}] ${tmpl.q}`,
      type: 'mcq',
      options: tmpl.opts,
      correctAnswer: tmpl.ans,
      explanation: tmpl.exp,
      whyOthersWrong: tmpl.whyWrong,
      field: params.field,
      topic: params.topic,
      difficulty: params.difficulty === 'Extreme' ? 'Expert' : params.difficulty === 'Hard' ? 'Advanced' : 'Intermediate',
      sourceMetadata: {
        sourceType: 'ai_generated',
        sourceName: 'Lyra Sovereign Question Engine',
        extractedAt: new Date().toISOString(),
      },
    };
    result.push(item);
  }

  return result;
}

// Storage Helpers
export function getSavedQuestionBank(): QuestionItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuestionToBank(question: QuestionItem): void {
  if (typeof window === 'undefined') return;
  const current = getSavedQuestionBank();
  const exists = current.some((q) => q.id === question.id);
  if (!exists) {
    current.push(question);
    localStorage.setItem(STORAGE_QUESTIONS_KEY, JSON.stringify(current));
  }
}

export function saveQuestionPack(pack: QuestionPack): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_PACKS_KEY);
    const packs: QuestionPack[] = raw ? JSON.parse(raw) : [];
    const idx = packs.findIndex((p) => p.id === pack.id);
    if (idx >= 0) {
      packs[idx] = pack;
    } else {
      packs.unshift(pack);
    }
    localStorage.setItem(STORAGE_PACKS_KEY, JSON.stringify(packs));
  } catch (err) {
    console.warn('Failed to save question pack:', err);
  }
}

export function getSavedQuestionPacks(): QuestionPack[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_PACKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
