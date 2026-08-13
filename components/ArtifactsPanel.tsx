import React, { useState } from 'react';
import {
  X,
  Code2,
  Eye,
  Copy,
  Check,
  Download,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ArtifactItem } from '../types';

interface ArtifactsPanelProps {
  artifact: ArtifactItem | null;
  onClose: () => void;
}

export const ArtifactsPanel: React.FC<ArtifactsPanelProps> = ({ artifact, onClose }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artifact-${artifact.language || 'code'}.${artifact.language || 'txt'}`;
    link.click();
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      <div
        onClick={onClose}
        className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
      />

      <aside className="fixed lg:relative inset-y-0 right-0 w-full sm:w-[88vw] md:w-[75vw] lg:w-[480px] xl:w-[560px] h-full bg-slate-950 border-l border-white/10 flex flex-col z-50 lg:z-20 shadow-2xl transition-all select-none">
        {/* Top Header */}
      <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-slate-900/60">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-white truncate">{artifact.title}</span>
            <span className="text-[10px] text-amber-400 font-mono uppercase">{artifact.language}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-white/10">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                viewMode === 'code'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleDownload}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Download Artifact File"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors ml-1"
            title="Close Artifact Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Content */}
      <div className="flex-1 overflow-auto bg-slate-900/40 p-4">
        {viewMode === 'preview' ? (
          <div className="w-full h-full rounded-xl border border-white/10 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
            {artifact.type === 'html' || artifact.type === 'svg' ? (
              <iframe
                srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body className="bg-slate-950 text-white p-4">${artifact.content}</body></html>`}
                title="Artifact Live View"
                className="w-full h-full border-none bg-slate-950"
              />
            ) : artifact.type === 'json' ? (
              <pre className="p-4 font-mono text-xs text-amber-300 overflow-auto h-full">
                {JSON.stringify(JSON.parse(artifact.content || '{}'), null, 2)}
              </pre>
            ) : (
              <div className="p-6 font-mono text-xs text-slate-200 overflow-auto h-full space-y-2">
                <div className="text-amber-400 font-semibold mb-2">Live Code Output View:</div>
                <div className="p-4 rounded bg-slate-900 border border-white/10 whitespace-pre-wrap">
                  {artifact.content}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full rounded-xl border border-white/10 bg-slate-950 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
            <pre>{artifact.content}</pre>
          </div>
        )}
      </div>
    </aside>
  </>
);
};
