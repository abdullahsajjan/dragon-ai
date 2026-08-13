import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Flame,
  User,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  FileType,
  FileSpreadsheet,
  FileCode,
  File,
  X,
} from 'lucide-react';
import { ChatMessage, ArtifactItem, AppSettings, DocumentAttachment } from '../types';
import { DragonLogo } from './DragonLogo';
import { formatFileSize } from '../utils/documentParser';

interface ChatMessageItemProps {
  message: ChatMessage;
  settings?: AppSettings;
  onRegenerate?: () => void;
  onOpenArtifact?: (artifact: ArtifactItem) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  settings,
  onRegenerate,
  onOpenArtifact,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rating, setRating] = useState<'like' | 'dislike' | null>(null);
  const [activeDocModal, setActiveDocModal] = useState<DocumentAttachment | null>(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleSpeech = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, 'code block omitted'));
        utterance.rate = 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  return (
    <div
      className={`py-5 px-4 md:px-8 border-b border-white/5 transition-all ${
        isUser
          ? 'bg-slate-900/30'
          : 'bg-slate-950/60'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3.5 md:gap-5">
        {/* Avatar Badge */}
        <div className="flex-shrink-0 pt-0.5">
          {isUser ? (
            settings?.userAvatarUrl ? (
              <img
                src={settings.userAvatarUrl}
                alt={settings?.userName || 'User'}
                className="w-8 h-8 rounded-xl object-cover border border-amber-500/40 shadow-sm"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-slate-800/90 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs shadow-sm">
                {settings?.userName ? settings.userName.charAt(0).toUpperCase() : <User className="w-4 h-4 text-amber-400" />}
              </div>
            )
          ) : (
            <DragonLogo settings={settings} size="sm" showText={false} />
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-wide text-xs">
                {isUser ? (settings?.userName || 'You') : (settings?.appTitle || 'Dragon AI')}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Action Tools */}
            {!isUser && (
              <div className="flex items-center gap-1 bg-slate-900/80 border border-white/10 rounded-xl px-2 py-0.5 opacity-90 hover:opacity-100 transition-opacity shadow-sm">
                <button
                  onClick={() => setRating(rating === 'like' ? null : 'like')}
                  className={`p-1 rounded-lg transition-colors ${
                    rating === 'like' ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-400 hover:text-emerald-400'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setRating(rating === 'dislike' ? null : 'dislike')}
                  className={`p-1 rounded-lg transition-colors ${
                    rating === 'dislike' ? 'text-rose-400 bg-rose-500/20' : 'text-slate-400 hover:text-rose-400'
                  }`}
                  title="Poor response"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
                <button
                  onClick={handleCopyText}
                  className="p-1 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                  title="Copy response"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleSpeech}
                  className={`p-1 rounded-lg transition-colors ${
                    isSpeaking ? 'text-amber-400 bg-amber-500/20 animate-pulse' : 'text-slate-400 hover:text-amber-400'
                  }`}
                  title={isSpeaking ? 'Stop reading' : 'Read aloud (TTS)'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="p-1 text-slate-400 hover:text-amber-400 rounded-lg transition-colors"
                    title="Regenerate response"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Attached Images */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {message.images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-white/10 bg-slate-900">
                  <img
                    src={img.previewUrl || img.data}
                    alt={img.name}
                    className="h-24 w-auto object-cover max-w-[200px]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] text-white font-medium px-2 truncate max-w-full">{img.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Attached Documents */}
          {message.documents && message.documents.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {message.documents.map((doc) => {
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
                  <button
                    key={doc.id}
                    onClick={() => setActiveDocModal(doc)}
                    className="rounded-xl border border-white/10 bg-slate-900/90 hover:bg-slate-800 p-2.5 flex items-center gap-2.5 transition-all text-left group shadow-sm hover:border-amber-500/50"
                  >
                    <div className={`p-2 rounded-lg bg-slate-950 border border-white/10 ${iconColor} group-hover:scale-105 transition-transform`}>
                      <DocIcon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-200 group-hover:text-amber-300 truncate max-w-[180px]">
                        {doc.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className={`px-1 py-0.2 rounded border font-mono font-semibold ${badgeBg}`}>
                          {ext.toUpperCase()}
                        </span>
                        <span>{formatFileSize(doc.size)}</span>
                        {doc.wordCount ? <span>• {doc.wordCount} words</span> : null}
                      </div>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 ml-1" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Document Content Inspector Modal */}
          {activeDocModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-slate-100">{activeDocModal.name}</span>
                    <span className="text-xs text-slate-400 font-mono">({formatFileSize(activeDocModal.size)})</span>
                  </div>
                  <button
                    onClick={() => setActiveDocModal(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-200 bg-slate-950/90 whitespace-pre-wrap leading-relaxed">
                  {activeDocModal.content || 'Binary document attached. Content processed by Gemini model directly.'}
                </div>
                <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <span>{activeDocModal.wordCount ? `${activeDocModal.wordCount} words` : 'Document Attachment'}</span>
                  <button
                    onClick={() => setActiveDocModal(null)}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/30"
                  >
                    Close Inspector
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reasoning / Thinking Process Accordion */}
          {!isUser && message.reasoning && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
              <button
                onClick={() => setShowThinking(!showThinking)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-medium text-amber-300 hover:bg-amber-500/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Dragon Reasoning Chain</span>
                </span>
                {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showThinking && (
                <div className="px-3.5 py-2.5 border-t border-amber-500/10 text-xs text-amber-200/80 font-mono whitespace-pre-wrap leading-relaxed bg-black/20">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Main Content Markdown */}
          <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-200 break-words">
            {message.isStreaming && !message.content ? (
              <div className="flex items-center gap-2 text-amber-400/80 text-xs py-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Dragon AI is thinking and composing...</span>
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeStr = String(children).replace(/\n$/, '');
                    const codeId = `code-${Math.random()}`;

                    if (!inline && match) {
                      const lang = match[1];
                      const isArtifactType = ['html', 'jsx', 'tsx', 'svg', 'json', 'css', 'javascript', 'typescript'].includes(lang);

                      return (
                        <div className="my-4 rounded-xl border border-white/10 bg-slate-900 overflow-hidden shadow-xl">
                          {/* Code Bar Header */}
                          <div className="px-4 py-2 bg-slate-950 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
                            <span className="font-mono text-amber-400/90 font-semibold uppercase text-[11px]">
                              {lang}
                            </span>
                            <div className="flex items-center gap-2">
                              {isArtifactType && onOpenArtifact && (
                                <button
                                  onClick={() =>
                                    onOpenArtifact({
                                      id: codeId,
                                      title: `${lang.toUpperCase()} Artifact`,
                                      type: lang === 'html' ? 'html' : lang === 'svg' ? 'svg' : lang === 'jsx' || lang === 'tsx' ? 'react' : 'code',
                                      language: lang,
                                      content: codeStr,
                                    })
                                  }
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors font-sans text-[11px]"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Preview Artifact</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleCopyCode(codeStr, codeId)}
                                className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors text-[11px]"
                              >
                                {copiedCodeId === codeId ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          {/* Code Output */}
                          <div className="p-4 font-mono text-xs overflow-x-auto text-slate-200 bg-slate-950/60 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                            <code>{children}</code>
                          </div>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-slate-800 text-amber-300 font-mono text-xs px-1.5 py-0.5 rounded border border-white/10" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="overflow-x-auto my-4 rounded-xl border border-white/10 bg-slate-900/50">
                        <table className="w-full text-left text-xs border-collapse">{children}</table>
                      </div>
                    );
                  },
                  th({ children }: any) {
                    return <th className="bg-slate-800/80 px-4 py-2.5 font-semibold text-slate-200 border-b border-white/10">{children}</th>;
                  },
                  td({ children }: any) {
                    return <td className="px-4 py-2 border-b border-white/5 text-slate-300">{children}</td>;
                  },
                  blockquote({ children }: any) {
                    return (
                      <blockquote className="border-l-4 border-amber-500 pl-4 py-1 my-3 text-slate-300 italic bg-amber-500/5 rounded-r">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>

          {/* Grounding Web Search Citations */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Web Sources & References:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                  >
                    <span className="truncate max-w-[200px]">{src.title || src.url}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error notice if message errored */}
          {message.error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {message.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
