import React from 'react';
import { MessageSquarePlus, Sparkles } from 'lucide-react';

interface FeedbackButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  inline?: boolean;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  onClick,
  isOpen = false,
  inline = false
}) => {
  if (isOpen) return null;

  const buttonElement = (
    <button
      type="button"
      onClick={onClick}
      aria-label="Report a mistake or submit feedback"
      title="Found a mistake? Help us improve!"
      className="pointer-events-auto shrink-0 group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-800 text-slate-100 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_16px_rgba(6,182,212,0.2)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.35)] backdrop-blur-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 whitespace-nowrap"
    >
      {/* Subtle accent indicator */}
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
      </span>

      {/* Icon */}
      <MessageSquarePlus className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />

      {/* Label */}
      <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200 group-hover:text-white transition-colors">
        Feedback
      </span>

      {/* Subtle sparkle accent on hover */}
      <Sparkles className="w-3.5 h-3.5 text-cyan-400/80 group-hover:rotate-12 transition-transform hidden sm:inline-block" />
    </button>
  );

  if (inline) {
    return buttonElement;
  }

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 font-sans pointer-events-none">
      {buttonElement}
    </div>
  );
};
