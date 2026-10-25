/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * "My Abacus" - Full Interactive Soroban Sandbox
 */

import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  Sliders,
  Keyboard,
  Hash,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  AbacusState,
  createEmptyAbacus,
  setAbacusFromNumber,
  getNumberFromAbacus,
  getFormattedNumber,
  getPlaceValueBreakdown,
  resetAbacus,
} from '../engine/abacusEngine';
import { Abacus } from '../components/abacus/Abacus';
import { AbacusToolbar } from '../components/abacus/AbacusToolbar';
import { sounds } from '../engine/soundEngine';

export const AbacusView: React.FC = () => {
  const { settings } = useApp();
  const [abacusState, setAbacusState] = useState<AbacusState>(() =>
    createEmptyAbacus(settings.defaultRodCount, Math.floor(settings.defaultRodCount * 0.65))
  );
  const [history, setHistory] = useState<AbacusState[]>([abacusState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);

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

  const handleDirectSet = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(inputVal);
    if (!isNaN(parsed) && parsed >= 0) {
      const newState = setAbacusFromNumber(abacusState, parsed);
      handleAbacusChange(newState);
      sounds.playBeadClick(true, true);
      setInputVal('');
    }
  };

  const presets = [
    { label: '7 (Recognise)', val: 7 },
    { label: '28 (2 Tens + 8)', val: 28 },
    { label: '73 (Carry demo)', val: 73 },
    { label: '144 (12×12)', val: 144 },
    { label: '16.25 (Decimal)', val: 16.25 },
    { label: '999 (Full)', val: 999 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title & Description */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span>My Abacus</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              Free Play Sandbox
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Move beads freely by touch, mouse, or keyboard. Experiment with place values and complements.
          </p>
        </div>

        <button
          onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <Keyboard className="w-3.5 h-3.5" />
          <span>Keyboard Shortcuts</span>
        </button>
      </div>

      {/* Keyboard Help Disclosure */}
      {showKeyboardHelp && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 space-y-2 animate-fadeIn">
          <div className="font-bold text-amber-400 flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Accessible Keyboard Controls:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
            <div className="bg-slate-800/80 p-2 rounded-lg">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">← / →</kbd> Move focus across rods
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">↑ / ↓</kbd> Nudge rod value (+1 / -1)
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">0 - 9</kbd> Set focused rod digit
            </div>
            <div className="bg-slate-800/80 p-2 rounded-lg">
              <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-white font-mono">Click</kbd> Bead engages / disengages
            </div>
          </div>
        </div>
      )}

      {/* Abacus Container Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center gap-4">
        {/* Toolbar */}
        <AbacusToolbar
          state={abacusState}
          onChange={handleAbacusChange}
          history={history}
          historyIndex={historyIndex}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        {/* The Abacus SVG */}
        <div className="w-full flex justify-center py-2">
          <Abacus
            state={abacusState}
            onChange={handleAbacusChange}
            palette={settings.beadPalette}
            theme={settings.theme}
            showValues={settings.showRodValues}
            interactive={true}
            maxHeight={420}
          />
        </div>
      </div>

      {/* Quick Direct Setter & Presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Direct Number Input */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-sky-400" />
            <span>Set Exact Number on Beads</span>
          </h3>
          <form onSubmit={handleDirectSet} className="flex gap-2">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="e.g. 73 or 144"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Set Beads
            </button>
          </form>
          <p className="text-[11px] text-slate-400">
            Type any positive integer or decimal to watch the beads instantly configure themselves according to Japanese Soroban rules.
          </p>
        </div>

        {/* Quick Example Presets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curriculum Presets</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  const newState = setAbacusFromNumber(abacusState, p.val);
                  handleAbacusChange(newState);
                  sounds.playBeadClick(true, true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-medium hover:border-amber-500 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
