import { MCQAssessmentQuestion, AssessmentResult, IntensityMode, UserProfile, Goal } from '../types';

export const PASSING_CRITERIA: Record<IntensityMode, number> = {
  TURTLE: 70,
  RABBIT: 75,
  CHEETAH: 80,
  TIGER: 85,
};

export const ASSESSMENT_SECTIONS = [
  'Goals & Milestone Alignment',
  'Discipline & Focus Friction',
  'Time Availability & Allocation',
  'Active Learning & Cognitive Habits',
  'Progress Corridor Accountability',
  'Workload & Burnout Management',
  'Domain & Systems Problem Solving',
];

export function generatePersonalizedAssessment(
  profile: UserProfile,
  goals: Goal[],
  targetMode: IntensityMode
): MCQAssessmentQuestion[] {
  const goal1 = goals[0]?.name || 'Autonomous Systems & Architecture';
  const goal2 = goals[1]?.name || 'Deep STEM & Execution Velocity';
  const targetHrs =
    targetMode === 'TIGER'
      ? '10-12 hours/day'
      : targetMode === 'CHEETAH'
      ? '7-8 hours/day'
      : targetMode === 'RABBIT'
      ? '4-5 hours/day'
      : '2 hours/day';

  const questions: MCQAssessmentQuestion[] = [
    // --- SECTION 1: Goals & Milestone Alignment (8 Questions) ---
    {
      id: 'q1',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: `Under ${targetMode} intensity, your primary goal "${goal1}" requires strict sub-milestone pacing. How do you handle unexpected dependency delays between consecutive modules?`,
      options: [
        'Halt all activities until the blocked dependency is completely resolved.',
        'Pivot temporarily to an independent parallel subsystem while running diagnostic timeboxes on the blocker.',
        'Lower the target benchmark criteria to mark the milestone complete ahead of time.',
        'Abandon the dependency entirely and switch to an unrelated auxiliary topic.',
      ],
      correctIndex: 1,
      explanation: 'Elite systems execution requires preserving momentum through decoupled parallel tracks without compromising rigorous acceptance criteria.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q2',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: `When defining Measurable Key Results for "${goal2}", which metric most reliably indicates true cognitive mastery rather than the illusion of competence?`,
      options: [
        'Total hours logged reading documentation and watching tutorial series.',
        'Subjective feeling of confidence after reviewing summarized notes.',
        'First-principles problem decomposition and building verified proof-of-work capstones under timed test constraints.',
        'Collecting bookmarks and comprehensive reference repos for future study.',
      ],
      correctIndex: 2,
      explanation: 'Proof-of-work under constraint is the only empirical measure of true knowledge and procedural capability.',
      difficulty: 'Challenging',
    },
    {
      id: 'q3',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: `You discover that 30% of your current curriculum for "${goal1}" consists of outdated legacy practices. What is the optimal tactical response?`,
      options: [
        'Complete the outdated portion anyway to maintain the original plan unchanged.',
        'Prune the deprecated modules immediately and reallocate the saved bandwidth toward high-leverage modern primitives.',
        'Double daily hours to finish the obsolete material faster.',
        'Abandon the entire goal and start over from scratch with a completely new subject.',
      ],
      correctIndex: 1,
      explanation: 'Sovereign learners ruthlessly audit syllabus leverage and eliminate negative-ROI content to maximize high-velocity mastery.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q4',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: 'How should milestone acceptance criteria be documented to prevent retrospective rationalization of poor work?',
      options: [
        'Keep criteria flexible and define them at the end based on whatever was completed.',
        'Specify binary, verifiable test conditions (pass/fail benchmarks, deployed capstones) prior to beginning execution.',
        'Rely exclusively on personal mood and motivation on the milestone due date.',
        'Let secondary metrics like pages turned substitute for working functional code.',
      ],
      correctIndex: 1,
      explanation: 'Pre-committing to objective, verifiable test criteria eliminates confirmation bias and self-deception.',
      difficulty: 'Challenging',
    },
    {
      id: 'q5',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: `If your primary goal "${goal1}" begins conflicting with your secondary interests, what principle guides resolution in ${targetMode} mode?`,
      options: [
        'Dilute effort equally across all interests so none feel neglected.',
        'Enforce absolute priority sequencing: the primary sovereign objective receives non-negotiable prime focus blocks before any secondary interest.',
        'Switch focus every 3 days between competing goals to stay stimulated.',
        'Stop tracking hours altogether to reduce psychological friction.',
      ],
      correctIndex: 1,
      explanation: 'Extreme execution requires radical prioritization. Diluted focus produces mediocrity across all tracks.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q6',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: 'What is the danger of setting vanity milestones (e.g., "skim 500 pages") versus outcome milestones?',
      options: [
        'There is no danger; input volume is the only factor that matters.',
        'Vanity milestones produce cognitive fatigue without verifiable skill acquisition or neural retention.',
        'Vanity milestones take too little time to execute.',
        'Outcome milestones cannot be measured objectively.',
      ],
      correctIndex: 1,
      explanation: 'Activity is not achievement. Outcome milestones guarantee actual capability transfer and retention.',
      difficulty: 'Challenging',
    },
    {
      id: 'q7',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: 'When should a milestone deadline be renegotiated rather than defended at all costs?',
      options: [
        'Whenever an evening video game or social distraction arises.',
        'Only when empirical empirical reality reveals an unpredicted structural dependency or valid external emergency, accompanied by an immediate recalculation of the corridor.',
        'Every time a single daily target is missed.',
        'Never under any circumstances, even during acute illness.',
      ],
      correctIndex: 1,
      explanation: 'Disciplined flexibility acknowledges genuine empirical constraints while recalibrating the overall corridor with mathematical honesty.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q8',
      section: 'Goals & Milestone Alignment',
      sectionIndex: 0,
      question: 'In tracking long-term milestones, what role do weekly retrospectives play?',
      options: [
        'They are passive administrative overhead that wastes valuable study time.',
        'They act as a closed-loop feedback sensor comparing planned velocity vs actual output, adjusting input parameters before drift accumulates.',
        'They serve only to celebrate achievements without critical examination of failures.',
        'They replace the need for daily execution tracking.',
      ],
      correctIndex: 1,
      explanation: 'Without continuous feedback loops, small deviations compound invisibly into total trajectory collapse.',
      difficulty: 'Challenging',
    },

    // --- SECTION 2: Discipline & Focus Friction (8 Questions) ---
    {
      id: 'q9',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'During a scheduled 90-minute deep work block, you experience acute cognitive resistance and impulse to check social feeds. What is the evidence-based protocol?',
      options: [
        'Immediately indulge the urge for 5 minutes as a reward.',
        'Practice the "10-minute urge surfing" protocol: acknowledge the dopamine deficit, maintain physical posture, and focus on the lowest-friction sub-step of the current problem.',
        'Abandon the current subject and search for something entertaining.',
        'Force yourself to stare at a blank wall until the 90 minutes expire.',
      ],
      correctIndex: 1,
      explanation: 'Urge surfing and initiating micro-actions bridges the limbic resistance gap without breaking the cognitive bubble.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q10',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'What is the "Dopamine Reset / Friction Inversion" strategy for environment design?',
      options: [
        'Keeping your smartphone next to your keyboard with notifications on so you stay connected.',
        'Increasing physical and cognitive friction for low-value distractions (phone in another room, site blockers) while reducing friction for deep work (workspace primed, IDE loaded).',
        'Consuming sugary energy drinks whenever motivation dips.',
        'Studying exclusively in busy, unpredictable public spaces.',
      ],
      correctIndex: 1,
      explanation: 'Willpower is an exhaustible resource; architecture of environment always defeats raw willpower over sustained periods.',
      difficulty: 'Challenging',
    },
    {
      id: 'q11',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'How does the "Pre-Commitment Device" (like WHO AM I? Intensity Locks) prevent ego depletion?',
      options: [
        'By forcing the user into impossible stress.',
        'By removing the daily decision fatigue of "how much should I work today", converting optional choice into settled policy.',
        'By eliminating the need to ever plan daily tasks.',
        'By guaranteeing that work is always easy and fun.',
      ],
      correctIndex: 1,
      explanation: 'Pre-commitment eliminates deliberative friction, preserving glucose and cognitive bandwidth for actual execution.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q12',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'When deep focus is fractured by an unavoidable interruption, what is the fastest way to resume cognitive state?',
      options: [
        'Rely on memory to reconstruct where you were.',
        'Maintain a continuous "Breadcrumb Trail / Next Immediate Action" note before detaching, allowing instantaneous re-entry upon return.',
        'Restart the entire module from page 1.',
        'Take the rest of the day off because focus was interrupted.',
      ],
      correctIndex: 1,
      explanation: 'Breadcrumb notes preserve the mental cache state, reducing re-entry cognitive overhead from 25 minutes down to seconds.',
      difficulty: 'Challenging',
    },
    {
      id: 'q13',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'What distinguishes pseudo-work from genuine deep work?',
      options: [
        'Pseudo-work feels exhausting and difficult.',
        'Pseudo-work creates the sensation of being busy (reorganizing tabs, recoloring notes) without advancing real problem-solving or producing measurable artifacts.',
        'Pseudo-work involves solving hard equations.',
        'Deep work never requires reading.',
      ],
      correctIndex: 1,
      explanation: 'Pseudo-work is low-cognitive-load evasion dressed as productivity. Deep work produces proof-of-work.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q14',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'How should you manage internal negative self-talk ("I am falling behind, this is too hard") during challenging drills?',
      options: [
        'Suppress the emotion completely and pretend it does not exist.',
        'Reframe the sensation as somatic proof of neuroplastic adaptation: difficulty is the biological signal that learning is actively occurring.',
        'Quit the session immediately to protect self-esteem.',
        'Complain on social forums for validation.',
      ],
      correctIndex: 1,
      explanation: 'Cognitive reappraisal of friction as neurobiological growth prevents affective surrender.',
      difficulty: 'Challenging',
    },
    {
      id: 'q15',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'What is the optimal session duration for high-intensity cognitive absorption before attentional decay occurs?',
      options: [
        '8 continuous hours with zero breaks.',
        '75–90 minute ultradian cycles followed by 10–15 minutes of low-stimulus defused recovery.',
        '5 minutes of work followed by 45 minutes of rest.',
        'Duration does not matter as long as music is playing loudly.',
      ],
      correctIndex: 1,
      explanation: 'Ultradian rhythms govern biological attention spans. 90-minute focus blocks maximize synaptic consolidation.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q16',
      section: 'Discipline & Focus Friction',
      sectionIndex: 1,
      question: 'Why is multitasking considered the antithesis of elite technical discipline?',
      options: [
        'It is actually superior and should be practiced daily.',
        'Context-switching imposes an acute "attention residue" tax, reducing effective cognitive capacity by up to 40% and multiplying error rates.',
        'It takes less time than single-tasking.',
        'Computers do not support multiple windows.',
      ],
      correctIndex: 1,
      explanation: 'Attention residue from rapid context switching degrades executive functioning and working memory depth.',
      difficulty: 'Challenging',
    },

    // --- SECTION 3: Time Availability & Allocation (8 Questions) ---
    {
      id: 'q17',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: `In ${targetMode} intensity, you are committing to approximately ${targetHrs}. How do you rigorously carve this time from your weekly schedule?`,
      options: [
        'Hope to find free hours at the end of the day after leisure and social activities.',
        'Time-block non-negotiable morning and evening deep work windows directly in your calendar before allocating any secondary commitments.',
        'Sleep only 3 hours per night indefinitely.',
        'Multitask while watching television and commuting.',
      ],
      correctIndex: 1,
      explanation: 'Time is not found; it is aggressively allocated by placing major rocks before the sand.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q18',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'What is Parkinson’s Law, and how must you apply it to study tasks?',
      options: [
        'Work expands to fill the time available for its completion; therefore, assign strict, compressed timeboxes to force high synthesis velocity.',
        'Work should be given unlimited time so it is done perfectly.',
        'Time management is impossible for creative subjects.',
        'Every task takes exactly 1 hour regardless of complexity.',
      ],
      correctIndex: 0,
      explanation: 'Tight, realistic timeboxes induce urgency and prune extraneous deliberation, speeding up execution.',
      difficulty: 'Challenging',
    },
    {
      id: 'q19',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'Why must every sustainable weekly schedule include "Buffer / Recovery Slots"?',
      options: [
        'To be lazy and sleep all day.',
        'Because life possesses stochastic variance; scheduled buffer slots absorb inevitable delays without breaking the green track corridor.',
        'Buffer slots are for low-intensity workers only.',
        'They allow you to play video games during study time.',
      ],
      correctIndex: 1,
      explanation: 'Fragile plans with 100% capacity utilization break on the first unexpected event. Robust schedules engineer buffer capacity.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q20',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'If you have a surprise commitment that consumes 3 hours of your planned study block today, what is the professional recovery protocol?',
      options: [
        'Give up on the entire week and wait until next Monday to start over.',
        'Log the deficit in WHO AM I? immediately, activate a 2-hour recovery allocation on the upcoming weekend buffer block, and protect tomorrow’s baseline.',
        'Double your intake of stimulants and study until 4:00 AM tonight.',
        'Pretend the hours were completed so the graph looks green.',
      ],
      correctIndex: 1,
      explanation: 'Transparent accountability and programmed buffer absorption maintains long-term trajectory integrity.',
      difficulty: 'Challenging',
    },
    {
      id: 'q21',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'What is the "Saying No / Opportunity Cost Filter" required for high-velocity achievement?',
      options: [
        'Saying yes to every invitation and event to stay popular.',
        'Recognizing that saying yes to low-leverage socializing or casual commitments is implicitly saying no to your sovereign mastery and life goals.',
        'Ignoring family emergencies.',
        'Never speaking to anyone.',
      ],
      correctIndex: 1,
      explanation: 'Every choice is a trade-off. Extreme outcomes require ruthless defense of high-leverage hours.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q22',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'How should you organize your daily focus blocks relative to your circadian peak?',
      options: [
        'Do the most demanding, complex analytical tasks during your peak cognitive alertness window, leaving administrative and passive tasks for low-energy troughs.',
        'Do easy tasks when you are most awake and tackle hard mathematics right before bed.',
        'Study whenever without regard to energy levels.',
        'Drink coffee at midnight to force high alertness.',
      ],
      correctIndex: 0,
      explanation: 'Aligning high-friction synthesis with peak biological alertness multiplies cognitive efficiency.',
      difficulty: 'Challenging',
    },
    {
      id: 'q23',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'What is the danger of "chronically borrowing from sleep" to hit daily hour targets?',
      options: [
        'There is no danger; sleep is optional for true grinders.',
        'Sleep deprivation destroys hippocampal memory consolidation, spikes error rates, impairs executive function, and leads to catastrophic velocity collapse.',
        'Sleep makes you lazy.',
        'Sleep increases daily hours available.',
      ],
      correctIndex: 1,
      explanation: 'Memory consolidation and neural repair occur during deep and REM sleep. Sacrificing sleep is burning your cognitive capital.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q24',
      section: 'Time Availability & Allocation',
      sectionIndex: 2,
      question: 'When planning weekly hours, what is the difference between "Gross Available Hours" and "Net Focused Hours"?',
      options: [
        'They are always identical.',
        'Gross hours include transitions and breaks; net hours measure strictly pure deep work with eyes on problem and hands on tools.',
        'Net hours are always larger than gross hours.',
        'Gross hours measure only weekend work.',
      ],
      correctIndex: 1,
      explanation: 'Honest time auditing measures net focused throughput rather than elapsed time sitting near a desk.',
      difficulty: 'Challenging',
    },

    // --- SECTION 4: Active Learning & Cognitive Habits (8 Questions) ---
    {
      id: 'q25',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'Which learning methodology delivers the highest retention coefficient according to cognitive science?',
      options: [
        'Re-reading high-lighted textbook chapters multiple times.',
        'Active Recall combined with Spaced Repetition (testing yourself from blank memory and spacing intervals).',
        'Listening to recorded lectures passively while falling asleep.',
        'Copying verbatim paragraphs into aesthetic notebooks.',
      ],
      correctIndex: 1,
      explanation: 'The testing effect forces neural retrieval pathways to strengthen; passive re-reading only creates familiarity bias.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q26',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'What is the "Feynman Technique" and how does it diagnose comprehension depth?',
      options: [
        'Reading physics textbooks by Richard Feynman.',
        'Explaining a complex concept in plain, jargon-free language to an imagined beginner; breakdowns in explanation expose exact knowledge gaps.',
        'Memorizing mathematical proofs word-for-word.',
        'Using technical buzzwords to impress others.',
      ],
      correctIndex: 1,
      explanation: 'If you cannot explain a concept simply, you rely on semantic mimicry rather than structural understanding.',
      difficulty: 'Challenging',
    },
    {
      id: 'q27',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'What is "Interleaved Practice" versus "Blocked Practice"?',
      options: [
        'Interleaving mixes different problem types and concepts within a session, training problem classification and retrieval flexibility.',
        'Blocked practice is always superior because it is easier.',
        'Interleaving means studying only one topic for six months straight.',
        'They are synonymous terms for rote memorization.',
      ],
      correctIndex: 0,
      explanation: 'Interleaving feels harder during practice but produces vastly superior long-term discrimination and transfer.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q28',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'Why should you attempt solving hard problems BEFORE reading the provided solutions?',
      options: [
        'It is a waste of time to struggle without the answer key.',
        'The cognitive struggle primes the brain’s neural networks, creating an epistemic hunger that makes the eventual solution stick permanently.',
        'To prove that problem authors make mistakes.',
        'Because solution keys are always incorrect.',
      ],
      correctIndex: 1,
      explanation: 'Generative struggle primes memory schemas, dramatically enhancing the encoding of the subsequent solution.',
      difficulty: 'Challenging',
    },
    {
      id: 'q29',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'What constitutes an effective Spaced Repetition Schedule for technical recall?',
      options: [
        'Reviewing everything every single day forever.',
        'Reviewing after Day 1, Day 3, Day 7, Day 16, and Day 35, matching the logarithmic decay of the Ebbinghaus forgetting curve.',
        'Reviewing only the night before the final benchmark assessment.',
        'Never reviewing past topics.',
      ],
      correctIndex: 1,
      explanation: 'Spacing reviews just as the memory trace is about to fade maximizes synaptic consolidation efficiency.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q30',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'How do you detect the "Illusion of Competence" when studying code or engineering architectures?',
      options: [
        'If the code compiles on the author’s computer, you know it.',
        'If you can follow along with a video tutorial, you have mastered it.',
        'Close the reference entirely; if you cannot recreate the architecture or write the algorithms from scratch on a blank screen, you do not truly know it.',
        'Ask AI to write it and assume you understand.',
      ],
      correctIndex: 2,
      explanation: 'Recognition is not recall. True mastery is generative execution from a clean slate.',
      difficulty: 'Challenging',
    },
    {
      id: 'q31',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'What role does "Mental Modeling" play in advanced engineering disciplines?',
      options: [
        'Memorizing arbitrary syntax.',
        'Building internal dynamic simulations of system interactions, state transitions, and failure modes to predict emergent behavior.',
        'Drawing pretty flowcharts with no functional backing.',
        'Relying purely on trial and error without theory.',
      ],
      correctIndex: 1,
      explanation: 'Elite engineers reason from underlying invariant physics and state machines, not surface-level pattern copying.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q32',
      section: 'Active Learning & Cognitive Habits',
      sectionIndex: 3,
      question: 'How should you document your mistakes during daily practice?',
      options: [
        'Ignore mistakes and only celebrate successes.',
        'Maintain an active "Failure & Error Log" detailing root cause, false assumptions, correct principle, and a targeted drill to prevent recurrence.',
        'Delete wrong answers immediately so no one sees them.',
        'Blame test questions for being unfair.',
      ],
      correctIndex: 1,
      explanation: 'Errors are the highest-density information signals available. Systematically converting errors into principles accelerates mastery.',
      difficulty: 'Challenging',
    },

    // --- SECTION 5: Progress Corridor Accountability (8 Questions) ---
    {
      id: 'q33',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'In the WHO AM I? wide-track philosophy, what does the "Corridor" represent?',
      options: [
        'A rigid, microscopic single-line track where a 5-minute deviation triggers total failure.',
        'An adaptive bounded zone with acceptable upper and lower velocity thresholds, allowing tactical exploration while preventing trajectory divergence.',
        'An arbitrary visual decoration with no behavioral meaning.',
        'A suggestion that can be ignored at will.',
      ],
      correctIndex: 1,
      explanation: 'The wide track balances sovereign tactical agility with mathematical discipline bounds.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q34',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'What constitutes a "YELLOW (Warning)" status on your track metrics?',
      options: [
        'You have achieved 100% of all goals ahead of time.',
        'Accumulated delays or missed hours have breached the safe central buffer, indicating that immediate recovery is required to prevent a RED breach.',
        'The server is offline.',
        'You decided to change your favorite color.',
      ],
      correctIndex: 1,
      explanation: 'YELLOW is an active warning that velocity decay is threatening long-term milestone dates unless corrected promptly.',
      difficulty: 'Challenging',
    },
    {
      id: 'q35',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'How should you calculate your true weekly Learning Velocity?',
      options: [
        'Hours spent sitting at desk with browser open.',
        'Net validated focused deep work hours executed against verified curriculum tasks divided by target hours.',
        'Number of articles added to reading list.',
        'Estimate based on how tired you feel.',
      ],
      correctIndex: 1,
      explanation: 'Velocity is measured through verified work units completed within the planned time envelope.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q36',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'When your Track Status shifts to RED, what is the mandatory immediate action?',
      options: [
        'Pretend everything is fine and double down on complex new goals.',
        'Initiate the Recovery Protocol: freeze new exploratory projects, diagnose the leak, and execute a focused catch-up block to re-center within the corridor.',
        'Delete your account and start over.',
        'Complain to peers that the system is too strict.',
      ],
      correctIndex: 1,
      explanation: 'RED demands emergency intervention to re-establish corridor equilibrium before systemic failure occurs.',
      difficulty: 'Challenging',
    },
    {
      id: 'q37',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'Why does WHO AM I? enforce transparent mathematical tracking of missed hours rather than resetting them to zero daily?',
      options: [
        'To cause emotional guilt.',
        'Because time is irreversible in reality; unacknowledged deficits compound into permanent project failure unless explicitly accounted for and recovered.',
        'To slow down the application database.',
        'It is a bug in the calculation.',
      ],
      correctIndex: 1,
      explanation: 'Mathematical honesty is the bedrock of sovereign engineering. Reality cannot be fooled by artificial resets.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q38',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'What is the relationship between consistency percentage and long-term skill acquisition?',
      options: [
        'Consistency does not matter; only last-minute cramming creates experts.',
        'High daily consistency produces compounding synaptic consolidation, whereas erratic binge-and-bust cycles lead to rapid memory decay.',
        'Consistency reduces intelligence.',
        'Compounding only applies to finance, not neural skills.',
      ],
      correctIndex: 1,
      explanation: 'Compound interest of small daily deliberate practice creates vast qualitative divergence over 12 months.',
      difficulty: 'Challenging',
    },
    {
      id: 'q39',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'How do you prevent "Metric Gaming" (optimizing for the metric rather than the underlying skill)?',
      options: [
        'Pair every quantitative quantity metric (hours logged) with an un-gameable qualitative quality benchmark (timed blind capstone evaluation).',
        'Stop tracking metrics entirely.',
        'Only count hours when you feel completely happy.',
        'Rely entirely on automated random numbers.',
      ],
      correctIndex: 0,
      explanation: 'Goodhart’s Law is mitigated by pairing quantity metrics with strict, objective quality hurdles.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q40',
      section: 'Progress Corridor Accountability',
      sectionIndex: 4,
      question: 'What is the sovereign definition of personal accountability?',
      options: [
        'Needing a teacher or boss standing over you to make you work.',
        'Internalized radical ownership: viewing yourself as the sole architect of your trajectory, choices, and outcomes regardless of external noise.',
        'Blaming circumstances and environment whenever goals are missed.',
        'Expecting AI to do all the thinking for you.',
      ],
      correctIndex: 1,
      explanation: 'Sovereignty begins with radical internal locus of control and total ownership of execution.',
      difficulty: 'Challenging',
    },

    // --- SECTION 6: Workload & Burnout Management (8 Questions) ---
    {
      id: 'q41',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: `In high-demand modes like Cheetah and Tiger, what is the primary early warning sign of chronic central nervous system (CNS) fatigue?`,
      options: [
        'Minor muscle soreness after gym.',
        'Elevated resting heart rate, persistent brain fog, emotional irritability, loss of working memory bandwidth, and inability to achieve deep focus.',
        'Feeling excited to learn.',
        'Hunger after a 4-hour study session.',
      ],
      correctIndex: 1,
      explanation: 'CNS fatigue manifests as neuro-affective blunting and executive function degradation long before physical collapse.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q42',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'What is the distinction between "Active Recovery" and "Passive Overstimulation"?',
      options: [
        'Active recovery involves walking in nature, sleep, light mobility, and non-dopaminergic rest; passive overstimulation involves doomscrolling and intense gaming that exhausts dopamine reserves.',
        'They are both identical forms of relaxation.',
        'Active recovery means studying more math.',
        'Passive overstimulation is healthier for the brain.',
      ],
      correctIndex: 0,
      explanation: 'Screen overstimulation does not restore prefrontal cortex resources; it deepens neural exhaustion.',
      difficulty: 'Challenging',
    },
    {
      id: 'q43',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'Why is the Deload Protocol essential in high-intensity cognitive development?',
      options: [
        'It is not essential; true champions never take deloads.',
        'Periodic programmatic reductions in volume (e.g. 50% volume for 4 days every 5 weeks) allow deep biological supercompensation and tissue adaptation.',
        'Deloading is quitting.',
        'It causes you to forget everything you learned.',
      ],
      correctIndex: 1,
      explanation: 'Supercompensation occurs during recovery. Without deload phases, progressive overload turns into chronic breakdown.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q44',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'How should you manage acute nutritional and hydration parameters during 6+ hour study blocks?',
      options: [
        'Drink sugary sodas and eat fast-food junk continually.',
        'Maintain stable blood glucose via complex macronutrients, prioritize electrolytes and water, and avoid massive insulin spikes that trigger postprandial somnolence.',
        'Fast completely for 48 hours without water.',
        'Rely entirely on synthetic caffeine pills.',
      ],
      correctIndex: 1,
      explanation: 'Glucose volatility directly impairs prefrontal cognitive control. Metabolic stability preserves steady mental clarity.',
      difficulty: 'Challenging',
    },
    {
      id: 'q45',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'What is the psychological antidote to "Imposter Syndrome" during rapid acceleration?',
      options: [
        'Bragging on the internet to mask insecurity.',
        'Anchoring self-worth to objective proof-of-work, disciplined execution consistency, and progressive mastery rather than comparison with others.',
        'Quitting high-level technical goals.',
        'Pretending you already know everything.',
      ],
      correctIndex: 1,
      explanation: 'Proof of work grounded in verified outputs dissolves subjective imposter anxiety.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q46',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'How does chronic non-restorative sleep affect emotional regulation and study persistence?',
      options: [
        'It has no effect.',
        'It disinhibits the amygdala and decouples prefrontal control, magnifying feelings of frustration and causing premature abandonment of hard problems.',
        'It improves math skills.',
        'It speeds up reading comprehension.',
      ],
      correctIndex: 1,
      explanation: 'Sleep deprivation directly impairs prefrontal-amygdalar connectivity, sabotaging emotional grit.',
      difficulty: 'Challenging',
    },
    {
      id: 'q47',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'What is the "Minimum Effective Dose" concept in technical practice?',
      options: [
        'Practicing as little as humanly possible.',
        'Identifying the precise volume and intensity of deliberate practice that triggers optimal neural adaptation without generating non-recoverable systemic fatigue.',
        'Taking medicine while coding.',
        'Studying for 24 hours straight.',
      ],
      correctIndex: 1,
      explanation: 'Training beyond the adaptive capacity produces junk volume and delayed recovery without additional skill acquisition.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q48',
      section: 'Workload & Burnout Management',
      sectionIndex: 5,
      question: 'When life throws an acute crisis (illness, bereavement), how should a sovereign learner handle intensity?',
      options: [
        'Force Tiger mode regardless, even if it leads to medical hospitalization.',
        'Strategically downshift to Turtle mode or use the emergency pause, preserving baseline sanity while keeping the neural pilot light alive.',
        'Quit learning permanently and abandon all ambitions.',
        'Pretend nothing happened and do zero hours without logging.',
      ],
      correctIndex: 1,
      explanation: 'Tactical survival downshifting maintains continuity without catastrophic life failure.',
      difficulty: 'Challenging',
    },

    // --- SECTION 7: Domain & Systems Problem Solving (8 Questions) ---
    {
      id: 'q49',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'In engineering complex distributed architectures, what does the CAP theorem state regarding consistency and availability during network partitions?',
      options: [
        'A distributed system can guarantee both perfect Consistency and Availability simultaneously during a Network Partition.',
        'In the presence of a network partition (P), a distributed system must choose between Consistency (CP) or Availability (AP); it cannot guarantee both.',
        'Distributed systems are never partitioned.',
        'Consistency and availability are unrelated concepts.',
      ],
      correctIndex: 1,
      explanation: 'The CAP theorem dictates an immutable physical trade-off between consistency and availability when partitions occur.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q50',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'When debugging a critical race condition in concurrent software, what is the first principled diagnostic step?',
      options: [
        'Randomly add sleep statements throughout the codebase hoping the timing changes.',
        'Isolate shared mutable state, identify thread interleaving boundaries, and formulate a verifiable hypothesis using synchronization primitives or immutability.',
        'Blame the operating system compiler.',
        'Re-run the program 100 times without changes.',
      ],
      correctIndex: 1,
      explanation: 'Principled concurrency debugging requires isolating mutable state boundaries and verifying synchronization invariants.',
      difficulty: 'Challenging',
    },
    {
      id: 'q51',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'What is the algorithmic significance of Big-O asymptotic analysis when scaling data structures?',
      options: [
        'It measures the exact wall-clock milliseconds an algorithm takes on one specific laptop.',
        'It describes the upper bound scaling behavior of time or space complexity as input size N grows toward infinity, independent of hardware constants.',
        'It is a marketing label for cloud servers.',
        'It only applies to small numbers.',
      ],
      correctIndex: 1,
      explanation: 'Asymptotic complexity isolates algorithmic efficiency from machine-specific constants, enabling scalable architecture design.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q52',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'In modern autonomous systems, why is a closed-loop control architecture (e.g. PID or Model Predictive Control) preferred over open-loop execution?',
      options: [
        'Open-loop is always more accurate and cheaper.',
        'Closed-loop systems continuously sample environmental feedback via sensors to compute real-time error vectors and adjust actuators against disturbances.',
        'Closed loop requires no math.',
        'Open-loop systems are self-healing.',
      ],
      correctIndex: 1,
      explanation: 'Sensor feedback and dynamic error correction enable robust operation in uncertain, stochastic real-world environments.',
      difficulty: 'Challenging',
    },
    {
      id: 'q53',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'What is "First Principles Reasoning" (Aristotelian / Muskian) compared to reasoning by analogy?',
      options: [
        'Copying what competitors or peers are doing and tweaking by 5%.',
        'Boiling a problem down to its most fundamental physical truths and building up a solution from those invariants, free of legacy assumptions.',
        'Reading historical biographies.',
        'Agreeing with the consensus opinion.',
      ],
      correctIndex: 1,
      explanation: 'First-principles reasoning dismantles conventional assumptions down to bedrock physics, uncovering radical breakthroughs.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q54',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'What is the primary role of idempotency in API design and network transactions?',
      options: [
        'To make requests execute twice as fast.',
        'To ensure that performing an operation multiple times produces the identical side-effect as performing it once, guaranteeing safety under network retries.',
        'To prevent users from sending data.',
        'Idempotency means encryption.',
      ],
      correctIndex: 1,
      explanation: 'Idempotency guarantees distributed safety and data integrity when network packets are duplicated or retried.',
      difficulty: 'Challenging',
    },
    {
      id: 'q55',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'When designing a reliable pipeline, why are backpressure mechanisms essential?',
      options: [
        'They are unnecessary; queues have infinite memory.',
        'Backpressure signals slow downstream consumers to upstream producers to throttle ingress, preventing memory exhaustion and cascading collapse.',
        'Backpressure increases server heat.',
        'Backpressure discards all data automatically.',
      ],
      correctIndex: 1,
      explanation: 'Unbounded queues without backpressure lead to out-of-memory errors and systemic crash under load spikes.',
      difficulty: 'High Rigor',
    },
    {
      id: 'q56',
      section: 'Domain & Systems Problem Solving',
      sectionIndex: 6,
      question: 'What does "Proof of Work" mean for your personal development trajectory in WHO AM I?',
      options: [
        'Collecting certificates of attendance and social media badges.',
        'Publicly verifiable, working, deployed artifacts, codebases, and systems that indisputably demonstrate your capability to the real world.',
        'Talking about what you plan to build someday.',
        'Having high self-esteem with no tangible output.',
      ],
      correctIndex: 1,
      explanation: 'In the sovereign economy, verifiable artifacts and deployed systems are the only currency that commands undeniable respect.',
      difficulty: 'High Rigor',
    },
  ];

  return questions;
}

