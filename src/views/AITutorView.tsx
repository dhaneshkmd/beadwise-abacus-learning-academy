/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * BeadWise Learning Buddy - AI & Deterministic Abacus Tutor
 * Supports server-side Gemini generation via /api/ai-tutor with an instant, robust,
 * deterministic local expert tutor fallback.
 */

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  User,
  Lightbulb,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  timestamp: string;
}

export const AITutorView: React.FC = () => {
  const { progress, settings } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'tutor',
      text: `Hello ${settings.learnerName}! I'm your BeadWise Learning Buddy. I'm here to explain any abacus concepts, teach you about five's or ten's complements, or walk you through tricky arithmetic problems. What would you like to explore today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    "Why do we need five's complement (+5 - 2)?",
    "How does carrying to the tens rod work (+10 - 3)?",
    "How do I recognize numbers on the Soroban?",
    "What is Flash Anzan mental arithmetic?",
  ];

  // Robust deterministic expert fallback responses
  const getDeterministicTutorResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes("five") || q.includes("5") || q.includes("complement")) {
      return `Great question! The Five's Complement is used when the lower deck (the 4 beads) does not have enough room, but the upper 5-bead is free. For example, to add 3 to 4: you push down the upper bead (+5) and push down 2 lower beads (-2). Because 5 - 2 = 3! The pairs to remember are: 1 and 4, 2 and 3.`;
    }

    if (q.includes("ten") || q.includes("10") || q.includes("carry") || q.includes("borrow")) {
      return `Carrying on the Soroban is done using Ten's Complement! When a rod cannot fit the number you are adding, you give 1 to the next rod to the left (worth +10) and take away the friend of 10 on your current rod. For example, 8 + 7: add 1 to the tens rod (+10) and subtract 3 from the units rod (-3). 10 - 3 = 7!`;
    }

    if (q.includes("recognize") || q.includes("digit") || q.includes("structure")) {
      return `Every Soroban rod represents digits 0 through 9: The upper bead is worth 5 when moved down toward the beam. The 4 lower beads are worth 1 each when moved up toward the beam. So 0 is clear, 3 is three lower beads, 5 is the upper bead, 7 is the upper bead (5) plus two lower beads (2), and 9 is all beads active!`;
    }

    if (q.includes("anzan") || q.includes("mental")) {
      return `Flash Anzan is the Japanese art of mental abacus calculation. By moving real beads and visualizing the reckoning beam, your brain develops a 'mental whiteboard'. You mentally flick the beads in your imagination and read the answer instantly!`;
    }

    if (q.includes("multiplication") || q.includes("times") || q.includes("multiply")) {
      return `On the Soroban, multiplication uses partial products! For example, 36 × 4 is broken down into (30 × 4) + (6 × 4) = 120 + 24 = 144. You place the products on their respective place values and accumulate them smoothly.`;
    }

    if (q.includes("recommend") || q.includes("next") || q.includes("lesson")) {
      return `Based on your progress at Level ${progress.level} with ${progress.xp} XP, I recommend practicing Five's and Ten's complements in the Practice tab, or advancing to Level ${progress.level + 1} lessons!`;
    }

    return `On the Soroban, every number is built with the upper 5-bead and four lower 1-beads touching the reckoning beam. Remember the core golden rule: add complements when beads run out, and keep your place values aligned with the reckoning dot! Feel free to ask about any specific formula or number.`;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      // Attempt server-side API call first
      const res = await fetch('/api/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          learnerLevel: progress.level,
          learnerName: settings.learnerName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const tutorMsg: ChatMessage = {
            id: `t-${Date.now()}`,
            sender: 'tutor',
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, tutorMsg]);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Fallback deterministic tutor response
    setTimeout(() => {
      const fallbackReply = getDeterministicTutorResponse(textToSend);
      const tutorMsg: ChatMessage = {
        id: `t-${Date.now()}`,
        sender: 'tutor',
        text: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, tutorMsg]);
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-purple-400" />
            <span>BeadWise Learning Buddy</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Your friendly mathematical companion. Explains complement rules, place-value reasoning, and encouraging tips.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Kid-Safe Curriculum Tutor</span>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 text-purple-400" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2">
          {messages.map((m) => {
            const isTutor = m.sender === 'tutor';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isTutor ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                    isTutor
                      ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md'
                      : 'bg-slate-800 text-amber-400'
                  }`}
                >
                  {isTutor ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div
                  className={`p-4 rounded-2xl max-w-lg text-sm leading-relaxed ${
                    isTutor
                      ? 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-medium rounded-tr-none shadow-md'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isTutor ? 'text-slate-400' : 'text-slate-900 font-semibold'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 bg-slate-800/60 p-3 rounded-2xl max-w-xs animate-pulse">
              <Bot className="w-4 h-4 animate-spin" />
              <span>Learning Buddy is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2 pt-3 border-t border-slate-800"
        >
          <input
            type="text"
            placeholder="Ask about 5's complements, borrowing, 8 + 7, decimals..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-md transition-all cursor-pointer"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
