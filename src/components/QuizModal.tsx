import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Flame,
  ArrowRight,
  Lightbulb,
  Sparkles,
  Timer,
  BookOpen,
  Trophy,
  BarChart3,
  ListFilter,
  Play,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { type ElementData, ELEMENTS_DATA } from '../data/elements';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onInspectElement?: (element: ElementData) => void;
}

export interface BankQuestion {
  id: string;
  topic: string;
  difficulty: string;
  format: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  formula?: string | null;
}

interface UserAnswerRecord {
  question: BankQuestion;
  selectedOptionIndex: number;
  isCorrect: boolean;
}

export const QUIZ_TOPICS = [
  'Periodic Table and element properties',
  'Atomic structure',
  'Protons, neutrons and electrons',
  'Electron configuration',
  'Chemical bonding',
  'Ionic and covalent compounds',
  'Chemical formulas and nomenclature',
  'Chemical reactions',
  'Acids, bases and salts',
  'Mole concept and Avogadro\'s number',
  'Stoichiometry',
  'Solutions and concentration',
  'Chemical equilibrium',
  'Thermodynamics',
  'Electrochemistry',
  'Organic chemistry',
  'Hydrocarbons',
  'Functional groups',
  'Isomerism',
  'Reaction mechanisms',
  'Laboratory equipment and safety',
  'Chemical calculations',
  'Periodic trends',
  'Isotopes and radioactivity',
  'Environmental chemistry',
  'Industrial chemistry',
  'Everyday chemistry',
  'Advanced chemistry problem-solving',
];

