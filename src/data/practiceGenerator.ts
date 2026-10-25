/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unlimited Deterministic Practice Question Generator with 4-Stage Hints
 */

export type OperationCategory = 
  | 'add_single'
  | 'add_two_digit'
  | 'add_multidigit'
  | 'sub_single'
  | 'sub_multidigit'
  | 'fives_complement'
  | 'tens_complement'
  | 'multiplication'
  | 'division'
  | 'decimals'
  | 'mixed'
  | 'percentages';

export type PracticeAnswerMode = 'beads' | 'keypad' | 'watch_repeat' | 'mental';

export interface PracticeQuestion {
  id: string;
  category: OperationCategory;
  prompt: string;
  terms: number[];
  operators: string[];
  correctAnswer: number;
  decimals: number;
  initialValue: number;
  hints: [string, string, string, string]; // Hint 1, 2, 3, 4
  explanation: string;
}

export interface PracticeConfig {
  category: OperationCategory;
  numQuestions: number; // 5, 10, 20, 50, 100, or -1 (continuous)
  answerMode: PracticeAnswerMode;
  numDigits?: number;
  numTerms?: number;
  timeLimitSeconds?: number;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateQuestion(category: OperationCategory, digits = 1, termsCount = 2): PracticeQuestion {
  const id = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  switch (category) {
    case 'fives_complement': {
      // e.g. 4 + 3, 4 + 2, 3 + 4, 2 + 4, 4 + 1
      const pairs = [
        { a: 4, b: 3, rule: "+3 = +5 - 2", ans: 7, beadClue: "Engage the upper 5-bead and disengage 2 lower beads on the units rod." },
        { a: 4, b: 2, rule: "+2 = +5 - 3", ans: 6, beadClue: "Engage the upper 5-bead and disengage 3 lower beads on the units rod." },
        { a: 3, b: 4, rule: "+4 = +5 - 1", ans: 7, beadClue: "Engage the upper 5-bead and disengage 1 lower bead on the units rod." },
        { a: 2, b: 4, rule: "+4 = +5 - 1", ans: 6, beadClue: "Engage the upper 5-bead and disengage 1 lower bead on the units rod." },
        { a: 3, b: 3, rule: "+3 = +5 - 2", ans: 6, beadClue: "Engage the upper 5-bead and disengage 2 lower beads on the units rod." },
        { a: 1, b: 4, rule: "+4 = +5 - 1", ans: 5, beadClue: "Engage the upper 5-bead and disengage 1 lower bead on the units rod." },
        { a: 7, b: -3, rule: "-3 = +2 - 5", ans: 4, beadClue: "Add 2 lower beads and disengage the upper 5-bead." },
        { a: 6, b: -2, rule: "-2 = +3 - 5", ans: 4, beadClue: "Add 3 lower beads and disengage the upper 5-bead." },
      ];
      const item = pairs[randInt(0, pairs.length - 1)];
      const op = item.b >= 0 ? '+' : '-';
      const bAbs = Math.abs(item.b);
      return {
        id,
        category,
        prompt: `${item.a} ${op} ${bAbs}`,
        terms: [item.a, item.b],
        operators: [op],
        correctAnswer: item.ans,
        decimals: 0,
        initialValue: item.a,
        hints: [
          "Look at the available lower beads. Is there enough room to move them directly?",
          `Use the Five's Complement strategy: ${item.rule}.`,
          item.beadClue,
          `Full Explanation: ${item.a} ${op} ${bAbs} = ${item.ans}. Since the units rod cannot fit the move directly, use the upper 5-bead with ${item.rule}.`,
        ],
        explanation: `Using the five's complement formula ${item.rule}, we reach ${item.ans}.`,
      };
    }

    case 'tens_complement': {
      // e.g. 8 + 7, 9 + 4, 8 + 8, 7 + 6, 13 - 6, 15 - 8
      const tensPairs = [
        { a: 8, b: 7, rule: "+7 = +10 - 3", ans: 15, beadClue: "Push 1 lower bead up on the Tens rod, and remove 3 lower beads from Units." },
        { a: 9, b: 4, rule: "+4 = +10 - 6", ans: 13, beadClue: "Add 1 to Tens rod, remove 6 (upper 5 + one 1-bead) from Units." },
        { a: 7, b: 8, rule: "+8 = +10 - 2", ans: 15, beadClue: "Add 1 to Tens rod, remove 2 lower beads from Units." },
        { a: 6, b: 7, rule: "+7 = +10 - 3", ans: 13, beadClue: "Add 1 to Tens rod, remove 3 lower beads from Units." },
        { a: 13, b: -6, rule: "-6 = -10 + 4", ans: 7, beadClue: "Remove 1 from Tens rod, and add 4 to Units rod (+5 - 1)." },
        { a: 15, b: -8, rule: "-8 = -10 + 2", ans: 7, beadClue: "Remove 1 from Tens rod, and add 2 lower beads to Units rod." },
        { a: 12, b: -5, rule: "-5 = -10 + 5", ans: 7, beadClue: "Remove 1 from Tens rod, and engage upper 5-bead on Units rod." },
      ];
      const item = tensPairs[randInt(0, tensPairs.length - 1)];
      const op = item.b >= 0 ? '+' : '-';
      const bAbs = Math.abs(item.b);
      return {
        id,
        category,
        prompt: `${item.a} ${op} ${bAbs}`,
        terms: [item.a, item.b],
        operators: [op],
        correctAnswer: item.ans,
        decimals: 0,
        initialValue: item.a,
        hints: [
          "The units rod alone cannot hold this amount. Think about borrowing or carrying with the tens place.",
          `Strategy: Use Ten's Complement rule (${item.rule}).`,
          item.beadClue,
          `Full Explanation: ${item.a} ${op} ${bAbs} = ${item.ans}. Ten's complement allows us to bridge rods cleanly: ${item.rule}.`,
        ],
        explanation: `Carrying / borrowing using ${item.rule} gives ${item.ans}.`,
      };
    }

    case 'add_single': {
      // Direct addition without carry (sum <= 9)
      const a = randInt(1, 4);
      const b = randInt(1, 4 - a);
      const ans = a + b;
      return {
        id,
        category,
        prompt: `${a} + ${b}`,
        terms: [a, b],
        operators: ['+'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: a,
        hints: [
          "Check how many lower beads are already at the reckoning beam.",
          "This is a direct addition problem — no carry or complement needed.",
          `Push ${b} more lower beads up to touch the reckoning beam.`,
          `${a} + ${b} = ${ans}. All required beads are directly available on the units rod.`,
        ],
        explanation: `Direct bead addition: ${a} + ${b} = ${ans}.`,
      };
    }

    case 'sub_single': {
      // Direct subtraction without borrow
      const a = randInt(5, 9);
      const b = randInt(1, a % 5 === 0 ? 5 : (a - 5));
      const ans = a - b;
      return {
        id,
        category,
        prompt: `${a} - ${b}`,
        terms: [a, b],
        operators: ['-'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: a,
        hints: [
          "Count the active beads currently touching the reckoning beam.",
          "This is a direct subtraction without borrowing from the tens place.",
          `Move active beads away from the beam to subtract ${b}.`,
          `${a} - ${b} = ${ans}. Simply move ${b} away from the reckoning bar.`,
        ],
        explanation: `Direct subtraction: ${a} - ${b} = ${ans}.`,
      };
    }

    case 'add_two_digit': {
      // Two digit addition (e.g. 23 + 14 = 37, 26 + 47 = 73, etc.)
      const a = randInt(15, 65);
      const b = randInt(12, 34);
      const ans = a + b;
      return {
        id,
        category,
        prompt: `${a} + ${b}`,
        terms: [a, b],
        operators: ['+'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: a,
        hints: [
          "Add the tens column first, then calculate the units column.",
          `Break down the second number: ${b} = ${Math.floor(b/10)*10} + ${b%10}.`,
          `Tens: ${a} + ${Math.floor(b/10)*10} = ${a + Math.floor(b/10)*10}. Now add ${b%10} to the units rod.`,
          `Complete calculation: ${a} + ${b} = ${ans}.`,
        ],
        explanation: `Multi-digit addition by place value: ${a} + ${b} = ${ans}.`,
      };
    }

    case 'sub_multidigit': {
      const a = randInt(45, 99);
      const b = randInt(11, a - 5);
      const ans = a - b;
      return {
        id,
        category,
        prompt: `${a} - ${b}`,
        terms: [a, b],
        operators: ['-'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: a,
        hints: [
          "Subtract the tens first from left to right, then subtract the units.",
          `Subtract ${Math.floor(b/10)*10} from ${a}, giving ${a - Math.floor(b/10)*10}.`,
          `Now subtract ${b%10} from the units rod.`,
          `${a} - ${b} = ${ans}.`,
        ],
        explanation: `Multi-digit subtraction: ${a} - ${b} = ${ans}.`,
      };
    }

    case 'multiplication': {
      const a = randInt(12, 45);
      const b = randInt(3, 9);
      const ans = a * b;
      const tensProd = Math.floor(a / 10) * 10 * b;
      const unitsProd = (a % 10) * b;
      return {
        id,
        category,
        prompt: `${a} × ${b}`,
        terms: [a, b],
        operators: ['×'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: 0,
        hints: [
          `Break into place values: (${Math.floor(a/10)*10} × ${b}) + (${a%10} × ${b}).`,
          `Step 1: ${Math.floor(a/10)*10} × ${b} = ${tensProd}. Set this on hundreds/tens rods.`,
          `Step 2: Add ${a%10} × ${b} = ${unitsProd} to the existing ${tensProd}.`,
          `Total: ${tensProd} + ${unitsProd} = ${ans}.`,
        ],
        explanation: `Multiplication via partial products: ${a} × ${b} = ${ans}.`,
      };
    }

    case 'division': {
      const divisor = randInt(3, 12);
      const quotient = randInt(4, 25);
      const dividend = divisor * quotient;
      return {
        id,
        category,
        prompt: `${dividend} ÷ ${divisor}`,
        terms: [dividend, divisor],
        operators: ['÷'],
        correctAnswer: quotient,
        decimals: 0,
        initialValue: dividend,
        hints: [
          `Find how many times ${divisor} fits into the highest place value of ${dividend}.`,
          `Think of multiplication in reverse: ${divisor} × ? = ${dividend}.`,
          `Try estimating with friendly numbers, e.g. ${divisor} × 10 = ${divisor * 10}.`,
          `${dividend} ÷ ${divisor} = ${quotient}. (Check: ${quotient} × ${divisor} = ${dividend}).`,
        ],
        explanation: `Division quotient: ${dividend} ÷ ${divisor} = ${quotient}.`,
      };
    }

    case 'decimals': {
      const a = Number((randInt(10, 45) + randInt(1, 9) * 0.1).toFixed(1));
      const b = Number((randInt(2, 15) + randInt(1, 9) * 0.1).toFixed(1));
      const ans = Number((a + b).toFixed(2));
      return {
        id,
        category,
        prompt: `${a} + ${b}`,
        terms: [a, b],
        operators: ['+'],
        correctAnswer: ans,
        decimals: 2,
        initialValue: a,
        hints: [
          "Keep place values aligned with the reckoning dot (unit rod).",
          "Add the whole numbers first, then add the tenths and hundredths.",
          `Units: ${Math.floor(a)} + ${Math.floor(b)} = ${Math.floor(a) + Math.floor(b)}. Now calculate the decimal parts.`,
          `Aligned decimal addition gives ${a} + ${b} = ${ans}.`,
        ],
        explanation: `Exact decimal addition: ${a} + ${b} = ${ans}.`,
      };
    }

    case 'percentages': {
      const percents = [10, 20, 25, 50];
      const p = percents[randInt(0, percents.length - 1)];
      const base = randInt(2, 10) * (100 / p);
      const ans = (base * p) / 100;
      return {
        id,
        category,
        prompt: `${p}% of ${base}`,
        terms: [p, base],
        operators: ['%'],
        correctAnswer: ans,
        decimals: 0,
        initialValue: 0,
        hints: [
          `Convert the percentage to a friendly fraction: ${p}% = ${p === 50 ? '1/2' : p === 25 ? '1/4' : p === 20 ? '1/5' : '1/10'}.`,
          `Divide ${base} by the fraction denominator.`,
          `Calculate ${base} ÷ ${100 / p}.`,
          `${p}% of ${base} = ${ans}.`,
        ],
        explanation: `${p}% of ${base} = ${ans}.`,
      };
    }

    default: {
      // Mixed addition / subtraction
      const a = randInt(10, 50);
      const b = randInt(5, 30);
      const isAdd = Math.random() > 0.4;
      const ans = isAdd ? a + b : a - (b > a ? a - 2 : b);
      const op = isAdd ? '+' : '-';
      const term2 = isAdd ? b : (b > a ? a - 2 : b);
      return {
        id,
        category: 'mixed',
        prompt: `${a} ${op} ${term2}`,
        terms: [a, term2],
        operators: [op],
        correctAnswer: ans,
        decimals: 0,
        initialValue: a,
        hints: [
          `Observe whether beads need to be added or subtracted.`,
          `Check whether any complements (5's or 10's) are required for the units rod.`,
          `Place value step: calculate tens first, then units.`,
          `${a} ${op} ${term2} = ${ans}.`,
        ],
        explanation: `Calculation result: ${a} ${op} ${term2} = ${ans}.`,
      };
    }
  }
}

export function generateQuestionSet(config: PracticeConfig): PracticeQuestion[] {
  const count = config.numQuestions > 0 ? config.numQuestions : 10;
  const list: PracticeQuestion[] = [];
  for (let i = 0; i < count; i++) {
    list.push(generateQuestion(config.category, config.numDigits || 1, config.numTerms || 2));
  }
  return list;
}
