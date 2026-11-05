import { DailyMission, GameState, PlayerRank, UpgradeId, UpgradeInfo } from '../types/game';

export const STORAGE_KEY = 'tap_coin_game_save_v1';

export const UPGRADE_DEFINITIONS: Record<UpgradeId, UpgradeInfo> = {
  multitap: {
    id: 'multitap',
    name: 'Multitap Strike',
    category: 'tap',
    description: 'Increases the amount of coins mined per tap on the coin.',
    baseCost: 50,
    costMultiplier: 1.7,
    maxLevel: 50,
    icon: 'Hammer',
    effectLabel: '+1 Coin/Tap',
  },
  energyLimit: {
    id: 'energyLimit',
    name: 'Battery Expansion',
    category: 'energy',
    description: 'Increases your maximum energy reserve capacity.',
    baseCost: 100,
    costMultiplier: 1.6,
    maxLevel: 40,
    icon: 'BatteryCharging',
    effectLabel: '+500 Max Energy',
  },
  energyRecovery: {
    id: 'energyRecovery',
    name: 'Turbo Recharge',
    category: 'energy',
    description: 'Regenerates energy faster every second automatically.',
    baseCost: 150,
    costMultiplier: 1.85,
    maxLevel: 30,
    icon: 'Zap',
    effectLabel: '+1 Energy/Sec',
  },
  autoMiner: {
    id: 'autoMiner',
    name: 'Autonomous Bot',
    category: 'passive',
    description: 'Mines coins continuously around the clock, even when offline.',
    baseCost: 250,
    costMultiplier: 1.65,
    maxLevel: 40,
    icon: 'Bot',
    effectLabel: 'Passive Income',
  },
};

export const DAILY_REWARDS_TABLE = [
  { day: 1, coins: 500, highlight: 'Starter Pack' },
  { day: 2, coins: 1500, highlight: 'Bronze Stack' },
  { day: 3, coins: 4000, highlight: 'Silver Cache' },
  { day: 4, coins: 10000, highlight: 'Gold Ingot' },
  { day: 5, coins: 25000, highlight: 'Treasure Chest' },
  { day: 6, coins: 60000, highlight: 'Royal Vault' },
  { day: 7, coins: 150000, highlight: 'Mega Jackpot' },
];

export const PLAYER_RANKS: PlayerRank[] = [
  { level: 1, title: 'Novice Miner', badge: '⛏️', requiredCoins: 0, color: 'text-amber-300' },
  { level: 2, title: 'Bronze Striker', badge: '🥉', requiredCoins: 2500, color: 'text-amber-500' },
  { level: 3, title: 'Silver Driller', badge: '🥈', requiredCoins: 15000, color: 'text-slate-300' },
  { level: 4, title: 'Gold Prospector', badge: '🥇', requiredCoins: 60000, color: 'text-yellow-400' },
  { level: 5, title: 'Emerald Tycoon', badge: '💎', requiredCoins: 250000, color: 'text-emerald-400' },
  { level: 6, title: 'Ruby Vault Master', badge: '👑', requiredCoins: 1000000, color: 'text-rose-400' },
  { level: 7, title: 'Diamond Overlord', badge: '⚡', requiredCoins: 5000000, color: 'text-cyan-400' },
  { level: 8, title: 'Galactic Coin Sovereign', badge: '🌌', requiredCoins: 25000000, color: 'text-purple-400' },
];

export const INITIAL_MISSIONS: DailyMission[] = [
  {
    id: 'm_tap_100',
    title: 'Warm-up Taps',
    description: 'Tap the golden coin 100 times today',
    type: 'taps',
    target: 100,
    current: 0,
    reward: 1000,
    claimed: false,
  },
  {
    id: 'm_tap_500',
    title: 'Endurance Striker',
    description: 'Tap the golden coin 500 times today',
    type: 'taps',
    target: 500,
    current: 0,
    reward: 5000,
    claimed: false,
  },
  {
    id: 'm_buy_upgrade',
    title: 'Smart Investor',
    description: 'Purchase 2 upgrades in the shop',
    type: 'upgrades',
    target: 2,
    current: 0,
    reward: 2500,
    claimed: false,
  },
  {
    id: 'm_daily_reward',
    title: 'Daily Dedication',
    description: 'Claim your daily login reward today',
    type: 'daily_claim',
    target: 1,
    current: 0,
    reward: 1500,
    claimed: false,
  },
  {
    id: 'm_auto_coins',
    title: 'Passive Harvest',
    description: 'Collect 1,000 coins from Auto Miner',
    type: 'auto_mine_coins',
    target: 1000,
    current: 0,
    reward: 3500,
    claimed: false,
  },
  {
    id: 'm_reach_earned',
    title: 'Wealth Accumulator',
    description: 'Mine 10,000 total coins today',
    type: 'coins_earned',
    target: 10000,
    current: 0,
    reward: 6000,
    claimed: false,
  },
];

export const getTodayDateKey = (): string => {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

export const DEFAULT_INITIAL_STATE: GameState = {
  coins: 0,
  totalEarned: 0,
  totalTaps: 0,
  energy: 1000,
  maxEnergy: 1000,
  coinsPerTap: 1,
  coinsPerSecond: 0,
  energyRecoveryRate: 1,
  upgrades: {
    multitap: 1,
    energyLimit: 1,
    energyRecovery: 1,
    autoMiner: 0,
  },
  dailyRewards: {
    currentStreak: 1,
    lastClaimDate: null,
  },
  missions: INITIAL_MISSIONS,
  missionsLastReset: getTodayDateKey(),
  turbo: {
    expiresAt: 0,
    cooldownUntil: 0,
  },
  settings: {
    soundEnabled: true,
    hapticEnabled: true,
  },
  player: {
    name: 'Tap Master',
    avatar: 'miner',
  },
  lastSaved: Date.now(),
};
