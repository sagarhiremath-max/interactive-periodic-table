import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Atom } from 'lucide-react';
import { ELEMENTS_DATA } from '../data/elements';

export const NotFoundPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const clean = query.trim().toLowerCase();
    const match = ELEMENTS_DATA.find(
      (el) =>
        String(el.number) === clean ||
        el.symbol.toLowerCase() === clean ||
        el.name.toLowerCase().includes(clean)
    );
    if (match) {
      navigate(`/element/${match.number}`);
    } else {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center font-sans select-none animate-in fade-in duration-300">
      <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_32px_rgba(6,182,212,0.25)]">
        <Atom className="w-12 h-12 animate-spin-slow" />
      </div>

      <span className="px-3 py-1 text-xs font-mono font-bold rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 mb-3">
        404 — Quantum State Undefined
      </span>

      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
        Element or Page Not Found
      </h1>

      <p className="text-slate-400 max-w-lg text-sm sm:text-base mb-8 leading-relaxed">
        The requested path or chemical element does not exist in the periodic table dataset. Explore valid elements from Hydrogen (#1) to Oganesson (#118).
      </p>

      {/* Quick Search */}
      <form onSubmit={handleSearch} className="w-full max-w-md relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, symbol, or atomic number (e.g. Os, 76, Gold)..."
          className="w-full px-4 py-3 pl-11 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all cursor-pointer"
        >
          Go
        </button>
      </form>

      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Periodic Table Matrix</span>
        </Link>
      </div>
    </div>
  );
};
