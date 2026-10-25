/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Express Full-Stack Server with Vite Middlewares & AI Learning Buddy API
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

app.post('/api/ai-tutor', async (req, res) => {
  const { prompt, learnerLevel, learnerName } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      reply: `On the Japanese Soroban, each rod has 1 upper bead (value 5) and 4 lower beads (value 1 each). Remember: five's complement (+5 - 2) and ten's complement (+10 - 3) let you calculate smoothly when beads run out!`,
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are the BeadWise Learning Buddy, an encouraging, kid-safe, expert abacus mathematics tutor.
The student is ${learnerName || 'a young learner'} at Level ${learnerLevel || 1}.
Keep explanations concise (2-4 sentences max), clear, friendly, and focused strictly on the Japanese Soroban abacus (five's complements, ten's complements, place values, carrying, borrowing).
User question: ${prompt}`,
    });

    const reply = response.text || 'Keep practicing on your Soroban beads! Every move trains your mind.';
    return res.json({ reply });
  } catch {
    return res.json({
      reply: `On the Soroban abacus, numbers are made by pushing beads to the reckoning bar. To add 3 with five's complement, push down the 5-bead and subtract 2 lower beads (+5 - 2 = 3).`,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BeadWise server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
