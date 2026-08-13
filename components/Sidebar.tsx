import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Pin,
  Trash2,
  Folder,
  Edit2,
  Search,
  Download,
  Check,
  X,
  Sparkles,
  Palette,
  FolderPlus,
  Sun,
  Moon,
} from 'lucide-react';
import { ChatSession, ChatFolder, AppSettings } from '../types';
import { DragonLogo } from './DragonLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onTogglePinSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onExportSession: (session: ChatSession) => void;
  folders: ChatFolder[];
  onCreateFolder: (name: string, color: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onTogglePinSession,
  onRenameSession,
  onExportSession,
  folders,
  onCreateFolder,
  settings,
  onUpdateSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showFolderInput, setShowFolderInput] = useState(false);

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = s.title.toLowerCase().includes(q);
    const messageMatch = s.messages.some((m) => m.content.toLowerCase().includes(q));
    return titleMatch || messageMatch;
  });

  const pinnedSessions = filteredSessions.filter((s) => s.pinned);
  const unpinnedSessions = filteredSessions.filter((s) => !s.pinned);

  // Date categorization helper
  const groupSessionsByDate = (sessionList: ChatSession[]) => {
    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = today - 86400000;
    const weekAgo = today - 7 * 86400000;

    const groups: { label: string; items: ChatSession[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Previous 7 Days', items: [] },
      { label: 'Older', items: [] },
    ];

    sessionList.forEach((s) => {
      const sessionDate = new Date(s.updatedAt).setHours(0, 0, 0, 0);
      if (sessionDate >= today) {
        groups[0].items.push(s);
      } else if (sessionDate >= yesterday) {
        groups[1].items.push(s);
      } else if (sessionDate >= weekAgo) {
        groups[2].items.push(s);
      } else {
        groups[3].items.push(s);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  };

  const groupedUnpinned = groupSessionsByDate(unpinnedSessions);

  const startRename = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      const colors = ['#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#3b82f6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      onCreateFolder(newFolderName.trim(), randomColor);
      setNewFolderName('');
      setShowFolderInput(false);
    }
  };

  return (
    <>
      {/* Mobile & Tablet Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container: Off-canvas drawer on Mobile/Tablet (< lg), Collapsible panel on Laptop/Desktop (lg+) */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 bg-slate-950 border-r border-white/10 z-50 lg:z-20 flex flex-col transition-all duration-300 ease-in-out select-none shadow-2xl lg:shadow-none ${
          isOpen
            ? 'w-80 max-w-[85vw] translate-x-0 opacity-100'
            : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:border-r-0 overflow-hidden'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-amber-500/20 flex items-center justify-between min-h-[64px] bg-slate-950/90 backdrop-blur-2xl">
          <DragonLogo settings={settings} size="md" />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-amber-300 rounded-xl hover:bg-amber-500/10 active:scale-95 transition-colors border border-transparent hover:border-amber-500/30"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Pinned Chats */}
          {pinnedSessions.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-semibold text-amber-400/80 tracking-wider mb-1.5 px-2 flex items-center gap-1">
                <Pin className="w-3 h-3" />
                <span>Pinned Chats</span>
              </div>
              <div className="space-y-0.5">
                {pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingId === session.id}
                    editTitle={editTitle}
                    onSetEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onStartRename={(e) => startRename(session, e)}
                    onSaveRename={() => saveRename(session.id)}
                    onCancelRename={() => setEditingId(null)}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                    onExport={() => onExportSession(session)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Folders */}
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1.5 px-2">
              <span className="flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>Projects & Folders</span>
              </span>
              <button
                onClick={() => setShowFolderInput(!showFolderInput)}
                className="hover:text-amber-400 transition-colors"
                title="Create Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>

            {showFolderInput && (
              <form onSubmit={handleCreateFolderSubmit} className="mb-2 px-1">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="flex-1 px-2 py-1 rounded text-xs bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                    autoFocus
                  />
                  <button type="submit" className="p-1 bg-amber-500/20 text-amber-300 rounded hover:bg-amber-500/30">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-0.5">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="px-2 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:bg-white/5 flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                  <span>{folder.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Date Grouped Unpinned Chats */}
          {groupedUnpinned.map((group) => (
            <div key={group.label}>
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1 px-2">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeSessionId}
                    isEditing={editingId === session.id}
                    editTitle={editTitle}
                    onSetEditTitle={setEditTitle}
                    onSelect={() => {
                      onSelectSession(session.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    onStartRename={(e) => startRename(session, e)}
                    onSaveRename={() => saveRename(session.id)}
                    onCancelRename={() => setEditingId(null)}
                    onTogglePin={() => onTogglePinSession(session.id)}
                    onDelete={() => onDeleteSession(session.id)}
                    onExport={() => onExportSession(session)}
                  />
                ))}
              </div>
            </div>
          ))}

          {filteredSessions.length === 0 && (
            <div className="text-center py-8 px-4 text-slate-500 text-xs">
              No chats found. Start a new Dragon AI conversation!
            </div>
          )}
        </div>

        {/* Bottom Theme & User Info Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-900/40 space-y-2">
          {/* Theme Quick Selector */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
              <Palette className="w-3 h-3" />
              <span>Theme</span>
            </span>
            <div className="flex items-center gap-1">
              <ThemeBadge
                color="bg-slate-950 border-amber-500"
                active={settings.theme === 'dark-obsidian'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark-obsidian' })}
                title="Dark Obsidian"
              />
              <ThemeBadge
                color="bg-slate-950 border-cyan-400"
                active={settings.theme === 'midnight-cyber'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'midnight-cyber' })}
                title="Midnight Cyber"
              />
              <ThemeBadge
                color="bg-purple-950 border-purple-500"
                active={settings.theme === 'royal-amethyst'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'royal-amethyst' })}
                title="Royal Amethyst"
              />
              <ThemeBadge
                color="bg-red-950 border-red-500"
                active={settings.theme === 'crimson-flame'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'crimson-flame' })}
                title="Crimson Flame"
              />
              <ThemeBadge
                color="bg-emerald-950 border-emerald-500"
                active={settings.theme === 'emerald-drake'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'emerald-drake' })}
                title="Emerald Drake"
              />
              <ThemeBadge
                color="bg-yellow-950 border-yellow-400"
                active={settings.theme === 'sunset-gold'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'sunset-gold' })}
                title="Sunset Gold"
              />
              <ThemeBadge
                color="bg-sky-950 border-teal-400"
                active={settings.theme === 'deep-ocean'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'deep-ocean' })}
                title="Deep Ocean"
              />
              <ThemeBadge
                color="bg-slate-100 border-slate-400"
                active={settings.theme === 'clean-light'}
                onClick={() => onUpdateSettings({ ...settings, theme: 'clean-light' })}
                title="Clean Light"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] text-amber-400 border border-white/10">
                AI
              </div>
              <span className="truncate text-[11px] text-slate-300">Dragon Studio</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">v2.5</span>
          </div>
        </div>
      </aside>
    </>
  );
};

