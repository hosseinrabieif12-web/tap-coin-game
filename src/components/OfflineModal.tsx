import React from 'react';
import { Coins, Zap, Clock, CheckCircle } from 'lucide-react';
import { OfflineSummary } from '../types/game';
import { formatCompact, formatSecondsToTime } from '../utils/gameMath';

interface OfflineModalProps {
  summary: OfflineSummary | null;
  onClaim: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ summary, onClaim }) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#0F141E] border border-amber-500/30 p-6 shadow-2xl gold-glow text-center">
        {/* Glow backdrop */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 opacity-25 blur-2xl pointer-events-none" />

        {/* Badge Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-lg shadow-amber-500/30 mb-4 flex items-center justify-center">
          <div className="w-full h-full rounded-2xl bg-[#090C12] flex items-center justify-center">
            <Coins className="w-8 h-8 text-amber-400 animate-bounce" />
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-100 tracking-tight">
          Welcome Back, Miner!
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Your Autonomous Miner kept digging while you were away!
        </p>

        {/* Stats Grid */}
        <div className="my-5 space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              Time Away
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {formatSecondsToTime(summary.secondsOffline)}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
            <span className="flex items-center gap-2 text-xs text-amber-300">
              <Coins className="w-4 h-4 text-amber-400" />
              Mined Coins
            </span>
            <span className="text-base font-black text-amber-400 tabular-nums">
              +{formatCompact(summary.coinsEarned)}
            </span>
          </div>

          {summary.energyRestored > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <Zap className="w-4 h-4 text-emerald-400" />
                Energy Restored
              </span>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">
                +{summary.energyRestored}
              </span>
            </div>
          )}
        </div>

        {/* Claim Button */}
        <button
          onClick={onClaim}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4 text-slate-950" />
          Collect Offline Earnings
        </button>
      </div>
    </div>
  );
};
