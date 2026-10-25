/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Main Navigation Bar & Header for BeadWise
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Award,
  Volume2,
  VolumeX,
  Menu,
  X,
  Compass,
  BookOpen,
  Calculator,
  Trophy,
  Brain,
  Bot,
  BarChart3,
  Users,
  Settings as SettingsIcon,
  Smile,
} from 'lucide-react';
import { useApp, NavSection } from '../../context/AppContext';

export const Navbar: React.FC = () => {
  const { activeSection, setActiveSection, progress, settings, updateSettings, t } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: <Compass className="w-4 h-4" /> },
    { id: 'abacus', label: t('nav.abacus'), icon: <Calculator className="w-4 h-4" /> },
    { id: 'learn', label: t('nav.learn'), icon: <BookOpen className="w-4 h-4" />, badge: `${progress.completedLessons.length}` },
    { id: 'practice', label: t('nav.practice'), icon: <Sparkles className="w-4 h-4" /> },
    { id: 'challenge', label: t('nav.challenge'), icon: <Trophy className="w-4 h-4" /> },
    { id: 'mental', label: t('nav.mental'), icon: <Brain className="w-4 h-4" /> },
    { id: 'ai_tutor', label: t('nav.ai_tutor'), icon: <Bot className="w-4 h-4" /> },
    { id: 'progress', label: t('nav.progress'), icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'teacher', label: t('nav.teacher'), icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: t('nav.settings'), icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div
            onClick={() => setActiveSection('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-xl text-slate-950 font-mono tracking-tighter">
                BW
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  BeadWise
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  SOROBAN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Smart Digital Abacus Learning Academy
              </p>
            </div>
          </div>

          {/* Quick Learner Stats HUD */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold">
            {/* Streak */}
            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{progress.streak} Day Streak</span>
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-1 bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full border border-sky-500/20">
              <Award className="w-3.5 h-3.5" />
              <span>Lvl {progress.level} • {progress.xp} XP</span>
            </div>

            {/* Child Mode Quick Toggle */}
            <button
              onClick={() => updateSettings({ childMode: !settings.childMode })}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition-colors ${
                settings.childMode
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 font-child font-bold'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title="Toggle playful child-friendly UI"
            >
              <Smile className="w-3.5 h-3.5" />
              <span>{settings.childMode ? 'Kid Friendly' : 'Standard UI'}</span>
            </button>

            {/* Language Quick Dropdown */}
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'hi' | 'ml' })}
              className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-amber-500"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="ml">മലയാളം (ML)</option>
            </select>

            {/* Sound Toggle */}
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={settings.soundEnabled ? 'Mute' : 'Unmute'}
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden gap-2">
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className="p-2 rounded-lg bg-slate-800 text-slate-300"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Primary Navigation Bar Tabs */}
        <nav className="hidden lg:flex items-center gap-1 border-t border-slate-800/80 py-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-4 space-y-2 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4" /> {progress.streak} Day Streak
            </div>
            <div className="flex items-center gap-1 text-sky-400">
              <Award className="w-4 h-4" /> Lvl {progress.level} ({progress.xp} XP)
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <select
              value={settings.language}
              onChange={(e) => updateSettings({ language: e.target.value as 'en' | 'hi' | 'ml' })}
              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300"
            >
              <option value="en">English (EN)</option>
              <option value="hi">हिन्दी (HI)</option>
              <option value="ml">മലയാളം (ML)</option>
            </select>

            <button
              onClick={() => updateSettings({ childMode: !settings.childMode })}
              className={`px-3 py-1 rounded-lg text-xs font-bold ${
                settings.childMode ? 'bg-pink-500 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {settings.childMode ? 'Kids Mode: ON' : 'Kids Mode: OFF'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
