import React, { useState } from 'react';
import { QuestionItem, RevisionItem, IntensityMode } from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import {
  FileQuestion,
  BookmarkCheck,
  Bookmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Layers,
  Award,
  Zap,
} from 'lucide-react';

interface PracticeViewProps {
  questions: QuestionItem[];
  revisions: RevisionItem[];
  intensityMode: IntensityMode;
  onToggleSaveQuestion: (questionId: string) => void;
  onRecordAttempt: (questionId: string, isCorrect: boolean) => void;
  onAddGeneratedQuestions: (newQuestions: QuestionItem[]) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  questions,
  revisions,
  intensityMode,
  onToggleSaveQuestion,
  onRecordAttempt,
  onAddGeneratedQuestions,
}) => {
  const [activeTab, setActiveTab] = useState<'practice' | 'bank' | 'revisions' | 'pyq'>('practice');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Daily target based on intensity mode
  const targetQuestions = intensityMode === 'CHEETAH' ? 50 : intensityMode === 'RABBIT' ? 35 : 25;
  const attemptedCount = questions.filter((q) => (q.attemptsCount || 0) > 0).length;

  const currentQ = questions[currentQuestionIndex] || questions[0];

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer) return; // already answered
    const optionLetter = opt.trim().slice(0, 1);
    setSelectedAnswer(optionLetter);
    setShowExplanation(true);
    const isCorrect = optionLetter === currentQ.correctAnswer;
    onRecordAttempt(currentQ.id, isCorrect);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % questions.length);
  };

  const handleGenerateMoreQuestions = async () => {
    setIsGenerating(true);
    try {
      const generated = await executeLyraTask('generate_quiz', {
        topic: currentQ.topic || 'System Design',
        difficulty: currentQ.difficulty || 'Intermediate',
      });
      if (Array.isArray(generated)) {
        const mapped = generated.map((g: any, idx: number) => ({
          id: `gen-${Date.now()}-${idx}`,
          question: g.question,
          type: g.type || 'mcq',
          options: g.options || ['A', 'B', 'C', 'D'],
          correctAnswer: g.correctAnswer || 'A',
          explanation: g.explanation || 'Analyzed by Lyra Question Engine.',
          topic: g.topic || 'General Practice',
          difficulty: 'Intermediate' as const,
          savedForRevision: false,
        }));
        onAddGeneratedQuestions(mapped);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const savedQuestions = questions.filter((q) => q.savedForRevision);
  const pyqQuestions = questions.filter((q) => q.isPyq);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <FileQuestion size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">QUESTION LAB & SMART REVISION</h2>
              <p className="text-xs text-slate-400">
                Targeted practice • Official PYQ paper archive • Spaced retrieval engine
              </p>
            </div>
          </div>
        </div>

        {/* Practice Modes Navigation */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'practice'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Practice Lab
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'bank'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookmarkCheck size={13} /> Saved Bank ({savedQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('pyq')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'pyq'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award size={13} /> PYQ Center ({pyqQuestions.length})
          </button>
          <button
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'revisions'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RotateCcw size={13} /> Smart Revision ({revisions.length})
          </button>
        </div>
      </div>

      {/* Daily Volume Target Indicator */}
      <div className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
            <Zap size={18} />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Today's Practice Target: {targetQuestions} Questions
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                Mode: {intensityMode}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Attempted today: <strong>{attemptedCount}</strong> of {targetQuestions} minimum target
            </div>
          </div>
        </div>

        <button
          disabled={isGenerating}
          onClick={handleGenerateMoreQuestions}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isGenerating ? <RotateCcw size={13} className="animate-spin" /> : <Sparkles size={13} className="text-indigo-400" />}
          Generate More Questions
        </button>
      </div>

      {/* TAB 1: INTERACTIVE PRACTICE LAB */}
      {activeTab === 'practice' && currentQ && (
        <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
          {/* Question Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-indigo-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-300 font-medium">{currentQ.topic}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                {currentQ.difficulty}
              </span>
              {currentQ.isPyq && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentQ.pyqYear || 'Official PYQ'}
                </span>
              )}
            </div>

            <button
              onClick={() => onToggleSaveQuestion(currentQ.id)}
              className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 text-xs ${
                currentQ.savedForRevision
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Save for Spaced Revision Bank"
            >
              {currentQ.savedForRevision ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
              <span>{currentQ.savedForRevision ? 'Saved' : 'Save for Revision'}</span>
            </button>
          </div>

          {/* Question Prompt */}
          <div className="text-sm font-semibold text-white leading-relaxed">
            {currentQ.question}
          </div>

          {/* Options */}
          {currentQ.options && (
            <div className="space-y-2.5">
              {currentQ.options.map((opt, idx) => {
                const optLetter = opt.trim().slice(0, 1);
                const isSelected = selectedAnswer === optLetter;
                const isCorrect = optLetter === currentQ.correctAnswer;

                let btnStyle = 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/60 text-slate-300';
                if (selectedAnswer) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-white font-semibold ring-1 ring-emerald-500';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={!!selectedAnswer}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full p-3.5 rounded-2xl border text-left text-xs transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedAnswer && isCorrect && <CheckCircle2 size={16} className="text-emerald-400 shrink-0 ml-2" />}
                    {selectedAnswer && isSelected && !isCorrect && (
                      <XCircle size={16} className="text-rose-400 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Detailed Explanation */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 animate-in fade-in">
              <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                <Sparkles size={14} /> Lyra Verified Explanation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Navigation Bottom Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500">
              Attempts: {currentQ.attemptsCount || 0} • Status: {currentQ.lastResult || 'Unattempted'}
            </span>
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Next Question →
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED QUESTION BANK */}
      {activeTab === 'bank' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Questions saved for deeper spaced recall ({savedQuestions.length} items):
          </div>
          {savedQuestions.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
              No questions saved yet. Click "Save for Revision" on any question to bookmark it here.
            </div>
          ) : (
            savedQuestions.map((q) => (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400">{q.topic}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Answer: {q.correctAnswer}</span>
                </div>
                <div className="text-xs text-white font-medium">{q.question}</div>
                <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  {q.explanation}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: PYQ CENTER */}
      {activeTab === 'pyq' && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">
            Official Previous-Year Examination Papers & Extracted Benchmark Questions:
          </div>
          {pyqQuestions.map((q) => (
            <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {q.pyqYear}
                </span>
                <span className="text-xs text-slate-400">{q.topic}</span>
              </div>
              <div className="text-xs font-semibold text-white">{q.question}</div>
              <div className="text-[11px] text-slate-400">{q.explanation}</div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: SMART REVISION */}
      {activeTab === 'revisions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Forgetting-Risk & Retention Stabilizer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks time elapsed since learning, previous accuracy, and cognitive forgetting decay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {revisions.map((rev) => {
              const riskBadge = {
                Critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                High: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                Medium: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                Low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              }[rev.forgettingRisk];

              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskBadge}`}>
                        Forgetting Risk: {rev.forgettingRisk}
                      </span>
                      <span className="text-xs font-mono font-bold text-cyan-400">
                        Mastery Evidence: {rev.masteryScore}/100
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{rev.topic}</h4>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                      {rev.recommendedAction}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Last revised: {rev.lastRevisedDate}</span>
                    <button
                      onClick={() => alert(`Starting 15-minute active recall drill for: ${rev.topic}`)}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                    >
                      Start Drill
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
