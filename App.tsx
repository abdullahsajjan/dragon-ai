import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatMessageItem } from './components/ChatMessageItem';
import { ChatInput } from './components/ChatInput';
import { ArtifactsPanel } from './components/ArtifactsPanel';
import { PersonaSelectorModal } from './components/PersonaSelectorModal';
import { SettingsModal } from './components/SettingsModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { AuthModal } from './components/AuthModal';
import { auth, saveUserSessionsToFirestore, loadUserSessionsFromFirestore } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { DRAGON_PERSONAS } from './data/personas';
import { extractArtifacts } from './utils/artifactParser';
import {
  loadSessions,
  saveSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  loadFolders,
  saveFolders,
  loadSettings,
  saveSettings,
} from './utils/storage';
import {
  ChatSession,
  ChatMessage,
  ImageAttachment,
  DocumentAttachment,
  DragonPersona,
  ArtifactItem,
  ChatFolder,
  AppSettings,
} from './types';
import { Sparkles, MessageSquarePlus, Code2 } from 'lucide-react';

export default function App() {
  // Persistence state
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessions());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => loadActiveSessionId());
  const [folders, setFolders] = useState<ChatFolder[]>(() => loadFolders());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());

  // Workspace UI states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<DragonPersona>(DRAGON_PERSONAS[0]);
  const [currentModel, setCurrentModel] = useState<string>('gemini-3.6-flash');
  const [useSearch, setUseSearch] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState<ArtifactItem | null>(null);
  const [artifactsOpen, setArtifactsOpen] = useState(false);

  // Modals
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    let initialCheckDone = false;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user && !initialCheckDone) {
        setAuthModalOpen(true);
      } else if (user) {
        // Load cloud sessions from Firestore
        const remoteSessions = await loadUserSessionsFromFirestore(user.uid);
        if (remoteSessions && Array.isArray(remoteSessions) && remoteSessions.length > 0) {
          setSessions(remoteSessions);
          if (remoteSessions[0]?.id) {
            setActiveSessionId(remoteSessions[0].id);
          }
        }
      }
      initialCheckDone = true;
    });
    return () => unsubscribe();
  }, []);

  // References
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ensure there is at least one session on first load
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSession: ChatSession = {
        id: `session-${Date.now()}`,
        title: 'New Workspace',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        model: 'gemini-3.6-flash',
        personaId: DRAGON_PERSONAS[0].id,
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSession.id);
      saveSessions([defaultSession]);
      saveActiveSessionId(defaultSession.id);
    } else if (!activeSessionId) {
      setActiveSessionId(sessions[0].id);
      saveActiveSessionId(sessions[0].id);
    }
  }, []);

  // Sync sessions to localStorage & Firestore
  useEffect(() => {
    if (sessions.length > 0) {
      saveSessions(sessions);
      if (currentUser?.uid) {
        saveUserSessionsToFirestore(currentUser.uid, sessions);
      }
    }
  }, [sessions, currentUser]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    if (activeSessionId) {
      saveActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  // Sync settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Current Active Session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Auto scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages.length, isGenerating]);

  // Handle New Chat Creation
  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      model: currentModel,
      personaId: activePersona.id,
      useSearch,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setActiveArtifact(null);
    setArtifactsOpen(false);
  };

  // Delete Chat Session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (id === activeSessionId && remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Toggle Pin Session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s))
    );
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  // Export Session to Markdown
  const handleExportSession = (session: ChatSession) => {
    const mdContent = `# ${session.title}\n*Exported from Dragon AI Workspace on ${new Date().toLocaleDateString()}*\n\n` +
      session.messages
        .map((m) => `### ${m.role === 'user' ? 'You' : 'Dragon AI'}\n${m.content}\n`)
        .join('\n---\n\n');

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${session.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
  };

  // Send Message to Dragon AI
  const handleSendMessage = async (
    text: string,
    images: ImageAttachment[] = [],
    documents: DocumentAttachment[] = []
  ) => {
    if (!activeSessionId) return;

    // Build user message
    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
      images,
      documents,
      timestamp: Date.now(),
    };

    // Auto generate title if it's the first user message
    let sessionTitle = activeSession.title;
    if (activeSession.messages.length === 0 || activeSession.title === 'New Conversation') {
      if (text.trim()) {
        sessionTitle = text.length > 30 ? text.substring(0, 30) + '...' : text;
      } else if (documents.length > 0) {
        sessionTitle = `Doc Analysis: ${documents[0].name}`;
      } else {
        sessionTitle = 'Multimodal Query';
      }
    }

    // Assistant placeholder message for streaming
    const assistantMessageId = `msg-assistant-${Date.now()}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...activeSession.messages, userMessage, assistantMessage];

    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : s
      )
    );

    setIsGenerating(true);

    // Setup AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build system prompt combining persona + settings
      let fullSystemPrompt = activePersona.systemPrompt;
      if (settings.customSystemInstruction) {
        fullSystemPrompt += `\n\nUser Custom Preference: ${settings.customSystemInstruction}`;
      }

      // Stream fetch to server endpoint
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: [...activeSession.messages, userMessage],
          model: currentModel,
          systemInstruction: fullSystemPrompt,
          thinkingLevel: currentModel === 'gemini-3.1-pro-preview' ? 'LOW' : 'MINIMAL',
          useSearch,
          images,
          documents,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Failed to communicate with Dragon AI server.`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let sources: any[] = [];
      let buffer = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Retain partial line at the end of buffer
          buffer = lines.pop() || '';

          for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith(':')) continue;

            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim();
              if (dataStr === '[DONE]') break;

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.error) {
                  accumulatedText += `\n\n⚠️ **Error**: ${parsed.error}`;
                } else {
                  if (parsed.text) {
                    accumulatedText += parsed.text;
                  }
                  if (parsed.sources && Array.isArray(parsed.sources)) {
                    sources = parsed.sources;
                  }
                }

                // Update assistant message in real time
                setSessions((prev) =>
                  prev.map((s) => {
                    if (s.id !== activeSessionId) return s;
                    const msgs = s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? {
                            ...m,
                            content: accumulatedText,
                            sources: sources.length > 0 ? sources : m.sources,
                          }
                        : m
                    );
                    return { ...s, messages: msgs };
                  })
                );
              } catch (e) {
                console.error('SSE JSON parse error:', e, dataStr);
              }
            }
          }
        }
      }

      // Finish streaming logic
      const extractedArtifacts = extractArtifacts(accumulatedText);

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          const msgs = s.messages.map((m) =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: accumulatedText,
                  isStreaming: false,
                  artifacts: extractedArtifacts,
                }
              : m
          );
          return { ...s, messages: msgs };
        })
      );

      // Auto open artifact panel if new artifact was extracted
      if (extractedArtifacts.length > 0) {
        setActiveArtifact(extractedArtifacts[0]);
        setArtifactsOpen(true);
      }

      // Speak text if autoTTS enabled
      if (settings.autoTTS && 'speechSynthesis' in window) {
        const cleanText = accumulatedText.replace(/```[\s\S]*?```/g, '');
        const utterance = new SpeechSynthesisUtterance(cleanText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            const msgs = s.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: `⚠️ Failed to connect to Dragon AI: ${err.message || 'Unknown network error.'}`,
                    isStreaming: false,
                    error: true,
                  }
                : m
            );
            return { ...s, messages: msgs };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeSession || activeSession.messages.length < 2) return;
    const lastUserMsg = [...activeSession.messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content, lastUserMsg.images || []);
    }
  };

  // Collect all artifacts in current active session
  const allSessionArtifacts = activeSession?.messages.flatMap((m) => m.artifacts || []) || [];

  // Update Settings and Persist to Storage
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return (
    <div className={`h-screen w-screen flex flex-col overflow-hidden theme-${settings.theme} font-size-${settings.fontSize || 'medium'}`}>
      {/* Navbar Header */}
      <Navbar
        currentModel={currentModel}
        onSelectModel={setCurrentModel}
        activePersona={activePersona}
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
        useSearch={useSearch}
        onToggleSearch={() => setUseSearch(!useSearch)}
        hasArtifacts={allSessionArtifacts.length > 0}
        artifactsOpen={artifactsOpen}
        onToggleArtifacts={() => setArtifactsOpen(!artifactsOpen)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onNewChat={handleNewChat}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Workspace Layout (Sidebar + Chat Area + Artifacts Side Panel) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onNewChat={handleNewChat}
          onDeleteSession={handleDeleteSession}
          onTogglePinSession={handleTogglePinSession}
          onRenameSession={handleRenameSession}
          onExportSession={handleExportSession}
          folders={folders}
          onCreateFolder={(name, color) => setFolders((prev) => [...prev, { id: `f-${Date.now()}`, name, color }])}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />

        {/* Central Chat Stream & Input Area */}
        <main className={`flex-1 flex flex-col h-full overflow-hidden relative bg-pattern-${settings.backgroundEffect || 'grid'}`}>
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
            {activeSession?.messages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                settings={settings}
                onRegenerate={handleRegenerate}
                onOpenArtifact={(art) => {
                  setActiveArtifact(art);
                  setArtifactsOpen(true);
                }}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Prompt Input Control */}
          <div className="border-t border-white/10 bg-slate-950/40 backdrop-blur-md">
            <ChatInput
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              onStopGeneration={handleStopGeneration}
              useSearch={useSearch}
              onToggleSearch={() => setUseSearch(!useSearch)}
              activePersona={activePersona}
              onOpenPersonaModal={() => setPersonaModalOpen(true)}
              onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
              isEmptySession={activeSession?.messages.length === 0}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          </div>
        </main>

        {/* Claude-Style Code Artifacts Panel */}
        {artifactsOpen && (
          <ArtifactsPanel
            artifact={activeArtifact || allSessionArtifacts[allSessionArtifacts.length - 1] || null}
            onClose={() => setArtifactsOpen(false)}
          />
        )}
      </div>

      {/* Persona Selector Modal */}
      <PersonaSelectorModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        activePersonaId={activePersona.id}
        onSelectPersona={setActivePersona}
        customPersonas={settings.customPersonas}
        onOpenSettingsCustomizer={() => setSettingsModalOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          saveSettings(newSettings);
        }}
        onClearAllSessions={() => {
          setSessions([]);
          localStorage.clear();
        }}
        onExportAllData={() => {
          const exportPayload = {
            sessions,
            folders,
            settings,
          };
          const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `dragon-ai-workspace-backup-${Date.now()}.json`;
          a.click();
        }}
        onImportData={(jsonStr) => {
          try {
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data)) {
              setSessions(data);
              saveSessions(data);
            } else if (data.sessions) {
              setSessions(data.sessions || []);
              saveSessions(data.sessions || []);
              if (data.folders) {
                setFolders(data.folders);
                saveFolders(data.folders);
              }
              if (data.settings) {
                setSettings(data.settings);
                saveSettings(data.settings);
              }
            }
            alert('Workspace backup successfully restored!');
          } catch (err) {
            alert('Invalid backup JSON file.');
          }
        }}
      />

      {/* Voice Assistant Hands-Free Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
        latestAssistantResponse={
          activeSession?.messages.filter((m) => m.role === 'assistant' && m.content).slice(-1)[0]?.content
        }
        activePersona={activePersona}
        settings={settings}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        settings={settings}
      />
    </div>
  );
}
