import React, { useState } from 'react';
import { ResourceItem, BookChapter, Goal } from '../../types';
import { executeLyraTask } from '../../services/lyraService';
import {
  FolderOpen,
  Plus,
  Book,
  FileText,
  Globe,
  FileCode,
  Sparkles,
  Layers,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

interface ResourcesViewProps {
  resources: ResourceItem[];
  bookChapters: BookChapter[];
  goals: Goal[];
  onAddResource: (res: ResourceItem) => void;
  onAddChapter: (chapter: BookChapter) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  bookChapters,
  goals,
  onAddResource,
  onAddChapter,
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'my_book'>('resources');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceItem['type']>('PDF');
  const [newSource, setNewSource] = useState('');
  const [newHours, setNewHours] = useState(15);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<BookChapter | null>(bookChapters[0] || null);

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topicsDetected.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateResource = () => {
    if (!newTitle.trim()) return;
    const item: ResourceItem = {
      id: `res-${Date.now()}`,
      title: newTitle,
      type: newType,
      source: newSource || 'Uploaded User Document',
      dateAdded: new Date().toISOString().split('T')[0],
      relatedGoals: [goals[0]?.id || 'goal-1'],
      topicsDetected: ['Core Principles', 'Architecture', 'Verification Methods'],
      difficulty: 'Intermediate',
      estimatedStudyHours: Number(newHours),
      status: 'analyzed',
      tags: ['Active Resource', newType],
    };
    onAddResource(item);
    setNewTitle('');
    setNewSource('');
    setShowAddModal(false);
  };

  const handleSynthesizeNewChapter = async () => {
    setIsSynthesizing(true);
    try {
      const topicName = 'Unified Distributed Consensus & Hardware Integration';
      const result = await executeLyraTask('synthesize_book_chapter', { topic: topicName });
      if (result) {
        const newChap: BookChapter = {
          id: `bk-${Date.now()}`,
          volume: result.volume || 'Volume I',
          chapterNumber: bookChapters.length + 1,
          title: result.chapterTitle || topicName,
          concept: result.sections?.[0]?.concept || 'Unified system architecture',
          explanation: result.sections?.[0]?.explanation || 'Synthesis of uploaded papers and system design documents.',
          example: result.sections?.[0]?.example || 'Practical pipeline benchmarking.',
          practiceQuestion: result.sections?.[0]?.practiceQuestion || 'Derive the message overhead for n replicas.',
          revisionPrompt: result.sections?.[0]?.revisionPrompt || 'Active recall on partition boundaries.',
          assessmentMethod: result.sections?.[0]?.assessmentMethod || 'Evidence-based lab benchmark.',
          sourceReferences: result.sourceReferences || ['Curriculum Standards 2026'],
        };
        onAddChapter(newChap);
        setSelectedChapter(newChap);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400">
              <FolderOpen size={20} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">RESOURCE INTELLIGENCE & MY BOOK</h2>
              <p className="text-xs text-slate-400">
                Upload PDFs, syllabi & papers → Unified curriculum → AI-synthesized knowledge book
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Navigation */}
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === 'resources'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('my_book')}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                activeTab === 'my_book'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen size={13} /> MY BOOK (Synthesized)
            </button>
          </div>

          {activeTab === 'resources' ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus size={14} /> Add Resource
            </button>
          ) : (
            <button
              disabled={isSynthesizing}
              onClick={handleSynthesizeNewChapter}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isSynthesizing ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
              Synthesize Chapter
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: RESOURCES */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded books, syllabus, topics, papers..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-3xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-indigo-400">
                      {res.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {res.estimatedStudyHours}h study
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{res.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">Source: {res.source}</p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {res.topicsDetected.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-900 text-[10px] text-slate-300 border border-slate-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} /> AI Analyzed
                  </span>
                  <span>Added {res.dateAdded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: MY BOOK (SYNTHESIZED KNOWLEDGE) */}
      {activeTab === 'my_book' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Chapter Outline */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 px-1 mb-1">
              Table of Chapters ({bookChapters.length})
            </div>
            {bookChapters.map((chap) => {
              const isSelected = selectedChapter?.id === chap.id;
              return (
                <div
                  key={chap.id}
                  onClick={() => setSelectedChapter(chap)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900/50 text-slate-300'
                  }`}
                >
                  <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mb-0.5">
                    Chapter {chap.chapterNumber}
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-1">{chap.title}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">{chap.concept}</div>
                </div>
              );
            })}
          </div>

          {/* Chapter Reader & Synthesized Sections */}
          <div className="lg:col-span-8">
            {selectedChapter ? (
              <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-5">
                <div className="pb-4 border-b border-slate-800">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    {selectedChapter.volume} • Chapter {selectedChapter.chapterNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedChapter.title}</h3>
                </div>

                {/* Concept & Explanation */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Core Concept
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs font-medium text-indigo-200 leading-relaxed">
                    {selectedChapter.concept}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Detailed Explanation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedChapter.explanation}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Concrete Applied Example
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-200 leading-relaxed">
                    {selectedChapter.example}
                  </div>
                </div>

                {/* Practice & Revision Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                      Target Practice Question
                    </div>
                    <p className="text-xs text-slate-300">{selectedChapter.practiceQuestion}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                    <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-1">
                      Active Recall Prompt
                    </div>
                    <p className="text-xs text-slate-300">{selectedChapter.revisionPrompt}</p>
                  </div>
                </div>

                {/* Sources */}
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  <span className="font-semibold text-slate-400">Synthesized Source References: </span>
                  {selectedChapter.sourceReferences.join(' • ')}
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                Select a chapter from the outline on the left.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-950 border border-slate-800 p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Add Learning Resource</h4>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Resource Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Linux Kernel Internals & Memory Architecture"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                >
                  <option value="PDF">PDF Document</option>
                  <option value="Book">Textbook</option>
                  <option value="Syllabus">Curriculum / Syllabus</option>
                  <option value="PYQ Paper">Previous Year Questions</option>
                  <option value="Website">Website / Article</option>
                  <option value="Note">Personal Notes</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Estimated Hours</label>
                <input
                  type="number"
                  value={newHours}
                  onChange={(e) => setNewHours(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Source / Citation</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="e.g. ArXiv paper / University library / Open courseware"
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateResource}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Add Resource
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
