import React, { useState, useEffect } from 'react';
import {
  MCQAssessmentQuestion,
  AssessmentResult,
  IntensityMode,
  UserProfile,
  Goal,
  IntensityLockState,
} from '../../types';
import {
  generatePersonalizedAssessment,
  evaluateAssessment,
  ASSESSMENT_SECTIONS,
  PASSING_CRITERIA,
} from '../../services/assessmentService';
import { LyraAvatar } from '../lyra/LyraAvatar';
import {
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Zap,
  Award,
  ChevronRight,
  Flag,
  BarChart3,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface IntensityAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  goals: Goal[];
  currentLockState: IntensityLockState;
  targetMode: IntensityMode;
  onAssessmentPassed: (newMode: IntensityMode, durationDays: 7 | 30) => void;
}

export const IntensityAssessmentModal: React.FC<IntensityAssessmentModalProps> = ({
  isOpen,
  onClose,
  profile,
  goals,
  currentLockState,
  targetMode,
  onAssessmentPassed,
}) => {
  const [questions, setQuestions] = useState<MCQAssessmentQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState<string>(ASSESSMENT_SECTIONS[0]);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [selectedNewDuration, setSelectedNewDuration] = useState<7 | 30>(30);
  const [showReviewExplanations, setShowReviewExplanations] = useState<boolean>(false);

  // Initialize or re-generate questions when opened
  useEffect(() => {
    if (isOpen) {
      const generated = generatePersonalizedAssessment(profile, goals, targetMode);
      setQuestions(generated);
      setCurrentIdx(0);
      setAnswers({});
      setFlagged({});
      setResult(null);
      setShowReviewExplanations(false);
      setActiveSection(ASSESSMENT_SECTIONS[0]);
    }
  }, [isOpen, targetMode]);

  if (!isOpen) return null;

  const currentQ = questions[currentIdx] || questions[0];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const passingReq = PASSING_CRITERIA[targetMode] || 75;

  const handleSelectOption = (optionIdx: number) => {
    if (result) return; // Locked after evaluation
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIdx,
    }));
  };

  const toggleFlag = () => {
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      if (questions[nextIdx]) {
        setActiveSection(questions[nextIdx].section);
      }
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      if (questions[prevIdx]) {
        setActiveSection(questions[prevIdx].section);
      }
    }
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    if (questions[idx]) {
      setActiveSection(questions[idx].section);
    }
  };

  const handleSubmit = () => {
    setIsEvaluating(true);
    setTimeout(() => {
      const evaluated = evaluateAssessment(questions, answers, targetMode);
      setResult(evaluated);
      setIsEvaluating(false);
    }, 1200);
  };

  const handleConfirmUnlock = () => {
    if (result && result.passed) {
      onAssessmentPassed(targetMode, selectedNewDuration);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] h-[860px]">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <LyraAvatar mood="Serious" size="sm" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>LYRA Intensity Reassessment Assessment</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Target: {targetMode} MODE
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Passing Score: ≥{passingReq}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-2">
                <span>56 Challenging Questions across 7 Core Domains</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">
                  Progress: {answeredCount}/{totalQuestions} Answered ({progressPercent}%)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!result && (
              <button
                onClick={handleSubmit}
                disabled={answeredCount < 10}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
                title={answeredCount < 10 ? 'Answer at least 10 questions to submit' : 'Submit for evaluation'}
              >
                <CheckCircle2 size={13} />
                <span>Submit & Evaluate</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold"
              title="Close Assessment"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 shrink-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Evaluation Loading State */}
        {isEvaluating && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="relative">
              <LyraAvatar mood="Focused" size="hero" state="thinking" />
              <div className="absolute -inset-4 rounded-full border border-indigo-500/40 animate-ping pointer-events-none" />
            </div>
            <div className="text-base font-bold text-white">Lyra is evaluating your responses...</div>
            <p className="text-xs text-slate-400 max-w-md">
              Analyzing cognitive discipline, time availability models, goal dependency alignment, and domain systems problem solving.
            </p>
          </div>
        )}

        {/* RESULT VIEW */}
        {!isEvaluating && result && (
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            <div
              className={`p-6 rounded-3xl border text-center space-y-3 ${
                result.passed
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="inline-flex p-3 rounded-2xl bg-black/40 shadow-inner">
                {result.passed ? (
                  <ShieldCheck size={36} className="text-emerald-400" />
                ) : (
                  <AlertCircle size={36} className="text-rose-400" />
                )}
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400">
                  ASSESSMENT DIAGNOSTIC OUTCOME
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  {result.passed ? 'CRITERIA ACHIEVED — MODE UNLOCKED!' : 'REASSESSMENT CRITERIA NOT MET'}
                </h3>
                <p className="text-xs text-slate-300 max-w-xl mx-auto mt-1 leading-relaxed">
                  {result.passed
                    ? `Outstanding rigor, ${profile.name}. Your verified score of ${result.scorePercentage}% surpasses the required ${result.passingThreshold}% threshold for ${targetMode} intensity.`
                    : `Your score of ${result.scorePercentage}% is below the required ${result.passingThreshold}% for ${targetMode} intensity. The lock remains active to protect your trajectory.`}
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-black text-white font-mono">{result.scorePercentage}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Your Score</div>
                </div>
                <div className="text-slate-600 text-2xl font-light">/</div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400 font-mono">≥{result.passingThreshold}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Requirement</div>
                </div>
                <div className="text-slate-600 text-2xl font-light">/</div>
                <div className="text-center">
                  <div className="text-2xl font-black text-white font-mono">
                    {result.correctAnswers}/{result.totalQuestions}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Correct</div>
                </div>
              </div>

              {/* Action when passed: choose new lock duration and apply */}
              {result.passed ? (
                <div className="pt-4 max-w-md mx-auto space-y-3">
                  <div className="text-xs font-bold text-white text-left">
                    Select commitment duration for new {targetMode} mode:
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setSelectedNewDuration(7)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedNewDuration === 7
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">7-Day Sprint Lock</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Flexible testing cycle</div>
                    </button>
                    <button
                      onClick={() => setSelectedNewDuration(30)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedNewDuration === 30
                          ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">30-Day Sovereign Lock</div>
                      <div className="text-[10px] opacity-80 mt-0.5">Full discipline commitment</div>
                    </button>
                  </div>

                  <button
                    onClick={handleConfirmUnlock}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Unlock size={16} />
                    <span>Apply & Lock {targetMode} Mode ({selectedNewDuration} Days)</span>
                  </button>
                </div>
              ) : (
                <div className="pt-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
                  >
                    <RotateCcw size={13} />
                    <span>Re-Attempt Assessment</span>
                  </button>
                  <button
                    onClick={() => setShowReviewExplanations(!showReviewExplanations)}
                    className="px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/40 text-xs font-semibold text-indigo-200 hover:text-white transition-all"
                  >
                    {showReviewExplanations ? 'Hide Explanations' : 'Review Detailed Answers'}
                  </button>
                </div>
              )}
            </div>

            {/* Section Breakdown Radar */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BarChart3 size={14} />
                <span>Performance Breakdown by Assessment Domain</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {result.sectionBreakdown.map((sec, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[200px]">{sec.section}</span>
                      <span
                        className={`font-mono font-bold ${
                          sec.percentage >= 75 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {sec.correct}/{sec.total} ({sec.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full transition-all duration-500 ${
                          sec.percentage >= 75 ? 'bg-emerald-400' : sec.percentage >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanations Review List */}
            {showReviewExplanations && (
              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold text-white uppercase tracking-wider">
                  Question Review & Strategic Explanations
                </div>
                <div className="space-y-2.5">
                  {questions.map((q, idx) => {
                    const userAns = answers[q.id];
                    const isCorrect = userAns === q.correctIndex;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl border text-xs space-y-2 ${
                          isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                            : 'bg-rose-950/20 border-rose-500/30 text-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-white">
                            {idx + 1}. {q.question}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong>Optimal Answer:</strong> {q.options[q.correctIndex]}
                        </div>
                        <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2 rounded-xl border border-indigo-500/20">
                          💡 <em>{q.explanation}</em>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE QUESTION VIEW */}
        {!isEvaluating && !result && currentQ && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Domain Tabs Navigation */}
            <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-900 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
              {ASSESSMENT_SECTIONS.map((secName, secIdx) => {
                const isActive = activeSection === secName;
                const secQuestions = questions.filter((q) => q.section === secName);
                const answeredInSec = secQuestions.filter((q) => answers[q.id] !== undefined).length;

                return (
                  <button
                    key={secName}
                    onClick={() => {
                      setActiveSection(secName);
                      const firstQOfSec = questions.findIndex((q) => q.section === secName);
                      if (firstQOfSec !== -1) setCurrentIdx(firstQOfSec);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{secName}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                        answeredInSec === secQuestions.length && secQuestions.length > 0
                          ? 'bg-emerald-400 text-black font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {answeredInSec}/{secQuestions.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Question Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
              {/* Question Header & Flag */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold">
                    Q{currentIdx + 1} of {totalQuestions}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{currentQ.section}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {currentQ.difficulty}
                  </span>
                </div>

                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs transition-all ${
                    flagged[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title="Flag question for later review"
                >
                  <Flag size={12} />
                  <span>{flagged[currentQ.id] ? 'Flagged' : 'Flag'}</span>
                </button>
              </div>

              {/* Question Text */}
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/90 text-sm sm:text-base font-semibold text-white leading-relaxed">
                {currentQ.question}
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-white'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>
                      <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">{optionText}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Question Navigator Palette */}
            <div className="px-5 py-2.5 bg-slate-950 border-t border-slate-900 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {questions.map((q, idx) => {
                  const isAns = answers[q.id] !== undefined;
                  const isCur = idx === currentIdx;
                  const isFlg = flagged[q.id];

                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={`w-7 h-7 rounded-lg text-[10px] font-mono font-bold shrink-0 transition-all flex items-center justify-center relative ${
                        isCur
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                          : isAns
                          ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-900 text-slate-500 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                      {isFlg && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Navigation Controls */}
            <div className="px-5 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft size={13} />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-400 font-mono hidden sm:block">
                {answeredCount} of {totalQuestions} answered
              </div>

              {currentIdx === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Submit Assessment</span>
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <span>Next Question</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
