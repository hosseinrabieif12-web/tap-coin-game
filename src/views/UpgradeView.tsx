import React from 'react';
import { Hammer, BatteryCharging, Zap, Bot, ArrowRight, Coins, Clock, Sparkles } from 'lucide-react';
import { GameState, UpgradeId } from '../types/game';
import { UPGRADE_DEFINITIONS } from '../utils/constants';
import {
  calculateCoinsPerSecond,
  calculateCoinsPerTap,
  calculateEnergyRecovery,
  calculateMaxEnergy,
  calculateUpgradeCost,
  formatCompact,
} from '../utils/gameMath';
import { soundManager } from '../utils/audio';
import { triggerParticleBurst } from '../components/ParticleCanvas';

interface UpgradeViewProps {
  state: GameState;
  onBuyUpgrade: (id: UpgradeId) => void;
}

export const UpgradeView: React.FC<UpgradeViewProps> = ({ state, onBuyUpgrade }) => {
  const upgradesList: UpgradeId[] = ['multitap', 'energyLimit', 'energyRecovery', 'autoMiner'];

  const getUpgradeIcon = (id: UpgradeId) => {
    switch (id) {
      case 'multitap':
        return <Hammer className="w-5 h-5 text-amber-400" />;
      case 'energyLimit':
        return <BatteryCharging className="w-5 h-5 text-yellow-400" />;
      case 'energyRecovery':
        return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'autoMiner':
        return <Bot className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getEffectValues = (id: UpgradeId, currentLevel: number) => {
    switch (id) {
      case 'multitap': {
        const cur = calculateCoinsPerTap(currentLevel);
        const next = calculateCoinsPerTap(currentLevel + 1);
        return { cur: `+${cur}/tap`, next: `+${next}/tap` };
      }
      case 'energyLimit': {
        const cur = calculateMaxEnergy(currentLevel);
        const next = calculateMaxEnergy(currentLevel + 1);
        return { cur: `${cur} max`, next: `${next} max` };
      }
      case 'energyRecovery': {
        const cur = calculateEnergyRecovery(currentLevel);
        const next = calculateEnergyRecovery(currentLevel + 1);
        return { cur: `+${cur}/s`, next: `+${next}/s` };
      }
      case 'autoMiner': {
        const cur = calculateCoinsPerSecond(currentLevel);
        const next = calculateCoinsPerSecond(currentLevel + 1);
        return { cur: `+${cur}/s`, next: `+${next}/s` };
      }
    }
  };

  const handleBuy = (id: UpgradeId, cost: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (state.coins < cost) {
      soundManager.playEnergyEmpty();
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14, 'tap');
    onBuyUpgrade(id);
  };

  const hourlyPassive = state.coinsPerSecond * 3600;

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 pt-2 pb-24 space-y-4">
      {/* Top Banner: Balance & Passive Yield */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#121824] to-[#0A0D14] border border-amber-500/25 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Available Coins
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xl">🪙</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tabular-nums gold-text-glow">
                {state.coins.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Passive Income
            </span>
            <div className="text-sm font-bold text-amber-300 font-mono mt-0.5">
              +{formatCompact(state.coinsPerSecond)}/sec
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              ≈ {formatCompact(hourlyPassive)}/hour
            </div>
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Tap Power</span>
            <span className="text-xs font-bold text-amber-300 font-mono">
              +{state.coinsPerTap}/tap
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Max Energy</span>
            <span className="text-xs font-bold text-yellow-300 font-mono">
              {state.maxEnergy}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400 block">Recharge</span>
            <span className="text-xs font-bold text-emerald-300 font-mono">
              +{state.energyRecoveryRate}/s
            </span>
          </div>
        </div>
      </div>

      {/* Upgrade Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Upgrades Shop
          </h3>
          <span className="text-xs text-amber-400 font-medium">
            Permanent Boosts
          </span>
        </div>

        {upgradesList.map((id) => {
          const def = UPGRADE_DEFINITIONS[id];
          const currentLevel = state.upgrades[id];
          const isMax = currentLevel >= def.maxLevel;
          const cost = calculateUpgradeCost(id, currentLevel);
          const canAfford = state.coins >= cost && !isMax;
          const effects = getEffectValues(id, currentLevel);

          return (
            <div
              key={id}
              className="p-4 rounded-2xl bg-[#0F141E]/90 border border-slate-800 hover:border-amber-500/30 transition-all shadow-md relative overflow-hidden"
            >
              <div className="flex items-start gap-3.5">
                {/* Icon box */}
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 p-2 shadow-inner">
                  {getUpgradeIcon(id)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-100 truncate">
                      {def.name}
                    </h4>
                    <span className="text-xs font-bold text-amber-400 font-mono bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded shrink-0">
                      Lv {currentLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                    {def.description}
                  </p>

                  {/* Effect progression */}
                  <div className="flex items-center gap-2 mt-2 text-xs">
                    <span className="text-slate-300 font-mono font-semibold">
                      {effects.cur}
                    </span>
                    {!isMax && (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-amber-400 font-mono font-bold">
                          {effects.next}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Footer Bar */}
              <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Price:</span>
                  <div className="flex items-center gap-1 font-mono font-black text-amber-400 text-sm">
                    <span>🪙</span>
                    <span>{isMax ? 'MAX' : formatCompact(cost)}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleBuy(id, cost, e)}
                  disabled={!canAfford}
                  className={`py-2 px-4 rounded-xl text-xs font-black tracking-wide uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                    isMax
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25 active:scale-95 cursor-pointer'
                      : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isMax ? 'Max Level' : 'Upgrade'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
