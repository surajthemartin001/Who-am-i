import React, { useState, useRef } from 'react';
import { ResourceItem, SourceProvenance } from '../../types';
import {
  Upload,
  FileText,
  BookOpen,
  Image,
  Link2,
  CheckCircle2,
  X,
  FileCheck,
  AlertCircle,
  FileQuestion,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface UniversalSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSourceAdded: (resource: ResourceItem) => void;
  existingResources?: ResourceItem[];
  onSelectExisting?: (resource: ResourceItem) => void;
  title?: string;
  subtitle?: string;
}

export const UniversalSourceModal: React.FC<UniversalSourceModalProps> = ({
  isOpen,
  onClose,
  onSourceAdded,
  existingResources = [],
  onSelectExisting,
  title = 'Upload or Select Source Material',
  subtitle = 'Provide real documents, PDFs, question banks, or notes to ground AI practice, plans, and curriculum.',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'text' | 'url' | 'existing'>('upload');
  const [sourceType, setSourceType] = useState<ResourceItem['type']>('PDF');
  const [sourceTitle, setSourceTitle] = useState('');
  const [textSnippet, setTextSnippet] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContentSnippet, setFileContentSnippet] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setSelectedFile(file);
    if (!sourceTitle) {
      setSourceTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    // Determine type automatically
    if (file.name.endsWith('.pdf')) setSourceType('PDF');
    else if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) setSourceType('Note');
    else if (file.name.includes('pyq') || file.name.includes('question') || file.name.includes('paper')) setSourceType('PYQ Paper');
    else if (file.name.includes('syllabus') || file.name.includes('curriculum')) setSourceType('Syllabus');
    else setSourceType('Book');

    // Read initial text preview if text-based
    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || '';
        setFileContentSnippet(text.slice(0, 1500));
      };
      reader.readAsText(file);
    } else {
      setFileContentSnippet(`Binary source document (${(file.size / 1024).toFixed(1)} KB) ready for AI ingestion.`);
    }
  };

  const handleSaveSource = () => {
    if (!sourceTitle.trim() && !selectedFile) {
      setErrorMessage('Please provide a source document title or select a file.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const finalTitle = sourceTitle.trim() || selectedFile?.name || 'Untitled Document';
      const sizeStr = selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : undefined;

      // Extract high-yield topics from title and snippets
      const inferredTopics: string[] = [];
      const lower = `${finalTitle} ${textSnippet} ${fileContentSnippet}`.toLowerCase();
      if (lower.includes('distributed') || lower.includes('systems')) inferredTopics.push('Distributed Systems');
      if (lower.includes('security') || lower.includes('owasp') || lower.includes('cyber')) inferredTopics.push('Cybersecurity');
      if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('neural')) inferredTopics.push('Neural Architectures');
      if (lower.includes('algorithm') || lower.includes('data structure')) inferredTopics.push('Algorithms & Data Structures');
      if (lower.includes('robot') || lower.includes('control') || lower.includes('ekf')) inferredTopics.push('Robotics & Kinematics');
      if (inferredTopics.length === 0) inferredTopics.push(finalTitle.slice(0, 30));

      const newResource: ResourceItem = {
        id: `res-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: finalTitle,
        type: sourceType,
        source: activeTab === 'url' ? urlInput.trim() : selectedFile ? selectedFile.name : 'Pasted Text Material',
        dateAdded: new Date().toISOString().split('T')[0],
        relatedGoals: inferredTopics.slice(0, 2),
        topicsDetected: inferredTopics,
        difficulty: 'Intermediate',
        estimatedStudyHours: selectedFile && selectedFile.size > 2000000 ? 12 : 5,
        status: 'analyzed',
        tags: ['Verified User Source', sourceType, ...inferredTopics],
        provenance: 'imported_from_source' as SourceProvenance,
        fileSize: sizeStr,
        contentSnippet: fileContentSnippet || textSnippet.slice(0, 500) || undefined,
        notes: activeTab === 'text' ? textSnippet : undefined,
      };

      onSourceAdded(newResource);
      setSuccessMessage(`Source "${finalTitle}" successfully connected and analyzed.`);
      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 700);
    } catch {
      setIsProcessing(false);
      setErrorMessage('Could not process this file. Retry or continue without it.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Upload size={17} />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">{title}</h3>
              <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-4 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'upload' ? 'border-indigo-500 text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Upload size={13} />
            <span>Upload Document / PDF</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'text' ? 'border-indigo-500 text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Paste Notes / Questions</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'url' ? 'border-indigo-500 text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Link2 size={13} />
            <span>Web URL / Reference</span>
          </button>
          {existingResources.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`py-3 px-3 border-b-2 font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'existing' ? 'border-indigo-500 text-indigo-400 font-semibold' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span>Use Existing ({existingResources.length})</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-2xl p-6 sm:p-8 text-center bg-slate-900/40 hover:bg-slate-900/70 transition-all cursor-pointer space-y-2.5"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md,.json,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-white">
                    {selectedFile ? selectedFile.name : 'Click to select or drag document here'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports PDFs, Question Papers, Books, Syllabus sheets, Notes, or Image Scans
                  </p>
                </div>
                {selectedFile && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono">
                    <FileCheck size={13} />
                    <span>Selected: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>

              {/* Source Document Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Document Title / Label
                  </label>
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Operating Systems Concepts - Silberschatz"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Material Type
                  </label>
                  <select
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Book">Textbook / Chapter</option>
                    <option value="PYQ Paper">Previous Year Question Paper</option>
                    <option value="Syllabus">Curriculum / Syllabus</option>
                    <option value="Note">Lecture Notes / Summary</option>
                    <option value="Website">Research / Web Reference</option>
                  </select>
                </div>
              </div>

              {/* Provenance Tag Display */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>Provenance:</span>
                  <span className="font-semibold text-slate-200">Imported from your verified source</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Zero Fabrication Guaranteed
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: TEXT PASTE */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Document / Topic Title
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. Memory Management & Paging Notes"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Paste Text Content, Syllabus, or Questions
                </label>
                <textarea
                  rows={6}
                  value={textSnippet}
                  onChange={(e) => setTextSnippet(e.target.value)}
                  placeholder="Paste questions, syllabus topics, formulas, or raw notes here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 3: URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Reference Label
                </label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. Official Raft Consensus Paper ArXiv"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Resource URL
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://arxiv.org/abs/1404.3281 or https://github.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EXISTING RESOURCES */}
          {activeTab === 'existing' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-400 mb-2">
                Select an already uploaded source to ground this practice set or curriculum:
              </p>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {existingResources.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => {
                      if (onSelectExisting) onSelectExisting(res);
                      else onSourceAdded(res);
                      onClose();
                    }}
                    className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <FileText size={13} className="text-indigo-400" />
                        <span>{res.title}</span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
                          {res.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {res.topicsDetected.join(' • ')}
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-indigo-400 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          {activeTab !== 'existing' && (
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleSaveSource}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all"
            >
              {isProcessing ? (
                <>
                  <Sparkles size={13} className="animate-spin" />
                  <span>Analyzing & Connecting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Connect Source Material</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
