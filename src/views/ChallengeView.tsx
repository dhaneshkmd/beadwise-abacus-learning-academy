/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Challenge Mode - Timed Speed Calculations & Combo Runs
 */

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  Zap,
  RotateCcw,
  Award,
  Play,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateQuestion, PracticeQuestion } from '../data/practiceGenerator';
import { sounds } from '../engine/soundEngine';

export const ChallengeView: React.FC = () => {
  const { addXP, recordExerciseAttempt } = useApp();

  const [duration, setDuration] = useState<number>(60);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentQ, setCurrentQ] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [personalBest, setPersonalBest] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('beadwise_pb') || '0', 10);
    } catch {
      return 0;
    }
  });

  // Countdown timer
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsFinished(true);
          setIsPlaying(false);
          sounds.playSuccess();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  // Update Personal Best
  useEffect(() => {
    if (isFinished && score > personalBest) {
      setPersonalBest(score);
      try {
        localStorage.setItem('beadwise_pb', score.toString());
      } catch {}
    }
  }, [isFinished, score, personalBest]);

  const startChallenge = (sec: number) => {
    setDuration(sec);
    setTimeLeft(sec);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsFinished(false);
    setIsPlaying(true);
    setUserAnswer('');
    setCurrentQ(generateQuestion('mixed'));
    sounds.playBeadClick(true, true);
  };

  const handleKeypad = (val: string) => {
    if (!isPlaying) return;
    if (val === '⌫') {
      setUserAnswer((prev) => prev.slice(0, -1));
    } else if (val === 'ENTER') {
      submitAnswer();
    } else {
      setUserAnswer((prev) => prev + val);
    }
  };

  const submitAnswer = () => {
    if (!currentQ || userAnswer === '') return;
    const parsed = parseFloat(userAnswer);
    const correct = Math.abs(parsed - currentQ.correctAnswer) < 0.001;

    if (correct) {
      sounds.playSuccess();
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > maxCombo) setMaxCombo(newCombo);
      const points = 10 * (newCombo >= 3 ? 2 : 1);
      setScore((s) => s + points);
      addXP(points);
      recordExerciseAttempt(true, false);
    } else {
      sounds.playError();
      setCombo(0);
      recordExerciseAttempt(false, false, {
        question: currentQ.prompt,
        userAnswer: parsed,
        correctAnswer: currentQ.correctAnswer,
        category: currentQ.category,
      });
    }

    setUserAnswer('');
    setCurrentQ(generateQuestion('mixed'));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Trophy className="w-7 h-7 text-amber-400" />
            <span>Speed Calculation Challenge</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Test your Soroban reflexes! Build combo streaks and achieve personal bests.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Personal Best: {personalBest} pts</span>
        </div>
      </div>

      {!isPlaying && !isFinished && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center mx-auto text-slate-950 shadow-lg">
            <Zap className="w-8 h-8 fill-slate-950" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-white">Choose Your Sprint</h2>
            <p className="text-xs text-slate-400">
              Solve as many questions as you can before the clock runs out. Consecutive correct answers award 2X combo points!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto">
            <button
              onClick={() => startChallenge(60)}
              className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-all text-left space-y-1 cursor-pointer group"
            >
              <div className="flex justify-between items-center text-white font-bold text-lg">
                <span>60s Sprint</span>
                <Clock className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">Fast 1-minute calculation sprint</p>
            </button>

            <button
              onClick={() => startChallenge(120)}
              className="p-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-all text-left space-y-1 cursor-pointer group"
            >
              <div className="flex justify-between items-center text-white font-bold text-lg">
                <span>120s Marathon</span>
                <Trophy className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-xs text-slate-400">High endurance mastery test</p>
            </button>
          </div>
        </div>
      )}

      {isPlaying && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          {/* HUD Banner */}
          <div className="flex items-center justify-between bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            {/* Timer */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400 animate-pulse" />
              <span className="font-mono text-2xl font-black text-white">{timeLeft}s</span>
            </div>

            {/* Combo */}
            <div className="flex items-center gap-2">
              <Flame className={`w-5 h-5 ${combo >= 3 ? 'text-orange-500 animate-bounce' : 'text-slate-500'}`} />
              <span className="text-xs font-bold text-slate-300">
                Combo: <strong className="text-amber-400 text-sm">{combo}x</strong>
              </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="font-mono text-2xl font-black text-amber-300">{score} pts</span>
            </div>
          </div>

          {/* Prompt */}
          <div className="text-center py-6 space-y-2">
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-wider">
              {currentQ.prompt} = <span className="text-amber-400">{userAnswer || '?'}</span>
            </div>
          </div>

          {/* On-screen Keypad */}
          <div className="max-w-xs mx-auto grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, 'ENTER'].map((k) => (
              <button
                key={k}
                onClick={() => handleKeypad(k.toString())}
                className={`p-3.5 rounded-xl font-bold font-mono text-lg transition-all active:scale-95 ${
                  k === 'ENTER'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white text-sm'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      {isFinished && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center mx-auto text-slate-950 shadow-xl">
            <Trophy className="w-10 h-10 fill-slate-950" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">Challenge Completed!</h2>
            <p className="text-slate-400 text-sm">Great effort! You earned {score} XP points.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="text-slate-500">Final Score</div>
              <div className="text-xl font-bold text-amber-300 font-mono">{score}</div>
            </div>
            <div>
              <div className="text-slate-500">Max Combo</div>
              <div className="text-xl font-bold text-sky-400 font-mono">{maxCombo}x</div>
            </div>
            <div>
              <div className="text-slate-500">Duration</div>
              <div className="text-xl font-bold text-white font-mono">{duration}s</div>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => startChallenge(duration)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
