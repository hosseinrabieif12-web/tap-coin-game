import React, { useRef, useState, useEffect } from 'react';
import { Zap, Flame, Award, ChevronRight, Sparkles } from 'lucide-react';
import { GameState } from '../types/game';
import { formatCompact, getPlayerRank } from '../utils/gameMath';
import { soundManager } from '../utils/audio';
import { triggerParticleBurst } from '../components/ParticleCanvas';
import goldenCoinImg from '../assets/images/golden_coin_master_1793884056000.jpg';

interface HomeViewProps {
  state: GameState;
  onTapCoin: (x: number, y: number) => void;
  onActivateTurbo: () => void;
  onNavigateTab: (tab: 'upgrade' | 'missions' | 'profile') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  state,
  onTapCoin,
  onActivateTurbo,
  onNavigateTab,
}) => {
  const coinRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number; scale: number }>({ x: 0, y: 0, scale: 1 });
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [rippleKey, setRippleKey] = useState<number>(0);

  const { rank, nextRank, progress } = getPlayerRank(state.totalEarned);

  // Turbo Boost status
  const now = Date.now();
  const isTurboActive = state.turbo.expiresAt > now;
  const isTurboCooldown = !isTurboActive && state.turbo.cooldownUntil > now;
  const turboSecondsRemaining = Math.max(0, Math.ceil((state.turbo.expiresAt - now) / 1000));
  const turboCooldownRemaining = Math.max(0, Math.ceil((state.turbo.cooldownUntil - now) / 1000));

  // Handle single mouse/pointer tap with 3D tilt
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (state.energy < 1) {
      soundManager.playEnergyEmpty();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);

    // Subtle 3D tilt opposite to press
    setTilt({
      x: -deltaY * 16,
      y: deltaX * 16,
      scale: 0.94,
    });
    setIsPressing(true);
    setRippleKey((prev) => prev + 1);

    onTapCoin(e.clientX, e.clientY);
    triggerParticleBurst(e.clientX, e.clientY, 8, 'tap');
  };

  const handlePointerUp = () => {
    setTilt({ x: 0, y: 0, scale: 1 });
    setIsPressing(false);
  };

  // Multi-touch handler for mobile players using 2+ fingers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (state.energy < 1) {
      soundManager.playEnergyEmpty();
      return;
    }

    // Process all touches in this event
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      onTapCoin(touch.clientX, touch.clientY);
      triggerParticleBurst(touch.clientX, touch.clientY, 7, 'tap');
    }

    setTilt({ x: 0, y: 0, scale: 0.93 });
    setIsPressing(true);
    setRippleKey((prev) => prev + 1);
  };

  const handleTouchEnd = () => {
    setTilt({ x: 0, y: 0, scale: 1 });
    setIsPressing(false);
  };

  const energyPercent = Math.min(100, Math.max(0, (state.energy / state.maxEnergy) * 100));

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-8.5rem)] max-w-md mx-auto px-4 pt-2 pb-20 select-none">
      {/* Top Section: Rank & Total Coins */}
      <div className="w-full space-y-3">
        {/* Player Rank Progress Bar */}
        <button
          onClick={() => onNavigateTab('profile')}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-[#0F141E]/80 border border-slate-800 hover:border-amber-500/30 transition-all text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0">{rank.badge}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-200 truncate">{rank.title}</span>
                <span className="text-[10px] text-amber-400 font-semibold">Tier {rank.level}</span>
              </div>
              <div className="w-32 sm:w-44 h-1.5 rounded-full bg-slate-800 mt-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
            <span>{nextRank ? `${formatCompact(state.totalEarned)} / ${formatCompact(nextRank.requiredCoins)}` : 'MAX'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </button>

        {/* Big Balance Card */}
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-0.5 shadow-md shadow-amber-400/30 flex items-center justify-center">
              <span className="text-sm select-none">🪙</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-amber-400 font-mono tabular-nums gold-text-glow">
              {state.coins.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mt-1">
            <span>Per Tap: <strong className="text-amber-300 font-mono">+{isTurboActive ? state.coinsPerTap * 2 : state.coinsPerTap}</strong></span>
            {isTurboActive && (
              <span className="text-amber-400 font-bold bg-amber-950/80 border border-amber-500/40 px-1.5 py-0.2 rounded text-[10px] animate-pulse">
                2X TURBO ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center Section: Big Animated Golden Coin */}
      <div className="relative flex items-center justify-center my-auto py-4">
        {/* Ambient Backlight Glow */}
        <div
          className={`absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full transition-all duration-300 pointer-events-none ${
            isTurboActive
              ? 'bg-amber-500/35 blur-3xl scale-110'
              : isPressing
              ? 'bg-amber-400/25 blur-2xl scale-95'
              : 'bg-amber-500/18 blur-2xl'
          }`}
        />

        {/* Outer Golden Concentric Rings */}
        <div className="relative p-3 rounded-full bg-gradient-to-b from-amber-400/20 via-amber-600/5 to-transparent border border-amber-500/30">
          <div className="p-2.5 rounded-full bg-gradient-to-b from-[#1C1608] to-[#0A0D14] border border-amber-500/40 shadow-2xl">
            {/* The Master Interactive Coin */}
            <div
              ref={coinRef}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
                transform: `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${tilt.scale})`,
                transition: isPressing ? 'transform 0.05s ease-out' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full cursor-pointer select-none touch-manipulation overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_40px_rgba(245,158,11,0.25)] active:shadow-amber-500/40"
            >
              {/* Coin Asset Image */}
              <img
                src={goldenCoinImg}
                alt="Golden Coin"
                draggable={false}
                className="w-full h-full object-cover select-none pointer-events-none"
              />

              {/* Shimmer Highlight Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />

              {/* Tap Ripple Effect Ring */}
              {rippleKey > 0 && (
                <div
                  key={rippleKey}
                  className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-40 pointer-events-none"
                />
              )}

              {/* Energy Depleted Overlay */}
              {state.energy < 1 && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
                  <Zap className="w-8 h-8 text-amber-500 animate-pulse mb-1" />
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    Recharging...
                  </span>
                  <span className="text-[10px] text-slate-300 mt-0.5">
                    +{state.energyRecoveryRate}/s
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Energy Bar & Turbo Boost */}
      <div className="w-full space-y-3">
        {/* Turbo Booster CTA */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onActivateTurbo}
            disabled={isTurboActive || isTurboCooldown}
            className={`flex-1 py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
              isTurboActive
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40 animate-pulse'
                : isTurboCooldown
                ? 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed'
                : 'bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border-amber-500/40 hover:border-amber-400 active:scale-98'
            }`}
          >
            <Flame className={`w-4 h-4 ${isTurboActive ? 'text-slate-950 animate-bounce' : 'text-amber-400'}`} />
            <span>
              {isTurboActive
                ? `TURBO 2X (${turboSecondsRemaining}s)`
                : isTurboCooldown
                ? `Turbo Cooldown (${turboCooldownRemaining}s)`
                : 'Activate 2X Turbo Boost'}
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('upgrade')}
            className="py-2.5 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors shrink-0"
          >
            Upgrade
          </button>
        </div>

        {/* Energy Meter Bar */}
        <div className="p-3.5 rounded-2xl bg-[#0F141E]/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Energy</span>
            </span>
            <div className="flex items-center gap-2 font-mono tabular-nums">
              <span className="text-slate-100 font-bold">{Math.floor(state.energy)}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400">{state.maxEnergy}</span>
              <span className="text-[10px] text-amber-400/90 ml-1">
                (+{state.energyRecoveryRate}/s)
              </span>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden p-0.5 border border-slate-800/80">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                energyPercent < 20
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 animate-pulse'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 shadow-sm shadow-amber-400/50'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
