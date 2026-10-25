/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Settings View - Personalisation, Accessibility, Themes, and Sound Preferences
 */

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Palette,
  Volume2,
  Globe,
  Smile,
  Gauge,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import {
  useApp,
  AppLanguage,
  AppTheme,
  BeadColorPalette,
  AnimationSpeed,
} from '../context/AppContext';
import { sounds } from '../engine/soundEngine';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllProgress } = useApp();
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const languages: { id: AppLanguage; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'Primary curriculum' },
    { id: 'hi', label: 'हिन्दी', sub: 'हिंदी निर्देश' },
    { id: 'ml', label: 'മലയാളം', sub: 'മലയാളം നിർദ്ദേശങ്ങൾ' },
  ];

  const palettes: { id: BeadColorPalette; label: string; preview: string }[] = [
    { id: 'amber-wood', label: 'Classic Amber Wood', preview: 'bg-amber-600' },
    { id: 'ruby-sapphire', label: 'Ruby & Sapphire', preview: 'bg-rose-600' },
    { id: 'emerald-jade', label: 'Emerald Jade', preview: 'bg-emerald-600' },
    { id: 'rainbow-place', label: 'Rainbow Place Values', preview: 'bg-gradient-to-r from-red-500 via-green-500 to-blue-500' },
    { id: 'high-contrast', label: 'High Contrast (B&W)', preview: 'bg-yellow-300' },
  ];

  const themes: { id: AppTheme; label: string; desc: string }[] = [
    { id: 'classic-wood', label: 'Warm Wood Frame', desc: 'Traditional polished wooden frame' },
    { id: 'modern-slate', label: 'Modern Slate', desc: 'Clean contemporary minimalist palette' },
    { id: 'ebony-gold', label: 'Ebony & Gold', desc: 'Sleek dark lacquer with brass rivets' },
  ];

  const speeds: { id: AnimationSpeed; label: string; desc: string }[] = [
    { id: 'slow', label: 'Slow Motion', desc: 'Best for beginners studying bead mechanics' },
    { id: 'normal', label: 'Normal Speed', desc: 'Natural physical bead sliding speed' },
    { id: 'fast', label: 'Brisk / Rapid', desc: 'Snappy for fast calculations & mental drills' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-7 h-7 text-sky-400" />
          <span>Application Settings</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Customize themes, bead color-blind palettes, language localization, and sound effects.
        </p>
      </div>

      {/* Language Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-5 h-5 text-sky-400" />
          <span>Language & Localisation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {languages.map((lang) => {
            const isSelected = settings.language === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => updateSettings({ language: lang.id })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-base">{lang.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <span className="text-xs text-slate-400 mt-0.5 block">{lang.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bead Color & Theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-amber-400" />
          <span>Bead Color Palette (Accessible & Color-Blind Friendly)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {palettes.map((p) => {
            const isSelected = settings.beadPalette === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  updateSettings({ beadPalette: p.id });
                  sounds.playBeadClick(true, true);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`w-6 h-6 rounded-full shrink-0 shadow-sm ${p.preview}`} />
                <div className="flex-1">
                  <div className="text-xs font-bold text-white">{p.label}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Frame Theme */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-emerald-400" />
          <span>Abacus Wooden Frame Material</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themes.map((th) => {
            const isSelected = settings.theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => updateSettings({ theme: th.id })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-sm">{th.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">{th.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sound & Speech Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-pink-400" />
          <span>Audio, Sounds, & Speech</span>
        </h3>

        <div className="space-y-3">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Realistic Bead Click Sounds</div>
              <div className="text-xs text-slate-400">Authentic wooden resonance synthesized with Web Audio</div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                updateSettings({ soundEnabled: next });
                sounds.enabled = next;
                if (next) sounds.playBeadClick(true, true);
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Speech Guidance */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Voice & Speech Guidance (TTS)</div>
              <div className="text-xs text-slate-400">Spoken numbers and verbal calculation instructions</div>
            </div>
            <button
              onClick={() => {
                const next = !settings.speechEnabled;
                updateSettings({ speechEnabled: next });
                sounds.speechEnabled = next;
                if (next) sounds.speak('Voice guidance is now enabled.');
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.speechEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.speechEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Child-Friendly Mode */}
          <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Child-Friendly UI Mode</div>
              <div className="text-xs text-slate-400">Playful fonts, warmer colors, and simplified wording</div>
            </div>
            <button
              onClick={() => updateSettings({ childMode: !settings.childMode })}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${
                settings.childMode ? 'bg-pink-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.childMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Reset Progress Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
          <RotateCcw className="w-5 h-5" />
          <span>Reset Learning Progress</span>
        </h3>
        <p className="text-xs text-slate-400">
          Reset all lessons, badges, streaks, and mistake records back to starting state.
        </p>

        {!showConfirmReset ? (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Reset Progress
          </button>
        ) : (
          <div className="p-4 bg-rose-950/40 border border-rose-600/50 rounded-2xl space-y-3">
            <p className="text-xs text-rose-200 font-semibold">
              Are you sure? This will clear all completed lessons and XP points permanently.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetAllProgress();
                  setShowConfirmReset(false);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
