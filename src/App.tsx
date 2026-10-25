/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BeadWise – Smart Digital Abacus Learning Academy
 * Root Application Component
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navigation/Navbar';
import { DashboardView } from './views/DashboardView';
import { AbacusView } from './views/AbacusView';
import { LearnView } from './views/LearnView';
import { PracticeView } from './views/PracticeView';
import { ChallengeView } from './views/ChallengeView';
import { MentalAbacusView } from './views/MentalAbacusView';
import { AITutorView } from './views/AITutorView';
import { ProgressView } from './views/ProgressView';
import { TeacherParentView } from './views/TeacherParentView';
import { SettingsView } from './views/SettingsView';

const MainAppContent: React.FC = () => {
  const { activeSection, settings } = useApp();

  return (
    <div
      className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 ${
        settings.childMode ? 'font-child' : ''
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeSection === 'dashboard' && <DashboardView />}
        {activeSection === 'abacus' && <AbacusView />}
        {activeSection === 'learn' && <LearnView />}
        {activeSection === 'practice' && <PracticeView />}
        {activeSection === 'challenge' && <ChallengeView />}
        {activeSection === 'mental' && <MentalAbacusView />}
        {activeSection === 'ai_tutor' && <AITutorView />}
        {activeSection === 'progress' && <ProgressView />}
        {activeSection === 'teacher' && <TeacherParentView />}
        {activeSection === 'settings' && <SettingsView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500 no-print">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400">BeadWise Academy</span>
            <span>•</span>
            <span>Realistic Japanese Soroban Educational Platform</span>
          </div>
          <div className="text-slate-400">
            Learn → Visualise → Practise → Get Hints → Master → Advance
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
