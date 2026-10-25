/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Student Progress Dashboard View
 * Analytics, accuracy rates, XP milestones, badges, skill mastery,
 * and Mistakes Bank with "Practice Again" retry action.
 */

import React from 'react';
import {
  BarChart3,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Sparkles,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRICULUM } from '../data/curriculum';

export const ProgressView: React.FC = () => {
  const { progress, setActiveSection, removeMistake } = useApp();

  const accuracy = progress.totalAttempted > 0
    ? Math.round((progress.totalCorrect / progress.totalAttempted) * 100)
    : 100;

  const totalLessons = CURRICULUM.reduce((acc, lvl) => acc + lvl.lessons.length, 0);
  const lessonsCompletedCount = progress.completedLessons.length;
  const curriculumPercent = Math.min(100, Math.round((lessonsCompletedCount / totalLessons) * 100));

  const allBadges = [
    { title: 'Bead Beginner', desc: 'Completed Level 0 Soroban discovery', icon: '🧮' },
    { title: 'Number Explorer', desc: 'Represented single & multi-digit numbers', icon: '🌟' },
    { title: 'Addition Champion', desc: 'Solved direct addition problems', icon: '➕' },
    { title: 'Complement Master', desc: "Mastered Five's & Ten's complements", icon: '💎' },
    { title: 'Multiplication Wizard', desc: 'Calculated multi-digit partial products', icon: '⚡' },
    { title: 'Mental Abacus Expert', desc: 'Performed rapid Flash Anzan calculations', icon: '🧠' },
    { title: 'Speed Calculator', desc: 'Scored high in timed challenge sprints', icon: '🚀' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-emerald-400" />
          <span>My Progress & Analytics</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Detailed metrics of your abacus learning journey, accuracy rates, and badges.
        </p>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Level & XP */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Current Level</span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            Level {progress.level}
          </div>
          <p className="text-[11px] text-slate-500">{progress.xp} Total XP Points</p>
        </div>

        {/* KPI 2: Accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Calculation Accuracy</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {accuracy}%
          </div>
          <p className="text-[11px] text-slate-500">{progress.totalCorrect} correct of {progress.totalAttempted}</p>
        </div>

        {/* KPI 3: Lessons */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Curriculum Progress</span>
          <div className="text-3xl font-black text-sky-400 font-mono">
            {curriculumPercent}%
          </div>
          <p className="text-[11px] text-slate-500">{lessonsCompletedCount} of {totalLessons} lessons done</p>
        </div>

        {/* KPI 4: Streak */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-slate-400 font-semibold">Active Streak</span>
          <div className="text-3xl font-black text-orange-400 font-mono flex items-center gap-1.5">
            <Flame className="w-6 h-6 fill-orange-400" />
            <span>{progress.streak} Days</span>
          </div>
          <p className="text-[11px] text-slate-500">{progress.hintsUsed} hints used total</p>
        </div>
      </div>

      {/* Skill Mastery Breakdown Bars */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-400" />
          <span>Skill Mastery Areas</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Number Representation (0-99)', pct: Math.min(100, progress.level * 25) },
            { label: 'Direct Addition & Subtraction', pct: Math.min(100, Math.max(30, progress.level * 20)) },
            { label: "Five's Complement (+5/-5)", pct: Math.min(100, Math.max(20, progress.level * 18)) },
            { label: "Ten's Complement (Carry & Borrow)", pct: Math.min(100, Math.max(15, progress.level * 15)) },
            { label: 'Multiplication & Division', pct: Math.min(100, Math.max(10, progress.level * 12)) },
            { label: 'Mental Abacus (Flash Anzan)', pct: Math.min(100, Math.max(10, progress.level * 10)) },
          ].map((skill, idx) => (
            <div key={idx} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{skill.label}</span>
                <span className="text-amber-400 font-mono">{skill.pct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${skill.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mistakes Bank & Review */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>Mistakes Bank ({progress.mistakes.length})</span>
          </h3>
          <span className="text-xs text-slate-400">
            Learn from your errors and practice them again!
          </span>
        </div>

        {progress.mistakes.length === 0 ? (
          <div className="text-center py-8 bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            🎉 Great job! No incorrect calculations recorded right now.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {progress.mistakes.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-white text-sm font-mono">{m.question}</div>
                  <div className="text-slate-400">
                    Your answer: <span className="text-rose-400 line-through font-mono">{m.userAnswer}</span> | Correct: <span className="text-emerald-400 font-bold font-mono">{m.correctAnswer}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      removeMistake(m.id);
                      setActiveSection('practice');
                    }}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-bold transition-colors cursor-pointer"
                  >
                    Retry Now
                  </button>
                  <button
                    onClick={() => removeMistake(m.id)}
                    className="text-slate-500 hover:text-slate-300 p-1"
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievement Badges Collection */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Earned Achievement Badges</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allBadges.map((badge) => {
            const unlocked = progress.badges.includes(badge.title);

            return (
              <div
                key={badge.title}
                className={`p-4 rounded-2xl border text-center space-y-2 transition-all ${
                  unlocked
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800 opacity-40'
                }`}
              >
                <div className="text-3xl">{badge.icon}</div>
                <div className="font-bold text-sm text-white">{badge.title}</div>
                <p className="text-[11px] text-slate-400 leading-tight">{badge.desc}</p>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  {unlocked ? '✓ Unlocked' : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
