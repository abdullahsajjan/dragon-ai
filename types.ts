export type Role = 'user' | 'assistant' | 'system';

export interface ImageAttachment {
  id: string;
  name: string;
  mimeType: string;
  data: string; // Base64
  previewUrl: string;
}

export interface DocumentAttachment {
  id: string;
  name: string;
  size: number; // Bytes
  mimeType: string;
  extension: string;
  content?: string; // Extracted plain text
  base64?: string; // Raw base64 data for binary/PDF/image files
  previewText?: string;
  lineCount?: number;
  wordCount?: number;
}

export interface GroundingSource {
  title?: string;
  url?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  reasoning?: string;
  timestamp: number;
  images?: ImageAttachment[];
  documents?: DocumentAttachment[];
  sources?: GroundingSource[];
  isStreaming?: boolean;
  error?: boolean;
  artifacts?: ArtifactItem[];
}

export interface ArtifactItem {
  id: string;
  title: string;
  type: 'html' | 'react' | 'svg' | 'markdown' | 'code' | 'json';
  language?: string;
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  model: string;
  personaId: string;
  systemPrompt?: string;
  thinkingLevel?: 'MINIMAL' | 'LOW' | 'HIGH';
  useSearch?: boolean;
  pinned?: boolean;
  folderId?: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
}

export interface DragonPersona {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  avatarColor: string;
  systemPrompt: string;
  suggestedPrompts: string[];
  defaultModel: string;
  isCustom?: boolean;
}

export interface QuickPromptItem {
  id: string;
  label: string;
  prompt: string;
  icon?: string;
}

export interface AppSettings {
  theme:
    | 'dark-obsidian'
    | 'midnight-cyber'
    | 'royal-amethyst'
    | 'crimson-flame'
    | 'emerald-drake'
    | 'sunset-gold'
    | 'clean-light'
    | 'deep-ocean';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily?: 'sans' | 'mono' | 'serif' | 'cyber';
  logoStyle?: 'dragon-crest' | 'neon-flame' | 'cyber-shield' | 'minimal-spark' | 'emerald-drake' | 'crimson-dragon' | 'diamond-prism' | 'neon-ring' | 'custom';
  textStyle?: 'cyber-neon' | 'flame-gradient' | 'futuristic-3d' | 'glass-pill' | 'minimal-line';
  customLogoUrl?: string;
  appTitle?: string;
  appSubtitle?: string;
  appBadge?: string;
  accentColor?: 'amber' | 'cyan' | 'purple' | 'emerald' | 'rose' | 'indigo' | 'sunset' | 'diamond';
  chatLayout?: 'bubbles' | 'flat' | 'compact' | 'reader';
  backgroundEffect?: 'grid' | 'dots' | 'aura' | 'cyber' | 'solid' | 'glass';
  sidebarPosition?: 'left' | 'right';
  codeTheme?: 'dark-synth' | 'monokai' | 'dracula' | 'github-dark';
  userName?: string;
  userAvatarUrl?: string;
  assistantName?: string;
  assistantAvatarUrl?: string;
  customWelcomeMessage?: string;
  voiceLanguage?: string;
  voiceSpeed?: number;
  voicePitch?: number;
  autoSpeakResponses?: boolean;
  autoTTS: boolean;
  streamSpeed: 'normal' | 'fast';
  defaultModel: string;
  showThinkingProcess: boolean;
  customSystemInstruction: string;
  customQuickPrompts?: QuickPromptItem[];
  customPersonas?: DragonPersona[];
}
