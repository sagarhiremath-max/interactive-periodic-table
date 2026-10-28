import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  ArrowRight,
  Eye,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../data/elements';
import { ATOMIC_RADII_PM } from '../data/trends';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onInspectElement: (element: ElementData) => void;
}

interface Option {
  label: string;
  isCorrect: boolean;
  eliminated?: boolean;
}

interface Question {
  type: string;
  target: ElementData;
  questionText: string;
  options: Option[];
  explanation: string;
  hint: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  onInspectElement,
}) => {
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestion = useCallback((): Question => {
    const targetIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    const target = ELEMENTS_DATA[targetIdx];

    const types = ['symbol', 'number', 'category', 'name', 'state', 'use', 'radius'];
    const qType = types[Math.floor(Math.random() * types.length)];

    let questionText = '';
    let correctLabel = '';
    let distractors: string[] = [];
    let explanation = '';
    let hint = '';

    if (qType === 'radius' && ATOMIC_RADII_PM[target.number] !== null) {
      const radius = ATOMIC_RADII_PM[target.number];
      questionText = `What is the approximate covalent/atomic radius of ${target.name} (${target.symbol})?`;
      correctLabel = `${radius} pm`;
      distractors = [
        `${Math.round(radius! * 0.7)} pm`,
        `${Math.round(radius! * 1.35)} pm`,
        `${Math.round(radius! + 45)} pm`,
      ];
      explanation = `${target.name} (${target.symbol}) has an empirical atomic radius of ${radius} pm.`;
      hint = `Atomic radii decrease left-to-right across a period and increase down a group. Period ${target.period}, Group ${target.group}.`;
    } else if (qType === 'symbol') {
      questionText = `What is the chemical symbol for ${target.name} (Atomic #${target.number})?`;
      correctLabel = target.symbol;
      const otherSymbols = ELEMENTS_DATA.filter((e) => e.number !== target.number)
        .map((e) => e.symbol)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      distractors = otherSymbols;
      explanation = `The chemical symbol for ${target.name} is ${target.symbol}. It resides in Period ${target.period}, Group ${target.group}.`;
      hint = `This element sits in the ${target.categoryName} family.`;
    } else if (qType === 'number') {
      questionText = `What is the atomic number (Z) of ${target.name} (${target.symbol})?`;
      correctLabel = `${target.number}`;
      const offsets = [-2, -1, 1, 2, 5, -5].sort(() => 0.5 - Math.random()).slice(0, 3);
      distractors = offsets.map((o) => `${Math.max(1, Math.min(118, target.number + o))}`);
      explanation = `${target.name} has atomic number Z=${target.number}, indicating ${target.number} protons in its nucleus.`;
      hint = `It resides in Period ${target.period}, Block ${target.block.toUpperCase()}.`;
    } else if (qType === 'category') {
      questionText = `Which chemical category does ${target.name} (${target.symbol}) belong to?`;
      correctLabel = target.categoryName;
      const otherCats = Array.from(new Set(ELEMENTS_DATA.map((e) => e.categoryName)))
        .filter((c) => c !== target.categoryName)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      distractors = otherCats;
      explanation = `${target.name} is categorized as a ${target.categoryName}.`;
      hint = `It is located in Group ${target.group}, Period ${target.period}.`;
    } else if (qType === 'state') {
      questionText = `What is the standard physical state of ${target.name} (${target.symbol}) at room temperature (293 K)?`;
      correctLabel = target.standardState.charAt(0).toUpperCase() + target.standardState.slice(1);
      const allStates = ['Solid', 'Liquid', 'Gas', 'Synthetic'];
      distractors = allStates.filter((s) => s.toLowerCase() !== target.standardState.toLowerCase()).slice(0, 3);
      explanation = `At standard room temperature (20°C / 293 K), ${target.name} is a ${target.standardState}.`;
      hint = `Melting point is ${target.meltingPointKelvin ? `${Math.round(target.meltingPointKelvin)} K` : 'synthetic'}.`;
    } else if (qType === 'use' && target.commonUses && target.commonUses.length > 0) {
      const targetUse = target.commonUses[0];
      questionText = `Which element is commonly utilized for: "${targetUse}"?`;
      correctLabel = `${target.name} (${target.symbol})`;
      const otherElems = ELEMENTS_DATA.filter((e) => e.number !== target.number)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((e) => `${e.name} (${e.symbol})`);
      distractors = otherElems;
      explanation = `${target.name} is known for this application: ${targetUse}.`;
      hint = `This element has atomic number Z=${target.number}.`;
    } else {
      // Name fallback
      questionText = `Which chemical element is represented by the symbol "${target.symbol}"?`;
      correctLabel = target.name;
      const otherNames = ELEMENTS_DATA.filter((e) => e.number !== target.number)
        .map((e) => e.name)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      distractors = otherNames;
      explanation = `"${target.symbol}" is the IUPAC standard symbol for ${target.name}.`;
      hint = `Category: ${target.categoryName}. Atomic weight is approx ${Math.round(target.atomicMassValue)} u.`;
    }

    // Shuffle options
    const allOptions: Option[] = [
      { label: correctLabel, isCorrect: true },
      ...distractors.map((d) => ({ label: d, isCorrect: false })),
    ].sort(() => 0.5 - Math.random());

    return {
      type: qType,
      target,
      questionText,
      options: allOptions,
      explanation,
      hint,
    };
  }, []);

  // Initialize first question on open
  useEffect(() => {
    if (isOpen && !currentQuestion) {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowHint(false);
    }
  }, [isOpen, currentQuestion, generateQuestion]);

  if (!isOpen) return null;

  const handleSelectAnswer = (idx: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(idx);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    const isCorrect = currentQuestion.options[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  const handleResetQuiz = () => {
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    setHintsUsed(0);
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowHint(false);
  };

  const handleUseHint = () => {
    if (showHint || !currentQuestion || isAnswered) return;
    setShowHint(true);
    setHintsUsed((prev) => prev + 1);

    // Also eliminate one wrong option
    const wrongIdxs = currentQuestion.options
      .map((opt, i) => (!opt.isCorrect ? i : -1))
      .filter((i) => i !== -1);
    if (wrongIdxs.length > 0) {
      const toEliminate = wrongIdxs[Math.floor(Math.random() * wrongIdxs.length)];
      setCurrentQuestion((prev) => {
        if (!prev) return null;
        const newOpts = [...prev.options];
        newOpts[toEliminate] = { ...newOpts[toEliminate], eliminated: true };
        return { ...prev, options: newOpts };
      });
    }
  };

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl flex flex-col rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400 border border-violet-500/40">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Elements Science Quiz Challenge
              </h2>
              <p className="text-xs text-slate-400">
                Test your mastery of chemical symbols, configurations, states & trends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetQuiz}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
              title="Restart Quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Scorebar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/40 grid grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Score</span>
            <span className="text-sm font-bold text-cyan-400">{score} / {totalAnswered}</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
            <span className="text-sm font-bold text-emerald-400">{accuracy}%</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block flex items-center justify-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" /> Streak
            </span>
            <span className="text-sm font-bold text-amber-400">{streak} (Best: {bestStreak})</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Hints</span>
            <span className="text-sm font-bold text-violet-400">{hintsUsed}</span>
          </div>
        </div>

        {/* Question Body */}
        {currentQuestion && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Question Heading */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                <span className="uppercase font-bold tracking-wider">
                  QUESTION #{totalAnswered + 1} // {currentQuestion.type.toUpperCase()}
                </span>
                {!isAnswered && (
                  <button
                    type="button"
                    onClick={handleUseHint}
                    disabled={showHint}
                    className={`inline-flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      showHint
                        ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>{showHint ? 'Hint Revealed' : 'Get Hint (-1 50/50)'}</span>
                  </button>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQuestion.questionText}
              </h3>

              {showHint && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{currentQuestion.hint}</span>
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedAnswer === idx;
                let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800/80';

                if (isAnswered) {
                  if (opt.isCorrect) {
                    optStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                  } else if (isSelected) {
                    optStyle = 'bg-rose-950/80 border-rose-500 text-rose-200';
                  } else {
                    optStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40';
                  }
                } else if (opt.eliminated) {
                  optStyle = 'bg-slate-950/40 border-slate-900 text-slate-600 line-through opacity-30 pointer-events-none';
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered || opt.eliminated}
                    onClick={() => handleSelectAnswer(idx)}
                    className={`p-4 rounded-xl border text-left font-sans text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-center text-slate-400">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt.label}</span>
                    </div>

                    {isAnswered && opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswered && isSelected && !opt.isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next Actions */}
            {isAnswered && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{currentQuestion.explanation}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      onInspectElement(currentQuestion.target);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect #{currentQuestion.target.number} {currentQuestion.target.name} Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 hover:from-cyan-300 hover:to-teal-200 transition-all cursor-pointer shadow-md"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
