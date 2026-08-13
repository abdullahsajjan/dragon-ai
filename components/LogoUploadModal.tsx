import React, { useState } from 'react';
import { X, Upload, Check, Image as ImageIcon, RotateCcw, Sparkles } from 'lucide-react';
import { AppSettings } from '../types';
import { compressImageToDataUrl } from '../utils/imageCompressor';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>(settings.customLogoUrl || '');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    try {
      setIsProcessing(true);
      const compressed = await compressImageToDataUrl(file, 300, 300);
      setSelectedFileUrl(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyLogo = () => {
    onUpdateSettings({
      ...settings,
      customLogoUrl: selectedFileUrl,
      logoStyle: selectedFileUrl ? 'custom' : 'dragon-crest',
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setSelectedFileUrl('');
    onUpdateSettings({
      ...settings,
      customLogoUrl: '',
      logoStyle: 'dragon-crest',
    });
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-950 border border-amber-500/40 p-6 shadow-2xl shadow-amber-500/10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Upload Custom Logo</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Instant
                </span>
              </h3>
              <p className="text-xs text-slate-400">Select any image/photo to use as website logo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Logo successfully updated!</span>
          </div>
        )}

        {/* Dropzone & File Input */}
        <div className="space-y-4">
          <label className="relative border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-slate-900/60 hover:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />

            {selectedFileUrl ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-amber-500/50 p-2 shadow-xl flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedFileUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <span className="text-xs text-amber-300 font-medium group-hover:underline flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Tap to choose a different photo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-white">Click or Drag Photo Here</span>
                <span className="text-xs text-slate-400">PNG, JPG, WEBP, GIF (Auto-optimized)</span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-2xl flex items-center justify-center text-amber-300 text-xs font-bold gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Optimizing photo...</span>
              </div>
            )}
          </label>

          {/* URL Input Fallback */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Or paste image URL:</span>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              value={selectedFileUrl}
              onChange={(e) => setSelectedFileUrl(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl bg-slate-900 border border-white/10 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          {settings.customLogoUrl && (
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Reset to default logo"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyLogo}
            disabled={!selectedFileUrl || isProcessing}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Logo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
