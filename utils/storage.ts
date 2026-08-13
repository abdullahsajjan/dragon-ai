import { ChatSession, ChatFolder, AppSettings } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'dragon_ai_sessions_v1',
  ACTIVE_SESSION_ID: 'dragon_ai_active_session_v1',
  FOLDERS: 'dragon_ai_folders_v1',
  SETTINGS: 'dragon_ai_settings_v1',
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark-obsidian',
  fontSize: 'medium',
  fontFamily: 'sans',
  logoStyle: 'dragon-crest',
  appTitle: 'Dragon AI',
  appSubtitle: 'Universal Intelligence Workspace',
  appBadge: '',
  accentColor: 'amber',
  chatLayout: 'bubbles',
  backgroundEffect: 'grid',
  sidebarPosition: 'left',
  codeTheme: 'dark-synth',
  userName: 'You',
  userAvatarUrl: '',
  assistantName: 'Dragon AI',
  assistantAvatarUrl: '',
  customWelcomeMessage: '',
  voiceLanguage: 'en-US',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
  autoTTS: false,
  streamSpeed: 'fast',
  defaultModel: 'gemini-3.6-flash',
  showThinkingProcess: true,
  customSystemInstruction: '',
  customQuickPrompts: [
    { id: 'qp-summary', label: 'Summarize', prompt: 'Please summarize the main points in clear bullet points:', icon: 'AlignLeft' },
    { id: 'qp-code', label: 'Code Review', prompt: 'Please review this code, find potential bugs, and suggest improvements:', icon: 'Code' },
    { id: 'qp-hindi', label: 'Translate Hindi', prompt: 'Please translate the following text into natural, simple Hindi:', icon: 'Languages' },
    { id: 'qp-explain', label: 'Explain Simple', prompt: 'Explain this concept to me step-by-step as if I am 10 years old:', icon: 'HelpCircle' },
  ],
  customPersonas: [],
};

export function loadSessions(): ChatSession[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Failed to load sessions:', err);
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

export function loadActiveSessionId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION_ID);
}

export function saveActiveSessionId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION_ID, id);
}

export function loadFolders(): ChatFolder[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return data ? JSON.parse(data) : [
      { id: 'f-code', name: 'Code & Dev', color: '#f59e0b' },
      { id: 'f-research', name: 'Research Notes', color: '#10b981' },
      { id: 'f-creative', name: 'Creative Writing', color: '#8b5cf6' },
    ];
  } catch (err) {
    return [];
  }
}

export function saveFolders(folders: ChatFolder[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  } catch (err) {
    console.error('Failed to save folders:', err);
  }
}

export function loadSettings(): AppSettings {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(data);
    if (parsed.appBadge === 'PRO') {
      parsed.appBadge = '';
    }
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      appBadge: parsed.appBadge === 'PRO' ? '' : (parsed.appBadge ?? ''),
      customQuickPrompts: parsed.customQuickPrompts && parsed.customQuickPrompts.length > 0
        ? parsed.customQuickPrompts
        : DEFAULT_SETTINGS.customQuickPrompts,
      customPersonas: parsed.customPersonas || [],
    };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}