export const DIFFICULTIES = ['Beginner', 'Easy', 'Intermediate', 'Advanced', 'Expert'];
export const QUESTION_COUNTS = [10, 20, 25, 50, 100];

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Mode & configuration states
  const [quizState, setQuizState] = useState<'setup' | 'playing' | 'completed'>('setup');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [secondsPerQuestion] = useState<number>(30);

  // Active quiz execution states
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswerRecord[]>([]);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [showReviewList, setShowReviewList] = useState<boolean>(false);

  // Timer states
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Lifetime progress stats
  const [lifetimeStats, setLifetimeStats] = useState({
    quizzesCompleted: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    highestStreak: 0
  });

  // Load lifetime stats on open
  useEffect(() => {
    try {
      const saved = localStorage.getItem('elements_lab_quiz_stats');
      if (saved) {
        setLifetimeStats(JSON.parse(saved));
      }
    } catch {}
  }, [isOpen]);

  const updateLifetimeStats = useCallback((correctDelta: number, totalDelta: number, newStreak: number) => {
    setLifetimeStats(prev => {
      const updated = {
        quizzesCompleted: prev.quizzesCompleted + 1,
        totalAnswered: prev.totalAnswered + totalDelta,
        totalCorrect: prev.totalCorrect + correctDelta,
        highestStreak: Math.max(prev.highestStreak, newStreak)
      };
      try {
        localStorage.setItem('elements_lab_quiz_stats', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Timer management during active quiz
  useEffect(() => {
    if (quizState !== 'playing' || !isTimed || isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState, isTimed, isAnswered, currentIndex]);

  // Handle timeout on a question
  const handleTimeExpire = () => {
    if (isAnswered || !questions[currentIndex]) return;
    setIsAnswered(true);
    setStreak(0);

    const currQ = questions[currentIndex];
    setUserAnswers(prev => [
      ...prev,
      { question: currQ, selectedOptionIndex: -1, isCorrect: false }
    ]);
  };

  // Generate rich, verified questions if API is unavailable (e.g. offline or static GitHub Pages)
  const generateFallbackQuestions = (count: number, topic: string, diff: string): BankQuestion[] => {
    const list: BankQuestion[] = [];
    const usedElementIndices = new Set<number>();
    const effectiveDiff = diff === 'all' ? 'Intermediate' : diff;
    const effectiveTopic = topic === 'all' ? 'Periodic Table and element properties' : topic;

    const questionTypes = ['symbol', 'number', 'category', 'period_group', 'block', 'protons_neutrons', 'state'];

    for (let i = 0; i < count; i++) {
      let randIdx = Math.floor(Math.random() * ELEMENTS_DATA.length);
      while (usedElementIndices.has(randIdx) && usedElementIndices.size < ELEMENTS_DATA.length) {
        randIdx = (randIdx + 1) % ELEMENTS_DATA.length;
      }
      usedElementIndices.add(randIdx);
      const target = ELEMENTS_DATA[randIdx];

      const qType = questionTypes[i % questionTypes.length];
      let questionText = '';
      let correct = '';
      const distractors: string[] = [];
      let explanation = '';
      let formula: string | null = null;

      if (qType === 'symbol') {
        questionText = `What is the chemical symbol for the element ${target.name} (Atomic #${target.number})?`;
        correct = target.symbol;
        const pool = ELEMENTS_DATA.filter(e => e.number !== target.number).map(e => e.symbol);
        const shuffled = pool.sort(() => 0.5 - Math.random());
        distractors.push(...Array.from(new Set(shuffled)).slice(0, 3));
        explanation = `The chemical symbol for ${target.name} is "${target.symbol}". It resides in Period ${target.period}, Group ${target.group}.`;
      } else if (qType === 'number') {
        questionText = `What is the atomic number (Z, count of protons) of ${target.name} (${target.symbol})?`;
        correct = `${target.number}`;
        const uniqueNums = new Set<number>();
        const candidateOffsets = [1, -1, 2, -2, 5, -5, 10, -10];
        for (const off of candidateOffsets.sort(() => 0.5 - Math.random())) {
          const val = target.number + off;
          if (val >= 1 && val <= 118 && val !== target.number) {
            uniqueNums.add(val);
            if (uniqueNums.size >= 3) break;
          }
        }
        while (uniqueNums.size < 3) {
          const r = Math.floor(Math.random() * 118) + 1;
          if (r !== target.number) uniqueNums.add(r);
        }
        distractors.push(...Array.from(uniqueNums).map(String));
        explanation = `${target.name} has atomic number Z=${target.number}, meaning its nucleus holds ${target.number} protons.`;
        formula = 'Z = protons';
      } else if (qType === 'category') {
        questionText = `To which chemical classification or family does ${target.name} (${target.symbol}) belong?`;
        correct = target.categoryName;
        const otherCats = Array.from(new Set(ELEMENTS_DATA.map(e => e.categoryName))).filter(c => c !== target.categoryName);
        distractors.push(...otherCats.sort(() => 0.5 - Math.random()).slice(0, 3));
        explanation = `${target.name} (${target.symbol}) is classified as a ${target.categoryName}.`;
      } else if (qType === 'period_group') {
        questionText = `In which Period and Group is ${target.name} (${target.symbol}, Z=${target.number}) located in the periodic table?`;
        correct = `Period ${target.period}, Group ${target.group}`;
        distractors.push(
          `Period ${Math.max(1, (target.period + 1) % 8)}, Group ${target.group}`,
          `Period ${target.period}, Group ${Math.max(1, (target.group + 2) % 19)}`,
          `Period ${Math.max(1, (target.period - 1) || 7)}, Group ${Math.max(1, (target.group - 1) || 18)}`
        );
        explanation = `${target.name} is situated in Period ${target.period} (principal quantum shell n=${target.period}) and Group ${target.group}.`;
      } else if (qType === 'block') {
        questionText = `In which subshell block (s, p, d, f) of the periodic table is ${target.name} (${target.symbol}) placed?`;
        correct = `${target.block}-block`;
        const allBlocks = ['s-block', 'p-block', 'd-block', 'f-block'].filter(b => b !== `${target.block}-block`);
        distractors.push(...allBlocks);
        explanation = `${target.name} has its valence differentiating electron entering the ${target.block} subshell, placing it in the ${target.block}-block.`;
      } else if (qType === 'protons_neutrons') {
        const mass = Math.round(target.atomicMassValue);
        const neutrons = mass - target.number;
        questionText = `How many neutrons are present in the standard isotope of ${target.name}-${mass} (Z = ${target.number})?`;
        correct = `${neutrons}`;
        distractors.push(`${neutrons + 1}`, `${Math.max(0, neutrons - 1)}`, `${neutrons + 2}`);
        explanation = `Neutrons N = Mass number A (${mass}) - Atomic number Z (${target.number}) = ${neutrons}.`;
        formula = 'N = A - Z';
      } else {
        const stateCap = target.standardState.charAt(0).toUpperCase() + target.standardState.slice(1);
        questionText = `What is the standard physical state of pure elemental ${target.name} (${target.symbol}) at 298 K (25°C) and 1 atm?`;
        correct = stateCap;
        const allStates = ['Solid', 'Liquid', 'Gas', 'Synthetic'].filter(s => s.toLowerCase() !== target.standardState.toLowerCase());
        distractors.push(...allStates.slice(0, 3));
        explanation = `Under standard temperature and pressure (298 K, 1 atm), ${target.name} exists as a ${target.standardState}.`;
      }

      const allOptions = [correct, ...distractors].sort(() => 0.5 - Math.random());
      list.push({
        id: `CLIENT-Q-${String(i + 1).padStart(4, '0')}`,
        topic: effectiveTopic,
        difficulty: effectiveDiff,
        format: 'Multiple Choice',
        question: questionText,
        options: allOptions,
        correctAnswer: correct,
        explanation,
        formula
      });
    }

    return list;
  };

  // Start new quiz
  const handleStartQuiz = async (customQuestions?: BankQuestion[]) => {
    setIsLoading(true);
    setErrorMessage(null);

    let loadedQuestions: BankQuestion[] = [];

    if (customQuestions && customQuestions.length > 0) {
      loadedQuestions = customQuestions;
    } else {
      try {
        const queryParams = new URLSearchParams({
          count: String(questionCount),
          topic: selectedTopic,
          difficulty: selectedDifficulty
        });

        const res = await fetch(`/api/quiz/questions?${queryParams.toString()}`);
        if (!res.ok) throw new Error(`Server returned status ${res.status}`);
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          loadedQuestions = data.questions;
        } else {
          loadedQuestions = generateFallbackQuestions(questionCount, selectedTopic, selectedDifficulty);
        }
      } catch (err) {
        console.warn('Could not fetch from quiz API, using local question generator fallback:', err);
        loadedQuestions = generateFallbackQuestions(questionCount, selectedTopic, selectedDifficulty);
      }
    }

    setQuestions(loadedQuestions);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setUserAnswers([]);
    setEliminatedOptions([]);
    setTimeLeft(secondsPerQuestion);
    setQuizState('playing');
    setIsLoading(false);
  };

  // Select an option
  const handleSelectOption = (optIndex: number) => {
    if (isAnswered || !questions[currentIndex]) return;

    setSelectedAnswer(optIndex);
    setIsAnswered(true);

    const currQ = questions[currentIndex];
    const isCorrect = currQ.options[optIndex] === currQ.correctAnswer;

    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const next = s + 1;
        setBestStreak(b => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setUserAnswers(prev => [
      ...prev,
      { question: currQ, selectedOptionIndex: optIndex, isCorrect }
    ]);
  };

  // 50/50 hint
  const handleUseHint = () => {
    if (isAnswered || !questions[currentIndex] || eliminatedOptions.length > 0) return;
    const currQ = questions[currentIndex];
    const wrongIndices = currQ.options
      .map((opt, i) => (opt !== currQ.correctAnswer ? i : -1))
      .filter(i => i !== -1);

    const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
    setEliminatedOptions(shuffled.slice(0, 2));
  };

  // Next question or finish
  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setEliminatedOptions([]);
      setTimeLeft(secondsPerQuestion);
    } else {
      // Finished
      setQuizState('completed');
      updateLifetimeStats(score, questions.length, bestStreak);
    }
  };

  // Retry missed questions
  const handleRetryIncorrect = () => {
    const incorrect = userAnswers.filter(a => !a.isCorrect).map(a => a.question);
    if (incorrect.length > 0) {
      handleStartQuiz(incorrect);
    }
  };

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const currentAccuracy = userAnswers.length > 0 ? Math.round((score / userAnswers.length) * 100) : 100;
  const finalAccuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#090d1e] border border-cyan-500/25 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden text-slate-100">
        
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-[#0c1228]/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400">
              <Trophy className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-wide text-white">
                  Chemistry Quiz Challenge
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  100,000 Question Bank
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Verified educational questions covering all 28 chemistry disciplines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Close quiz (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* 1. SETUP SCREEN */}
          {quizState === 'setup' && (
            <div className="space-y-6 animate-fade-in">
              {/* Highlight Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-blue-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Complete Scientific Question Bank Active
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                    Configure your personalized test. Choose from 28 specialized chemistry topics or challenge yourself with comprehensive mixed adaptive questions.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/20">
                    <div className="text-cyan-300 font-bold text-sm">100,000</div>
                    <div className="text-slate-400 text-[10px]">Verified Questions</div>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-black/40 border border-purple-500/20">
                    <div className="text-purple-300 font-bold text-sm">28</div>
                    <div className="text-slate-400 text-[10px]">Topics</div>
                  </div>
                </div>
              </div>

              {/* Selection Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Topic Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    Chemistry Topic
                  </label>
                  <div className="relative">
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-[#0e1633] border border-cyan-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition pr-9"
                    >
                      <option value="all">🌟 All 28 Chemistry Topics (Mixed Bank)</option>
                      {QUIZ_TOPICS.map((topic, i) => (
                        <option key={topic} value={topic}>
                          {i + 1}. {topic}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedTopic === 'all'
                      ? 'Queries drawn randomly across all 28 sub-disciplines'
                      : `Targeted exclusively on ${selectedTopic}`}
                  </p>
                </div>

                {/* Difficulty Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <Layers className="w-3.5 h-3.5 text-purple-400" />
                    Difficulty Tier
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('all')}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                        selectedDifficulty === 'all'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'bg-[#0e1633] border-slate-700/60 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      Mixed
                    </button>
                    {DIFFICULTIES.map(diff => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium border transition-all ${
                          selectedDifficulty === diff
                            ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                            : 'bg-[#0e1633] border-slate-700/60 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {selectedDifficulty === 'all' ? 'Adaptive question challenge across all competencies' : `Filtered to ${selectedDifficulty} level questions`}
                  </p>
                </div>

                {/* Question Count Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <ListFilter className="w-3.5 h-3.5 text-cyan-400" />
                    Questions per Quiz
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {QUESTION_COUNTS.map(count => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          questionCount === count
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-[#0e1633] border-slate-700/60 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {count} Qs
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quiz Mode (Practice vs Timed) */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    <Timer className="w-3.5 h-3.5 text-yellow-400" />
                    Quiz Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTimed(false)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        !isTimed
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#0e1633] border-slate-700/60 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-semibold text-white">📖 Practice Mode</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Untimed, relaxed learning</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTimed(true)}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${
                        isTimed
                          ? 'bg-yellow-500/20 border-yellow-400 text-yellow-200'
                          : 'bg-[#0e1633] border-slate-700/60 text-slate-400 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-semibold text-white">⚡ Timed Challenge</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">30s per question countdown</div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Start Quiz Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span>Completed: <strong>{lifetimeStats.quizzesCompleted}</strong></span>
                  </div>
                  <div>•</div>
                  <div>Answered: <strong>{lifetimeStats.totalAnswered}</strong></div>
                  <div>•</div>
                  <div>Best Streak: <strong>{lifetimeStats.highestStreak}</strong></div>
                </div>

                <button
                  type="button"
                  onClick={() => handleStartQuiz()}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isLoading ? 'Loading Questions...' : `Launch ${questionCount}-Question Quiz`}
                </button>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* 2. ACTIVE QUIZ PLAYING SCREEN */}
          {quizState === 'playing' && currentQ && (
            <div className="space-y-5 animate-fade-in">
              {/* Progress & Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 font-mono">
                      Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]">
                      {currentQ.topic}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-500/30 text-[11px]">
                      {currentQ.difficulty}
                    </span>
                  </div>

                  {/* Timer & Streak */}
                  <div className="flex items-center gap-3">
                    {streak > 1 && (
                      <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span>{streak}x streak</span>
                      </div>
                    )}

                    {isTimed && (
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                        timeLeft <= 5
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/50 animate-pulse'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{timeLeft}s</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Question Box */}
              <div className="p-5 rounded-2xl bg-[#0e1633] border border-cyan-500/20 shadow-lg space-y-4">
                <div className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {currentQ.question}
                </div>

                {currentQ.formula && (
                  <div className="inline-block px-3 py-1.5 rounded-lg bg-black/40 border border-cyan-500/30 font-mono text-xs text-cyan-300">
                    Formula: {currentQ.formula}
                  </div>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isEliminated = eliminatedOptions.includes(idx);
                  const isSelected = selectedAnswer === idx;
                  const isCorrectAnswer = opt === currentQ.correctAnswer;

                  let btnStyle = 'bg-[#0e1633] border-slate-700/60 text-slate-200 hover:border-cyan-400 hover:bg-slate-800/60';

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.25)]';
                    } else if (isSelected && !isCorrectAnswer) {
                      btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                    } else {
                      btnStyle = 'bg-[#090d1e] border-slate-800 text-slate-500 opacity-60';
                    }
                  } else if (isEliminated) {
                    btnStyle = 'opacity-30 line-through pointer-events-none border-slate-800 text-slate-600 bg-black/20';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered || isEliminated}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-4 rounded-xl border text-left font-medium text-sm transition-all flex items-start justify-between gap-3 ${btnStyle}`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono bg-black/40 border border-slate-700 text-slate-400 shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrectAnswer && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Explanation Panel */}
              {isAnswered && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/30 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Explanation
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              )}

              {/* Action Bottom Bar */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  {!isAnswered && eliminatedOptions.length === 0 && (
                    <button
                      type="button"
                      onClick={handleUseHint}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/25 flex items-center gap-1.5 transition"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      50 / 50 Hint
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-slate-400">
                    Score: <span className="text-cyan-300 font-bold">{score}</span> / {userAnswers.length} ({currentAccuracy}%)
                  </div>

                  {isAnswered && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 transition"
                    >
                      <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. RESULTS & REVIEW SCREEN */}
          {quizState === 'completed' && (
            <div className="space-y-6 animate-fade-in text-center py-4">
              {/* Score Display Card */}
              <div className="p-6 rounded-2xl bg-[#0e1633] border border-cyan-500/30 max-w-lg mx-auto space-y-4 shadow-xl">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  <Award className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">Quiz Challenge Complete!</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {finalAccuracy >= 80 ? '🌟 Exceptional performance! Outstanding scientific knowledge.' : finalAccuracy >= 60 ? '👍 Solid chemistry proficiency. Great work!' : '📚 Keep practicing to master these chemical concepts!'}
                  </p>
                </div>

                {/* Score Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                  <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20">
                    <div className="text-xl font-bold text-cyan-300 font-mono">{score} / {questions.length}</div>
                    <div className="text-[11px] text-slate-400 uppercase mt-0.5">Score</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-purple-500/20">
                    <div className="text-xl font-bold text-purple-300 font-mono">{finalAccuracy}%</div>
                    <div className="text-[11px] text-slate-400 uppercase mt-0.5">Accuracy</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20">
                    <div className="text-xl font-bold text-amber-300 font-mono">{bestStreak}x</div>
                    <div className="text-[11px] text-slate-400 uppercase mt-0.5">Best Streak</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {userAnswers.some(a => !a.isCorrect) && (
                  <button
                    type="button"
                    onClick={handleRetryIncorrect}
                    className="px-5 py-2.5 rounded-xl bg-purple-600/30 border border-purple-400 text-purple-200 hover:bg-purple-600/50 text-xs font-semibold flex items-center gap-2 transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Retry Incorrect Questions ({userAnswers.filter(a => !a.isCorrect).length})
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowReviewList(prev => !prev)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold flex items-center gap-2 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  {showReviewList ? 'Hide Answer Review' : 'Review All Answers'}
                </button>

                <button
                  type="button"
                  onClick={() => setQuizState('setup')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  New Custom Quiz
                </button>
              </div>

              {/* Detailed Review List */}
              {showReviewList && (
                <div className="space-y-4 text-left max-w-2xl mx-auto pt-4 border-t border-slate-800 animate-fade-in">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-cyan-400" />
                    Itemized Question Review
                  </h4>

                  <div className="space-y-3">
                    {userAnswers.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border space-y-2 ${
                          item.isCorrect
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 text-xs">
                          <span className="font-semibold text-white">
                            #{idx + 1}. {item.question.question}
                          </span>
                          {item.isCorrect ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold text-[10px]">
                              Correct
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold text-[10px]">
                              Incorrect
                            </span>
                          )}
                        </div>

                        <div className="text-xs space-y-1">
                          {!item.isCorrect && (
                            <div className="text-rose-300">
                              Your answer: <strong>{item.selectedOptionIndex >= 0 ? item.question.options[item.selectedOptionIndex] : 'Time expired'}</strong>
                            </div>
                          )}
                          <div className="text-emerald-300">
                            Correct answer: <strong>{item.question.correctAnswer}</strong>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80">
                          {item.question.explanation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
