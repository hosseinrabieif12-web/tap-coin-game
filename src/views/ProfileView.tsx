import React, { useState } from 'react';
import {
  Award,
  Coins,
  MousePointerClick,
  ArrowUpCircle,
  Zap,
  Bot,
  Flame,
  Volume2,
  Vibrate,
  RotateCcw,
  Cloud,
  CheckCircle,
  ExternalLink,
  HelpCircle,
  X,
  Github,
} from 'lucide-react';
import { GameState } from '../types/game';
import { formatCompact, getPlayerRank } from '../utils/gameMath';
import { soundManager } from '../utils/audio';

interface ProfileViewProps {
  state: GameState;
  onToggleSound: () => void;
  onToggleHaptic: () => void;
  onResetGame: () => void;
  onChangeName: (newName: string) => void;
  onOpenGitHubModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  state,
  onToggleSound,
  onToggleHaptic,
  onResetGame,
  onChangeName,
  onOpenGitHubModal,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(state.player.name);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);

  const { rank, nextRank, progress } = getPlayerRank(state.totalEarned);

  const totalUpgradeLevels =
    state.upgrades.multitap +
    state.upgrades.energyLimit +
    state.upgrades.energyRecovery +
    state.upgrades.autoMiner;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onChangeName(nameInput.trim().slice(0, 18));
      setIsEditingName(false);
      soundManager.playUpgrade();
    }
  };

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 pt-2 pb-24 space-y-4">
      {/* Player Header Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#121824] to-[#0A0D14] border border-amber-500/25 shadow-xl relative overflow-hidden text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-700 p-1 shadow-xl shadow-amber-500/30 flex items-center justify-center">
          <div className="w-full h-full rounded-[22px] bg-[#090C12] flex items-center justify-center">
            <span className="text-4xl select-none leading-none">{rank.badge}</span>
          </div>
        </div>

        {/* Name and Rank Title */}
        <div className="mt-3">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center justify-center gap-2 mt-1">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                maxLength={18}
                className="px-3 py-1 text-sm font-bold text-center bg-slate-900 border border-amber-500 rounded-lg text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-xl font-black text-slate-100">{state.player.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[10px] text-slate-400 hover:text-amber-400 underline font-medium cursor-pointer"
              >
                Edit
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-300">
              {rank.title} (Tier {rank.level})
            </span>
          </div>
        </div>

        {/* Level Progression */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-left">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Progress to Next Rank</span>
            <span className="font-mono text-slate-200">
              {nextRank ? `${formatCompact(state.totalEarned)} / ${formatCompact(nextRank.requiredCoins)}` : 'MAX RANK'}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Career Statistics */}
      <div className="p-4 rounded-2xl bg-[#0F141E]/90 border border-slate-800 shadow-md">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Player Statistics
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              Current Coins
            </span>
            <span className="text-sm font-black text-amber-400 font-mono tabular-nums block mt-1">
              {state.coins.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              Lifetime Earned
            </span>
            <span className="text-sm font-black text-slate-100 font-mono tabular-nums block mt-1">
              {state.totalEarned.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <MousePointerClick className="w-3.5 h-3.5 text-cyan-400" />
              Total Taps
            </span>
            <span className="text-sm font-black text-slate-100 font-mono tabular-nums block mt-1">
              {state.totalTaps.toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Upgrade Levels
            </span>
            <span className="text-sm font-black text-slate-100 font-mono tabular-nums block mt-1">
              Lv {totalUpgradeLevels}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              Auto Income
            </span>
            <span className="text-sm font-black text-amber-400 font-mono tabular-nums block mt-1">
              +{formatCompact(state.coinsPerSecond)}/s
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Max Energy
            </span>
            <span className="text-sm font-black text-slate-100 font-mono tabular-nums block mt-1">
              {state.maxEnergy} (+{state.energyRecoveryRate}/s)
            </span>
          </div>
        </div>
      </div>

      {/* Settings & Audio */}
      <div className="p-4 rounded-2xl bg-[#0F141E]/90 border border-slate-800 shadow-md space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Game Preferences
        </h3>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">Sound Effects</div>
              <div className="text-[10px] text-slate-400">Coin pings and chimes</div>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              state.settings.soundEnabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                state.settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-xs font-bold text-slate-200">Haptic Vibration</div>
              <div className="text-[10px] text-slate-400">Tactile mobile vibrations</div>
            </div>
          </div>
          <button
            onClick={onToggleHaptic}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              state.settings.hapticEnabled ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                state.settings.hapticEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Automatic GitHub Publisher Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#0F141E] to-[#0A0D14] border border-amber-500/40 shadow-lg relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                <span>انتشار خودکار روی گیت‌هاب</span>
                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded uppercase">Auto</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                ارسال و انتشار خودکار کل کدهای پروژه با توکن گیت‌هاب (GitHub Token)
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenGitHubModal}
          className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98 transition-all cursor-pointer"
        >
          <Github className="w-4 h-4" />
          <span>انتشار روی گیت‌هاب با توکن (Publish to GitHub)</span>
        </button>
      </div>

      {/* Cloudflare Pages Deployment Guide Trigger */}
      <button
        onClick={() => setShowDeployGuide(true)}
        className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-500/30 hover:border-amber-400 flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-2.5 text-left">
          <Cloud className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-200">Cloudflare Pages Deployment</div>
            <div className="text-[10px] text-slate-400">Compatible with GitHub & Cloudflare Pages</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
      </button>

      {/* Reset Progress Section */}
      <div className="p-4 rounded-2xl bg-[#0F141E]/90 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200">Reset Game Progress</h4>
            <p className="text-[10px] text-slate-400">Wipe all LocalStorage coins and upgrades</p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-400 text-xs font-bold transition-all"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-2xl bg-[#0F141E] border border-red-500/40 p-5 text-center space-y-3">
            <RotateCcw className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-100">Reset All Progress?</h3>
            <p className="text-xs text-slate-400">
              Are you sure? This will delete all your coins, upgrades, and missions from this device.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetGame();
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cloudflare Pages Deployment Modal */}
      {showDeployGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-3xl bg-[#0F141E] border border-amber-500/40 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">Cloudflare Pages Deployment</h3>
              </div>
              <button
                onClick={() => setShowDeployGuide(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              TAP COIN is a zero-backend, pure client-side application built with React, Vite, and LocalStorage. It deploys seamlessly to Cloudflare Pages via GitHub.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">
                  Step 1: Push to GitHub
                </span>
                <p className="text-xs text-slate-400">
                  Commit and push the project repository to your GitHub account.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">
                  Step 2: Connect Cloudflare Pages
                </span>
                <p className="text-xs text-slate-400">
                  In the Cloudflare Dashboard, go to <strong>Workers & Pages</strong> &gt; <strong>Create application</strong> &gt; <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-amber-400 block uppercase">
                  Step 3: Build Configurations
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-slate-950 font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Framework Preset</span>
                    Vite
                  </div>
                  <div className="p-2 rounded bg-slate-950 font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Build Command</span>
                    npm run build
                  </div>
                  <div className="col-span-2 p-2 rounded bg-slate-950 font-mono text-slate-300">
                    <span className="text-slate-500 block text-[10px]">Build Output Directory</span>
                    dist
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDeployGuide(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
