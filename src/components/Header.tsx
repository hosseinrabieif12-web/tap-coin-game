import React from 'react';
import { Volume2, VolumeX, Zap, Github, Send } from 'lucide-react';
import { formatCompact } from '../utils/gameMath';

interface HeaderProps {
  coins: number;
  coinsPerSecond: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenGitHubModal: () => void;
  onOpenTelegramModal: () => void;
  playerTitle: string;
  playerLevel: number;
  playerBadge: string;
}

export const Header: React.FC<HeaderProps> = ({
  coins,
  coinsPerSecond,
  soundEnabled,
  onToggleSound,
  onOpenGitHubModal,
  onOpenTelegramModal,
  playerTitle,
  playerLevel,
  playerBadge,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#080B10]/90 backdrop-blur-md border-b border-amber-500/15 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
        {/* Brand & Rank */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-0.5 shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center">
            <span className="text-base select-none leading-none">{playerBadge || '🪙'}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-wider text-amber-400 uppercase leading-none whitespace-nowrap">
                TAP COIN
              </h1>
              <span className="text-[10px] font-bold text-amber-300/80 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded leading-none whitespace-nowrap">
                LVL {playerLevel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
              {playerTitle}
            </p>
          </div>
        </div>

        {/* Live Passive Income, Telegram, GitHub & Sound */}
        <div className="flex items-center gap-1.5 shrink-0">
          {coinsPerSecond > 0 && (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-950/40 border border-amber-500/20 text-amber-300 text-xs font-semibold tabular-nums">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>+{formatCompact(coinsPerSecond)}/s</span>
            </div>
          )}

          {/* Telegram Bot Connector Button */}
          <button
            onClick={onOpenTelegramModal}
            title="اتصال به بات تلگرام و وب‌هوک (Telegram Bot)"
            className="flex items-center gap-1 py-1.5 px-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400 text-sky-400 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 -translate-x-0.5 translate-y-0.5" />
            <span className="hidden xs:inline text-[11px]">بات</span>
          </button>

          {/* GitHub Publish Button */}
          <button
            onClick={onOpenGitHubModal}
            title="انتشار خودکار روی گیت‌هاب (Publish to GitHub)"
            className="flex items-center gap-1 py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400 text-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Github className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline text-[11px]">گیت‌هاب</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            className="w-8 h-8 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
