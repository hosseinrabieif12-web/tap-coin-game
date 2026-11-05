import { OfflineSummary, PlayerRank, UpgradeId } from '../types/game';
import { PLAYER_RANKS, UPGRADE_DEFINITIONS } from './constants';

export const calculateUpgradeCost = (id: UpgradeId, currentLevel: number): number => {
  const def = UPGRADE_DEFINITIONS[id];
  if (!def) return 999999;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel - 1));
};

export const calculateCoinsPerTap = (multitapLevel: number): number => {
  // Level 1: 1, Level 2: 2, Level 3: 4, Level 4: 7, Level 5: 11...
  // Smooth scaling:
  return Math.max(1, Math.floor(1 + (multitapLevel - 1) * 1.5));
};

export const calculateMaxEnergy = (energyLimitLevel: number): number => {
  // Starts at 1000, +500 per level
  return 1000 + (energyLimitLevel - 1) * 500;
};

export const calculateEnergyRecovery = (energyRecoveryLevel: number): number => {
  // Level 1: 1 energy/sec, Level 2: 2/s, Level 3: 4/s, etc.
  return Math.max(1, energyRecoveryLevel);
};

export const calculateCoinsPerSecond = (autoMinerLevel: number): number => {
  if (autoMinerLevel <= 0) return 0;
  // Level 1: 2/s, Level 2: 5/s, Level 3: 12/s, Level 4: 25/s, Level 5: 50/s...
  return Math.floor(autoMinerLevel * 2 + Math.pow(autoMinerLevel, 1.7));
};

export const getPlayerRank = (totalEarned: number): { rank: PlayerRank; nextRank: PlayerRank | null; progress: number } => {
  let currentRankIndex = 0;
  for (let i = PLAYER_RANKS.length - 1; i >= 0; i--) {
    if (totalEarned >= PLAYER_RANKS[i].requiredCoins) {
      currentRankIndex = i;
      break;
    }
  }

  const rank = PLAYER_RANKS[currentRankIndex];
  const nextRank = currentRankIndex < PLAYER_RANKS.length - 1 ? PLAYER_RANKS[currentRankIndex + 1] : null;

  let progress = 100;
  if (nextRank) {
    const range = nextRank.requiredCoins - rank.requiredCoins;
    const gained = totalEarned - rank.requiredCoins;
    progress = Math.min(100, Math.max(0, (gained / range) * 100));
  }

  return { rank, nextRank, progress };
};

export const formatCompact = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num < 1000) return num.toLocaleString();
  if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num < 1000000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
  if (num < 1000000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
  return (num / 1000000000000).toFixed(2).replace(/\.00$/, '') + 'T';
};

export const formatSecondsToTime = (totalSeconds: number): string => {
  if (totalSeconds < 60) return `${Math.floor(totalSeconds)}s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return `${hours}h ${remMinutes}m`;
};

export const calculateOfflineProgress = (
  lastSavedMs: number,
  autoMinerLevel: number,
  currentEnergy: number,
  maxEnergy: number,
  recoveryRate: number
): OfflineSummary | null => {
  if (!lastSavedMs) return null;
  const now = Date.now();
  const elapsedMs = now - lastSavedMs;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  // Require at least 20 seconds away to trigger offline dialog
  if (elapsedSeconds < 20) return null;

  // Cap maximum offline idle collection to 12 hours (43,200 seconds)
  const cappedSeconds = Math.min(elapsedSeconds, 12 * 60 * 60);

  const cps = calculateCoinsPerSecond(autoMinerLevel);
  const coinsEarned = cps * cappedSeconds;

  // Energy restoration during offline time
  const energyGained = recoveryRate * cappedSeconds;
  const energyRestored = Math.min(maxEnergy, currentEnergy + energyGained) - currentEnergy;

  if (coinsEarned <= 0 && energyRestored <= 0) return null;

  return {
    secondsOffline: elapsedSeconds,
    coinsEarned,
    energyRestored: Math.max(0, energyRestored),
  };
};
