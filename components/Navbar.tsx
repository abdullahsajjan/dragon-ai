import React from 'react';
import {
  Flame,
  Plus,
  Settings,
  Globe,
  Code2,
  Sparkles,
  Layers,
  Volume2,
  VolumeX,
  ChevronDown,
  Palette,
  User,
  LogIn,
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { DragonPersona, AppSettings } from '../types';
import { DragonLogo } from './DragonLogo';

const APP_THEMES: { id: AppSettings['theme']; name: string; color: string }[] = [
  { id: 'dark-obsidian', name: 'Dark Obsidian', color: 'bg-amber-500' },
  { id: 'midnight-cyber', name: 'Midnight Cyber', color: 'bg-cyan-400' },
  { id: 'royal-amethyst', name: 'Royal Amethyst', color: 'bg-purple-500' },
  { id: 'emerald-drake', name: 'Emerald Drake', color: 'bg-emerald-400' },
  { id: 'crimson-flame', name: 'Crimson Flame', color: 'bg-rose-500' },
  { id: 'sunset-gold', name: 'Sunset Gold', color: 'bg-yellow-500' },
  { id: 'deep-ocean', name: 'Deep Ocean', color: 'bg-sky-400' },
  { id: 'clean-light', name: 'Clean Light', color: 'bg-slate-200' },
];

interface NavbarProps {
  currentModel: string;
  onSelectModel: (model: string) => void;
  activePersona: DragonPersona;
  onOpenPersonaModal: () => void;
  useSearch: boolean;
  onToggleSearch: () => void;
  hasArtifacts: boolean;
  artifactsOpen: boolean;
  onToggleArtifacts: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onOpenSettings: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onOpenVoiceAssistant?: () => void;
  currentUser?: FirebaseUser | null;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentModel,
  onSelectModel,
  activePersona,
  onOpenPersonaModal,
  useSearch,
  onToggleSearch,
  hasArtifacts,
  artifactsOpen,
  onToggleArtifacts,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onNewChat,
  onToggleSidebar,
  onOpenVoiceAssistant,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <header className="h-16 border-b border-amber-500/20 bg-slate-950/90 backdrop-blur-2xl px-4 flex items-center justify-between sticky top-0 z-20 select-none shadow-xl shadow-amber-500/5">
      {/* Left section: Sidebar toggle & App identity */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition-all duration-200 active:scale-95 border border-transparent hover:border-amber-500/30"
          title="Toggle Sidebar"
        >
          <Layers className="w-5 h-5 text-amber-400" />
        </button>

        <div className="flex items-center gap-2 py-1">
          <DragonLogo settings={settings} size="md" onClick={onNewChat} />
        </div>
      </div>

      {/* Middle section: Model & Persona Selectors */}
      <div className="hidden md:flex items-center gap-2.5">
        {/* Model dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/50 text-xs text-slate-100 cursor-pointer transition-all shadow-sm group-hover:shadow-amber-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold tracking-wide">
              {currentModel === 'gemini-3.6-flash'
                ? 'Dragon 3.6 Flash'
                : currentModel === 'gemini-3.1-pro-preview'
                ? 'Dragon 3.1 Pro (Deep)'
                : 'Dragon 3.1 Flash-Lite'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform group-hover:rotate-180" />
          </div>

          <div className="absolute top-full mt-1.5 left-0 w-64 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl p-1.5 hidden group-hover:block z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="text-[10px] uppercase font-mono font-bold text-amber-400/80 px-2.5 py-1 tracking-wider">
              AI Engines
            </div>
            <button
              onClick={() => onSelectModel('gemini-3.6-flash')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-all ${
                currentModel === 'gemini-3.6-flash'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Dragon 3.6 Flash</span>
                <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded-full text-amber-300 font-mono">Fast & Smart</span>
              </div>
              <span className="text-[10px] text-slate-400">High speed, full capability reasoning</span>
            </button>

            <button
              onClick={() => onSelectModel('gemini-3.1-pro-preview')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-all mt-1 ${
                currentModel === 'gemini-3.1-pro-preview'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Dragon 3.1 Pro</span>
                <span className="text-[9px] bg-purple-500/20 px-1.5 py-0.5 rounded-full text-purple-300 font-mono">Deep Thinker</span>
              </div>
              <span className="text-[10px] text-slate-400">Math proofs, complex code & research</span>
            </button>

            <button
              onClick={() => onSelectModel('gemini-3.1-flash-lite')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-all mt-1 ${
                currentModel === 'gemini-3.1-flash-lite'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Dragon 3.1 Flash-Lite</span>
                <span className="text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded-full text-cyan-300 font-mono">Lite</span>
              </div>
              <span className="text-[10px] text-slate-400">Minimal latency for instant Q&A</span>
            </button>
          </div>
        </div>

        {/* Persona Pill */}
        <button
          onClick={onOpenPersonaModal}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 hover:border-amber-500/40 text-xs text-slate-200 transition-all shadow-sm active:scale-95"
        >
          <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activePersona.avatarColor} animate-pulse`} />
          <span className="font-semibold text-slate-200">{activePersona.name}</span>
        </button>

        {/* Search Grounding toggle */}
        <button
          onClick={onToggleSearch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            useSearch
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10'
              : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
          }`}
          title="Toggle Real-Time Google Search Grounding"
        >
          <Globe className={`w-3.5 h-3.5 ${useSearch ? 'text-emerald-400 animate-spin-slow' : ''}`} />
          <span>Web Grounding</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2">
        {/* Voice Assistant Button */}
        {onOpenVoiceAssistant && (
          <button
            onClick={onOpenVoiceAssistant}
            className="p-1.5 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Open Interactive Voice Assistant"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden lg:inline">Voice AI</span>
          </button>
        )}

        {/* Artifacts Canvas button */}
        {hasArtifacts && (
          <button
            onClick={onToggleArtifacts}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              artifactsOpen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-white/10 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/30'
            }`}
            title="Open Code Artifacts Panel"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Artifacts</span>
          </button>
        )}

        {/* Auto TTS toggle */}
        <button
          onClick={() => onUpdateSettings({ ...settings, autoTTS: !settings.autoTTS })}
          className={`p-2 rounded-xl text-slate-400 hover:text-white transition-all ${
            settings.autoTTS ? 'text-amber-400 bg-amber-500/15 border border-amber-500/30' : 'hover:bg-white/5'
          }`}
          title={settings.autoTTS ? 'Auto Voice Speech Enabled' : 'Auto Voice Speech Disabled'}
        >
          {settings.autoTTS ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Theme Quick Switcher Dropdown */}
        <div className="relative group">
          <button
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-1"
            title="Change UI Theme & Palette"
          >
            <Palette className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </button>
          <div className="absolute top-full mt-1.5 right-0 w-52 bg-slate-900/95 border border-white/10 rounded-2xl shadow-2xl p-1.5 hidden group-hover:block z-50 backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="text-[10px] uppercase font-mono font-bold text-amber-400 px-2.5 py-1 tracking-wider flex items-center justify-between">
              <span>Theme Palette</span>
              <Palette className="w-3 h-3" />
            </div>
            <div className="space-y-0.5 mt-0.5">
              {APP_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onUpdateSettings({ ...settings, theme: theme.id })}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                    settings.theme === theme.id
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-sm'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${theme.color} ring-1 ring-white/20 shadow-sm`} />
                    <span>{theme.name}</span>
                  </span>
                  {settings.theme === theme.id && <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full">Active</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          title="Workspace Settings"
        >
          <Settings className="w-4 h-4 text-slate-300" />
        </button>

        {/* User Account / Login button */}
        <button
          onClick={onOpenAuth}
          className={`p-1.5 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            currentUser
              ? 'bg-slate-900 border-amber-500/40 text-amber-300 hover:border-amber-400 hover:bg-slate-850'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400'
          }`}
          title={currentUser ? `Logged in as ${currentUser.displayName || currentUser.email}` : 'Sign In / Account'}
        >
          {currentUser ? (
            currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="w-5 h-5 rounded-full object-cover ring-1 ring-amber-400/60"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-amber-500/30 text-amber-300 font-bold text-[10px] flex items-center justify-center">
                {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
              </div>
            )
          ) : (
            <User className="w-4 h-4 text-amber-400" />
          )}
          <span className="hidden sm:inline text-xs font-medium">
            {currentUser ? (currentUser.displayName?.split(' ')[0] || 'Account') : 'Sign In'}
          </span>
        </button>
      </div>
    </header>
  );
};
