import { DailyMission, GameState } from '../types/game';
import { DEFAULT_INITIAL_STATE, INITIAL_MISSIONS, STORAGE_KEY, getTodayDateKey } from './constants';
import { calculateCoinsPerSecond, calculateCoinsPerTap, calculateEnergyRecovery, calculateMaxEnergy } from './gameMath';

export const loadGameState = (): { state: GameState; isFirstTime: boolean } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: { ...DEFAULT_INITIAL_STATE, lastSaved: Date.now() }, isFirstTime: true };
    }

    const parsed = JSON.parse(raw) as Partial<GameState>;
    const today = getTodayDateKey();

    // Verify day transition for missions
    let missions = Array.isArray(parsed.missions) && parsed.missions.length > 0 ? parsed.missions : INITIAL_MISSIONS;
    let missionsLastReset = parsed.missionsLastReset || today;

    if (missionsLastReset !== today) {
      // New day: reset daily missions
      missions = INITIAL_MISSIONS.map((m) => ({ ...m, current: 0, claimed: false }));
      missionsLastReset = today;
    }

    // Verify upgrades
    const upgrades = {
      multitap: Math.max(1, parsed.upgrades?.multitap || 1),
      energyLimit: Math.max(1, parsed.upgrades?.energyLimit || 1),
      energyRecovery: Math.max(1, parsed.upgrades?.energyRecovery || 1),
      autoMiner: Math.max(0, parsed.upgrades?.autoMiner ?? 0),
    };

    // Calculate derived rates
    const maxEnergy = calculateMaxEnergy(upgrades.energyLimit);
    const coinsPerTap = calculateCoinsPerTap(upgrades.multitap);
    const energyRecoveryRate = calculateEnergyRecovery(upgrades.energyRecovery);
    const coinsPerSecond = calculateCoinsPerSecond(upgrades.autoMiner);

    // Merge state with fallback defaults
    const state: GameState = {
      coins: typeof parsed.coins === 'number' && !isNaN(parsed.coins) ? parsed.coins : 0,
      totalEarned: typeof parsed.totalEarned === 'number' && !isNaN(parsed.totalEarned) ? parsed.totalEarned : 0,
      totalTaps: typeof parsed.totalTaps === 'number' && !isNaN(parsed.totalTaps) ? parsed.totalTaps : 0,
      energy: Math.min(maxEnergy, Math.max(0, parsed.energy ?? maxEnergy)),
      maxEnergy,
      coinsPerTap,
      coinsPerSecond,
      energyRecoveryRate,
      upgrades,
      dailyRewards: {
        currentStreak: parsed.dailyRewards?.currentStreak || 1,
        lastClaimDate: parsed.dailyRewards?.lastClaimDate || null,
      },
      missions,
      missionsLastReset,
      turbo: {
        expiresAt: parsed.turbo?.expiresAt || 0,
        cooldownUntil: parsed.turbo?.cooldownUntil || 0,
      },
      settings: {
        soundEnabled: parsed.settings?.soundEnabled ?? true,
        hapticEnabled: parsed.settings?.hapticEnabled ?? true,
      },
      player: {
        name: parsed.player?.name || 'Tap Master',
        avatar: parsed.player?.avatar || 'miner',
      },
      lastSaved: parsed.lastSaved || Date.now(),
    };

    return { state, isFirstTime: false };
  } catch (err) {
    console.error('Failed to parse saved game progress, falling back to initial state:', err);
    return { state: { ...DEFAULT_INITIAL_STATE, lastSaved: Date.now() }, isFirstTime: true };
  }
};

export const saveGameState = (state: GameState): boolean => {
  try {
    const toSave: GameState = {
      ...state,
      lastSaved: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (err) {
    console.error('Failed to save game state to LocalStorage:', err);
    return false;
  }
};

export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear LocalStorage:', err);
  }
};
