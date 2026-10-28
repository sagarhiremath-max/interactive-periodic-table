import React from 'react';
import { X, Settings, Moon, Sun, RotateCcw, Columns, Sparkles } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  layoutMode: 'standard' | 'extended';
  onToggleLayout: () => void;
  onResetAll: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  layoutMode,
  onToggleLayout,
  onResetAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 font-mono select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md border-3 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[8px_8px_0px_0px_#000000] dark:shadow-[8px_8px_0px_0px_#FFFFFF] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b-2 border-black dark:border-white flex items-center justify-between bg-[#FFE600] text-black">
          <div className="flex items-center gap-2.5">
            <Settings size={20} strokeWidth={2.5} />
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">
                CONFIGURATION // SETTINGS
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-black bg-white hover:bg-[#FF007A] hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          {/* Theme Mode */}
          <div className="flex items-center justify-between p-3.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-[#222] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF]">
            <div>
              <p className="font-black uppercase text-xs">THEME MODE</p>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase mt-0.5">
                BRUTAL LIGHT VS DARK HIGH-CONTRAST
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#FFE600] text-black font-black uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              {darkMode ? <Sun size={14} strokeWidth={3} /> : <Moon size={14} strokeWidth={3} />}
              <span>{darkMode ? 'DARK' : 'LIGHT'}</span>
            </button>
          </div>

          {/* Periodic Table Layout */}
          <div className="flex items-center justify-between p-3.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-[#222] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF]">
            <div>
              <p className="font-black uppercase text-xs">GRID MATRIX LAYOUT</p>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase mt-0.5">
                18-COL STANDARD / 32-COL EXTENDED
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleLayout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-white dark:bg-black text-black dark:text-white font-black uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <Columns size={14} strokeWidth={2.5} />
              <span className="uppercase">{layoutMode}</span>
            </button>
          </div>

          {/* Reset All Filters */}
          <div className="flex items-center justify-between p-3.5 border-2 border-black dark:border-white bg-neutral-100 dark:bg-[#222] shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#FFF]">
            <div>
              <p className="font-black uppercase text-xs">PURGE ACTIVE STATE</p>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase mt-0.5">
                CLEAR ALL QUERIES, SELECTIONS & HEATMAPS
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetAll();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border-2 border-black bg-[#FF007A] text-white font-black uppercase shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <RotateCcw size={13} strokeWidth={3} />
              <span>RESET</span>
            </button>
          </div>

          {/* App Info */}
          <div className="pt-2 text-center text-[10px] font-mono font-bold uppercase text-neutral-500">
            <p className="flex items-center justify-center gap-1 text-black dark:text-white font-black">
              <Sparkles size={13} strokeWidth={2.5} className="text-[#FFE600]" />
              ELEMENT EXPLORER // BRUTALIST ARCHITECTURE V2.0
            </p>
            <p className="mt-0.5">REACT 19 + TYPESCRIPT + TAILWIND CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
