import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Lock, Gift, Coins, Sparkles, Clock, Target } from 'lucide-react';
import { DailyMission, GameState } from '../types/game';
import { DAILY_REWARDS_TABLE, getTodayDateKey } from '../utils/constants';
import { formatCompact } from '../utils/gameMath';
import { triggerParticleBurst } from '../components/ParticleCanvas';

interface MissionsViewProps {
  state: GameState;
  onClaimDailyReward: () => void;
  onClaimMission: (missionId: string) => void;
}

export const MissionsView: React.FC<MissionsViewProps> = ({
  state,
  onClaimDailyReward,
  onClaimMission,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rewards' | 'missions'>('rewards');
  const [timeLeftUntilMidnight, setTimeLeftUntilMidnight] = useState<string>('');

  const todayKey = getTodayDateKey();
  const claimedToday = state.dailyRewards.lastClaimDate === todayKey;

  // Countdown timer to next UTC midnight
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeftUntilMidnight(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentStreakDay = ((state.dailyRewards.currentStreak - 1) % 7) + 1;

  const handleClaimDaily = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, 'celebration');
    onClaimDailyReward();
  };

  const handleClaimMissionClick = (missionId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    triggerParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 30, 'celebration');
    onClaimMission(missionId);
  };

  const claimableMissionsCount = state.missions.filter((m) => !m.claimed && m.current >= m.target).length;

  return (
    <div className="flex flex-col max-w-md mx-auto px-4 pt-2 pb-24 space-y-4">
      {/* Sub-tab Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-[#0F141E] border border-slate-800">
        <button
          onClick={() => setActiveSubTab('rewards')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'rewards'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gift className="w-4 h-4 text-amber-400" />
          <span>Daily Rewards</span>
          {!claimedToday && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('missions')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 relative ${
            activeSubTab === 'missions'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>Daily Missions</span>
          {claimableMissionsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
              {claimableMissionsCount}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: DAILY LOGIN REWARDS */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-4 animate-[fadeIn_0.15s_ease-out]">
          {/* Header Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#141B28] to-[#0A0D14] border border-amber-500/25 shadow-xl text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>7-Day Login Streak</span>
            </div>

            <div className="mt-2">
              <span className="text-3xl font-black text-slate-100">
                Day {currentStreakDay}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Log in every day to claim exponential gold prizes and unlock the Day 7 Mega Jackpot!
              </p>
            </div>

            {/* Claim Action Box */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              {claimedToday ? (
                <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Claimed for today! Next reward in:</span>
                  <span className="font-mono text-amber-400 font-bold tabular-nums">
                    {timeLeftUntilMidnight}
                  </span>
                </div>
              ) : (
                <button
                  onClick={handleClaimDaily}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm tracking-wide uppercase shadow-lg shadow-amber-500/30 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim Day {currentStreakDay} Reward (+{formatCompact(DAILY_REWARDS_TABLE[currentStreakDay - 1].coins)} Coins)</span>
                </button>
              )}
            </div>
          </div>

          {/* 7-Day Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
            {DAILY_REWARDS_TABLE.map((item) => {
              const isToday = item.day === currentStreakDay;
              const isClaimed = item.day < currentStreakDay || (isToday && claimedToday);
              const isFuture = item.day > currentStreakDay;
              const isJackpot = item.day === 7;

              return (
                <div
                  key={item.day}
                  className={`relative p-2.5 rounded-2xl border text-center transition-all ${
                    isJackpot ? 'col-span-2' : ''
                  } ${
                    isToday && !claimedToday
                      ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                      : isClaimed
                      ? 'bg-slate-900/60 border-slate-800 opacity-60'
                      : 'bg-[#0F141E] border-slate-800/80'
                  }`}
                >
                  {/* Status Tag */}
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Day {item.day}
                  </span>

                  <div className="my-1.5 flex items-center justify-center">
                    {isClaimed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : isFuture ? (
                      <Lock className="w-5 h-5 text-slate-600" />
                    ) : (
                      <span className="text-xl">🎁</span>
                    )}
                  </div>

                  <div className="font-mono font-black text-xs text-amber-400 tabular-nums">
                    +{formatCompact(item.coins)}
                  </div>

                  <span className="text-[9px] text-slate-400 block truncate mt-0.5">
                    {item.highlight}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DAILY MISSIONS */}
      {activeSubTab === 'missions' && (
        <div className="space-y-3 animate-[fadeIn_0.15s_ease-out]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Resets in: <strong className="font-mono text-slate-200">{timeLeftUntilMidnight}</strong></span>
            </div>
            <span className="text-xs text-amber-400 font-semibold">
              Daily Quests
            </span>
          </div>

          {state.missions.map((mission) => {
            const isCompleted = mission.current >= mission.target;
            const progressPercent = Math.min(100, Math.max(0, (mission.current / mission.target) * 100));

            return (
              <div
                key={mission.id}
                className="p-4 rounded-2xl bg-[#0F141E]/90 border border-slate-800 hover:border-amber-500/30 transition-all shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-100 truncate">
                      {mission.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {mission.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-mono font-black text-amber-400 shrink-0">
                    <span>🪙</span>
                    <span>+{formatCompact(mission.reward)}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>
                      {Math.min(mission.current, mission.target)} / {mission.target}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Claim Button */}
                <div className="mt-3 flex justify-end">
                  {mission.claimed ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={(e) => handleClaimMissionClick(mission.id, e)}
                      className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs tracking-wide uppercase shadow-md shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim Reward</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
