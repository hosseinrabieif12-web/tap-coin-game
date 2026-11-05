import React from 'react';
import { FloatingNumber } from '../types/game';

interface FloatingNumbersProps {
  items: FloatingNumber[];
}

export const FloatingNumbers: React.FC<FloatingNumbersProps> = ({ items }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            left: `${item.x}px`,
            top: `${item.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute animate-[floatUp_0.8s_ease-out_forwards] font-black text-2xl sm:text-3xl tracking-tight select-none pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          <span
            className={
              item.isCrit
                ? 'text-yellow-200 font-extrabold gold-text-glow scale-125 inline-block'
                : 'text-amber-400 font-bold gold-text-glow'
            }
          >
            +{item.amount}
          </span>
        </div>
      ))}
      <style>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0.85);
          }
          40% {
            opacity: 1;
            transform: translate(-50%, -80px) scale(1.15);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -140px) scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};
