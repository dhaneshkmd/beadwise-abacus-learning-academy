/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Learn Step-by-Step View (Levels 0 through 12)
 * Features an interactive step demonstration player (Play, Pause, Step Next/Prev, Replay, Slow Motion),
 * bead and rod highlight, and an interactive "Try it on Abacus" guided verification mode.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  CheckCircle2,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRICULUM, Lesson, CurriculumLevel } from '../data/curriculum';
import { Abacus } from '../components/abacus/Abacus';
import { AbacusToolbar } from '../components/abacus/AbacusToolbar';
import {
  AbacusState,
  createEmptyAbacus,
  getNumberFromAbacus,
  setAbacusFromNumber,
} from '../engine/abacusEngine';
import { sounds } from '../engine/soundEngine';

export const LearnView: React.FC = () => {
  const { progress, markLessonComplete, settings, addXP } = useApp();

  // Selected Level & Lesson
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);
  const currentLevel = CURRICULUM[selectedLevelIdx] || CURRICULUM[0];
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(currentLevel.lessons[0]);

  // Demo Player State
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlowMotion, setIsSlowMotion] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Student Practice Abacus State for "Try it on Abacus"
  const [practiceAbacusState, setPracticeAbacusState] = useState<AbacusState>(() =>
    createEmptyAbacus(5, 4)
  );
  const [practiceCompleted, setPracticeCompleted] = useState<Record<number, boolean>>({});
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Reset step index when lesson changes
  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
    setFeedbackMsg(null);
    setPracticeCompleted({});
    if (selectedLesson.guidedPractice.length > 0) {
      setPracticeAbacusState(
        setAbacusFromNumber(createEmptyAbacus(5, 4), selectedLesson.guidedPractice[0].initialValue)
      );
    }
  }, [selectedLesson]);

  // Auto-play timer loop
  useEffect(() => {
    if (isPlaying) {
      const delay = isSlowMotion ? 2000 : 1100;
      playTimerRef.current = setTimeout(() => {
        if (currentStepIdx < selectedLesson.demoSteps.length - 1) {
          const nextIdx = currentStepIdx + 1;
          setCurrentStepIdx(nextIdx);
          sounds.playBeadClick(true, true);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIdx, selectedLesson, isSlowMotion]);

  const activeStep = selectedLesson.demoSteps[currentStepIdx] || selectedLesson.demoSteps[0];
  const isLessonFinished = progress.completedLessons.includes(selectedLesson.id);

  // Check student practice solution
  const handleVerifyPractice = (taskIndex: number) => {
    const task = selectedLesson.guidedPractice[taskIndex];
    if (!task) return;
    const currentVal = getNumberFromAbacus(practiceAbacusState);

    if (currentVal === task.targetValue) {
      sounds.playSuccess();
      setFeedbackMsg({
        text: `Excellent! You correctly set ${task.targetValue} on the abacus!`,
        success: true,
      });
      setPracticeCompleted(prev => ({ ...prev, [taskIndex]: true }));
      addXP(20);

      // If all guided tasks complete, mark whole lesson complete
      const allDone = selectedLesson.guidedPractice.every((_, idx) => idx === taskIndex || practiceCompleted[idx]);
      if (allDone && !isLessonFinished) {
        markLessonComplete(selectedLesson.id, selectedLesson.badgeName);
      }
    } else {
      sounds.playError();
      setFeedbackMsg({
        text: `Your abacus reads ${currentVal}, but target is ${task.targetValue}. Check the hint below!`,
        success: false,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <span>Structured Soroban Curriculum</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Master abacus arithmetic through slow-motion demonstrations, visual bead highlights, and guided practice.
          </p>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
          {CURRICULUM.map((lvl, idx) => {
            const isSelected = selectedLevelIdx === idx;
            const hasCompleted = lvl.lessons.every(l => progress.completedLessons.includes(l.id));
            return (
              <button
                key={lvl.level}
                onClick={() => {
                  setSelectedLevelIdx(idx);
                  setSelectedLesson(lvl.lessons[0]);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                    : hasCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Lvl {lvl.level}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons in Level List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
              Level {currentLevel.level} • {currentLevel.category}
            </div>
            <h2 className="text-lg font-extrabold text-white">{currentLevel.title}</h2>
            <p className="text-xs text-slate-400 mt-1">{currentLevel.description}</p>
          </div>

          <div className="space-y-2">
            {currentLevel.lessons.map((lesson) => {
              const isCurrent = lesson.id === selectedLesson.id;
              const isDone = progress.completedLessons.includes(lesson.id);

              return (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-amber-500/15 border-amber-500/50 shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">{lesson.title}</span>
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{lesson.subtitle}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-400 ${isCurrent ? 'text-amber-400' : ''}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Interactive Lesson Viewer & Demonstration Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Concept Explanation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Concept & Rule
              </span>
              {isLessonFinished && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Award className="w-3.5 h-3.5" /> Completed
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{selectedLesson.title}</h3>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              {selectedLesson.conceptText}
            </p>
            {selectedLesson.keyRule && (
              <div className="inline-block px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                Formula Rule: {selectedLesson.keyRule}
              </div>
            )}
          </div>

          {/* Interactive Demonstration Abacus Player */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="font-bold text-sm text-white">
                  Demonstration (Step {activeStep.stepNumber} of {selectedLesson.demoSteps.length})
                </h4>
              </div>

              {/* Running Value Badge */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Step Value:</span>
                <span className="font-mono font-extrabold text-amber-300 text-sm bg-slate-800 px-2 py-0.5 rounded-lg">
                  {activeStep.runningValue}
                </span>
              </div>
            </div>

            {/* Step Explanation Banner */}
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
              <div className="text-xs font-bold text-amber-400">{activeStep.title}</div>
              <p className="text-xs text-slate-200 leading-relaxed">{activeStep.explanation}</p>
              {activeStep.ruleName && (
                <div className="text-[11px] font-semibold text-emerald-300 pt-1">
                  💡 Strategy applied: {activeStep.ruleName}
                </div>
              )}
            </div>

            {/* Abacus with highlighted target bead / rod */}
            <div className="py-2">
              <Abacus
                state={activeStep.resultingState}
                onChange={() => {}} // Read-only during demonstration playback
                interactive={false}
                palette={settings.beadPalette}
                theme={settings.theme}
                highlightRodIndex={activeStep.rodIndex}
                highlightUpper={activeStep.highlightUpper}
                highlightLowerIndices={activeStep.highlightLowerIndices}
                showValues={true}
              />
            </div>

            {/* Demonstration Controls: Play, Pause, Next, Prev, Replay, Slow-Mo */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sounds.playClearSound();
                    setCurrentStepIdx(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Replay from Step 1"
                  aria-label="Replay from Step 1"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (currentStepIdx > 0) {
                      setCurrentStepIdx(currentStepIdx - 1);
                      sounds.playBeadClick(true, false);
                    }
                  }}
                  disabled={currentStepIdx === 0}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                  title="Previous Step"
                  aria-label="Previous Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                  aria-label={isPlaying ? 'Pause' : 'Play Demonstration'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-slate-950" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>{currentStepIdx === selectedLesson.demoSteps.length - 1 ? 'Replay' : 'Play'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (currentStepIdx < selectedLesson.demoSteps.length - 1) {
                      setCurrentStepIdx(currentStepIdx + 1);
                      sounds.playBeadClick(true, true);
                    }
                  }}
                  disabled={currentStepIdx === selectedLesson.demoSteps.length - 1}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
                  title="Next Step"
                  aria-label="Next Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Slow Motion Toggle */}
              <button
                onClick={() => setIsSlowMotion(!isSlowMotion)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors ${
                  isSlowMotion
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span>{isSlowMotion ? 'Slow Motion: ON' : 'Normal Speed'}</span>
              </button>
            </div>
          </div>

          {/* Guided Practice: "Try It on Abacus" */}
          {selectedLesson.guidedPractice.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-white text-base">Guided Practice: Try It Yourself</h4>
              </div>

              {selectedLesson.guidedPractice.map((task, idx) => {
                const isTaskDone = practiceCompleted[idx];

                return (
                  <div key={idx} className="space-y-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="font-semibold text-white text-sm">
                        Task {idx + 1}: {task.question}
                      </div>
                      {isTaskDone && (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                          <CheckCircle2 className="w-4 h-4" /> Completed (+20 XP)
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-800 p-2.5 rounded-lg border border-slate-700/60">
                      💡 <strong>Hint:</strong> {task.hint}
                    </div>

                    {/* Interactive Abacus for student input */}
                    <div className="py-1">
                      <Abacus
                        state={practiceAbacusState}
                        onChange={setPracticeAbacusState}
                        palette={settings.beadPalette}
                        theme={settings.theme}
                        interactive={true}
                        showValues={true}
                      />
                    </div>

                    {/* Verification Button & Feedback */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={() => handleVerifyPractice(idx)}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                      >
                        Check My Abacus Beads
                      </button>

                      <div className="text-xs font-mono text-slate-400">
                        Current: <strong className="text-white">{getNumberFromAbacus(practiceAbacusState)}</strong> | Target: <strong className="text-amber-400">{task.targetValue}</strong>
                      </div>
                    </div>

                    {feedbackMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs font-medium ${
                          feedbackMsg.success
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {feedbackMsg.text}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
