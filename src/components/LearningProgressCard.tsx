import React from 'react';
import { GraduationCap, BookOpen, Flame, Award } from 'lucide-react';

interface LearningProgressCardProps {
  exploredCount: number;
  totalElements?: number;
  progressPercentage: number;
  onOpenQuiz: () => void;
  onOpenGuide: () => void;
  darkMode?: boolean;
}

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  exploredCount,
  totalElements = 118,
  progressPercentage,
  onOpenQuiz,
  onOpenGuide,
  darkMode: _darkMode = false,
}) => {
  return (
    <div className="p-5 border-2.5 border-black dark:border-white bg-white dark:bg-[#181818] text-black dark:text-white shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#FFF] flex flex-col justify-between font-mono">
      <div>
        <div className="flex items-center justify-between pb-3 border-b-2 border-black dark:border-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 border-2 border-black bg-[#00E599] text-black shadow-[2px_2px_0px_#000]">
              <GraduationCap size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                LEARNING & MASTERY
              </h3>
              <p className="text-[10px] text-neutral-600 dark:text-neutral-400 uppercase">
                CURRICULUM PROGRESS
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-2 py-0.5 border border-black bg-[#00E599] text-black">
            {progressPercentage}%
          </span>
        </div>

        {/* Brutalist Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold uppercase">
            <span className="text-neutral-600 dark:text-neutral-400">ELEMENTS EXPLORED</span>
            <span className="font-black">
              {exploredCount} / {totalElements}
            </span>
          </div>
          <div className="w-full h-4 border-2 border-black dark:border-white bg-neutral-200 dark:bg-black p-0.5">
            <div
              className="h-full bg-[#FFE600] border-r-2 border-black transition-all duration-300"
              style={{ width: `${Math.max(2, progressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Milestone perks */}
        <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
          <div className="p-2.5 border-2 border-black dark:border-white bg-white dark:bg-[#222] shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] flex items-center gap-2">
            <Award size={16} strokeWidth={2.5} className="text-[#FFE600] shrink-0" />
            <div className="min-w-0">
              <p className="font-black uppercase text-[11px]">7 QUIZ TYPES</p>
              <p className="text-[9px] text-neutral-600 dark:text-neutral-400 uppercase">RADII & STATES</p>
            </div>
          </div>
          <div className="p-2.5 border-2 border-black dark:border-white bg-white dark:bg-[#222] shadow-[2px_2px_0px_0px_#000] dark:shadow-[2px_2px_0px_0px_#FFF] flex items-center gap-2">
            <Flame size={16} strokeWidth={2.5} className="text-[#FF007A] shrink-0" />
            <div className="min-w-0">
              <p className="font-black uppercase text-[11px]">BOHR MODELS</p>
              <p className="text-[9px] text-neutral-600 dark:text-neutral-400 uppercase">ALL 118 ATOMS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2.5 mt-4 pt-3 border-t-2 border-black dark:border-white">
        <button
          type="button"
          onClick={onOpenQuiz}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 border-2 border-black bg-[#FFE600] text-black font-black uppercase text-xs shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
        >
          <GraduationCap size={15} strokeWidth={2.5} />
          <span>LAUNCH QUIZ</span>
        </button>

        <button
          type="button"
          onClick={onOpenGuide}
          className="inline-flex items-center justify-center p-2 border-2 border-black dark:border-white bg-white dark:bg-[#222] text-black dark:text-white shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#FFF] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer hover:bg-neutral-100"
          title="Open Chemistry Guide"
        >
          <BookOpen size={16} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
