import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  Layers,
  Heart,
  GraduationCap,
  Settings,
  Atom,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'table' | 'elements' | 'favorites' | 'learning';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  favoritesCount: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  favoritesCount,
}) => {
  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'table', label: 'Periodic Table', icon: Grid3X3 },
    { id: 'elements', label: 'Elements Directory', icon: Layers },
    { id: 'favorites', label: 'Favorites', icon: Heart, badge: favoritesCount },
    { id: 'learning', label: 'Learning & Quiz', icon: GraduationCap },
  ];

  return (
    <>
      {/* Desktop Fixed Left Sidebar */}
      <aside
        className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[74px] bg-[#FFFFFF] dark:bg-[#121212] text-black dark:text-white flex-col items-center justify-between py-6 z-40 border-r-3 border-black dark:border-white shadow-[4px_0px_0px_0px_#000000] dark:shadow-[4px_0px_0px_0px_#FFFFFF]"
        aria-label="Main Navigation"
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="group relative flex items-center justify-center w-12 h-12 bg-[#FFE600] text-black border-2 border-black shadow-[3px_3px_0px_0px_#000000] dark:shadow-[3px_3px_0px_0px_#FFFFFF] transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] cursor-pointer"
            title="Element Explorer"
            aria-label="Element Explorer Home"
          >
            <Atom size={26} strokeWidth={2.5} className="transition-transform group-hover:rotate-90 duration-300" />
            <span className="pointer-events-none absolute left-[82px] bg-black text-[#FFE600] font-mono text-xs font-bold px-3 py-1.5 shadow-[3px_3px_0px_0px_#FFE600] opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border-2 border-black uppercase tracking-wider">
              [ ELEMENT EXPLORER ]
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-3.5 w-full px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <div key={item.id} className="relative group flex items-center justify-center w-full">
                <button
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  className={`relative flex items-center justify-center w-12 h-12 transition-all duration-100 border-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_0px_#000000] font-black translate-x-[-1px] translate-y-[-1px]'
                      : 'border-transparent text-black dark:text-white hover:border-black dark:hover:border-white hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:shadow-[3px_3px_0px_0px_#000] dark:hover:shadow-[3px_3px_0px_0px_#FFF]'
                  }`}
                >
                  <Icon size={20} strokeWidth={2.2} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 text-[10px] font-mono font-black px-1.5 py-0.2 bg-[#FF007A] text-white border-2 border-black leading-tight shadow-[1px_1px_0px_0px_#000]"
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Brutalist Tooltip */}
                <div className="pointer-events-none absolute left-[80px] bg-white dark:bg-black text-black dark:text-white text-xs font-mono font-bold px-2.5 py-1.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border-2 border-black dark:border-white flex items-center gap-1.5 uppercase">
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] px-1 py-0.5 bg-black text-white dark:bg-white dark:text-black font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom Settings Item */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="flex items-center justify-center w-12 h-12 border-2 border-transparent hover:border-black dark:hover:border-white text-black dark:text-white hover:bg-[#FFE600] hover:text-black hover:shadow-[3px_3px_0px_0px_#000] transition-all cursor-pointer"
          >
            <Settings size={20} strokeWidth={2.2} className="transition-transform group-hover:rotate-90 duration-300" />
          </button>
          <div className="pointer-events-none absolute left-[80px] bg-white dark:bg-black text-black dark:text-white text-xs font-mono font-bold px-2.5 py-1.5 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap z-50 border-2 border-black dark:border-white uppercase">
            [ SETTINGS ]
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#121212] border-t-3 border-black dark:border-white z-40 flex items-center justify-around px-2 text-black dark:text-white shadow-[0px_-4px_0px_0px_#000000] dark:shadow-[0px_-4px_0px_0px_#FFFFFF] safe-area-pb"
        aria-label="Mobile Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-mono font-bold transition-all ${
                isActive ? 'text-black dark:text-[#FFE600]' : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <div
                className={`p-1 border-2 transition-all ${
                  isActive
                    ? 'bg-[#FFE600] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                    : 'border-transparent'
                }`}
              >
                <Icon size={18} strokeWidth={2.2} />
              </div>
              <span className="mt-0.5 uppercase">{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-1.5 right-3 bg-[#FF007A] text-white text-[9px] font-mono font-black px-1 border border-black shadow-[1px_1px_0px_#000]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-mono font-bold text-neutral-600 dark:text-neutral-400"
        >
          <div className="p-1 border-2 border-transparent">
            <Settings size={18} strokeWidth={2.2} />
          </div>
          <span className="mt-0.5 uppercase">CONFIG</span>
        </button>
      </nav>
    </>
  );
};
