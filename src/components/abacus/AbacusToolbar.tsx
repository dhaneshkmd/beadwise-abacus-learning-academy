/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Abacus Control Toolbar with Live Place-Value Breakdown and Explain My Beads
 */

import React, { useState } from 'react';
import {
  RotateCcw,
  Undo2,
  Redo2,
  Volume2,
  VolumeX,
  HelpCircle,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
} from 'lucide-react';
import {
  AbacusState,
  getFormattedNumber,
  getPlaceValueBreakdown,
  explainMyBeads,
  resetAbacus,
  createEmptyAbacus,
} from '../../engine/abacusEngine';
import { sounds } from '../../engine/soundEngine';
import { useApp } from '../../context/AppContext';

interface AbacusToolbarProps {
  state: AbacusState;
  onChange: (s: AbacusState) => void;
  history: AbacusState[];
  historyIndex: number;
  onUndo: () => void;
  onRedo: () => void;
}

export const AbacusToolbar: React.FC<AbacusToolbarProps> = ({
  state,
  onChange,
  history,
  historyIndex,
  onUndo,
  onRedo,
}) => {
  const { settings, updateSettings, t } = useApp();
  const [showExplainModal, setShowExplainModal] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const breakdown = getPlaceValueBreakdown(state);
  const currentFormatted = getFormattedNumber(state);
  const explanation = explainMyBeads(state);

  const handleClear = () => {
    sounds.playClearSound();
    onChange(resetAbacus(state));
  };

  const handleRodCountChange = (count: number) => {
    const unitIndex = Math.floor(count * 0.65);
    onChange(createEmptyAbacus(count, unitIndex));
  };

  return (
    <div className="w-full max-w-4xl flex flex-col gap-3 px-2">
      {/* Top Value & Place Breakdown Card */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Current Number Display */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-semibold text-sky-400 uppercase tracking-wider">
              Value
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-100 font-mono-numbers">
                {currentFormatted}
              </span>
              <span className="text-[10px] text-slate-400">
                ({state.rods.length}r)
              </span>
            </div>
          </div>

          {/* Mobile Buttons shortcut */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={() => setShowExplainModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold"
              aria-label="Explain My Beads"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explain</span>
            </button>
            <button
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-rose-600/80 text-white text-xs font-bold"
              aria-label="Clear All to Zero"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Mathematical Visualisation Breakdown */}
        <div className="flex-1 px-1 sm:px-4 border-t md:border-t-0 md:border-x border-slate-800/80 pt-2 md:pt-0 w-full md:w-auto text-left">
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
            Formula: <span className="text-xs sm:text-sm font-semibold text-emerald-300 font-mono-numbers">{breakdown.placeFormula}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate mt-0.5">
            Bead Sum: <span className="text-slate-300">{breakdown.beadFormula}</span>
          </div>
        </div>

        {/* Primary Action Buttons (Desktop) */}
        <div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowExplainModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
            aria-label="Explain My Beads"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain Beads</span>
          </button>

          <button
            onClick={onUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors"
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
            title="Clear all beads to zero"
            aria-label="Clear All to Zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Rod Count Selector */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
            <span className="text-slate-300 font-medium">Rods:</span>
            {[5, 7, 9, 11, 13].map(count => (
              <button
                key={`rods-${count}`}
                onClick={() => handleRodCountChange(count)}
                className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                  state.rods.length === count
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {count}
              </button>
            ))}
          </div>

          {/* Show/Hide Value */}
          <button
            onClick={() => updateSettings({ showRodValues: !settings.showRodValues })}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            {settings.showRodValues ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Rod Values</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Show Rod Values</span>
              </>
            )}
          </button>
        </div>

        {/* Audio Mute & Config */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`p-1.5 rounded-lg border border-slate-700/60 transition-colors ${
              settings.soundEnabled ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 bg-slate-800'
            }`}
            title={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Explain My Beads Dialog Modal */}
      {showExplainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
                <Sparkles className="w-5 h-5" />
                <span>Explain My Beads</span>
              </div>
              <button
                onClick={() => setShowExplainModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-200 leading-relaxed">
              <p className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 text-amber-200 font-medium">
                {explanation}
              </p>

              <div>
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Place Values Active:
                </h4>
                {breakdown.terms.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">All rods are at 0.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {breakdown.terms.map((t, idx) => (
                      <div key={idx} className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40 flex justify-between">
                        <span className="text-slate-400">{t.label}:</span>
                        <span className="font-bold text-sky-300 font-mono-numbers">{t.formatted}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Total Decimal Value: <strong className="text-white text-base">{currentFormatted}</strong></span>
                <button
                  onClick={() => setShowExplainModal(false)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
