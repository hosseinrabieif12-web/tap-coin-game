import React from 'react';
import { Coins, ArrowUpCircle, CheckSquare, User } from 'lucide-react';
import { TabType } from '../types/game';

interface TabsNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasClaimableMissions: boolean;
  hasClaimableDailyReward: boolean;
}

export const TabsNav: React.FC<TabsNavProps> = ({
  currentTab,
  onChangeTab,
  hasClaimableMissions,
  hasClaimableDailyReward,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Coins },
    { id: 'upgrade' as TabType, label: 'Upgrade', icon: ArrowUpCircle },
    {
      id: 'missions' as TabType,
      label: 'Missions',
      icon: CheckSquare,
      badge: hasClaimableMissions || hasClaimableDailyReward,
    },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080B10]/95 backdrop-blur-xl border-t border-amber-500/20">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[48px] py-1 transition-all ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              {/* Active glow pill indicator on top */}
              {isActive && (
                <span className="absolute top-0 w-8 h-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-sm shadow-amber-400/50" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-400'
                  }`}
                />

                {/* Badge notification dot */}
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-slate-950" />
                  </span>
                )}
              </div>

              <span className="text-[11px] tracking-tight mt-1 whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
