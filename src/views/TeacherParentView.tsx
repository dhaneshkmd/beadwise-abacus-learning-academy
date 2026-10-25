/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Teacher & Parent Dashboard
 * Features:
 * - Learner level assignment and daily practice goal configuration
 * - Printable Practice Worksheets with optional Answer Key
 * - Progress export summary
 * - Student privacy guarantee
 */

import React, { useState } from 'react';
import {
  Users,
  Printer,
  Download,
  Target,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  FileText,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateQuestion, PracticeQuestion } from '../data/practiceGenerator';

export const TeacherParentView: React.FC = () => {
  const { progress, settings, updateSettings } = useApp();

  const [studentName, setStudentName] = useState(settings.learnerName);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [worksheetQuestions, setWorksheetQuestions] = useState<PracticeQuestion[]>(() => {
    return Array.from({ length: 12 }, () => generateQuestion('mixed'));
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ learnerName: studentName, dailyGoal });
  };

  const handleGenerateNewWorksheet = () => {
    setWorksheetQuestions(Array.from({ length: 12 }, () => generateQuestion('mixed')));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportData = () => {
    const summary = {
      studentName: settings.learnerName,
      level: progress.level,
      xp: progress.xp,
      streak: progress.streak,
      totalAttempted: progress.totalAttempted,
      totalCorrect: progress.totalCorrect,
      accuracy: progress.totalAttempted > 0 ? `${Math.round((progress.totalCorrect / progress.totalAttempted) * 100)}%` : '100%',
      completedLessons: progress.completedLessons,
      badges: progress.badges,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beadwise_progress_${studentName.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Teacher & Parent Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Monitor learning goals, assign daily targets, and generate customized printable Soroban practice worksheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Export Progress</span>
          </button>
        </div>
      </div>

      {/* Goal & Profile Setting Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 no-print">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <span>Learner Profile & Goals</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Student / Child Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Daily Practice Target (Questions)
            </label>
            <input
              type="number"
              min="3"
              max="100"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value, 10) || 10)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Save Goals
            </button>
          </div>
        </form>
      </div>

      {/* Printable Practice Worksheet Generator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 no-print">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-sky-400" />
              <span>Printable Abacus Practice Sheet</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate offline paper worksheets for homework, classroom quizzes, and tactile Soroban practice.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAnswerKey(!showAnswerKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showAnswerKey
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Answer Key: {showAnswerKey ? 'Visible' : 'Hidden'}
            </button>

            <button
              onClick={handleGenerateNewWorksheet}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Regenerate Problems
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Worksheet</span>
            </button>
          </div>
        </div>

        {/* The Printable Page Area */}
        <div className="bg-white text-slate-950 p-6 md:p-8 rounded-2xl shadow-xl print-page border border-slate-200 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">
                BeadWise Soroban Mathematics Worksheet
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Practice placing beads, applying 5's and 10's complements, and calculating totals.
              </p>
            </div>
            <div className="text-right text-xs text-slate-700 space-y-1">
              <div>Name: ______________________</div>
              <div>Date: _________ Score: ______/12</div>
            </div>
          </div>

          {/* 12 Question Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pt-2">
            {worksheetQuestions.map((q, idx) => (
              <div
                key={idx}
                className="border-2 border-slate-300 rounded-xl p-3 flex flex-col justify-between min-h-[110px]"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b pb-1">
                  <span>Problem #{idx + 1}</span>
                  <span className="text-[10px] text-slate-400">{q.category}</span>
                </div>

                <div className="text-center font-mono font-black text-2xl text-slate-900 my-auto">
                  {q.prompt} =
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Answer:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {showAnswerKey ? q.correctAnswer : '_______'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-300 pt-3 text-[11px] text-slate-500 flex justify-between items-center">
            <span>BeadWise Digital Abacus Academy • Free Educational Resource</span>
            <span>https://beadwise.academy</span>
          </div>
        </div>
      </div>

      {/* Children Privacy Assurance */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-400 no-print">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Child Privacy Commitment:</strong> BeadWise operates entirely client-side for anonymous practice. No personal child data or birthdates are collected or shared with external parties.
        </span>
      </div>
    </div>
  );
};
