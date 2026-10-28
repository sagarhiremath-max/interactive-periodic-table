import React from 'react';
import { Atom, Layers, Heart, GraduationCap } from 'lucide-react';

interface DashboardStatsProps {
  totalElements?: number;
  categoriesCount?: number;
  favoritesCount: number;
  learningProgressPercentage: number;
  exploredCount: number;
  darkMode?: boolean;
  onFilterFavorites?: () => void;
  onOpenQuiz?: () => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalElements = 118,
  categoriesCount = 10,
  favoritesCount,
  learningProgressPercentage,
  exploredCount,
  darkMode: _darkMode = false,
  onFilterFavorites,
  onOpenQuiz,
}) => {
  const statCards = [
    {
      id: 'elements',
      title: 'TOTAL ELEMENTS',
      value: totalElements,
      subtext: 'DISCOVERED MATTER',
      icon: Atom,
      color: 'bg-[#FFE600]',
      onClick: undefined,
    },
    {
      id: 'categories',
      title: 'CATEGORIES',
      value: categoriesCount,
      subtext: 'FAMILIES & BLOCKS',
      icon: Layers,
      color: 'bg-[#00E5FF]',
      onClick: undefined,
    },
    {
      id: 'favorites',
      title: 'FAVORITES',
      value: favoritesCount,
      subtext: favoritesCount === 1 ? '1 SAVED ELEMENT' : `${favoritesCount} SAVED ELEMENTS`,
      icon: Heart,
      color: 'bg-[#FF007A]',
      onClick: onFilterFavorites,
    },
    {
      id: 'learning',
      title: 'LEARNING PROGRESS',
      value: `${learningProgressPercentage}%`,
      subtext: `${exploredCount}/${totalElements} EXPLORED`,
      icon: GraduationCap,
      color: 'bg-[#00E599]',
      onClick: onOpenQuiz,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.onClick);

        return (
          <div
            key={card.id}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={card.onClick}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                card.onClick?.();
              }
            }}
            className={`p-4 sm:p-5 flex flex-col justify-between border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] transition-transform ${
              isClickable
                ? 'cursor-pointer hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000]'
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                {card.title}
              </span>
              <div className={`p-2 border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] ${card.color}`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-black dark:text-white">
                {card.value}
              </div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider mt-1 text-neutral-600 dark:text-neutral-400">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
