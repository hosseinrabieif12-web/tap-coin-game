export type TabType = 'home' | 'upgrade' | 'missions' | 'profile';

export type UpgradeId = 'multitap' | 'energyLimit' | 'energyRecovery' | 'autoMiner';

export interface UpgradeInfo {
  id: UpgradeId;
  name: string;
  category: 'tap' | 'energy' | 'passive';
  description: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  icon: string;
  effectLabel: string;
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  type: 'taps' | 'upgrades' | 'coins_earned' | 'daily_claim' | 'auto_mine_coins';
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
}

export interface PlayerRank {
  level: number;
  title: string;
  badge: string;
  requiredCoins: number;
  color: string;
}

export interface GameState {
  coins: number;
  totalEarned: number;
  totalTaps: number;
  energy: number;
  maxEnergy: number;
  coinsPerTap: number;
  coinsPerSecond: number;
  energyRecoveryRate: number;
  upgrades: {
    multitap: number;
    energyLimit: number;
    energyRecovery: number;
    autoMiner: number;
  };
  dailyRewards: {
    currentStreak: number;
    lastClaimDate: string | null;
  };
  missions: DailyMission[];
  missionsLastReset: string;
  turbo: {
    expiresAt: number;
    cooldownUntil: number;
  };
  settings: {
    soundEnabled: boolean;
    hapticEnabled: boolean;
  };
  player: {
    name: string;
    avatar: string;
  };
  lastSaved: number;
}

export interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  amount: number;
  isCrit?: boolean;
}

export interface OfflineSummary {
  secondsOffline: number;
  coinsEarned: number;
  energyRestored: number;
}
