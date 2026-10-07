import React, { useState, useEffect } from 'react';
import { QuestionItem, QuestionPack } from '../../types';
import { LyraAvatar } from '../lyra/LyraAvatar';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Flag,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Zap,
  Info,
  Clock,
  Award,
  AlertTriangle,
  FileText,
} from 'lucide-react';

interface UnifiedPracticeSessionProps {
  pack: QuestionPack;
  questions: QuestionItem[];
  onClose: () => void;
  onRecordResult?: (packId: string, score: number) => void;
}

export const UnifiedPracticeSession: React.FC<UnifiedPracticeSessionProps> = ({
  pack,
  questions,
  onClose,
  onRecordResult,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [savedForRevision, setSavedForRevision] = useState<Record<string, boolean>>({});
  const [flaggedAmbiguous, setFlaggedAmbiguous] = useState<Record<string, boolean>>({});
  const [viewingSourceModal, setViewingSourceModal] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(
    (pack.timeLimitMinutes || 30) * 60
  );

  const currentQ = questions[currentIdx] || questions[0];
  const total = questions.length;

  // Timer countdown
  useEffect(() => {
    if (sessionCompleted || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionCompleted, timeLeftSeconds]);

  if (!currentQ) return null;

  const currentSelected = selectedAnswers[currentQ.id];
  const isAnswered = currentSelected !== undefined;
  const isCorrect = currentSelected === currentQ.correctAnswer;

  const handleSelectOption = (letter: string) => {
    if (pack.mode === 'practice' && isAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: letter,
    }));
    if (pack.mode === 'practice') {
      setShowExplanation(true);
    }
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < total - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setSessionCompleted(true);
      // Calculate final score
      let correctCount = 0;
      questions.forEach((q) => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      const score = Math.round((correctCount / total) * 100);
      onRecordResult?.(pack.id, score);
    }
  };

  const handlePrev = () => {
    setShowExplanation(false);
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const toggleSaveRevision = () => {
    setSavedForRevision((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const toggleFlagAmbiguous = () => {
    setFlaggedAmbiguous((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Completion stats
  const correctTotal = questions.filter((q) => selectedAnswers[q.id] === q.correctAnswer).length;
  const accuracyPercent = Math.round((correctTotal / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] h-[860px]">
        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-slate-800/80 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <LyraAvatar mood="Focused" size="sm" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>{pack.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {pack.mode.toUpperCase()} MODE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Question {currentIdx + 1} of {total} • Topic: {currentQ.topic}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Countdown Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-cyan-300">
              <Clock size={12} />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold"
              title="Close session"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 shrink-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${Math.round(((currentIdx + 1) / total) * 100)}%` }}
          />
        </div>

        {/* COMPLETION SUMMARY SCREEN */}
        {sessionCompleted ? (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col items-center justify-center text-center">
            <div className="p-4 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 inline-flex">
              <Award size={48} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                PRACTICE SESSION COMPLETED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {accuracyPercent >= 80 ? 'Mastery Level Performance!' : 'Practice Completed!'}
              </h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Lyra has cataloged your answers into your personal development history.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md w-full pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-white font-mono">{accuracyPercent}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {correctTotal}/{total}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Correct</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {Object.keys(savedForRevision).filter((k) => savedForRevision[k]).length}
                </div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">Saved</div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setSelectedAnswers({});
                  setSessionCompleted(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-all flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Re-Attempt Pack</span>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* ACTIVE QUESTION VIEW */
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
            {/* Question Header & Source Context Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono font-bold">
                  Q{currentIdx + 1}
                </span>
                <span className="text-xs font-semibold text-slate-300">{currentQ.field || pack.field}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Source-Aware Metadata Badge */}
              <div className="flex items-center gap-2">
                {currentQ.sourceMetadata && (
                  <button
                    onClick={() => setViewingSourceModal(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-indigo-300 transition-all"
                    title="Click to view original source reference context"
                  >
                    <FileText size={12} />
                    <span>
                      Source: {currentQ.sourceMetadata.sourceName.slice(0, 24)}
                      {currentQ.sourceMetadata.originalQuestionNumber && ` (#${currentQ.sourceMetadata.originalQuestionNumber})`}
                    </span>
                  </button>
                )}

                <button
                  onClick={toggleSaveRevision}
                  className={`p-1.5 rounded-xl transition-all ${
                    savedForRevision[currentQ.id]
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title={savedForRevision[currentQ.id] ? 'Saved for Revision' : 'Save for Revision'}
                >
                  {savedForRevision[currentQ.id] ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                </button>

                <button
                  onClick={toggleFlagAmbiguous}
                  className={`p-1.5 rounded-xl transition-all ${
                    flaggedAmbiguous[currentQ.id]
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                  title="Report question ambiguity or answer conflict"
                >
                  <Flag size={14} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/90 text-sm sm:text-base font-semibold text-white leading-relaxed">
              {currentQ.question}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-2.5">
              {(currentQ.options || ['True', 'False']).map((optText, optIdx) => {
                const optLetter = ['A', 'B', 'C', 'D'][optIdx] || String.fromCharCode(65 + optIdx);
                const isSelected = currentSelected === optLetter;
                const isTheCorrectOption = currentQ.correctAnswer === optLetter;

                let stateClass = 'bg-slate-900/40 border-slate-800 text-slate-300 hover:border-slate-700';
                if (showExplanation) {
                  if (isTheCorrectOption) {
                    stateClass = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                  } else if (isSelected && !isTheCorrectOption) {
                    stateClass = 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500';
                  }
                } else if (isSelected) {
                  stateClass = 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg ring-1 ring-indigo-500';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optLetter)}
                    className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${stateClass}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        showExplanation && isTheCorrectOption
                          ? 'bg-emerald-600 text-white'
                          : showExplanation && isSelected && !isTheCorrectOption
                          ? 'bg-rose-600 text-white'
                          : isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {optLetter}
                    </div>
                    <div className="text-xs sm:text-sm font-medium leading-relaxed pt-0.5">{optText}</div>
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Deep Analysis Box */}
            {showExplanation && (
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3 animate-in fade-in duration-200 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                        <CheckCircle2 size={16} /> Correct! Option {currentQ.correctAnswer}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-bold text-rose-400">
                        <XCircle size={16} /> Incorrect! Correct is Option {currentQ.correctAnswer}
                      </span>
                    )}
                  </div>

                  {currentQ.sourceMetadata && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Source-Verified: {currentQ.sourceMetadata.sourceType.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="text-slate-200 leading-relaxed bg-black/30 p-3.5 rounded-2xl border border-white/5">
                  <strong>Explanation:</strong> {currentQ.explanation}
                </div>

                {/* Why Other Options Are Wrong */}
                {currentQ.whyOthersWrong && currentQ.whyOthersWrong.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Why Alternative Options Fail:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                      {currentQ.whyOthersWrong.map((why, idx) => (
                        <li key={idx}>{why}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Source Reference Modal Preview */}
        {viewingSourceModal && currentQ.sourceMetadata && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-md w-full p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  <span>Original Source Provenance</span>
                </span>
                <button
                  onClick={() => setViewingSourceModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
                <div>
                  <strong>Document:</strong> {currentQ.sourceMetadata.sourceName}
                </div>
                <div>
                  <strong>Source Type:</strong> {currentQ.sourceMetadata.sourceType.toUpperCase()}
                </div>
                {currentQ.sourceMetadata.pageNumber && (
                  <div>
                    <strong>Page/Section:</strong> Page {currentQ.sourceMetadata.pageNumber}
                  </div>
                )}
                {currentQ.sourceMetadata.originalQuestionNumber && (
                  <div>
                    <strong>Original Question Number:</strong> #{currentQ.sourceMetadata.originalQuestionNumber}
                  </div>
                )}
              </div>

              {currentQ.sourceMetadata.originalSnippet && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Original Snippet:</span>
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto">
                    {currentQ.sourceMetadata.originalSnippet}
                  </div>
                </div>
              )}

              <button
                onClick={() => setViewingSourceModal(false)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Deck */}
        {!sessionCompleted && (
          <div className="px-6 py-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {!showExplanation && pack.mode === 'practice' && (
                <button
                  onClick={() => setShowExplanation(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                >
                  <HelpCircle size={13} />
                  <span>Show Answer</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <span>{currentIdx === total - 1 ? 'Finish Session' : 'Next Question'}</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