export function evaluateAssessment(
  questions: MCQAssessmentQuestion[],
  answers: Record<string, number>,
  targetMode: IntensityMode
): AssessmentResult {
  let correctCount = 0;
  const sectionStats: Record<string, { correct: number; total: number }> = {};

  // Initialize sections
  ASSESSMENT_SECTIONS.forEach((s) => {
    sectionStats[s] = { correct: 0, total: 0 };
  });

  questions.forEach((q) => {
    if (!sectionStats[q.section]) {
      sectionStats[q.section] = { correct: 0, total: 0 };
    }
    sectionStats[q.section].total += 1;

    const userAnswer = answers[q.id];
    if (userAnswer === q.correctIndex) {
      correctCount += 1;
      sectionStats[q.section].correct += 1;
    }
  });

  const total = questions.length;
  const scorePercentage = Math.round((correctCount / total) * 100);
  const threshold = PASSING_CRITERIA[targetMode] || 75;
  const passed = scorePercentage >= threshold;

  const sectionBreakdown = Object.entries(sectionStats).map(([section, stats]) => ({
    section,
    correct: stats.correct,
    total: stats.total,
    percentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
  }));

  return {
    totalQuestions: total,
    correctAnswers: correctCount,
    scorePercentage,
    passingThreshold: threshold,
    passed,
    sectionBreakdown,
    targetMode,
    evaluatedAt: new Date().toISOString(),
  };
}
