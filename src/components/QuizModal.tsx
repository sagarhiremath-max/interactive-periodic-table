import React, { useState, useEffect, useCallback } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw, Flame, ArrowRight, Eye } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../data/elements';
import { ATOMIC_RADII_PM } from '../data/trends';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onInspectElement: (element: ElementData) => void;
}

interface Question {
  type: string;
  target: ElementData;
  questionText: string;
  options: { label: string; isCorrect: boolean }[];
  explanation: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onInspectElement,
}) => {
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestion = useCallback((): Question => {
    // Pick random element
    const targetIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    const target = ELEMENTS_DATA[targetIdx];

    const types = ['symbol', 'number', 'category', 'name', 'state', 'use', 'radius'];
    const qType = types[Math.floor(Math.random() * types.length)];

    let questionText = '';
    let correctLabel = '';
    let distractors: string[] = [];
    let explanation = '';

    if (qType === 'radius' && ATOMIC_RADII_PM[target.number] !== null) {
      const radius = ATOMIC_RADII_PM[target.number];
      questionText = `What is the approximate empirical atomic radius of ${target.name} (${target.symbol})?`;
      correctLabel = `${radius} pm`;
      explanation = `${target.name} (Z=${target.number}, Period ${target.period}) has an empirical atomic radius of ${radius} pm.`;
      const deltas = [-40, -25, 30, 55];
      for (const d of deltas) {
        if (distractors.length < 3) {
          const fake = Math.max(30, (radius as number) + d);
          const fakeLabel = `${fake} pm`;
          if (fake !== radius && !distractors.includes(fakeLabel)) {
            distractors.push(fakeLabel);
          }
        }
      }
    } else if (qType === 'symbol') {
      questionText = `What is the chemical symbol for ${target.name}?`;
      correctLabel = target.symbol;
      explanation = `${target.name} has atomic number ${target.number} and is represented by the symbol "${target.symbol}".`;
      while (distractors.length < 3) {
        const rElem = ELEMENTS_DATA[Math.floor(Math.random() * ELEMENTS_DATA.length)];
        if (rElem.symbol !== target.symbol && !distractors.includes(rElem.symbol)) {
          distractors.push(rElem.symbol);
        }
      }
    } else if (qType === 'number') {
      questionText = `What is the atomic number of ${target.name} (${target.symbol})?`;
      correctLabel = `${target.number}`;
      explanation = `${target.name} has ${target.number} protons in its nucleus, placing it at position ${target.number} on the periodic table.`;
      while (distractors.length < 3) {
        const offset = (Math.floor(Math.random() * 9) - 4) || 1;
        const fakeNum = Math.max(1, Math.min(118, target.number + offset));
        const fakeStr = `${fakeNum}`;
        if (fakeStr !== correctLabel && !distractors.includes(fakeStr)) {
          distractors.push(fakeStr);
        }
      }
    } else if (qType === 'category') {
      questionText = `Which chemical category does ${target.name} (${target.symbol}) belong to?`;
      correctLabel = target.categoryName;
      explanation = `${target.name} is classified as a ${target.categoryName.toLowerCase()} in Period ${target.period}, Group ${target.group}.`;
      const allCategories = Array.from(new Set(ELEMENTS_DATA.map((e) => e.categoryName)));
      while (distractors.length < 3) {
        const rCat = allCategories[Math.floor(Math.random() * allCategories.length)];
        if (rCat !== correctLabel && !distractors.includes(rCat)) {
          distractors.push(rCat);
        }
      }
    } else if (qType === 'state') {
      // Physical state
      questionText = `What is the standard physical state of ${target.name} (${target.symbol}) at room temperature (293 K / 20°C)?`;
      correctLabel = target.standardState.charAt(0).toUpperCase() + target.standardState.slice(1);
      explanation = `At room temperature, ${target.name} is a ${target.standardState}. (Melting point: ${target.meltingPointKelvin ? `${Math.round(target.meltingPointKelvin - 273.15)}°C` : 'N/A'}).`;
      const allStates = ['Solid', 'Liquid', 'Gas', 'Synthetic'];
      distractors = allStates.filter((s) => s.toLowerCase() !== target.standardState.toLowerCase()).slice(0, 3);
    } else if (qType === 'use' && target.commonUses && target.commonUses.length > 0) {
      const use = target.commonUses[0];
      questionText = `Which element is commonly utilized for: "${use}"?`;
      correctLabel = `${target.name} (${target.symbol})`;
      explanation = `${target.name} is key in: ${target.commonUses.join(', ')}.`;
      while (distractors.length < 3) {
        const rElem = ELEMENTS_DATA[Math.floor(Math.random() * ELEMENTS_DATA.length)];
        const distStr = `${rElem.name} (${rElem.symbol})`;
        if (rElem.number !== target.number && !distractors.includes(distStr)) {
          distractors.push(distStr);
        }
      }
    } else {
      questionText = `Which element has the symbol "${target.symbol}" and atomic number ${target.number}?`;
      correctLabel = target.name;
      explanation = `Symbol "${target.symbol}" corresponds to ${target.name} (Atomic mass: ${target.atomicMass} u).`;
      while (distractors.length < 3) {
        const rElem = ELEMENTS_DATA[Math.floor(Math.random() * ELEMENTS_DATA.length)];
        if (rElem.name !== target.name && !distractors.includes(rElem.name)) {
          distractors.push(rElem.name);
        }
      }
    }

    const options = [
      { label: correctLabel, isCorrect: true },
      ...distractors.map((d) => ({ label: d, isCorrect: false })),
    ].sort(() => Math.random() - 0.5);

    return {
      type: qType,
      target,
      questionText,
      options,
      explanation,
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isOpen, generateQuestion]);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered || !currentQuestion) return;

    setSelectedAnswer(index);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    const isCorrect = currentQuestion.options[index].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        setBestStreak((best) => Math.max(best, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleResetQuiz = () => {
    setScore(0);
    setTotalAnswered(0);
    setStreak(0);
    handleNext();
  };

  if (!isOpen) return null;

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-black/60 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative z-10 w-full max-w-xl flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <h2 className="text-lg font-bold">Chemistry Challenge Quiz</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz modal"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Score & Streak Header */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-white/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 block text-[10px]">Score</span>
              <strong className="text-base text-cyan-400 font-bold">
                {score} / {totalAnswered} ({accuracy}%)
              </strong>
            </div>

            <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
              <Flame size={16} className={streak > 0 ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-500'} />
              <div>
                <span className="text-slate-400 block text-[10px]">Streak</span>
                <strong className="text-sm text-amber-300 font-bold">
                  {streak} <span className="text-[10px] text-slate-400 font-normal">(Best: {bestStreak})</span>
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetQuiz}
            className="flex items-center gap-1 text-slate-400 hover:text-white text-xs p-1.5 rounded-lg hover:bg-white/5"
            title="Reset Quiz Statistics"
          >
            <RotateCcw size={13} />
            <span>Reset Stats</span>
          </button>
        </div>

        {/* Question Area */}
        <div className="p-6 space-y-5">
          {currentQuestion && (
            <>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  Question #{totalAnswered + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold mt-2 leading-snug">
                  {currentQuestion.questionText}
                </h3>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentQuestion.options.map((opt, idx) => {
                  let btnStyle = darkMode
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-500';
                    } else if (selectedAnswer === idx) {
                      btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300 line-through ring-1 ring-rose-500';
                    } else {
                      btnStyle = 'opacity-40 border-slate-700';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`p-3.5 rounded-xl border text-sm font-semibold text-left transition-all flex items-center justify-between ${btnStyle} ${
                        !isAnswered ? 'hover:scale-[1.01]' : ''
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isAnswered && opt.isCorrect && (
                        <CheckCircle2 size={18} className="text-emerald-400 shrink-0 ml-2" />
                      )}
                      {isAnswered && selectedAnswer === idx && !opt.isCorrect && (
                        <XCircle size={18} className="text-rose-400 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Feedback & Educational Explanation */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 animate-in fade-in duration-150 ${
                    currentQuestion.options[selectedAnswer ?? 0]?.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {currentQuestion.options[selectedAnswer ?? 0]?.isCorrect ? (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={16} /> Correct!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-rose-400">
                        <XCircle size={16} /> Incorrect
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300">{currentQuestion.explanation}</p>

                  {/* Actions: Inspect Element or Next Question */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onInspectElement(currentQuestion.target);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                    >
                      <Eye size={13} />
                      <span>Inspect {currentQuestion.target.name} in Table</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <span>Next Question</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
