import React, { useState } from 'react';
import {
  X,
  Settings,
  Sparkles,
  Volume2,
  Trash2,
  Download,
  Brain,
  Palette,
  Check,
  ShieldCheck,
  Type,
  Upload,
  Plus,
  Zap,
  User,
  Sliders,
  Languages,
  RotateCcw,
  Layout,
  Terminal,
  Lock,
  Key,
  Unlock,
} from 'lucide-react';
import { AppSettings, DragonPersona, QuickPromptItem } from '../types';
import { DragonLogo } from './DragonLogo';
import { compressImageToDataUrl } from '../utils/imageCompressor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearAllSessions: () => void;
  onExportAllData: () => void;
  onImportData?: (jsonData: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllSessions,
  onExportAllData,
  onImportData,
}) => {
  const [activeTab, setActiveTab] = useState<'visuals' | 'ai' | 'profile' | 'shortcuts' | 'voice' | 'system'>('visuals');
  
  // Custom Prompt state
  const [customPrompt, setCustomPrompt] = useState(settings.customSystemInstruction || '');

  // New Custom Persona Form State
  const [showPersonaForm, setShowPersonaForm] = useState(false);
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaTagline, setNewPersonaTagline] = useState('');
  const [newPersonaPrompt, setNewPersonaPrompt] = useState('');
  const [newPersonaModel, setNewPersonaModel] = useState('gemini-3.6-flash');
  const [newPersonaColor, setNewPersonaColor] = useState('from-amber-400 to-orange-600');

  // New Quick Prompt State
  const [newQpLabel, setNewQpLabel] = useState('');
  const [newQpPrompt, setNewQpPrompt] = useState('');

  // Logo Admin PIN Protection state (PIN: 122005)
  const [isLogoUnlocked, setIsLogoUnlocked] = useState(false);
  const [logoPinInput, setLogoPinInput] = useState('');
  const [logoPinError, setLogoPinError] = useState(false);

  if (!isOpen) return null;

  const handleSaveCustomPrompt = () => {
    onUpdateSettings({ ...settings, customSystemInstruction: customPrompt });
  };

  const handleAddCustomPersona = () => {
    if (!newPersonaName.trim() || !newPersonaPrompt.trim()) return;
    const newPersona: DragonPersona = {
      id: `custom-persona-${Date.now()}`,
      name: newPersonaName.trim(),
      tagline: newPersonaTagline.trim() || 'Custom AI Persona',
      icon: 'Sparkles',
      avatarColor: newPersonaColor,
      systemPrompt: newPersonaPrompt.trim(),
      suggestedPrompts: [
        `Help me with ${newPersonaName.trim()} tasks`,
        `Provide expert guidance based on my system instructions`,
      ],
      defaultModel: newPersonaModel,
      isCustom: true,
    };

    const updatedPersonas = [...(settings.customPersonas || []), newPersona];
    onUpdateSettings({ ...settings, customPersonas: updatedPersonas });

    // Reset form
    setNewPersonaName('');
    setNewPersonaTagline('');
    setNewPersonaPrompt('');
    setShowPersonaForm(false);
  };

  const handleDeleteCustomPersona = (id: string) => {
    const updated = (settings.customPersonas || []).filter((p) => p.id !== id);
    onUpdateSettings({ ...settings, customPersonas: updated });
  };

  const handleAddQuickPrompt = () => {
    if (!newQpLabel.trim() || !newQpPrompt.trim()) return;
    const newQp: QuickPromptItem = {
      id: `qp-${Date.now()}`,
      label: newQpLabel.trim(),
      prompt: newQpPrompt.trim(),
    };
    const updated = [...(settings.customQuickPrompts || []), newQp];
    onUpdateSettings({ ...settings, customQuickPrompts: updated });
    setNewQpLabel('');
    setNewQpPrompt('');
  };

  const handleDeleteQuickPrompt = (id: string) => {
    const updated = (settings.customQuickPrompts || []).filter((qp) => qp.id !== id);
    onUpdateSettings({ ...settings, customQuickPrompts: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">Workspace Customization Studio</h2>
              <p className="text-[10px] text-slate-400">Full control over theme, logo, AI behavior, shortcuts & profiles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-950 border-b border-white/10 overflow-x-auto scrollbar-none text-xs font-semibold">
          {[
            { id: 'visuals', label: '🎨 Design & Themes', icon: Palette },
            { id: 'ai', label: '🤖 AI & Personas', icon: Brain },
            { id: 'profile', label: '👤 User Profile', icon: User },
            { id: 'shortcuts', label: '⚡ Quick Prompts', icon: Zap },
            { id: 'voice', label: '🔊 Voice & Speech', icon: Volume2 },
            { id: 'system', label: '⚙️ Layout & Data', icon: Sliders },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6 text-xs text-slate-200 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* TAB 1: VISUALS & DESIGN */}
          {activeTab === 'visuals' && (
            <div className="space-y-6">
              
              {/* Branding Section */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>App Logo & Header Branding</span>
                  </span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono border border-amber-500/30">
                    Live Preview
                  </span>
                </div>

                {/* Logo Live Preview */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-between shadow-inner">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold">Active Header Crest</span>
                    <DragonLogo settings={settings} size="lg" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 font-mono font-bold block">{settings.appTitle || 'Dragon AI'}</span>
                    <span className="text-[10px] text-amber-400 font-mono">{settings.appBadge ? `Badge: [${settings.appBadge}]` : 'No Badge'}</span>
                  </div>
                </div>

                {/* Title & Badge Text Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">App Title Name</label>
                    <input
                      type="text"
                      value={settings.appTitle ?? 'Dragon AI'}
                      onChange={(e) => onUpdateSettings({ ...settings, appTitle: e.target.value })}
                      placeholder="Dragon AI"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-amber-500/50 uppercase tracking-wider"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-medium">Header Badge Tag (Optional)</label>
                    <input
                      type="text"
                      value={settings.appBadge ?? ''}
                      onChange={(e) => onUpdateSettings({ ...settings, appBadge: e.target.value })}
                      placeholder="e.g. VIP (Optional)"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-500/50 uppercase font-mono"
                    />
                  </div>
                </div>

                {/* Logo Style Options */}
                <div className="space-y-2">
                  <span className="text-xs text-slate-300 font-semibold block">Choose Logo Icon Style:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'dragon-crest', label: 'Gold Crest', desc: 'Metallic Tech' },
                      { id: 'neon-flame', label: 'Hyperion Flame', desc: 'Glowing Core' },
                      { id: 'cyber-shield', label: 'Cyber Shield', desc: 'Neon Blue' },
                      { id: 'minimal-spark', label: 'Violet Spark', desc: 'Quantum Core' },
                      { id: 'emerald-drake', label: 'Emerald Drake', desc: 'Bio Matrix' },
                      { id: 'crimson-dragon', label: 'Crimson Dragon', desc: 'Ruby Flame' },
                      { id: 'custom', label: 'Custom Image', desc: 'Upload / URL' },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() => onUpdateSettings({ ...settings, logoStyle: style.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          (settings.logoStyle || 'dragon-crest') === style.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-md'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs block font-bold">{style.label}</span>
                        <span className="text-[9px] opacity-70 font-mono block">{style.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Typography Style Options */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-xs text-slate-300 font-semibold block">Choose "Dragon AI" Text Style:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'cyber-neon', label: 'Cyber Neon Badge', desc: 'DRAGON <AI/>' },
                      { id: 'flame-gradient', label: 'Fiery Gradient', desc: 'DRAGON AI 🔥' },
                      { id: 'futuristic-3d', label: 'Futuristic 3D', desc: 'DRAGON — AI —' },
                      { id: 'glass-pill', label: 'Frosted Glass Pill', desc: 'DRAGON [ AI ]' },
                      { id: 'minimal-line', label: 'Minimal Tech Line', desc: 'DRAGON • AI' },
                    ].map((tStyle) => (
                      <button
                        key={tStyle.id}
                        onClick={() => onUpdateSettings({ ...settings, textStyle: tStyle.id as any })}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          (settings.textStyle || 'cyber-neon') === tStyle.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-md'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-xs block font-bold">{tStyle.label}</span>
                        <span className="text-[9px] opacity-80 font-mono block text-amber-400">{tStyle.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Logo Image Input & Upload Box with PIN Protection (122005) */}
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                      {isLogoUnlocked ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>Custom Photo / Logo Upload</span>
                    </span>

                    {isLogoUnlocked ? (
                      <div className="flex items-center gap-2">
                        {settings.customLogoUrl && (
                          <button
                            onClick={() => onUpdateSettings({ ...settings, customLogoUrl: '', logoStyle: 'dragon-crest' })}
                            className="text-[11px] text-rose-400 hover:text-rose-300 underline font-mono"
                          >
                            Reset
                          </button>
                        )}
                        <button
                          onClick={() => setIsLogoUnlocked(false)}
                          className="px-2 py-0.5 rounded-lg bg-slate-950 border border-amber-500/30 text-amber-400 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Lock</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        PIN Protected 🔒
                      </span>
                    )}
                  </div>

                  {!isLogoUnlocked ? (
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                      <p className="text-[11px] text-slate-300">
                        Enter Admin PIN to unlock logo upload & photo customization:
                      </p>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (logoPinInput.trim() === '122005') {
                            setIsLogoUnlocked(true);
                            setLogoPinError(false);
                            setLogoPinInput('');
                          } else {
                            setLogoPinError(true);
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <div className="relative flex-1">
                          <input
                            type="password"
                            maxLength={10}
                            placeholder="Enter Admin PIN"
                            value={logoPinInput}
                            onChange={(e) => {
                              setLogoPinInput(e.target.value);
                              if (logoPinError) setLogoPinError(false);
                            }}
                            className={`w-full p-2 text-xs rounded-lg bg-slate-900 border font-mono text-white placeholder-slate-500 focus:outline-none transition-all ${
                              logoPinError ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-amber-500/30 focus:border-amber-500'
                            }`}
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-1"
                        >
                          <Key className="w-3.5 h-3.5" />
                          <span>Unlock</span>
                        </button>
                      </form>

                      {logoPinError && (
                        <p className="text-[10px] text-rose-400 font-medium">
                          ❌ Incorrect PIN! Entering correct admin PIN unlocks logo settings.
                        </p>
                      )}
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Unlocked with Admin PIN</span>
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                        {/* Live Preview Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-slate-950 border border-amber-500/40 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-lg">
                          {settings.customLogoUrl ? (
                            <img
                              src={settings.customLogoUrl}
                              alt="Custom Logo Preview"
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <div className="text-[10px] text-slate-500 text-center font-mono p-1">No Logo Uploaded</div>
                          )}
                        </div>

                        {/* Upload Actions & URL Input */}
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-amber-500/10 active:scale-95">
                              <Upload className="w-4 h-4 text-amber-400" />
                              <span>Choose Photo / Image File</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const compressed = await compressImageToDataUrl(file, 300, 300);
                                      onUpdateSettings({
                                        ...settings,
                                        customLogoUrl: compressed,
                                        logoStyle: 'custom',
                                      });
                                    } catch (err) {
                                      console.error('Failed to compress logo image:', err);
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Or paste image URL (e.g. https://...)"
                              value={settings.customLogoUrl || ''}
                              onChange={(e) =>
                                onUpdateSettings({
                                  ...settings,
                                  customLogoUrl: e.target.value,
                                  logoStyle: e.target.value ? 'custom' : settings.logoStyle,
                                })
                              }
                              className="w-full p-2 text-xs rounded-lg bg-slate-950 border border-white/10 text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500/50"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Theme & Color Palette */}
              <div className="space-y-3">
                <label className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>Atmosphere Theme & Color Scheme</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'dark-obsidian', name: 'Dark Obsidian', accent: 'bg-amber-500' },
                    { id: 'midnight-cyber', name: 'Midnight Cyber', accent: 'bg-cyan-400' },
                    { id: 'royal-amethyst', name: 'Royal Amethyst', accent: 'bg-purple-500' },
                    { id: 'crimson-flame', name: 'Crimson Flame', accent: 'bg-rose-500' },
                    { id: 'emerald-drake', name: 'Emerald Drake', accent: 'bg-emerald-500' },
                    { id: 'sunset-gold', name: 'Sunset Gold', accent: 'bg-yellow-500' },
                    { id: 'deep-ocean', name: 'Deep Ocean', accent: 'bg-teal-400' },
                    { id: 'clean-light', name: 'Clean Light', accent: 'bg-slate-700' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        settings.theme === t.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-md'
                          : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${t.accent}`} />
                        <span className="text-xs">{t.name}</span>
                      </div>
                      {settings.theme === t.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Effect & Font Family */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300 text-xs block">Background Matrix Effect</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'grid', label: 'Grid Matrix' },
                      { id: 'dots', label: 'Dots Pattern' },
                      { id: 'aura', label: 'Aura Glow' },
                      { id: 'solid', label: 'Solid Space' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => onUpdateSettings({ ...settings, backgroundEffect: bg.id as any })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          (settings.backgroundEffect || 'grid') === bg.id
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs">{bg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-semibold text-slate-300 text-xs block">Font Size Scale</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'small', label: 'Small (13px)' },
                      { id: 'medium', label: 'Medium (15px)' },
                      { id: 'large', label: 'Large (17px)' },
                    ].map((fs) => (
                      <button
                        key={fs.id}
                        onClick={() => onUpdateSettings({ ...settings, fontSize: fs.id as any })}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          settings.fontSize === fs.id
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                            : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="text-xs">{fs.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI & PERSONAS */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              
              {/* Default Engine */}
              <div className="space-y-2">
                <label className="font-bold text-slate-200 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>Default AI Model Engine</span>
                </label>
                <select
                  value={settings.defaultModel}
                  onChange={(e) => onUpdateSettings({ ...settings, defaultModel: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-white font-medium focus:outline-none focus:border-amber-500/50"
                >
                  <option value="gemini-3.6-flash">Dragon 3.6 Flash (Fastest & Ultra Intelligent)</option>
                  <option value="gemini-3.1-pro-preview">Dragon 3.1 Pro (Deep Thinking & Complex Proofs)</option>
                  <option value="gemini-3.1-flash-lite">Dragon 3.1 Flash-Lite (Low Latency)</option>
                </select>
              </div>

              {/* Custom System Instruction */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-white/10">
                <label className="font-bold text-slate-200 text-xs block">Global System Instructions (Overriding Behavior)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="E.g., Always explain step-by-step, format code cleanly in TypeScript, answer in Hindi or English..."
                  rows={3}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-white/10 text-slate-200 focus:outline-none focus:border-amber-500/50 text-xs resize-none"
                />
                <button
                  onClick={handleSaveCustomPrompt}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/40 transition-colors"
                >
                  Save Global System Instructions
                </button>
              </div>

              {/* Custom Personas Creator */}
              <div className="space-y-3 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">Custom AI Personas</h3>
                    <p className="text-[10px] text-slate-400">Create your own tailored AI personas with custom system prompts</p>
                  </div>
                  <button
                    onClick={() => setShowPersonaForm(!showPersonaForm)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/40 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Persona</span>
                  </button>
                </div>

                {/* Persona Creation Form */}
                {showPersonaForm && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-3 animate-in fade-in zoom-in-95">
                    <span className="font-bold text-amber-300 text-xs block">New Custom Persona Creator</span>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Persona Name</label>
                        <input
                          type="text"
                          placeholder="E.g. Hindi Code Tutor"
                          value={newPersonaName}
                          onChange={(e) => setNewPersonaName(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Tagline</label>
                        <input
                          type="text"
                          placeholder="E.g. Explains coding in simple Hindi"
                          value={newPersonaTagline}
                          onChange={(e) => setNewPersonaTagline(e.target.value)}
                          className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">System Prompt</label>
                      <textarea
                        rows={3}
                        placeholder="You are a Hindi coding tutor. Always explain code logic in clear Hindi with English tech terms..."
                        value={newPersonaPrompt}
                        onChange={(e) => setNewPersonaPrompt(e.target.value)}
                        className="w-full p-2.5 rounded-lg bg-slate-900 border border-white/10 text-white text-xs resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowPersonaForm(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCustomPersona}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                      >
                        Save Persona
                      </button>
                    </div>
                  </div>
                )}

                {/* List of Custom Personas */}
                <div className="space-y-2">
                  {(settings.customPersonas || []).length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 text-center text-slate-500 text-xs">
                      No custom personas created yet. Click "Create Persona" above to add one!
                    </div>
                  ) : (
                    (settings.customPersonas || []).map((cp) => (
                      <div
                        key={cp.id}
                        className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-200 text-xs">{cp.name}</div>
                          <div className="text-[10px] text-slate-400">{cp.tagline}</div>
                        </div>
                        <button
                          onClick={() => handleDeleteCustomPersona(cp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>User Profile & Identity</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="Aakash"
                      value={settings.userName ?? ''}
                      onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">User Avatar URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={settings.userAvatarUrl ?? ''}
                      onChange={(e) => onUpdateSettings({ ...settings, userAvatarUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <span className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Assistant Name & Persona Persona Override</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">AI Assistant Display Name</label>
                    <input
                      type="text"
                      placeholder="Dragon AI"
                      value={settings.assistantName ?? 'Dragon AI'}
                      onChange={(e) => onUpdateSettings({ ...settings, assistantName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-medium text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Assistant Avatar URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={settings.assistantAvatarUrl ?? ''}
                      onChange={(e) => onUpdateSettings({ ...settings, assistantAvatarUrl: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUICK PROMPTS & SHORTCUTS */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Custom Quick Action Buttons</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">Add shortcut buttons that appear near the chat input box</p>
                </div>
              </div>

              {/* Add New Quick Prompt Form */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-2">
                <span className="text-xs font-bold text-amber-300 block">Add New Quick Action Button</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Button Label (e.g. 📝 Summarize)"
                    value={newQpLabel}
                    onChange={(e) => setNewQpLabel(e.target.value)}
                    className="w-1/3 p-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Prompt template text..."
                    value={newQpPrompt}
                    onChange={(e) => setNewQpPrompt(e.target.value)}
                    className="flex-1 p-2 rounded-lg bg-slate-900 border border-white/10 text-white text-xs"
                  />
                  <button
                    onClick={handleAddQuickPrompt}
                    className="px-3 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shrink-0"
                  >
                    Add Button
                  </button>
                </div>
              </div>

              {/* List of Quick Action Buttons */}
              <div className="space-y-2">
                {(settings.customQuickPrompts || []).map((qp) => (
                  <div
                    key={qp.id}
                    className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-amber-300 text-xs block">{qp.label}</span>
                      <span className="text-[10px] text-slate-400 truncate block">{qp.prompt}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteQuickPrompt(qp.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VOICE & SPEECH */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-200 text-sm">Auto Read Aloud (TTS)</div>
                    <div className="text-[10px] text-slate-400">Automatically speak response text after generation completes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoTTS}
                    onChange={(e) => onUpdateSettings({ ...settings, autoTTS: e.target.checked })}
                    className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Voice Speed */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Voice Speed: {settings.voiceSpeed || 1.0}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={settings.voiceSpeed || 1.0}
                    onChange={(e) => onUpdateSettings({ ...settings, voiceSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Voice Language */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <label className="font-semibold text-slate-300 text-xs block">Voice Recognition & TTS Language</label>
                  <select
                    value={settings.voiceLanguage || 'en-US'}
                    onChange={(e) => onUpdateSettings({ ...settings, voiceLanguage: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="hi-IN">Hindi / Hinglish (भारत)</option>
                    <option value="es-ES">Spanish (Español)</option>
                    <option value="fr-FR">French (Français)</option>
                    <option value="de-DE">German (Deutsch)</option>
                    <option value="ja-JP">Japanese (日本語)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: LAYOUT & DATA */}
          {activeTab === 'system' && (
            <div className="space-y-5">
              
              {/* Density and Layout */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-950/80 border border-white/10">
                <span className="font-bold text-slate-200 text-sm block">Chat Stream Density</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bubbles', label: 'Modern Bubbles' },
                    { id: 'flat', label: 'Flat Stream' },
                    { id: 'compact', label: 'Developer Compact' },
                  ].map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => onUpdateSettings({ ...settings, chatLayout: layout.id as any })}
                      className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                        (settings.chatLayout || 'bubbles') === layout.id
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs">{layout.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data & Backup */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-3">
                <span className="font-bold text-slate-200 text-sm block">Backup & Data Management</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={onExportAllData}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/50 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors font-semibold"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Backup JSON</span>
                  </button>

                  <label className="py-2.5 px-3 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/50 text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-colors font-semibold cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Import Backup</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const content = event.target?.result as string;
                            if (content && onImportData) {
                              onImportData(content);
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete all chat sessions?')) {
                        onClearAllSessions();
                        onClose();
                      }
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Chat Sessions</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Settings saved automatically to localStorage</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
