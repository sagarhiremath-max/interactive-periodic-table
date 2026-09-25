import React, { useState, useEffect, useCallback } from 'react';
import { X, Award, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../data/elements';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onInspectElement: (element: ElementData) => void;
}

interface Question {
  type: 'symbol' | 'number' | 'category' | 'name';
  target: ElementData;
  questionText: string;
  options: { label: string; isCorrect: boolean }[];
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onInspectElement,
}) => {
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestion = useCallback((): Question => {
    // Pick random element from 1 to 118
    const targetIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
    const target = ELEMENTS_DATA[targetIdx];

    const questionTypes: ('symbol' | 'number' | 'category' | 'name')[] = ['symbol', 'number', 'category', 'name'];
    const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let questionText = '';
    let correctLabel = '';
    let distractors: string[] = [];

    if (qType === 'symbol') {
      questionText = `What is the chemical symbol for ${target.name}?`;
      correctLabel = target.symbol;
      while (distractors.length < 3) {
        const rElem = ELEMENTS_DATA[Math.floor(Math.random() * ELEMENTS_DATA.length)];
        if (rElem.symbol !== target.symbol && !distractors.includes(rElem.symbol)) {
          distractors.push(rElem.symbol);
        }
      }
    } else if (qType === 'number') {
      questionText = `What is the atomic number of ${target.name} (${target.symbol})?`;
      correctLabel = `${target.number}`;
      while (distractors.length < 3) {
        const offset = (Math.floor(Math.random() * 9) - 4) || 1;
        const fakeNum = Math.max(1, Math.min(118, target.number + offset));
        const fakeStr = `${fakeNum}`;
        if (fakeStr !== correctLabel && !distractors.includes(fakeStr)) {
          distractors.push(fakeStr);
        }
      }
    } else if (qType === 'category') {
      questionText = `Which category does ${target.name} (${target.symbol}) belong to?`;
      correctLabel = target.categoryName;
      const allCategories = Array.from(new Set(ELEMENTS_DATA.map((e) => e.categoryName)));
      while (distractors.length < 3) {
        const rCat = allCategories[Math.floor(Math.random() * allCategories.length)];
        if (rCat !== correctLabel && !distractors.includes(rCat)) {
          distractors.push(rCat);
        }
      }
    } else {
      questionText = `Which element has the symbol "${target.symbol}" and atomic number ${target.number}?`;
      correctLabel = target.name;
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
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(generateQuestion());
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isOpen, generateQuestion]);

  if (!isOpen || !currentQuestion) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    setTotalAnswered((prev) => prev + 1);

    if (currentQuestion.options[idx].isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const handleReset = () => {
    setScore(0);
    setTotalAnswered(0);
    setCurrentQuestion(generateQuestion());
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className={`relative z-10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border ${
          darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <h2 className="font-bold text-base">Periodic Table Knowledge Challenge</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300">
            <X size={18} />
          </button>
        </div>

        {/* Score tracker */}
        <div className="px-6 py-3 bg-white/5 flex items-center justify-between text-xs border-b border-white/10">
          <div className="flex items-center gap-4">
            <span>Score: <strong className="text-cyan-400 font-bold">{score} / {totalAnswered}</strong></span>
            <span>Accuracy: <strong className="text-amber-400 font-bold">{totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0}%</strong></span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw size={12} />
            <span>Reset Stats</span>
          </button>
        </div>

        {/* Question Area */}
        <div className="p-6">
          <div className="mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 block mb-1">
              Question {totalAnswered + 1}
            </span>
            <h3 className="text-lg font-bold leading-snug">{currentQuestion.questionText}</h3>
          </div>

          {/* Option buttons */}
          <div className="grid grid-cols-1 gap-2.5">
            {currentQuestion.options.map((opt, idx) => {
              let btnStyle = darkMode ? 'bg-slate-800 hover:bg-slate-700 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 border-slate-200';

              if (isAnswered) {
                if (opt.isCorrect) {
                  btnStyle = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                } else if (selectedAnswer === idx) {
                  btnStyle = 'bg-rose-600/30 border-rose-500 text-rose-300 font-bold';
                } else {
                  btnStyle = 'opacity-40 border-transparent';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt.label}</span>
                  {isAnswered && opt.isCorrect && <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />}
                  {isAnswered && !opt.isCorrect && selectedAnswer === idx && <XCircle className="text-rose-400 shrink-0" size={18} />}
                </button>
              );
            })}
          </div>

          {/* Result Action Bar */}
          {isAnswered && (
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  onClose();
                  onInspectElement(currentQuestion.target);
                }}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              >
                Inspect {currentQuestion.target.name} details ➔
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
              >
                Next Question ➔
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
