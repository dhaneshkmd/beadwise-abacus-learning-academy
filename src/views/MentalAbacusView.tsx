/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Mental Abacus (Flash Anzan) Studio
 * Features:
 * - Sequential rapid number flash practice (0.5s to 2.5s duration)
 * - Flash number-to-abacus mental visualization
 * - Listen-and-Calculate voice mode using SpeechSynthesis
 * - Hide/Reveal abacus visualization toggle
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  Zap,
  Play,
  RotateCcw,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Abacus } from '../components/abacus/Abacus';
import {
  createEmptyAbacus,
  setAbacusFromNumber,
  AbacusState,
} from '../engine/abacusEngine';
import { sounds } from '../engine/soundEngine';

export const MentalAbacusView: React.FC = () => {
  const { addXP, recordExerciseAttempt, settings } = useApp();

  // Settings for Anzan
  const [numTerms, setNumTerms] = useState<number>(3); // 3 to 7 terms
  const [flashSpeedMs, setFlashSpeedMs] = useState<number>(1000); // 800ms to 2000ms
  const [voiceMode, setVoiceMode] = useState<boolean>(false);
  const [hideAbacus, setHideAbacus] = useState<boolean>(true);

  // Anzan Session State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(-1);
  const [displayItem, setDisplayItem] = useState<string>('Ready');
  const [expectedTotal, setExpectedTotal] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [demonstrationAbacus, setDemonstrationAbacus] = useState<AbacusState>(() =>
    createEmptyAbacus(5, 4)
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate a new sequential chain
  const startAnzanRun = () => {
    const terms: number[] = [];
    let running = 0;
    for (let i = 0; i < numTerms; i++) {
      // Pick random 1-digit or simple 2-digit number
      const num = Math.floor(Math.random() * 8) + 1;
      terms.push(num);
      running += num;
    }

    setSequence(terms);
    setExpectedTotal(running);
    setCurrentIdx(-1);
    setDisplayItem('Get Ready...');
    setUserAnswer('');
    setSubmitted(false);
    setIsPlaying(true);
    setDemonstrationAbacus(createEmptyAbacus(5, 4));

    sounds.playBeadClick(true, true);
  };

  // Step through flashing sequence
  useEffect(() => {
    if (!isPlaying) return;

    if (currentIdx === -1) {
      timerRef.current = setTimeout(() => {
        setCurrentIdx(0);
      }, 1200);
      return;
    }

    if (currentIdx < sequence.length) {
      const term = sequence[currentIdx];
      setDisplayItem(`+${term}`);
      sounds.playBeadClick(term >= 5, true);

      if (voiceMode) {
        sounds.speak(`Plus ${term}`);
      }

      timerRef.current = setTimeout(() => {
        setCurrentIdx((idx) => idx + 1);
      }, flashSpeedMs);
    } else {
      // Finished flashing
      setDisplayItem('?');
      setIsPlaying(false);
      if (voiceMode) {
        sounds.speak('Equals what?');
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIdx, sequence, flashSpeedMs, voiceMode]);

  const handleVerify = () => {
    if (submitted) return;
    const parsed = parseInt(userAnswer, 10);
    const correct = parsed === expectedTotal;
    setIsCorrect(correct);
    setSubmitted(true);
    setDemonstrationAbacus(setAbacusFromNumber(createEmptyAbacus(5, 4), expectedTotal));

    if (correct) {
      sounds.playSuccess();
      addXP(25);
      recordExerciseAttempt(true, false);
    } else {
      sounds.playError();
      recordExerciseAttempt(false, false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-sky-400" />
            <span>Mental Abacus Studio (Flash Anzan)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Build rapid mental arithmetic intuition. Train your visual memory to calculate without looking at physical beads.
          </p>
        </div>

        {/* Hide Abacus Switch */}
        <button
          onClick={() => setHideAbacus(!hideAbacus)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            hideAbacus
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}
        >
          {hideAbacus ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{hideAbacus ? 'Mental Mode (Beads Hidden)' : 'Show Reference Beads'}</span>
        </button>
      </div>

      {/* Configuration Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Terms:</span>
          {[3, 4, 5, 7].map((num) => (
            <button
              key={num}
              onClick={() => setNumTerms(num)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                numTerms === num ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {num} numbers
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-medium">Flash Speed:</span>
          {[
            { label: '0.8s (Fast)', ms: 800 },
            { label: '1.2s (Normal)', ms: 1200 },
            { label: '1.8s (Slow)', ms: 1800 },
          ].map((sp) => (
            <button
              key={sp.ms}
              onClick={() => setFlashSpeedMs(sp.ms)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                flashSpeedMs === sp.ms ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* Voice Mode Toggle */}
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors ${
            voiceMode
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Listen & Calculate: {voiceMode ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Flash Anzan Screen */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="min-h-[160px] flex flex-col items-center justify-center bg-slate-950/80 rounded-3xl border border-slate-800 p-6">
          <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-orange-400 font-mono tracking-wider animate-pulse">
            {displayItem}
          </div>
          {isPlaying && (
            <div className="text-xs text-slate-400 mt-2 font-mono">
              Flashing term {currentIdx + 1} of {sequence.length}
            </div>
          )}
        </div>

        {/* Action button */}
        {!isPlaying && displayItem !== '?' && (
          <button
            onClick={startAnzanRun}
            className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Flash Sequence</span>
          </button>
        )}

        {/* Answering Form when sequence finishes */}
        {displayItem === '?' && !submitted && (
          <div className="max-w-sm mx-auto space-y-3 animate-fadeIn">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              What is the total sum?
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Enter total"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                autoFocus
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-bold text-white focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleVerify}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Result & Solution */}
        {submitted && (
          <div className="space-y-4 animate-fadeIn max-w-lg mx-auto">
            <div
              className={`p-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2 ${
                isCorrect
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Correct! Chain sum is {expectedTotal} (+25 XP)</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span>Incorrect. The sum was {sequence.join(' + ')} = {expectedTotal}.</span>
                </>
              )}
            </div>

            {/* Revealed Bead Representation */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">
                Soroban Bead Configuration for {expectedTotal}:
              </span>
              <Abacus
                state={demonstrationAbacus}
                onChange={() => {}}
                interactive={false}
                palette={settings.beadPalette}
                theme={settings.theme}
                showValues={true}
              />
            </div>

            <button
              onClick={startAnzanRun}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              Try Next Flash Sequence →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
