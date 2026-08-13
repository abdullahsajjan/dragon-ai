import React from 'react';
import { Flame, Shield, Sparkles, Zap } from 'lucide-react';
import { AppSettings } from '../types';

interface DragonLogoProps {
  settings?: AppSettings;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  layout?: 'horizontal' | 'stacked';
  className?: string;
  onClick?: () => void;
}

export const DragonLogo: React.FC<DragonLogoProps> = ({
  settings,
  size = 'md',
  showText = true,
  layout = 'horizontal',
  className = '',
  onClick,
}) => {
  const customUrl = settings?.customLogoUrl;
  const logoStyle = settings?.logoStyle === 'custom' || customUrl ? (settings?.logoStyle || 'custom') : (settings?.logoStyle || 'dragon-crest');

  const sizeDimensions = {
    sm: { box: 'w-7 h-7', icon: 'w-4 h-4', text: 'text-xs', badge: 'text-[9px]' },
    md: { box: 'w-9 h-9', icon: 'w-5 h-5', text: 'text-sm', badge: 'text-[10px]' },
    lg: { box: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-lg', badge: 'text-xs' },
    xl: { box: 'w-24 h-24', icon: 'w-14 h-14', text: 'text-2xl', badge: 'text-xs' },
  }[size];

  // Render Custom URL or Uploaded Image Logo
  if ((logoStyle === 'custom' || customUrl) && customUrl) {
    return (
      <div onClick={onClick} className={`flex items-center gap-2.5 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}>
        <div className={`${sizeDimensions.box} rounded-xl overflow-hidden shadow-lg border border-amber-500/40 bg-slate-950 flex items-center justify-center relative p-0.5 group-hover:border-amber-400 transition-all`}>
          <img
            src={customUrl}
            alt="App Logo"
            className="w-full h-full object-contain rounded-lg"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Fallback if URL fails
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        {showText && (
          <div className="flex flex-col">
            <span className={`font-extrabold tracking-wide bg-gradient-to-r from-amber-200 via-orange-300 to-amber-500 bg-clip-text text-transparent ${sizeDimensions.text} flex items-center gap-1.5`}>
              {settings?.appTitle || 'Dragon AI'}
              {settings?.appBadge && settings?.appBadge !== 'PRO' && (
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 ${sizeDimensions.badge}`}>
                  {settings.appBadge}
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Render SVG Vector Crest Logos
  const renderLogoIcon = () => {
    switch (logoStyle) {
      case 'neon-flame':
        return (
          <div className={`${sizeDimensions.box} rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-0.5 shadow-lg shadow-orange-500/30`}>
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group p-0.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 via-red-500/20 to-transparent opacity-80" />
              <Flame className={`${sizeDimensions.icon} text-amber-400 fill-amber-500/40 animate-pulse relative z-10`} />
            </div>
          </div>
        );

      case 'cyber-shield':
        return (
          <div className={`${sizeDimensions.box} rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/30`}>
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group p-0.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-blue-500/20 to-transparent opacity-80" />
              <Shield className={`${sizeDimensions.icon} text-cyan-400 fill-cyan-500/30 relative z-10`} />
            </div>
          </div>
        );

      case 'minimal-spark':
        return (
          <div className={`${sizeDimensions.box} rounded-xl bg-gradient-to-br from-purple-400 via-violet-600 to-fuchsia-600 p-0.5 shadow-lg shadow-purple-500/30`}>
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group p-0.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 via-fuchsia-500/20 to-transparent opacity-80" />
              <Zap className={`${sizeDimensions.icon} text-purple-300 fill-purple-400/40 relative z-10`} />
            </div>
          </div>
        );

      case 'emerald-drake':
        return (
          <div className={`${sizeDimensions.box} rounded-xl bg-gradient-to-br from-emerald-400 via-teal-600 to-green-700 p-0.5 shadow-lg shadow-emerald-500/30`}>
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group p-0.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-transparent opacity-80" />
              <Sparkles className={`${sizeDimensions.icon} text-emerald-300 fill-emerald-400/40 relative z-10`} />
            </div>
          </div>
        );

      case 'crimson-dragon':
        return (
          <div className={`${sizeDimensions.box} rounded-xl bg-gradient-to-br from-rose-500 via-red-600 to-orange-600 p-0.5 shadow-lg shadow-red-500/30`}>
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group p-0.5">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/30 via-orange-500/20 to-transparent opacity-80" />
              <Flame className={`${sizeDimensions.icon} text-rose-300 fill-rose-500/40 relative z-10`} />
            </div>
          </div>
        );

      case 'dragon-crest':
      default:
        return (
          <div className={`${sizeDimensions.box} relative flex items-center justify-center shrink-0 group`}>
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-md group-hover:bg-amber-500/30 transition-all pointer-events-none" />
            
            {/* High-Precision Metallic Cyber Dragon D Crest */}
            <svg className="w-full h-full relative z-10 drop-shadow-[0_2px_10px_rgba(245,158,11,0.55)] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                {/* Premium Gold Metallic Gradient */}
                <linearGradient id="goldMetallicMain" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="20%" stopColor="#fef08a" />
                  <stop offset="45%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#d97706" />
                  <stop offset="90%" stopColor="#78350f" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>

                {/* Dark Gunmetal Steel Gradient */}
                <linearGradient id="steelMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="35%" stopColor="#334155" />
                  <stop offset="70%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Lighter Steel Highlight for 3D bevels */}
                <linearGradient id="steelHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="50%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Bright Gold Rim Highlight */}
                <linearGradient id="goldGlint" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>

                {/* Intense Glowing Eye */}
                <radialGradient id="amberEyeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="30%" stopColor="#fbbf24" />
                  <stop offset="75%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#450a0a" />
                </radialGradient>
              </defs>

              {/* 1. Outer Golden Circuit Halo Ring */}
              <circle cx="50" cy="50" r="41" stroke="url(#goldMetallicMain)" strokeWidth="1.6" opacity="0.9" />
              <circle cx="50" cy="50" r="44" stroke="url(#goldMetallicMain)" strokeWidth="0.6" strokeDasharray="16 6 8 6" opacity="0.6" />

              {/* Outer Circuit Nodes & Traces */}
              <path d="M 9 50 H 1 M 91 50 H 99 M 50 9 V 1 M 50 91 V 99" stroke="url(#goldMetallicMain)" strokeWidth="1.2" opacity="0.8" />
              <circle cx="2" cy="50" r="1.5" fill="url(#goldMetallicMain)" />
              <circle cx="98" cy="50" r="1.5" fill="url(#goldMetallicMain)" />
              <circle cx="50" cy="2" r="1.5" fill="url(#goldMetallicMain)" />
              <circle cx="50" cy="98" r="1.5" fill="url(#goldMetallicMain)" />

              {/* Corner Circuit Traces */}
              <path d="M 80 26 H 90 V 34 M 20 74 H 10 V 66" stroke="url(#goldMetallicMain)" strokeWidth="1" opacity="0.7" fill="none" />
              <circle cx="90" cy="34" r="1.2" fill="url(#goldMetallicMain)" />
              <circle cx="10" cy="66" r="1.2" fill="url(#goldMetallicMain)" />

              {/* 2. Solid 'D' Base Spine Block (Dark Gunmetal Steel with Gold Rim) */}
              <path d="M 38 16 C 68 16 86 30 86 50 C 86 70 68 84 38 84 H 30 V 16 Z" fill="url(#steelMetallic)" stroke="url(#goldMetallicMain)" strokeWidth="1.6" />
              {/* D Inner Cutout in Pitch Dark Background */}
              <path d="M 44 28 C 60 28 72 36 72 50 C 72 64 60 72 44 72 V 28 Z" fill="#020617" stroke="url(#goldMetallicMain)" strokeWidth="1" />

              {/* 3. PCB Circuit Lines on the Dark Steel 'D' Plate */}
              <g opacity="0.9">
                <path d="M 54 32 H 66 L 72 38 V 48 L 66 54 H 58" stroke="url(#goldMetallicMain)" strokeWidth="1" fill="none" />
                <circle cx="66" cy="32" r="1.3" fill="url(#goldMetallicMain)" />
                <circle cx="72" cy="38" r="1.3" fill="url(#goldMetallicMain)" />
                <circle cx="66" cy="54" r="1.3" fill="url(#goldMetallicMain)" />

                <path d="M 50 62 H 62 L 68 68" stroke="url(#goldMetallicMain)" strokeWidth="0.9" fill="none" />
                <circle cx="68" cy="68" r="1.2" fill="url(#goldMetallicMain)" />
              </g>

              {/* 1. Outer Glowing Neon Circuit Ring */}
              <circle cx="50" cy="50" r="44" stroke="url(#goldMetallicMain)" strokeWidth="1.8" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <circle cx="50" cy="50" r="41" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="12 4 4 4" opacity="0.8" />

              {/* Glowing Outer Orbs */}
              <circle cx="50" cy="6" r="2.5" fill="#fef08a" className="animate-ping" opacity="0.7" />
              <circle cx="50" cy="6" r="2" fill="url(#goldMetallicMain)" />
              <circle cx="50" cy="94" r="2" fill="url(#goldMetallicMain)" />
              <circle cx="6" cy="50" r="2" fill="url(#goldMetallicMain)" />
              <circle cx="94" cy="50" r="2" fill="url(#goldMetallicMain)" />

              {/* Corner Circuit Traces */}
              <path d="M 18 28 L 28 18 H 36" stroke="url(#goldGlint)" strokeWidth="1.2" fill="none" opacity="0.8" />
              <path d="M 82 28 L 72 18 H 64" stroke="url(#goldGlint)" strokeWidth="1.2" fill="none" opacity="0.8" />
              <path d="M 18 72 L 28 82 H 36" stroke="url(#goldGlint)" strokeWidth="1.2" fill="none" opacity="0.8" />
              <path d="M 82 72 L 72 82 H 64" stroke="url(#goldGlint)" strokeWidth="1.2" fill="none" opacity="0.8" />

              {/* 2. Cyber Dragon Silhouette & Wings */}
              {/* Back Golden Wing Flame */}
              <path d="M 50 20 C 65 12 84 22 86 42 C 86 58 72 74 50 86 C 28 74 14 58 14 42 C 16 22 35 12 50 20 Z" fill="url(#steelMetallic)" stroke="url(#goldMetallicMain)" strokeWidth="1.8" />

              {/* Inner Glowing Core Pattern */}
              <path d="M 50 26 C 60 20 74 28 76 42 C 76 54 66 66 50 76 C 34 66 24 54 24 42 C 26 28 40 20 50 26 Z" fill="#020617" stroke="url(#goldGlint)" strokeWidth="1" />

              {/* Cyber Dragon Head - Sharp Facing Left/Front */}
              {/* Horn 1 Back Right */}
              <path d="M 52 24 L 68 12 L 62 26 Z" fill="url(#goldMetallicMain)" />
              <path d="M 48 24 L 32 12 L 38 26 Z" fill="url(#goldMetallicMain)" />

              {/* Secondary Fiery Horns */}
              <path d="M 54 28 L 74 20 L 64 32 Z" fill="url(#goldGlint)" />
              <path d="M 46 28 L 26 20 L 36 32 Z" fill="url(#goldGlint)" />

              {/* Center Dragon Brow & Crown Plate */}
              <path d="M 50 22 L 58 34 L 50 44 L 42 34 Z" fill="url(#steelHighlight)" stroke="url(#goldMetallicMain)" strokeWidth="1.2" />

              {/* Snout & Mandibles */}
              <path d="M 50 44 L 62 52 L 50 70 L 38 52 Z" fill="url(#steelMetallic)" stroke="url(#goldGlint)" strokeWidth="1.4" />
              <path d="M 50 48 L 56 54 L 50 64 L 44 54 Z" fill="#090d16" stroke="url(#goldMetallicMain)" strokeWidth="1" />

              {/* Fiery Eye Gems */}
              <circle cx="44" cy="40" r="2.5" fill="url(#amberEyeGlow)" className="drop-shadow-[0_0_6px_#f59e0b]" />
              <circle cx="56" cy="40" r="2.5" fill="url(#amberEyeGlow)" className="drop-shadow-[0_0_6px_#f59e0b]" />

              {/* Center Core Gem Crystal */}
              <polygon points="50,30 53,35 50,40 47,35" fill="#fef08a" />

              {/* Bottom Flame Accent Wing Tail */}
              <path d="M 50 70 L 56 78 L 50 88 L 44 78 Z" fill="url(#goldMetallicMain)" />
            </svg>
          </div>
        );
    }
  };

  const titleText = settings?.appTitle || 'Dragon AI';
  const badgeText = (settings?.appBadge === 'PRO' ? '' : settings?.appBadge) || '';
  const textStyle = settings?.textStyle || 'default';

  // Ensure firstWord is 'DRAGON' (uppercase) and secondWord is 'AI'
  const parts = titleText.trim().split(/\s+/);
  const rawFirst = parts[0] || 'DRAGON';
  const rawSecond = parts.slice(1).join(' ') || 'AI';

  const uppercaseFirst = rawFirst.toUpperCase();
  const uppercaseSecond = rawSecond.toUpperCase();

  // Size specific line font sizing
  const line1FontSize = size === 'sm' ? 'text-xs sm:text-sm' : size === 'md' ? 'text-sm sm:text-base' : size === 'lg' ? 'text-lg sm:text-xl' : 'text-2xl';
  const line2FontSize = size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-[12px]' : size === 'lg' ? 'text-[14px]' : 'text-[16px]';

  // Render Text Content according to user's requested style
  const renderTextContent = () => {
    if (!showText) return null;

    if (layout === 'stacked') {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          {/* Top Line: DRAGON in Cinzel / Syne elegant font */}
          <div className="font-cinzel font-bold uppercase tracking-[0.35em] text-slate-200 text-xs sm:text-sm drop-shadow-sm">
            {uppercaseFirst}
          </div>

          {/* Bottom Line: -- AI -- in Orbitron futuristic glowing font */}
          <div className="mt-1 flex items-center justify-center gap-1.5 font-orbitron font-black text-2xl sm:text-3xl tracking-[0.2em] drop-shadow-[0_0_16px_rgba(245,158,11,0.85)]">
            <span className="text-amber-500/90 font-extrabold opacity-90">--</span>
            <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-orange-400 bg-clip-text text-transparent px-1.5 font-orbitron font-black">
              {uppercaseSecond}
            </span>
            <span className="text-amber-500/90 font-extrabold opacity-90">--</span>
          </div>

          {badgeText && (
            <span className="mt-1.5 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {badgeText}
            </span>
          )}
        </div>
      );
    }

    // Default Horizontal Layouts (Navbar, Sidebar, Modals)
    return (
      <div className="flex flex-col justify-center leading-none">
        {/* Top Line: DRAGON in Cinzel font */}
        <div className="flex items-center gap-1 font-cinzel font-bold uppercase tracking-[0.25em] text-slate-200 text-[10px] sm:text-xs">
          <span>{uppercaseFirst}</span>
          {badgeText && (
            <span className={`font-mono font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 ${sizeDimensions.badge}`}>
              {badgeText}
            </span>
          )}
        </div>

        {/* Bottom Line: -- AI -- in Orbitron font */}
        <div className="flex items-center justify-start gap-1 mt-1 font-orbitron font-black text-amber-400 tracking-[0.2em] text-sm sm:text-base drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]">
          <span className="text-amber-500 font-extrabold">--</span>
          <span className="bg-gradient-to-r from-amber-100 via-amber-300 to-amber-400 bg-clip-text text-transparent px-0.5 font-orbitron font-black">
            {uppercaseSecond}
          </span>
          <span className="text-amber-500 font-extrabold">--</span>
        </div>
      </div>
    );
  };

  if (layout === 'stacked') {
    return (
      <div onClick={onClick} className={`flex flex-col items-center justify-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}>
        {/* Large Central Emblem */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 relative flex items-center justify-center p-1 mb-3">
          <div className="absolute inset-0 bg-amber-500/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
          <div className="w-full h-full flex items-center justify-center relative z-10">
            {renderLogoIcon()}
          </div>
        </div>

        {/* Text Content */}
        {renderTextContent()}
      </div>
    );
  }

  return (
    <div onClick={onClick} className={`flex items-center gap-3 select-none group ${onClick ? 'cursor-pointer' : ''} ${className}`}>
      {renderLogoIcon()}
      {renderTextContent()}
    </div>
  );
};
