/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FloatingNumber, GameState, OfflineSummary, TabType, UpgradeId } from './types/game';
import { Header } from './components/Header';
import { TabsNav } from './components/TabsNav';
import { ParticleCanvas, triggerParticleBurst } from './components/ParticleCanvas';
import { FloatingNumbers } from './components/FloatingNumbers';
import { OfflineModal } from './components/OfflineModal';
import { GitHubPublishModal } from './components/GitHubPublishModal';
import { TelegramBotModal } from './components/TelegramBotModal';
import { HomeView } from './views/HomeView';
import { UpgradeView } from './views/UpgradeView';
import { MissionsView } from './views/MissionsView';
import { ProfileView } from './views/ProfileView';
import { clearGameState, loadGameState, saveGameState } from './utils/storage';
import {
  calculateCoinsPerSecond,
  calculateCoinsPerTap,
  calculateEnergyRecovery,
  calculateMaxEnergy,
  calculateOfflineProgress,
  calculateUpgradeCost,
  getPlayerRank,
} from './utils/gameMath';
import { DAILY_REWARDS_TABLE, DEFAULT_INITIAL_STATE, getTodayDateKey } from './utils/constants';
import { soundManager } from './utils/audio';
import { initTelegramWebApp, getTelegramUser } from './utils/telegramWebApp';
import tapBannerImg from './assets/images/tap_coin_banner_1793884055895.jpg';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const { state } = loadGameState();
    return state;
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [offlineSummary, setOfflineSummary] = useState<OfflineSummary | null>(null);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState<boolean>(false);

  // Keep a ref to latest state to avoid stale closures in interval ticks and unmount saves
  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  // Initialize sounds, check offline progress, and detect Telegram WebApp on mount
  useEffect(() => {
    initTelegramWebApp();

    const { state, isFirstTime } = loadGameState();
    soundManager.setSoundEnabled(state.settings.soundEnabled);
    soundManager.setHapticEnabled(state.settings.hapticEnabled);

    // Sync Telegram user profile if running inside Telegram
    const tgUser = getTelegramUser();
    if (tgUser?.first_name) {
      setGameState((prev) => ({
        ...prev,
        player: {
          ...prev.player,
          name: tgUser.first_name,
        },
      }));
    }

    if (!isFirstTime && state.lastSaved) {
      const summary = calculateOfflineProgress(
        state.lastSaved,
        state.upgrades.autoMiner,
        state.energy,
        state.maxEnergy,
        state.energyRecoveryRate
      );
      if (summary && (summary.coinsEarned > 0 || summary.energyRestored > 0)) {
        setOfflineSummary(summary);
      }
    }
  }, []);

  // Sync audio/haptic settings whenever they change
  useEffect(() => {
    soundManager.setSoundEnabled(gameState.settings.soundEnabled);
    soundManager.setHapticEnabled(gameState.settings.hapticEnabled);
  }, [gameState.settings]);

  // Main Game Loop: Energy recharge, Auto Miner coins, and Turbo timers
  useEffect(() => {
    const TICK_MS = 250;
    const interval = setInterval(() => {
      const s = stateRef.current;
      const now = Date.now();
      const dt = TICK_MS / 1000;

      let energyChanged = false;
      let newEnergy = s.energy;

      // 1. Regenerate Energy
      if (s.energy < s.maxEnergy) {
        newEnergy = Math.min(s.maxEnergy, s.energy + s.energyRecoveryRate * dt);
        energyChanged = true;
      }

      // 2. Auto Miner passive coin accrual
      let newCoins = s.coins;
      let newTotalEarned = s.totalEarned;
      let missionsChanged = false;
      let updatedMissions = s.missions;

      if (s.coinsPerSecond > 0) {
        const earnedThisTick = s.coinsPerSecond * dt;
        newCoins += earnedThisTick;
        newTotalEarned += earnedThisTick;

        // Update auto mine mission progress
        updatedMissions = updatedMissions.map((m) => {
          if (m.type === 'auto_mine_coins' && !m.claimed && m.current < m.target) {
            missionsChanged = true;
            return { ...m, current: Math.min(m.target, m.current + earnedThisTick) };
          }
          if (m.type === 'coins_earned' && !m.claimed && m.current < m.target) {
            missionsChanged = true;
            return { ...m, current: Math.min(m.target, m.current + earnedThisTick) };
          }
          return m;
        });
      }

      if (energyChanged || s.coinsPerSecond > 0 || missionsChanged) {
        setGameState((prev) => ({
          ...prev,
          energy: newEnergy,
          coins: newCoins,
          totalEarned: newTotalEarned,
          missions: updatedMissions,
        }));
      }
    }, TICK_MS);

    return () => clearInterval(interval);
  }, []);

  // Periodic LocalStorage auto-save every 3 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveGameState(stateRef.current);
    }, 3000);

    const handleBeforeUnload = () => {
      saveGameState(stateRef.current);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(saveInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Clean up floating numbers after animation completes
  useEffect(() => {
    if (floatingNumbers.length === 0) return;
    const timer = setTimeout(() => {
      setFloatingNumbers((prev) => (prev.length > 0 ? prev.slice(1) : []));
    }, 700);
    return () => clearTimeout(timer);
  }, [floatingNumbers]);

  // Handle Golden Coin Tap
  const handleTapCoin = useCallback((clientX: number, clientY: number) => {
    setGameState((prev) => {
      if (prev.energy < 1) {
        soundManager.playEnergyEmpty();
        return prev;
      }

      const now = Date.now();
      const isTurboActive = prev.turbo.expiresAt > now;
      const multiplier = isTurboActive ? 2 : 1;
      const earned = prev.coinsPerTap * multiplier;

      // 10% chance of golden critical hit (+50% bonus)
      const isCrit = Math.random() < 0.1;
      const finalEarned = isCrit ? Math.floor(earned * 1.5) : earned;

      soundManager.playTap(isCrit);
      soundManager.triggerHaptic(isCrit ? 28 : 16);

      // Add floating number display
      setFloatingNumbers((current) => [
        ...current.slice(-12), // Keep max 12 floating numbers at a time for 60fps performance
        {
          id: Date.now() + Math.random(),
          x: clientX,
          y: clientY,
          amount: finalEarned,
          isCrit,
        },
      ]);

      // Update missions for taps and coins
      const newMissions = prev.missions.map((m) => {
        if (m.type === 'taps' && !m.claimed && m.current < m.target) {
          return { ...m, current: m.current + 1 };
        }
        if (m.type === 'coins_earned' && !m.claimed && m.current < m.target) {
          return { ...m, current: Math.min(m.target, m.current + finalEarned) };
        }
        return m;
      });

      return {
        ...prev,
        coins: prev.coins + finalEarned,
        totalEarned: prev.totalEarned + finalEarned,
        totalTaps: prev.totalTaps + 1,
        energy: Math.max(0, prev.energy - 1),
        missions: newMissions,
      };
    });
  }, []);

  // Activate 2x Turbo Boost
  const handleActivateTurbo = useCallback(() => {
    const now = Date.now();
    soundManager.playTurbo();
    soundManager.triggerHaptic(40);

    setGameState((prev) => ({
      ...prev,
      turbo: {
        expiresAt: now + 15000, // 15 seconds active
        cooldownUntil: now + 60000, // 45 seconds cooldown after expire
      },
    }));
  }, []);

  // Purchase Upgrade
  const handleBuyUpgrade = useCallback((id: UpgradeId) => {
    setGameState((prev) => {
      const curLevel = prev.upgrades[id];
      const cost = calculateUpgradeCost(id, curLevel);

      if (prev.coins < cost) {
        soundManager.playEnergyEmpty();
        return prev;
      }

      soundManager.playUpgrade();
      soundManager.triggerHaptic(25);

      const newUpgrades = {
        ...prev.upgrades,
        [id]: curLevel + 1,
      };

      const newMaxEnergy = calculateMaxEnergy(newUpgrades.energyLimit);
      const newCoinsPerTap = calculateCoinsPerTap(newUpgrades.multitap);
      const newRecovery = calculateEnergyRecovery(newUpgrades.energyRecovery);
      const newCps = calculateCoinsPerSecond(newUpgrades.autoMiner);

      // Update 'upgrades' mission
      const newMissions = prev.missions.map((m) => {
        if (m.type === 'upgrades' && !m.claimed && m.current < m.target) {
          return { ...m, current: m.current + 1 };
        }
        return m;
      });

      return {
        ...prev,
        coins: prev.coins - cost,
        upgrades: newUpgrades,
        maxEnergy: newMaxEnergy,
        coinsPerTap: newCoinsPerTap,
        energyRecoveryRate: newRecovery,
        coinsPerSecond: newCps,
        missions: newMissions,
      };
    });
  }, []);

  // Claim Daily Login Reward
  const handleClaimDailyReward = useCallback(() => {
    const today = getTodayDateKey();
    setGameState((prev) => {
      if (prev.dailyRewards.lastClaimDate === today) return prev;

      soundManager.playClaim();
      soundManager.triggerHaptic(50);

      const streakDay = ((prev.dailyRewards.currentStreak - 1) % 7) + 1;
      const rewardConfig = DAILY_REWARDS_TABLE[streakDay - 1];
      const rewardCoins = rewardConfig.coins;

      // Update mission for daily claim
      const newMissions = prev.missions.map((m) => {
        if (m.type === 'daily_claim' && !m.claimed) {
          return { ...m, current: 1 };
        }
        return m;
      });

      return {
        ...prev,
        coins: prev.coins + rewardCoins,
        totalEarned: prev.totalEarned + rewardCoins,
        dailyRewards: {
          currentStreak: prev.dailyRewards.currentStreak + 1,
          lastClaimDate: today,
        },
        missions: newMissions,
      };
    });
  }, []);

  // Claim Daily Mission Reward
  const handleClaimMission = useCallback((missionId: string) => {
    setGameState((prev) => {
      const mission = prev.missions.find((m) => m.id === missionId);
      if (!mission || mission.claimed || mission.current < mission.target) {
        return prev;
      }

      soundManager.playClaim();
      soundManager.triggerHaptic(35);

      const newMissions = prev.missions.map((m) =>
        m.id === missionId ? { ...m, claimed: true } : m
      );

      return {
        ...prev,
        coins: prev.coins + mission.reward,
        totalEarned: prev.totalEarned + mission.reward,
        missions: newMissions,
      };
    });
  }, []);

  // Claim Offline Earnings
  const handleClaimOfflineEarnings = useCallback(() => {
    if (!offlineSummary) return;
    soundManager.playClaim();
    triggerParticleBurst(window.innerWidth / 2, window.innerHeight / 2, 50, 'celebration');

    setGameState((prev) => ({
      ...prev,
      coins: prev.coins + offlineSummary.coinsEarned,
      totalEarned: prev.totalEarned + offlineSummary.coinsEarned,
      energy: Math.min(prev.maxEnergy, prev.energy + offlineSummary.energyRestored),
      lastSaved: Date.now(),
    }));

    setOfflineSummary(null);
  }, [offlineSummary]);

  // Audio Toggle
  const handleToggleSound = useCallback(() => {
    setGameState((prev) => {
      const nextSound = !prev.settings.soundEnabled;
      soundManager.setSoundEnabled(nextSound);
      if (nextSound) soundManager.playTap();
      return {
        ...prev,
        settings: {
          ...prev.settings,
          soundEnabled: nextSound,
        },
      };
    });
  }, []);

  // Haptic Toggle
  const handleToggleHaptic = useCallback(() => {
    setGameState((prev) => {
      const nextHaptic = !prev.settings.hapticEnabled;
      soundManager.setHapticEnabled(nextHaptic);
      if (nextHaptic) soundManager.triggerHaptic(30);
      return {
        ...prev,
        settings: {
          ...prev.settings,
          hapticEnabled: nextHaptic,
        },
      };
    });
  }, []);

  // Reset Game
  const handleResetGame = useCallback(() => {
    clearGameState();
    setGameState({ ...DEFAULT_INITIAL_STATE, lastSaved: Date.now() });
    setCurrentTab('home');
    soundManager.playTap();
  }, []);

  // Change Player Name
  const handleChangeName = useCallback((name: string) => {
    setGameState((prev) => ({
      ...prev,
      player: {
        ...prev.player,
        name,
      },
    }));
  }, []);

  const { rank } = getPlayerRank(gameState.totalEarned);

  // Check badges for notifications
  const todayKey = getTodayDateKey();
  const hasClaimableDailyReward = gameState.dailyRewards.lastClaimDate !== todayKey;
  const hasClaimableMissions = gameState.missions.some(
    (m) => !m.claimed && m.current >= m.target
  );

  return (
    <div className="relative min-h-screen bg-[#080B10] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Background Ambience Banner Artwork */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${tapBannerImg})`,
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#080B10]/80 via-[#080B10]/95 to-[#080B10] pointer-events-none" />

      {/* Interactive Global Particle Canvas */}
      <ParticleCanvas />

      {/* Tap Floating Numbers */}
      <FloatingNumbers items={floatingNumbers} />

      {/* Welcome Back Offline Earnings Modal */}
      <OfflineModal summary={offlineSummary} onClaim={handleClaimOfflineEarnings} />

      {/* Automatic GitHub Publisher Modal */}
      <GitHubPublishModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
      />

      {/* Telegram Bot & Webhook Modal */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
      />

      {/* Sticky Header */}
      <Header
        coins={gameState.coins}
        coinsPerSecond={gameState.coinsPerSecond}
        soundEnabled={gameState.settings.soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
        playerTitle={rank.title}
        playerLevel={rank.level}
        playerBadge={rank.badge}
      />

      {/* Active Tab View */}
      <main className="relative z-10 flex-1 w-full max-w-md mx-auto">
        {currentTab === 'home' && (
          <HomeView
            state={gameState}
            onTapCoin={handleTapCoin}
            onActivateTurbo={handleActivateTurbo}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'upgrade' && (
          <UpgradeView state={gameState} onBuyUpgrade={handleBuyUpgrade} />
        )}

        {currentTab === 'missions' && (
          <MissionsView
            state={gameState}
            onClaimDailyReward={handleClaimDailyReward}
            onClaimMission={handleClaimMission}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            state={gameState}
            onToggleSound={handleToggleSound}
            onToggleHaptic={handleToggleHaptic}
            onResetGame={handleResetGame}
            onChangeName={handleChangeName}
            onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
            onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
          />
        )}
      </main>

      {/* Sticky Bottom Thumb Navigation */}
      <TabsNav
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
        hasClaimableMissions={hasClaimableMissions}
        hasClaimableDailyReward={hasClaimableDailyReward}
      />
    </div>
  );
}
