/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Application Context & Local Persistence for BeadWise
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { sounds } from '../engine/soundEngine';

export type NavSection = 
  | 'dashboard'
  | 'abacus'
  | 'learn'
  | 'practice'
  | 'challenge'
  | 'mental'
  | 'ai_tutor'
  | 'progress'
  | 'teacher'
  | 'settings';

export type AppLanguage = 'en' | 'hi' | 'ml';
export type AppTheme = 'classic-wood' | 'modern-slate' | 'ebony-gold';
export type BeadColorPalette = 'amber-wood' | 'ruby-sapphire' | 'emerald-jade' | 'rainbow-place' | 'high-contrast';
export type AnimationSpeed = 'slow' | 'normal' | 'fast';

export interface MistakeRecord {
  id: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  category: string;
  date: string;
}

export interface UserProgress {
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  totalAttempted: number;
  totalCorrect: number;
  hintsUsed: number;
  mistakes: MistakeRecord[];
  badges: string[];
}

export interface UserSettings {
  language: AppLanguage;
  childMode: boolean;
  theme: AppTheme;
  beadPalette: BeadColorPalette;
  defaultRodCount: number;
  animationSpeed: AnimationSpeed;
  soundEnabled: boolean;
  speechEnabled: boolean;
  showRodValues: boolean;
  learnerName: string;
  dailyGoal: number; // questions per day
}

interface AppContextType {
  activeSection: NavSection;
  setActiveSection: (s: NavSection) => void;
  progress: UserProgress;
  settings: UserSettings;
  updateSettings: (partial: Partial<UserSettings>) => void;
  addXP: (amount: number) => void;
  markLessonComplete: (lessonId: string, badgeName?: string) => void;
  recordExerciseAttempt: (correct: boolean, usedHint: boolean, mistakeData?: Omit<MistakeRecord, 'id' | 'date'>) => void;
  removeMistake: (id: string) => void;
  resetAllProgress: () => void;
  t: (key: string) => string;
}

const DEFAULT_SETTINGS: UserSettings = {
  language: 'en',
  childMode: false,
  theme: 'classic-wood',
  beadPalette: 'amber-wood',
  defaultRodCount: 7,
  animationSpeed: 'normal',
  soundEnabled: true,
  speechEnabled: false,
  showRodValues: true,
  learnerName: 'Young Mathematician',
  dailyGoal: 10,
};

