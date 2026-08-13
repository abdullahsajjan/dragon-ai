import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image as ImageIcon,
  Globe,
  Mic,
  MicOff,
  Square,
  Sparkles,
  Paperclip,
  X,
  Zap,
  Code2,
  Search,
  BookOpen,
  FileText,
  FileType,
  FileSpreadsheet,
  FileCode,
  File,
  Volume2,
  Palette,
} from 'lucide-react';
import { ImageAttachment, DocumentAttachment, DragonPersona, AppSettings } from '../types';
import { parseUploadedFiles, formatFileSize } from '../utils/documentParser';
import { DragonLogo } from './DragonLogo';

const APP_THEMES: { id: AppSettings['theme']; name: string; color: string }[] = [
  { id: 'dark-obsidian', name: 'Obsidian', color: 'bg-amber-500' },
  { id: 'midnight-cyber', name: 'Cyber', color: 'bg-cyan-400' },
  { id: 'royal-amethyst', name: 'Amethyst', color: 'bg-purple-500' },
  { id: 'emerald-drake', name: 'Emerald', color: 'bg-emerald-400' },
  { id: 'crimson-flame', name: 'Crimson', color: 'bg-rose-500' },
  { id: 'sunset-gold', name: 'Gold', color: 'bg-yellow-500' },
  { id: 'deep-ocean', name: 'Ocean', color: 'bg-sky-400' },
  { id: 'clean-light', name: 'Light', color: 'bg-slate-200' },
];

