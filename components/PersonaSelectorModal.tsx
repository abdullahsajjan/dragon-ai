import React from 'react';
import {
  X,
  Flame,
  Check,
  Sparkles,
  Terminal,
  Search,
  Feather,
  BrainCircuit,
  Briefcase,
  GraduationCap,
  Compass,
  Scale,
} from 'lucide-react';
import { DRAGON_PERSONAS } from '../data/personas';
import { DragonPersona } from '../types';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersonaId: string;
  onSelectPersona: (persona: DragonPersona) => void;
  customPersonas?: DragonPersona[];
  onOpenSettingsCustomizer?: () => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  isOpen,
  onClose,
  activePersonaId,
  onSelectPersona,
  customPersonas = [],
  onOpenSettingsCustomizer,
}) => {
  if (!isOpen) return null;

  const allPersonas = [...DRAGON_PERSONAS, ...customPersonas];

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-5 h-5 text-amber-400" />;
      case 'Search':
        return <Search className="w-5 h-5 text-emerald-400" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-purple-400" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5 text-cyan-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-300" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-blue-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-rose-400" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-violet-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-white">Select AI Persona</h2>
          </div>
          <div className="flex items-center gap-2">
            {onOpenSettingsCustomizer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSettingsCustomizer();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold border border-amber-500/30 flex items-center gap-1 transition-colors"
              >
                <span>+ Custom Persona</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personas Grid */}
        <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {allPersonas.map((persona) => {
            const isSelected = persona.id === activePersonaId;
            return (
              <div
                key={persona.id}
                onClick={() => {
                  onSelectPersona(persona);
                  onClose();
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/60 border-white/10 hover:border-white/20 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${persona.avatarColor} p-0.5 flex items-center justify-center flex-shrink-0`}
                >
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                    {getPersonaIcon(persona.icon)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-slate-100">{persona.name}</h3>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{persona.tagline}</p>
                  <div className="text-[10px] font-mono text-slate-500 bg-black/30 p-2 rounded-lg line-clamp-2">
                    {persona.systemPrompt}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
