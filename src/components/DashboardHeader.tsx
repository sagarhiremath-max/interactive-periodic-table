import React, { useState } from 'react';
import {
  Bell,
  ArrowRightLeft,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';

interface DashboardHeaderProps {
  onOpenCompare: () => void;
  onOpenQuiz: () => void;
  favoritesCount: number;
  darkMode?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onOpenCompare,
  onOpenQuiz,
  favoritesCount,
  darkMode: _darkMode = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  // Formatted date string
  const todayDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  const notifications = [
    {
      id: 1,
      title: 'Periodic Trends Mode Active',
      desc: 'Empirical radii, electronegativity, density and ionization energies rendered.',
      time: 'NOW',
    },
    {
      id: 2,
      title: 'Chemistry Quiz Ready',
      desc: 'Challenge yourself with interactive questions on symbols, shells and states.',
      time: '1H AGO',
    },
    {
      id: 3,
      title: `${favoritesCount} Saved Elements`,
      desc: 'Bookmarked elements synchronized to your brutalist local session.',
      time: 'ACTIVE',
    },
  ];

  return (
    <header className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-black dark:border-white">
      {/* Title & Welcome */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="brutal-badge bg-[#FFE600] text-black font-mono">
            PERIODIC SYSTEM // V.2.0
          </span>
          <span className="text-xs font-mono font-bold text-black dark:text-white">•</span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            {todayDate}
          </span>
        </div>
        <div className="flex items-baseline gap-3 mt-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase text-black dark:text-white">
            ELEMENT EXPLORER
          </h1>
          <span className="text-xs font-mono font-bold uppercase tracking-wider hidden md:inline text-neutral-600 dark:text-neutral-400">
            // CHEMICAL INTELLIGENCE DIRECTORY
          </span>
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-3 self-end sm:self-auto">
        {/* Compare Elements Button */}
        <button
          type="button"
          onClick={onOpenCompare}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-black uppercase tracking-wider border-2 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          title="Compare two elements side-by-side"
        >
          <ArrowRightLeft size={15} strokeWidth={2.5} className="text-black dark:text-white" />
          <span>COMPARE</span>
        </button>

        {/* Start Quiz Button */}
        <button
          type="button"
          onClick={onOpenQuiz}
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-black uppercase tracking-wider border-2 border-black bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          title="Take chemistry quiz"
        >
          <GraduationCap size={16} strokeWidth={2.5} />
          <span>QUIZ MODE</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Notifications"
            className="relative p-2 border-2 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
          >
            <Bell size={18} strokeWidth={2.2} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#FF007A] border border-black" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 border-3 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[6px_6px_0px_0px_#000000] dark:shadow-[6px_6px_0px_0px_#FFFFFF] p-4 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} strokeWidth={2.5} className="text-[#FFE600]" />
                  <h3 className="text-sm font-mono font-black uppercase tracking-wider">NOTIFICATIONS</h3>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 border border-black hover:bg-[#FF007A] hover:text-white cursor-pointer"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>

              <div className="divide-y-2 divide-neutral-200 dark:divide-neutral-800 max-h-72 overflow-y-auto mt-1 font-mono">
                {notifications.map((item) => (
                  <div key={item.id} className="py-2.5 px-1 hover:bg-[#FFE600]/20 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black uppercase">{item.title}</p>
                      <span className="text-[10px] font-bold px-1 bg-black text-white dark:bg-white dark:text-black">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[11px] mt-1 leading-snug text-neutral-700 dark:text-neutral-300">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t-2 border-black dark:border-white text-center font-mono">
                <span className="text-[11px] font-black uppercase text-black dark:text-white inline-flex items-center gap-1.5">
                  <CheckCircle2 size={13} strokeWidth={2.5} className="text-[#00E599]" /> ALL DATA VERIFIED
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="relative w-10 h-10 border-2 border-black bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-mono font-black text-sm">
            SC
            <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00E599] border border-black" />
          </div>
          <div className="hidden lg:flex flex-col text-left font-mono">
            <span className="text-xs font-black uppercase leading-tight text-black dark:text-white">SCIENTIST</span>
            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 leading-tight uppercase">// OPERATOR</span>
          </div>
        </div>
      </div>
    </header>
  );
};