interface ChatInputProps {
  onSendMessage: (text: string, images: ImageAttachment[], documents: DocumentAttachment[]) => void;
  isGenerating: boolean;
  onStopGeneration?: () => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  activePersona: DragonPersona;
  onOpenPersonaModal: () => void;
  onOpenVoiceAssistant?: () => void;
  isEmptySession: boolean;
  settings?: AppSettings;
  onUpdateSettings?: (settings: AppSettings) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  useSearch,
  onToggleSearch,
  activePersona,
  onOpenPersonaModal,
  onOpenVoiceAssistant,
  isEmptySession,
  settings,
  onUpdateSettings,
}) => {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  // Handle Form Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!prompt.trim() && images.length === 0 && documents.length === 0) || isGenerating) return;

    onSendMessage(prompt.trim(), images, documents);
    setPrompt('');
    setImages([]);
    setDocuments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle File Upload (Documents + Images)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const result = await parseUploadedFiles(files);
    if (result.images.length > 0) {
      setImages((prev) => [...prev, ...result.images]);
    }
    if (result.documents.length > 0) {
      setDocuments((prev) => [...prev, ...result.documents]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Drag & Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const result = await parseUploadedFiles(e.dataTransfer.files);
      if (result.images.length > 0) {
        setImages((prev) => [...prev, ...result.images]);
      }
      if (result.documents.length > 0) {
        setDocuments((prev) => [...prev, ...result.documents]);
      }
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  // Voice Dictation setup
  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsRecording(true);
    }
  };

  return (
    <div className="p-3 md:p-4 max-w-4xl mx-auto w-full">
      {/* Empty State Prompt Starters */}
      {isEmptySession && (
        <div className="mb-6 space-y-5 animate-fade-in">
          {/* Central Hero Banner Card */}
          <div className="relative rounded-3xl bg-slate-950/80 border border-amber-500/25 p-6 md:p-8 text-center space-y-4 shadow-2xl shadow-amber-500/5 backdrop-blur-2xl overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Dragon AI Logo Crest Stack */}
            <div className="relative z-10 flex flex-col items-center">
              <DragonLogo layout="stacked" settings={settings} />
            </div>

            <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto pt-1 leading-relaxed relative z-10">
              Your high-performance workspace for <span className="text-amber-300 font-semibold">Coding</span>, <span className="text-amber-300 font-semibold">Deep Research</span>, <span className="text-amber-300 font-semibold">Math & Physics</span>, and <span className="text-amber-300 font-semibold">Document Intelligence</span>.
            </p>

            {/* Quick Theme Palette Selector */}
            {settings && onUpdateSettings && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 relative z-10">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mr-1">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>UI Theme:</span>
                </span>
                {APP_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => onUpdateSettings({ ...settings, theme: theme.id })}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all border ${
                      settings.theme === theme.id
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/60 shadow-md shadow-amber-500/10 scale-105'
                        : 'bg-slate-900/90 text-slate-400 border-white/10 hover:text-slate-200 hover:border-amber-500/30'
                    }`}
                    title={`Switch theme to ${theme.name}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${theme.color}`} />
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Purpose Categories for Students & Problem Solvers */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { label: '🧮 Math & Physics', prompt: 'Solve this step-by-step with clear formulas and explanations: ' },
              { label: '💻 Code Debugger', prompt: 'Find bugs, explain errors, and provide a clean optimized code solution for: ' },
              { label: '🎓 Study Quiz & Cards', prompt: 'Create 5 multiple-choice practice questions and key flashcards with answers for: ' },
              { label: '📚 Concept Explainer', prompt: 'Explain this concept simply with analogies, bullet points, and real-world examples: ' },
              { label: '📄 PDF & Document Analysis', prompt: 'Summarize key takeaways, main formulas, and solve all questions in this document' },
              { label: '🔬 Live Search & Facts', prompt: 'Find the latest verified information and scientific facts about: ', search: true },
              { label: '📈 Logic & Reasoning', prompt: 'Provide a logical reasoning problem with step-by-step hint and detailed solution' },
            ].map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.search && !useSearch) onToggleSearch();
                  setPrompt(item.prompt);
                  textareaRef.current?.focus();
                }}
                className="px-3.5 py-1.5 rounded-2xl text-xs font-semibold bg-slate-950/80 border border-amber-500/20 hover:border-amber-400 hover:bg-amber-500/10 text-slate-200 hover:text-amber-300 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Persona Starter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activePersona.suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p);
                  textareaRef.current?.focus();
                }}
                className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-amber-500/50 hover:bg-slate-900/90 text-left transition-all group shadow-lg hover:shadow-amber-500/10 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                    Prompt Starter #{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Box Frame with Drag & Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl bg-slate-900/90 border transition-all overflow-hidden shadow-2xl backdrop-blur-xl ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 ring-4 ring-amber-500/20 scale-[1.01]'
            : 'border-amber-500/20 focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20'
        }`}
      >
        {/* Drag Overlay Hint */}
        {isDragging && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 border-2 border-dashed border-amber-400 rounded-2xl">
            <Paperclip className="w-8 h-8 text-amber-400 animate-bounce" />
            <p className="text-sm font-bold text-amber-300">Drop Documents or Images Here</p>
            <p className="text-xs text-slate-400">PDF, TXT, DOCX, CSV, JSON, Code files, Images</p>
          </div>
        )}

        {/* Image & Document Attachment Preview Bar */}
        {(images.length > 0 || documents.length > 0) && (
          <div className="p-3 border-b border-white/10 flex flex-wrap gap-2 bg-slate-950/80 max-h-36 overflow-y-auto">
            {/* Image Cards */}
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex items-center p-1 gap-2 pr-6">
                <img src={img.previewUrl} alt={img.name} className="h-10 w-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">{img.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Image</span>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute top-1 right-1 p-0.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {/* Document Cards */}
            {documents.map((doc) => {
              const ext = doc.extension.toLowerCase();
              let DocIcon = FileText;
              let iconColor = 'text-amber-400';
              let badgeBg = 'bg-amber-500/10 border-amber-500/30 text-amber-300';

              if (ext === 'pdf') {
                DocIcon = FileType;
                iconColor = 'text-red-400';
                badgeBg = 'bg-red-500/10 border-red-500/30 text-red-300';
              } else if (['csv', 'json', 'xlsx'].includes(ext)) {
                DocIcon = FileSpreadsheet;
                iconColor = 'text-emerald-400';
                badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
              } else if (['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'cpp', 'java', 'sql'].includes(ext)) {
                DocIcon = FileCode;
                iconColor = 'text-cyan-400';
                badgeBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
              }

              return (
                <div key={doc.id} className="relative group rounded-xl border border-white/10 bg-slate-900/90 p-2 flex items-center gap-2 pr-7 shadow-sm">
                  <div className={`p-1.5 rounded-lg bg-slate-950 border border-white/10 ${iconColor}`}>
                    <DocIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[130px]" title={doc.name}>
                      {doc.name}
                    </span>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className={`px-1 py-0.2 rounded border font-mono ${badgeBg}`}>
                        {ext.toUpperCase()}
                      </span>
                      <span className="text-slate-400 font-mono">{formatFileSize(doc.size)}</span>
                      {doc.wordCount ? <span className="text-slate-500">• {doc.wordCount} words</span> : null}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="absolute top-1.5 right-1.5 p-0.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask Dragon AI (${activePersona.name}) anything or upload documents (PDF, TXT, Code, DOCX)...`}
          rows={1}
          className="w-full px-4 pt-3.5 pb-2 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none min-h-[50px] max-h-[200px]"
        />

        {/* Toolbar & Controls */}
        <div className="px-3 pb-2.5 flex items-center justify-between text-xs border-t border-white/5 pt-2 bg-slate-950/40">
          {/* Left tools: Upload, Search toggle, Persona */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Custom Quick Prompts Bar */}
            {(settings?.customQuickPrompts || []).slice(0, 4).map((qp) => (
              <button
                key={qp.id}
                onClick={() => {
                  setPrompt((prev) => (prev ? `${prev}\n\n${qp.prompt}` : qp.prompt));
                  textareaRef.current?.focus();
                }}
                className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-[11px] text-amber-300/90 border border-amber-500/20 hover:border-amber-500/50 transition-all flex items-center gap-1"
                title={qp.prompt}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="truncate max-w-[90px]">{qp.label}</span>
              </button>
            ))}
            {/* File Input for Documents & Images */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.txt,.doc,.docx,.csv,.json,.xml,.html,.css,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.sql,.sh,.md"
              multiple
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] font-medium border border-white/10 bg-slate-900"
              title="Upload Documents (PDF, TXT, DOCX, Code, CSV) or Images"
            >
              <Paperclip className="w-3.5 h-3.5 text-amber-400" />
              <span>Attach File / Doc</span>
            </button>

            {/* Grounding Search */}
            <button
              onClick={onToggleSearch}
              className={`p-1.5 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-1 ${
                useSearch
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Toggle Web Search Grounding"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Search {useSearch ? 'ON' : 'OFF'}</span>
            </button>

            {/* Prompt Enhancer */}
            {prompt.trim().length > 0 && (
              <button
                onClick={() => {
                  setPrompt((prev) => `${prev.trim()}\n\nPlease provide a clear, step-by-step breakdown with accurate logic, complete code/examples if applicable, and structured formatting.`);
                }}
                className="p-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-medium transition-all flex items-center gap-1"
                title="Enhance prompt for higher detail & clarity"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Enhance</span>
              </button>
            )}

            {/* Active Persona Chip */}
            <button
              onClick={onOpenPersonaModal}
              className="px-2 py-1 rounded-md bg-slate-800 text-[11px] text-slate-300 border border-white/10 hover:border-amber-500/40 transition-colors flex items-center gap-1"
            >
              <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${activePersona.avatarColor}`} />
              <span className="truncate max-w-[100px]">{activePersona.name.split('-')[0]}</span>
            </button>
          </div>

          {/* Right tools: Voice Assistant & Submit */}
          <div className="flex items-center gap-1.5">
            {/* Interactive Voice Assistant Launcher */}
            {onOpenVoiceAssistant && (
              <button
                onClick={onOpenVoiceAssistant}
                className="p-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-semibold transition-all flex items-center gap-1.5 shadow-md group"
                title="Open Interactive Dragon Voice Assistant"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Voice Assistant</span>
              </button>
            )}

            {/* Dictation Microphone */}
            <button
              onClick={toggleRecording}
              className={`p-2 rounded-lg transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={isRecording ? 'Stop Recording Voice' : 'Voice Input (Dictate Speech)'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit or Stop button */}
            {isGenerating ? (
              <button
                onClick={onStopGeneration}
                className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/30 transition-all"
                title="Stop Response Generation"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit()}
                disabled={!prompt.trim() && images.length === 0 && documents.length === 0}
                className={`p-2 rounded-xl transition-all shadow-md ${
                  prompt.trim() || images.length > 0 || documents.length > 0
                    ? 'bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white shadow-red-600/20 active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
                title="Send Message to Dragon AI"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-[10px] text-slate-500">
        Dragon AI can make mistakes. Verify important information & search citations.
      </div>
    </div>
  );
};