const DEFAULT_PROGRESS: UserProgress = {
  level: 1,
  xp: 120,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: ['l0-structure'],
  totalAttempted: 15,
  totalCorrect: 13,
  hintsUsed: 2,
  mistakes: [],
  badges: ['Bead Beginner'],
};

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'nav.dashboard': 'Dashboard',
    'nav.abacus': 'My Abacus',
    'nav.learn': 'Learn Step-by-Step',
    'nav.practice': 'Practice Math',
    'nav.challenge': 'Challenge Mode',
    'nav.mental': 'Mental Abacus',
    'nav.ai_tutor': 'AI Learning Buddy',
    'nav.progress': 'My Progress',
    'nav.teacher': 'Teacher / Parent',
    'nav.settings': 'Settings',
    'app.tagline': 'Master Mathematics with the Realistic Soroban',
    'abacus.clear': 'Clear to Zero',
    'abacus.undo': 'Undo',
    'abacus.redo': 'Redo',
    'abacus.explain': 'Explain My Beads',
    'abacus.hideValues': 'Hide Values',
    'abacus.showValues': 'Show Values',
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.abacus': 'मेरा अबेकस',
    'nav.learn': 'कदम-दर-कदम सीखें',
    'nav.practice': 'गणित अभ्यास',
    'nav.challenge': 'चुनौती मोड',
    'nav.mental': 'मानसिक अबेकस',
    'nav.ai_tutor': 'एआई गुरु',
    'nav.progress': 'मेरी प्रगति',
    'nav.teacher': 'शिक्षक / अभिभावक',
    'nav.settings': 'सेटिंग्स',
    'app.tagline': 'सटीक सोरोबन के साथ गणित में महारत हासिल करें',
    'abacus.clear': 'शून्य करें',
    'abacus.undo': 'पूर्ववत',
    'abacus.redo': 'पुनः करें',
    'abacus.explain': 'मोतियों का अर्थ बताएं',
    'abacus.hideValues': 'संख्या छिपाएँ',
    'abacus.showValues': 'संख्या दिखाएँ',
  },
  ml: {
    'nav.dashboard': 'ഡാഷ്‌ബോർഡ്',
    'nav.abacus': 'എന്റെ അബാക്കസ്',
    'nav.learn': 'പഠിക്കാം',
    'nav.practice': 'പരിശീലനം',
    'nav.challenge': 'ചലഞ്ച് മോഡ്',
    'nav.mental': 'മനക്കണക്ക്',
    'nav.ai_tutor': 'എഐ ട്യൂട്ടർ',
    'nav.progress': 'പുരോഗതി',
    'nav.teacher': 'അധ്യാപകർ / രക്ഷിതാക്കൾ',
    'nav.settings': 'ക്രമീകരണങ്ങൾ',
    'app.tagline': 'സൊറോബൻ അബാക്കസിലൂടെ ഗണിതം എളുപ്പത്തിൽ പഠിക്കാം',
    'abacus.clear': 'പൂജ്യമാക്കുക',
    'abacus.undo': 'പൂർവ്വാവസ്ഥ',
    'abacus.redo': 'വീണ്ടും ചെയ്യുക',
    'abacus.explain': 'മണികളുടെ വിശദീകരണം',
    'abacus.hideValues': 'മൂല്യം മറയ്ക്കുക',
    'abacus.showValues': 'മൂല്യം കാണിക്കുക',
  },
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const saved = localStorage.getItem('beadwise_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PROGRESS;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('beadwise_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('beadwise_progress', JSON.stringify(progress));
    } catch {}
  }, [progress]);

  useEffect(() => {
    try {
      localStorage.setItem('beadwise_settings', JSON.stringify(settings));
    } catch {}
    sounds.enabled = settings.soundEnabled;
    sounds.speechEnabled = settings.speechEnabled;
  }, [settings]);

  const updateSettings = (partial: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const addXP = (amount: number) => {
    setProgress(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.max(1, Math.min(12, Math.floor(newXp / 150) + 1));
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const markLessonComplete = (lessonId: string, badgeName?: string) => {
    setProgress(prev => {
      const completed = prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId];
      const badges = badgeName && !prev.badges.includes(badgeName)
        ? [...prev.badges, badgeName]
        : prev.badges;
      return {
        ...prev,
        completedLessons: completed,
        badges,
        xp: prev.xp + 50,
      };
    });
  };

  const recordExerciseAttempt = (correct: boolean, usedHint: boolean, mistakeData?: Omit<MistakeRecord, 'id' | 'date'>) => {
    setProgress(prev => {
      const mistakes = [...prev.mistakes];
      if (!correct && mistakeData) {
        mistakes.unshift({
          id: `m-${Date.now()}`,
          date: new Date().toLocaleDateString(),
          ...mistakeData,
        });
        if (mistakes.length > 20) mistakes.pop();
      }

      return {
        ...prev,
        totalAttempted: prev.totalAttempted + 1,
        totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
        hintsUsed: prev.hintsUsed + (usedHint ? 1 : 0),
        xp: prev.xp + (correct ? 15 : 2),
        mistakes,
      };
    });
  };

  const removeMistake = (id: string) => {
    setProgress(prev => ({
      ...prev,
      mistakes: prev.mistakes.filter(m => m.id !== id),
    }));
  };

  const resetAllProgress = () => {
    setProgress(DEFAULT_PROGRESS);
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem('beadwise_progress');
      localStorage.removeItem('beadwise_settings');
    } catch {}
  };

  const t = (key: string): string => {
    return TRANSLATIONS[settings.language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        activeSection,
        setActiveSection,
        progress,
        settings,
        updateSettings,
        addXP,
        markLessonComplete,
        recordExerciseAttempt,
        removeMistake,
        resetAllProgress,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
