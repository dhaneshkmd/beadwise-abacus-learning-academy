/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Practice Mathematics View
 * - Unlimited deterministic question generator across 12 operation categories
 * - 4 distinct answer modes: Mode A (Solve with Beads), Mode B (Keypad), Mode C (Watch & Repeat), Mode D (Mental)
 * - 4-stage intelligent hint system (Gentle Clue, Strategy, Visual Bead Highlight, Full Explanation)
 * - Performance analytics and mistake tracking
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Award,
  ChevronRight,
  Flame,
  Volume2,
  Sliders,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  OperationCategory,
  PracticeAnswerMode,
  PracticeQuestion,
  generateQuestion,
} from '../data/practiceGenerator';
import { Abacus } from '../components/abacus/Abacus';
import { AbacusToolbar } from '../components/abacus/AbacusToolbar';
import {
  AbacusState,
  createEmptyAbacus,
  getNumberFromAbacus,
  setAbacusFromNumber,
  resetAbacus,
} from '../engine/abacusEngine';
import { sounds } from '../engine/soundEngine';

export const PracticeView: React.FC = () => {
  const { progress, recordExerciseAttempt, settings, addXP } = useApp();

  // Configuration
  const [category, setCategory] = useState<OperationCategory>('fives_complement');
  const [answerMode, setAnswerMode] = useState<PracticeAnswerMode>('beads');
  const [presetCount, setPresetCount] = useState<number>(10);

  // Active Session
  const [question, setQuestion] = useState<PracticeQuestion>(() => generateQuestion('fives_complement'));
  const [questionIndex, setQuestionIndex] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);

  // User input
  const [abacusState, setAbacusState] = useState<AbacusState>(() =>
    createEmptyAbacus(settings.defaultRodCount, Math.floor(settings.defaultRodCount * 0.65))
  );
  const [keypadInput, setKeypadInput] = useState('');
  const [revealedHints, setRevealedHints] = useState<number>(0); // 0..4
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // History stack for the practice abacus
  const [history, setHistory] = useState<AbacusState[]>([abacusState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // When question changes, initialize abacus with initialValue if applicable
  const loadNextQuestion = () => {
    const nextQ = generateQuestion(category);
    setQuestion(nextQ);
    setRevealedHints(0);
    setSubmitted(false);
    setKeypadInput('');

    const newAbacus = setAbacusFromNumber(
      createEmptyAbacus(settings.defaultRodCount, Math.floor(settings.defaultRodCount * 0.65)),
      nextQ.initialValue || 0
    );
    setAbacusState(newAbacus);
    setHistory([newAbacus]);
    setHistoryIndex(0);
  };

  const handleAbacusChange = (newState: AbacusState) => {
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

  // Submit Answer
  const handleSubmit = () => {
    if (submitted) return;

    let userNum = 0;
    if (answerMode === 'beads') {
      userNum = getNumberFromAbacus(abacusState);
    } else {
      userNum = parseFloat(keypadInput) || 0;
    }

    const correct = Math.abs(userNum - question.correctAnswer) < 0.001;
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      sounds.playSuccess();
      setSessionScore(s => s + 1);
      recordExerciseAttempt(true, revealedHints > 0);
    } else {
      sounds.playError();
      recordExerciseAttempt(false, revealedHints > 0, {
        question: question.prompt,
        userAnswer: userNum,
        correctAnswer: question.correctAnswer,
        category: question.category,
      });
    }
  };

  const categories: { id: OperationCategory; label: string }[] = [
    { id: 'fives_complement', label: "Five's Complement (+5/-5)" },
    { id: 'tens_complement', label: "Ten's Complement (Carry/Borrow)" },
    { id: 'add_single', label: 'Single Digit Addition' },
    { id: 'sub_single', label: 'Single Digit Subtraction' },
    { id: 'add_two_digit', label: 'Two Digit Addition' },
    { id: 'sub_multidigit', label: 'Multi-Digit Subtraction' },
    { id: 'multiplication', label: 'Multiplication' },
    { id: 'division', label: 'Division' },
    { id: 'decimals', label: 'Decimals' },
    { id: 'percentages', label: 'Percentages' },
    { id: 'mixed', label: 'Mixed Operations' },
  ];

  const modes: { id: PracticeAnswerMode; label: string; desc: string }[] = [
    { id: 'beads', label: 'Mode A: Solve with Beads', desc: 'Move beads until abacus matches the answer' },
    { id: 'keypad', label: 'Mode B: Numeric Keypad', desc: 'Type your numerical answer' },
    { id: 'mental', label: 'Mode D: Mental Answer', desc: 'Calculate in your mind without moving beads' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header and Category Filters */}
      <div className="space-y-4 border-b border-slate-800 pb-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Sparkles className="w-7 h-7 text-amber-400" />
              <span>Unlimited Practice Generator</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Deterministic question generator with multi-stage hints and realistic bead verification.
            </p>
          </div>

          {/* Session Stats HUD */}
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>Score: {sessionScore}/{questionIndex}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1.5 text-sky-400">
              <Clock className="w-4 h-4" />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCategory(c.id);
                loadNextQuestion();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                category === c.id
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Answer Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Answer Mode:</span>
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => setAnswerMode(m.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                answerMode === m.id
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Exercise Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Question Prompt Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/70 p-5 rounded-2xl border border-slate-800">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Question #{questionIndex}
            </span>
            <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-wide">
              {question.prompt} = <span className="text-amber-400">?</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (revealedHints < 4) {
                  setRevealedHints(prev => prev + 1);
                  sounds.playBeadClick(true, true);
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Hint ({revealedHints}/4)</span>
            </button>

            <button
              onClick={() => {
                setQuestionIndex(i => i + 1);
                loadNextQuestion();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              Skip
            </button>
          </div>
        </div>

        {/* 4-Stage Progressive Hint Display */}
        {revealedHints > 0 && (
          <div className="space-y-2 animate-fadeIn">
            {revealedHints >= 1 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                <strong>Hint 1 (Gentle Guidance):</strong> {question.hints[0]}
              </div>
            )}
            {revealedHints >= 2 && (
              <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-xl text-xs text-sky-200">
                <strong>Hint 2 (Strategy & Rule):</strong> {question.hints[1]}
              </div>
            )}
            {revealedHints >= 3 && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200">
                <strong>Hint 3 (Visual Bead Hint):</strong> {question.hints[2]}
              </div>
            )}
            {revealedHints >= 4 && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
                <strong>Hint 4 (Full Explanation):</strong> {question.hints[3]}
              </div>
            )}
          </div>
        )}

        {/* Answer Input based on mode */}
        {answerMode === 'beads' && (
          <div className="space-y-4">
            <AbacusToolbar
              state={abacusState}
              onChange={handleAbacusChange}
              history={history}
              historyIndex={historyIndex}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />

            <div className="py-2">
              <Abacus
                state={abacusState}
                onChange={handleAbacusChange}
                palette={settings.beadPalette}
                theme={settings.theme}
                showValues={settings.showRodValues}
                interactive={!submitted}
              />
            </div>
          </div>
        )}

        {answerMode === 'keypad' && (
          <div className="max-w-xs mx-auto space-y-4">
            <div className="text-center font-mono text-3xl font-bold bg-slate-950 p-4 rounded-2xl border border-slate-800 text-white min-h-[64px] flex items-center justify-center">
              {keypadInput || <span className="text-slate-600">Enter Number</span>}
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, '⌫'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === '⌫') {
                      setKeypadInput(prev => prev.slice(0, -1));
                    } else {
                      setKeypadInput(prev => prev + key);
                    }
                    sounds.playBeadClick(false, true);
                  }}
                  className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-lg active:scale-95 transition-all"
                >
                  {key}
                </button>
              ))}
            </div>
          </div>
        )}

        {answerMode === 'mental' && (
          <div className="space-y-4 text-center max-w-md mx-auto">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <Eye className="w-8 h-8 text-sky-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Mental Calculation Mode</h4>
              <p className="text-xs text-slate-300">
                Picture the Soroban in your mind. Mentally move the beads to solve <strong className="text-amber-300">{question.prompt}</strong>.
              </p>
              <input
                type="number"
                placeholder="Type your mental answer"
                value={keypadInput}
                onChange={(e) => setKeypadInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Submit & Next Button */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-xl text-sm shadow-xl transition-all cursor-pointer"
            >
              Check Answer
            </button>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div
                className={`flex items-center gap-2 text-sm font-bold p-3 rounded-xl ${
                  isCorrect
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Correct! (+15 XP) {question.explanation}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Incorrect. The answer is {question.correctAnswer}. Check Hint 4 for step-by-step reasoning!</span>
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  setQuestionIndex(i => i + 1);
                  loadNextQuestion();
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold rounded-xl text-sm shadow-lg transition-all cursor-pointer"
              >
                Next Question →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
