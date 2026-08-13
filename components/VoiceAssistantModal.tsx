import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Sparkles,
  Send,
  Square,
  Globe2,
  Flame,
  Radio,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { AppSettings, DragonPersona } from '../types';
import { DragonLogo } from './DragonLogo';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
  isGenerating: boolean;
  latestAssistantResponse?: string;
  activePersona: DragonPersona;
  settings?: AppSettings;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  isGenerating,
  latestAssistantResponse,
  activePersona,
  settings,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLang, setSelectedLang] = useState<'hi-IN' | 'en-US' | 'en-IN'>('en-US');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(settings?.voiceSpeed || 1.0);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech synthesis on close or unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // When a new assistant response arrives while modal is open, auto speak it!
  useEffect(() => {
    if (isOpen && latestAssistantResponse && !isGenerating) {
      speakText(latestAssistantResponse);
    }
  }, [latestAssistantResponse, isGenerating, isOpen]);

  // Handle Speech Recognition Setup
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Speak Text Aloud using Web Speech Synthesis
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return;

    // Clean markdown symbols for smooth audio playback
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block output.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 1000));
    utterance.rate = voiceSpeed;
    utterance.pitch = 1.0;
    utterance.lang = selectedLang;

    // Try finding best matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(
      (v) => v.lang.startsWith(selectedLang.split('-')[0]) || v.lang === selectedLang
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendQuery = () => {
    if (!transcript.trim() || isGenerating) return;
    stopListening();
    stopSpeaking();
    onSendMessage(transcript.trim());
    setTranscript('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-500/10 flex flex-col items-center text-center overflow-hidden">
        {/* Ambient Glow Background Effect */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <DragonLogo settings={settings} size="sm" />
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-950 border border-white/10 rounded-full px-2.5 py-1 text-xs text-slate-300">
              <Globe2 className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="en-US" className="bg-slate-900 text-slate-200">English (US)</option>
                <option value="en-IN" className="bg-slate-900 text-slate-200">English (India)</option>
                <option value="hi-IN" className="bg-slate-900 text-slate-200">Hindi (हिंदी)</option>
              </select>
            </div>
            <button
              onClick={() => {
                stopListening();
                stopSpeaking();
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Glowing Voice Orb */}
        <div className="my-8 relative flex items-center justify-center">
          {/* Wave Ripple Effects when listening or speaking */}
          {(isListening || isSpeaking || isGenerating) && (
            <>
              <div className="absolute w-44 h-44 rounded-full border-2 border-amber-500/40 animate-ping opacity-75 pointer-events-none" />
              <div className="absolute w-56 h-56 rounded-full border border-orange-500/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Voice Orb */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-32 h-32 rounded-full p-1 transition-all transform active:scale-95 shadow-2xl flex items-center justify-center relative z-10 ${
              isListening
                ? 'bg-gradient-to-tr from-amber-400 via-orange-500 to-red-600 shadow-orange-500/50 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-600 shadow-teal-500/40'
                : isGenerating
                ? 'bg-gradient-to-tr from-purple-500 via-indigo-500 to-blue-600 shadow-purple-500/40 animate-pulse'
                : 'bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-950 border border-white/20 hover:border-amber-500/50'
            }`}
          >
            <div className="w-full h-full bg-slate-950/90 rounded-full flex flex-col items-center justify-center p-3 relative overflow-hidden">
              {isListening ? (
                <>
                  <Radio className="w-10 h-10 text-amber-400 animate-pulse mb-1" />
                  <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">Listening...</span>
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-10 h-10 text-emerald-400 animate-bounce mb-1" />
                  <span className="text-[10px] font-bold text-emerald-300 tracking-wider uppercase">Speaking...</span>
                </>
              ) : isGenerating ? (
                <>
                  <Sparkles className="w-10 h-10 text-purple-400 animate-spin mb-1" />
                  <span className="text-[10px] font-bold text-purple-300 tracking-wider uppercase">Thinking...</span>
                </>
              ) : (
                <>
                  <Mic className="w-10 h-10 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-semibold text-slate-300">Tap to Speak</span>
                </>
              )}
            </div>
          </button>
        </div>

        {/* Live Transcript / Response Box */}
        <div className="w-full bg-slate-950/90 border border-white/10 rounded-2xl p-4 min-h-[90px] max-h-[160px] overflow-y-auto mb-4 text-left flex flex-col justify-center relative">
          {transcript ? (
            <p className="text-sm text-slate-100 font-medium leading-relaxed">
              &ldquo;{transcript}&rdquo;
            </p>
          ) : isGenerating ? (
            <div className="flex items-center gap-2 text-xs text-amber-300">
              <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
              <span>Dragon AI is generating voice answer...</span>
            </div>
          ) : isSpeaking ? (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Dragon Assistant Voice Output
              </span>
              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                {latestAssistantResponse}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 text-center italic">
              Tap the orb above and speak your question in Hindi or English...
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            {isSpeaking ? (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 border border-white/10"
              >
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
                <span>Mute Voice</span>
              </button>
            ) : latestAssistantResponse ? (
              <button
                onClick={() => speakText(latestAssistantResponse)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 border border-white/10"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Replay Response</span>
              </button>
            ) : null}
          </div>

          <button
            onClick={handleSendQuery}
            disabled={!transcript.trim() || isGenerating}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg ${
              transcript.trim() && !isGenerating
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 hover:brightness-110 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Ask Dragon AI</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
