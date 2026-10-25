/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Home Dashboard View
 * Features:
 * - Large interactive Soroban preview with live value breakdown
 * - Prominent "Start Learning" & "Continue Lesson"
 * - Daily Practice challenge progress tracker
 * - Recommended next activity
 * - Level mastery summary & quick shortcuts
 */

import React, { useState } from 'react';
import {
  Play,
  Sparkles,
  BookOpen,
  Trophy,
  Brain,
  Bot,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { createEmptyAbacus, setAbacusFromNumber } from '../engine/abacusEngine';
import { Abacus } from '../components/abacus/Abacus';
import { AbacusToolbar } from '../components/abacus/AbacusToolbar';
import { CURRICULUM } from '../data/curriculum';

export const DashboardView: React.FC = () => {
  const { setActiveSection, progress, settings } = useApp();

  // Dashboard abacus interactive preview state (initialized to 7 for quick recognition)
  const [abacusState, setAbacusState] = useState(() =>
    setAbacusFromNumber(createEmptyAbacus(7, 4), 7)
  );
  const [history, setHistory] = useState([abacusState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleAbacusChange = (newState: typeof abacusState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setAbacusState(newState);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setAbacusState(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setAbacusState(history[historyIndex + 1]);
    }
  };

  // Find next uncompleted lesson
  let nextLesson = CURRICULUM[0].lessons[0];
  for (const lvl of CURRICULUM) {
    const uncompleted = lvl.lessons.find(l => !progress.completedLessons.includes(l.id));
    if (uncompleted) {
      nextLesson = uncompleted;
      break;
    }
  }

  const dailyDone = Math.min(progress.totalAttempted % settings.dailyGoal || 0, settings.dailyGoal);
  const dailyPercent = Math.min(100, Math.round((dailyDone / settings.dailyGoal) * 100));

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto px-4 py-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-amber-700 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-amber-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              Learn → Visualise → Practise → Master
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Welcome back, {settings.learnerName}!
            </h1>
            <p className="text-amber-100 text-sm md:text-base leading-relaxed">
              Explore the Japanese Soroban. Move realistic beads, observe place values evolve live, and train your mind for instant mental arithmetic.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveSection('learn')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 hover:bg-amber-100 font-extrabold rounded-xl text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Continue Lesson ({nextLesson.title})</span>
              </button>
              <button
                onClick={() => setActiveSection('practice')}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-white font-bold rounded-xl text-sm border border-white/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Daily Practice</span>
              </button>
            </div>
          </div>

          {/* Quick Level Card */}
          <div className="bg-slate-950/60 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center min-w-[200px] text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-inner mb-2">
              {progress.level}
            </div>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Level {progress.level}
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {progress.xp} Total XP
            </span>
            {/* Daily Goal bar */}
            <div className="w-full mt-3 pt-3 border-t border-slate-800 text-left">
              <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                <span>Daily Goal</span>
                <span className="font-bold text-amber-300">{dailyDone}/{settings.dailyGoal}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${dailyPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Primary Feature: Interactive Abacus Preview & Live Visualisation */}
      <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>Interactive Soroban</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
                Live Physical Model
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click upper bead (5) or lower beads (1 each). Value and place formulas update immediately.
            </p>
          </div>
          <button
            onClick={() => setActiveSection('abacus')}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30 transition-colors"
          >
            <span>Open Full Sandbox</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Toolbar */}
        <AbacusToolbar
          state={abacusState}
          onChange={handleAbacusChange}
          history={history}
          historyIndex={historyIndex}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* Interactive SVG Abacus */}
        <div className="pt-2">
          <Abacus
            state={abacusState}
            onChange={handleAbacusChange}
            palette={settings.beadPalette}
            theme={settings.theme}
            showValues={settings.showRodValues}
            interactive={true}
          />
        </div>
      </section>

      {/* 4 Quick Launch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Curriculum */}
        <div
          onClick={() => setActiveSection('learn')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-amber-400 transition-colors text-base">
            Learn Step-by-Step
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            13 progressive levels from number recognition to multi-digit multiplication and decimals.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-amber-400">
            <span>{progress.completedLessons.length} Lessons Finished</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Practice Generator */}
        <div
          onClick={() => setActiveSection('practice')}
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors text-base">
            Practice Mathematics
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Unlimited customizable questions with 4-stage intelligent hints & bead assistance.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-emerald-400">
            <span>{progress.totalAttempted} Solved</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Mental Abacus Studio */}
        <div
          onClick={() => setActiveSection('mental')}
          className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors text-base">
            Mental Abacus (Anzan)
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Train your inner mind eye with flash numbers, rapid arithmetic, and listen-and-calculate.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-sky-400">
            <span>Start Visualizing</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: AI Learning Buddy */}
        <div
          onClick={() => setActiveSection('ai_tutor')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer group transition-all hover:-translate-y-1 shadow-lg"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors text-base">
            BeadWise Tutor
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            Ask questions, understand why five's/ten's complements work, and get encouraging tips.
          </p>
          <div className="mt-3 flex items-center text-xs font-semibold text-purple-400">
            <span>Ask Tutor</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