// Subcomponent for individual session item
interface SessionItemProps {
  session: ChatSession;
  isActive: boolean;
  isEditing: boolean;
  editTitle: string;
  onSetEditTitle: (val: string) => void;
  onSelect: () => void;
  onStartRename: (e: React.MouseEvent) => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onExport: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  isActive,
  isEditing,
  editTitle,
  onSetEditTitle,
  onSelect,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onTogglePin,
  onDelete,
  onExport,
}) => {
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => onSetEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSaveRename();
            if (e.key === 'Escape') onCancelRename();
          }}
          className="flex-1 px-2 py-1 rounded text-xs bg-slate-900 border border-amber-500 text-white focus:outline-none"
          autoFocus
        />
        <button onClick={onSaveRename} className="p-1 text-emerald-400 hover:text-emerald-300">
          <Check className="w-3.5 h-3.5" />
        </button>
        <button onClick={onCancelRename} className="p-1 text-slate-400 hover:text-white">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/50 text-amber-200 font-semibold shadow-sm shadow-amber-500/10'
          : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
      }`}
    >
      <div className="flex items-center gap-2 overflow-hidden flex-1">
        <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400 animate-pulse' : 'text-slate-500 group-hover:text-amber-400/80'}`} />
        <span className="truncate">{session.title}</span>
      </div>

      {/* Action buttons on hover */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-slate-900/90 rounded px-1 ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 hover:text-amber-400 ${session.pinned ? 'text-amber-400' : 'text-slate-400'}`}
          title={session.pinned ? 'Unpin' : 'Pin to top'}
        >
          <Pin className="w-3 h-3" />
        </button>
        <button onClick={onStartRename} className="p-1 text-slate-400 hover:text-white" title="Rename">
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
          className="p-1 text-slate-400 hover:text-white"
          title="Export Markdown"
        >
          <Download className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-slate-400 hover:text-red-400"
          title="Delete Chat"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const ThemeBadge: React.FC<{
  color: string;
  active: boolean;
  onClick: () => void;
  title: string;
}> = ({ color, active, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-4 h-4 rounded-full border ${color} ${
      active ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950' : 'opacity-70 hover:opacity-100'
    } transition-all`}
  />
);
