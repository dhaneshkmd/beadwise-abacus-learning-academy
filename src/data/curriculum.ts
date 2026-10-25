/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Complete 13-Level Abacus Curriculum (Level 0 through Level 12)
 * Includes all learning objectives, detailed instructions, interactive demo steps, and test tasks.
 */

import { DemonstrationStep, getSampleLearningExperiences } from '../engine/sorobanMath';
import { createEmptyAbacus, setAbacusFromNumber } from '../engine/abacusEngine';

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  level: number;
  badgeName: string;
  conceptText: string;
  keyRule?: string;
  workedExampleId?: string;
  demoSteps: DemonstrationStep[];
  guidedPractice: {
    question: string;
    targetValue: number;
    initialValue: number;
    hint: string;
    strategy: string;
  }[];
}

export interface CurriculumLevel {
  level: number;
  title: string;
  category: string;
  description: string;
  badgeTitle: string;
  color: string;
  lessons: Lesson[];
}

const sampleExamples = getSampleLearningExperiences();

export const CURRICULUM: CurriculumLevel[] = [
  {
    level: 0,
    title: 'Discover the Abacus',
    category: 'Foundation',
    description: 'Learn the anatomy of the Japanese Soroban, the reckoning beam, rods, upper 5-beads, and lower 1-beads.',
    badgeTitle: 'Bead Beginner',
    color: 'from-amber-500 to-orange-600',
    lessons: [
      {
        id: 'l0-structure',
        title: 'Anatomy of the Soroban',
        subtitle: 'Frame, Beam, Rods, and Beads',
        level: 0,
        badgeName: 'Bead Explorer',
        conceptText: 'The Japanese Soroban is divided by a horizontal Reckoning Beam (or Bar). The upper deck has 1 bead per rod, representing 5. The lower deck has 4 beads per rod, each representing 1. Only beads pushed towards the reckoning beam count as active!',
        keyRule: 'Active beads touch the horizontal reckoning beam.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Zero Position (Clean Slate)',
            explanation: 'When all upper beads are pushed UP away from the beam, and all lower beads are pushed DOWN away from the beam, the abacus reads 0.',
            rodIndex: 4,
            actionType: 'init',
            resultingState: createEmptyAbacus(5, 4),
            runningValue: 0,
            mathDisplay: 'Abacus = 0',
          },
          {
            stepNumber: 2,
            title: 'The Upper 5-Bead',
            explanation: 'Push down the upper bead to touch the beam. This immediately adds 5 to this rod.',
            rodIndex: 4,
            actionType: 'engage_upper',
            highlightUpper: true,
            resultingState: (() => {
              const s = createEmptyAbacus(5, 4);
              s.rods[4].upper = true;
              return s;
            })(),
            runningValue: 5,
            mathDisplay: 'Upper Bead = 5',
          },
          {
            stepNumber: 3,
            title: 'The Lower 1-Beads',
            explanation: 'Push up 1 lower bead towards the beam. Combined with 5, the rod now reads 6.',
            rodIndex: 4,
            actionType: 'add_lower',
            highlightLowerIndices: [0],
            resultingState: (() => {
              const s = createEmptyAbacus(5, 4);
              s.rods[4].upper = true;
              s.rods[4].lower = 1;
              return s;
            })(),
            runningValue: 6,
            mathDisplay: '5 + 1 = 6',
          },
        ],
        guidedPractice: [
          {
            question: 'Set the units rod to 5 by engaging the upper bead.',
            targetValue: 5,
            initialValue: 0,
            hint: 'Touch or click the upper bead on the units rod to push it down toward the beam.',
            strategy: 'The upper bead is worth 5 when touching the reckoning beam.',
          },
          {
            question: 'Set the units rod to 3 by moving lower beads.',
            targetValue: 3,
            initialValue: 0,
            hint: 'Push 3 lower beads up toward the reckoning beam.',
            strategy: 'Each lower bead is worth 1.',
          },
        ],
      },
    ],
  },

  {
    level: 1,
    title: 'Number Recognition (0–99)',
    category: 'Foundation',
    description: 'Recognise and represent digits 0 through 9 on individual rods, and build 2-digit numbers with place values.',
    badgeTitle: 'Number Explorer',
    color: 'from-blue-500 to-indigo-600',
    lessons: [
      {
        id: 'l1-recognise-7',
        title: 'Representing Single Digits (Recognising 7)',
        subtitle: 'Upper 5-Bead plus Two Lower Beads',
        level: 1,
        badgeName: 'Digit Master',
        conceptText: 'Numbers from 0 to 9 are made by combining the upper 5-bead and 0 to 4 lower beads. For example: 0 is empty, 1 is one lower, 4 is four lower, 5 is upper only, 6 is 5 + 1, 7 is 5 + 2, 8 is 5 + 3, and 9 is 5 + 4.',
        keyRule: 'Rod Value = (5 × Upper) + (1 × Lower)',
        workedExampleId: 'ex-1-recognise-7',
        demoSteps: sampleExamples[0].steps,
        guidedPractice: [
          {
            question: 'Set the abacus to represent 7 on the units rod.',
            targetValue: 7,
            initialValue: 0,
            hint: 'Engage the 5-bead and two 1-beads.',
            strategy: '5 + 2 = 7',
          },
          {
            question: 'Set the abacus to represent 9.',
            targetValue: 9,
            initialValue: 0,
            hint: 'Engage the upper bead and all four lower beads.',
            strategy: '5 + 4 = 9',
          },
          {
            question: 'Set the abacus to represent 28 (Tens rod = 2, Units rod = 8).',
            targetValue: 28,
            initialValue: 0,
            hint: 'Put 2 on the rod left of units, and 8 on the units rod.',
            strategy: '20 + 8 = 28',
          },
        ],
      },
    ],
  },

  {
    level: 2,
    title: 'Basic Addition (No Carrying)',
    category: 'Basic Arithmetic',
    description: 'Perform single-digit and multi-digit addition directly when beads are available without needing complements.',
    badgeTitle: 'Addition Champion',
    color: 'from-emerald-500 to-teal-600',
    lessons: [
      {
        id: 'l2-direct-add',
        title: 'Direct Addition',
        subtitle: 'Adding 1, 2, or 3 Lower Beads',
        level: 2,
        badgeName: 'Direct Adder',
        conceptText: 'Direct addition is used whenever the required beads are free and ready to move towards the beam. For example, starting with 2 and adding 2 simply moves two more lower beads up to make 4.',
        keyRule: 'Direct Move: Push available beads toward the beam.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Set 2 on Units Rod',
            explanation: 'Push up 2 lower beads on the units rod.',
            rodIndex: 4,
            actionType: 'add_lower',
            highlightLowerIndices: [0, 1],
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 2),
            runningValue: 2,
            mathDisplay: '2',
          },
          {
            stepNumber: 2,
            title: 'Add 5 Directly',
            explanation: 'The upper bead is free! Push it down toward the beam. 2 + 5 = 7.',
            rodIndex: 4,
            actionType: 'engage_upper',
            highlightUpper: true,
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 7),
            runningValue: 7,
            mathDisplay: '2 + 5 = 7',
          },
        ],
        guidedPractice: [
          {
            question: 'Calculate: 1 + 3',
            targetValue: 4,
            initialValue: 1,
            hint: 'Push 3 more lower beads up to the beam.',
            strategy: 'Direct addition: 1 + 3 = 4',
          },
          {
            question: 'Calculate: 3 + 5',
            targetValue: 8,
            initialValue: 3,
            hint: 'Push down the upper 5-bead.',
            strategy: 'Direct addition: 3 + 5 = 8',
          },
          {
            question: 'Calculate: 21 + 13',
            targetValue: 34,
            initialValue: 21,
            hint: 'Add 1 to tens rod (20 -> 30) and 3 to units rod (1 -> 4).',
            strategy: 'Place value addition: 21 + 13 = 34',
          },
        ],
      },
    ],
  },

  {
    level: 3,
    title: 'Basic Subtraction (No Borrowing)',
    category: 'Basic Arithmetic',
    description: 'Subtract single and multi-digit numbers directly by pushing active beads away from the reckoning beam.',
    badgeTitle: 'Subtraction Star',
    color: 'from-cyan-500 to-blue-600',
    lessons: [
      {
        id: 'l3-direct-sub',
        title: 'Direct Subtraction',
        subtitle: 'Removing Active Beads',
        level: 3,
        badgeName: 'Bead Subtractor',
        conceptText: 'When subtracting without borrowing, simply push active beads away from the reckoning beam. To subtract 1, push down 1 lower bead. To subtract 5, push up the upper bead.',
        keyRule: 'Subtracting: Move beads away from the reckoning beam.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Set Initial Value 8',
            explanation: 'Units rod has upper bead (5) and 3 lower beads (3) engaged.',
            rodIndex: 4,
            actionType: 'init',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 8),
            runningValue: 8,
            mathDisplay: '8',
          },
          {
            stepNumber: 2,
            title: 'Subtract 3 Directly',
            explanation: 'Push 3 lower beads down away from the beam. 8 - 3 = 5.',
            rodIndex: 4,
            actionType: 'sub_lower',
            highlightLowerIndices: [0, 1, 2],
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 5),
            runningValue: 5,
            mathDisplay: '8 - 3 = 5',
          },
        ],
        guidedPractice: [
          {
            question: 'Calculate: 9 - 4',
            targetValue: 5,
            initialValue: 9,
            hint: 'Push 4 lower beads down away from the beam.',
            strategy: 'Direct subtraction: 9 - 4 = 5',
          },
          {
            question: 'Calculate: 7 - 5',
            targetValue: 2,
            initialValue: 7,
            hint: 'Push the upper 5-bead up away from the beam.',
            strategy: 'Direct subtraction: 7 - 5 = 2',
          },
        ],
      },
    ],
  },

  {
    level: 4,
    title: "Five's Complement (+5 / -5)",
    category: 'Intermediate Techniques',
    description: "Master complementary numbers of 5: when there are not enough lower beads, use the 5-bead with complements (+4 = +5 - 1, etc.).",
    badgeTitle: 'Complement Master',
    color: 'from-purple-500 to-indigo-600',
    lessons: [
      {
        id: 'l4-fives-comp',
        title: "Five's Complement Addition (4 + 3)",
        subtitle: 'Using Friends of 5 (+5 - 2)',
        level: 4,
        badgeName: "Five's Champion",
        conceptText: "When adding to a rod and you do not have enough lower beads free, but the upper 5-bead is free, use the Five's Complement: +3 = +5 - 2, +4 = +5 - 1, +2 = +5 - 3, +1 = +5 - 4.",
        keyRule: "Five's Complement: +x = +5 - (5 - x)",
        workedExampleId: 'ex-2-fives-complement',
        demoSteps: sampleExamples[1].steps,
        guidedPractice: [
          {
            question: 'Calculate: 4 + 3 using Five\'s Complement',
            targetValue: 7,
            initialValue: 4,
            hint: 'Engage the 5-bead and disengage 2 lower beads (+5 - 2).',
            strategy: '+3 = +5 - 2',
          },
          {
            question: 'Calculate: 3 + 4',
            targetValue: 7,
            initialValue: 3,
            hint: 'Use +4 = +5 - 1 (engage 5-bead, remove 1 lower bead).',
            strategy: '+4 = +5 - 1',
          },
          {
            question: 'Calculate: 2 + 4',
            targetValue: 6,
            initialValue: 2,
            hint: 'Add 5 and remove 1.',
            strategy: '+4 = +5 - 1',
          },
        ],
      },
    ],
  },

  {
    level: 5,
    title: "Ten's Complement (Carrying & Borrowing)",
    category: 'Intermediate Techniques',
    description: "Learn carrying and borrowing between adjacent rods using 10's complements (+7 = +10 - 3, -6 = -10 + 4).",
    badgeTitle: "Ten's Master",
    color: 'from-rose-500 to-pink-600',
    lessons: [
      {
        id: 'l5-tens-add',
        title: "Carrying with Ten's Complement (8 + 7)",
        subtitle: 'Passing 10 to the Next Rod (+10 - 3)',
        level: 5,
        badgeName: 'Carry Wizard',
        conceptText: "When a rod cannot hold the amount being added, carry 1 to the next left rod (+10) and subtract the complement on the current rod. For +7, add 10 to the tens rod and subtract 3 from the units rod.",
        keyRule: "Ten's Complement Addition: +x = +10 - (10 - x)",
        workedExampleId: 'ex-3-tens-complement',
        demoSteps: sampleExamples[2].steps,
        guidedPractice: [
          {
            question: 'Calculate: 8 + 7',
            targetValue: 15,
            initialValue: 8,
            hint: 'Add 1 to tens rod, subtract 3 from units rod (+10 - 3).',
            strategy: '+7 = +10 - 3',
          },
          {
            question: 'Calculate: 9 + 4',
            targetValue: 13,
            initialValue: 9,
            hint: 'Add 1 to tens rod, subtract 6 from units rod (+10 - 6).',
            strategy: '+4 = +10 - 6',
          },
          {
            question: 'Calculate: 13 - 6 (Borrowing)',
            targetValue: 7,
            initialValue: 13,
            hint: 'Take away 10 from tens rod and add 4 to units rod (-10 + 4).',
            strategy: '-6 = -10 + 4',
          },
        ],
      },
    ],
  },

  {
    level: 6,
    title: 'Multi-Digit Calculations',
    category: 'Advanced Arithmetic',
    description: 'Calculate with two-digit and three-digit numbers, applying multi-step carries and borrows (26 + 47 = 73, 100 - 58 = 42).',
    badgeTitle: 'Multi-Digit Master',
    color: 'from-amber-600 to-yellow-500',
    lessons: [
      {
        id: 'l6-multidigit',
        title: 'Multi-Digit Addition (26 + 47 = 73)',
        subtitle: 'Sequential Tens and Units Addition',
        level: 6,
        badgeName: 'Multi-Rod Expert',
        conceptText: 'When calculating multi-digit numbers, work from left to right (highest place value first) or right to left. Add tens first: 26 + 40 = 66. Then add units: 66 + 7 = 73.',
        keyRule: 'Break numbers into place values: (20 + 40) + (6 + 7).',
        workedExampleId: 'ex-5-multi-digit',
        demoSteps: sampleExamples[4].steps,
        guidedPractice: [
          {
            question: 'Calculate: 26 + 47',
            targetValue: 73,
            initialValue: 26,
            hint: 'Add 40 to tens rod (+50 - 10) then 7 to units rod (+10 - 3).',
            strategy: '26 + 40 = 66; 66 + 7 = 73',
          },
          {
            question: 'Calculate: 100 - 58',
            targetValue: 42,
            initialValue: 100,
            hint: 'Subtract 50 (leaves 50), then subtract 8 (leaves 42).',
            strategy: '100 - 50 = 50; 50 - 8 = 42',
          },
        ],
      },
    ],
  },

  {
    level: 7,
    title: 'Multiplication (36 × 4 = 144)',
    category: 'Advanced Arithmetic',
    description: 'Soroban multiplication via place-value partial products and accumulating rods.',
    badgeTitle: 'Multiplication Wizard',
    color: 'from-emerald-600 to-green-500',
    lessons: [
      {
        id: 'l7-multiplication',
        title: 'Two-Digit Multiplication (36 × 4)',
        subtitle: 'Partial Products on the Soroban',
        level: 7,
        badgeName: 'Multiplication Maestro',
        conceptText: 'Multiply each place value: 30 × 4 = 120. Set 120 on the abacus. Next, multiply 6 × 4 = 24. Add 24 to the existing 120: 120 + 24 = 144.',
        keyRule: '(30 × 4) + (6 × 4) = 120 + 24 = 144',
        workedExampleId: 'ex-6-multiplication',
        demoSteps: sampleExamples[5].steps,
        guidedPractice: [
          {
            question: 'Calculate: 36 × 4',
            targetValue: 144,
            initialValue: 0,
            hint: 'Calculate 30 × 4 = 120, then add 6 × 4 = 24.',
            strategy: '120 + 24 = 144',
          },
          {
            question: 'Calculate: 25 × 5',
            targetValue: 125,
            initialValue: 0,
            hint: '20 × 5 = 100; 5 × 5 = 25; Total = 125.',
            strategy: '100 + 25 = 125',
          },
        ],
      },
    ],
  },

  {
    level: 8,
    title: 'Division (144 ÷ 12 = 12)',
    category: 'Advanced Arithmetic',
    description: 'Exact division and quotient rod alignment on the Soroban.',
    badgeTitle: 'Division Dynamo',
    color: 'from-blue-600 to-sky-500',
    lessons: [
      {
        id: 'l8-division',
        title: 'Long Division (144 ÷ 12 = 12)',
        subtitle: 'Setting Dividend and Subtracting Products',
        level: 8,
        badgeName: 'Division Ace',
        conceptText: 'Set 144 on the rods. Find how many times 12 fits into 14: 1 time (in tens place = 10). Subtract 120 from 144, leaving 24. 12 fits into 24 exactly 2 times. 24 - 24 = 0. Final quotient is 12.',
        keyRule: 'Dividend - (Quotient × Divisor) until remainder is 0.',
        workedExampleId: 'ex-7-division',
        demoSteps: sampleExamples[6].steps,
        guidedPractice: [
          {
            question: 'Calculate: 144 ÷ 12',
            targetValue: 12,
            initialValue: 144,
            hint: 'Find tens quotient (10 × 12 = 120, leaves 24) and units quotient (2 × 12 = 24).',
            strategy: '144 ÷ 12 = 12',
          },
          {
            question: 'Calculate: 96 ÷ 3',
            targetValue: 32,
            initialValue: 96,
            hint: '90 ÷ 3 = 30; 6 ÷ 3 = 2; Total = 32.',
            strategy: '30 + 2 = 32',
          },
        ],
      },
    ],
  },

  {
    level: 9,
    title: 'Decimal Arithmetic (12.5 + 3.75 = 16.25)',
    category: 'Decimals & Real Numbers',
    description: 'Represent decimal places with the unit dot marker. Perform addition and subtraction with tenths and hundredths.',
    badgeTitle: 'Decimal Virtuoso',
    color: 'from-teal-600 to-cyan-500',
    lessons: [
      {
        id: 'l9-decimals',
        title: 'Decimal Alignment (12.5 + 3.75)',
        subtitle: 'Tenths, Hundredths, and Unit Rod Dot',
        level: 9,
        badgeName: 'Decimal Navigator',
        conceptText: 'On the Soroban, white reckoning dots mark the units rod (10^0). Rods to the right represent tenths (0.1) and hundredths (0.01). Always align numbers at the unit dot!',
        keyRule: 'Keep unit rod aligned with the decimal point.',
        workedExampleId: 'ex-8-decimals',
        demoSteps: sampleExamples[7].steps,
        guidedPractice: [
          {
            question: 'Calculate: 12.5 + 3.75',
            targetValue: 16.25,
            initialValue: 12.5,
            hint: 'Add 3 to units (15.5), 0.7 to tenths (16.2), and 0.05 to hundredths (16.25).',
            strategy: '12.5 + 3.75 = 16.25',
          },
          {
            question: 'Calculate: 5.4 - 2.1',
            targetValue: 3.3,
            initialValue: 5.4,
            hint: 'Subtract 2 from units rod and 0.1 from tenths rod.',
            strategy: '5.4 - 2.1 = 3.3',
          },
        ],
      },
    ],
  },

  {
    level: 10,
    title: 'Advanced Mathematics',
    category: 'Mastery',
    description: 'Percentages, squares, number patterns, and mental estimations.',
    badgeTitle: 'Math Strategist',
    color: 'from-violet-600 to-purple-600',
    lessons: [
      {
        id: 'l10-percentages',
        title: 'Percentages & Squares',
        subtitle: '25% of 80 and 15²',
        level: 10,
        badgeName: 'Percent Pro',
        conceptText: '25% means one-fourth (1/4). To find 25% of 80, divide 80 by 4 = 20. To square 15: 15 × 15 = 15 × 10 (150) + 15 × 5 (75) = 225.',
        keyRule: '25% of 80 = 80 ÷ 4 = 20. 15² = 225.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Decompose 25% of 80',
            explanation: '25% = 1/4. Calculating 80 ÷ 4.',
            rodIndex: 4,
            actionType: 'init',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 80),
            runningValue: 80,
            mathDisplay: '25% of 80 = 80 ÷ 4',
          },
          {
            stepNumber: 2,
            title: 'Result: 20',
            explanation: '8 tens divided by 4 equals 2 tens. Result is 20.',
            rodIndex: 3,
            actionType: 'set_rod',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 20),
            runningValue: 20,
            mathDisplay: '80 ÷ 4 = 20',
          },
        ],
        guidedPractice: [
          {
            question: 'Calculate: 25% of 80',
            targetValue: 20,
            initialValue: 0,
            hint: 'Divide 80 by 4.',
            strategy: '80 / 4 = 20',
          },
          {
            question: 'Calculate: 15²',
            targetValue: 225,
            initialValue: 0,
            hint: '15 × 15 = 225',
            strategy: '15 × 15 = 225',
          },
        ],
      },
    ],
  },

  {
    level: 11,
    title: 'Mental Abacus (Anzan)',
    category: 'Mental Calculation',
    description: 'Visualise the Soroban in your mind. Perform rapid arithmetic without touching physical beads.',
    badgeTitle: 'Mental Abacus Expert',
    color: 'from-fuchsia-600 to-pink-600',
    lessons: [
      {
        id: 'l11-mental',
        title: 'Flash Anzan Visualisation',
        subtitle: 'Seeing Beads With Your Mind\'s Eye',
        level: 11,
        badgeName: 'Inner Eye',
        conceptText: 'Anzan is the art of mental Soroban calculation. Experienced learners visualize an imaginary abacus in their mind and mentally move the beads with their fingers, calculating faster than a calculator!',
        keyRule: 'Visualise the reckoning beam and move beads in your imagination.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Mental Picture: Zero',
            explanation: 'Close your eyes or look at the blank space. Picture the horizontal reckoning beam with all beads at rest.',
            rodIndex: 4,
            actionType: 'init',
            resultingState: createEmptyAbacus(5, 4),
            runningValue: 0,
            mathDisplay: 'Mental Image: 0',
          },
          {
            stepNumber: 2,
            title: 'Flash Number: +5',
            explanation: 'Mentally snap down the upper 5-bead in your mind.',
            rodIndex: 4,
            actionType: 'engage_upper',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 5),
            runningValue: 5,
            mathDisplay: 'Mental Value: 5',
          },
          {
            stepNumber: 3,
            title: 'Flash Number: +3',
            explanation: 'Mentally push up 3 lower beads. You clearly "see" 8.',
            rodIndex: 4,
            actionType: 'set_rod',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 8),
            runningValue: 8,
            mathDisplay: 'Mental Value: 8',
          },
        ],
        guidedPractice: [
          {
            question: 'Mental Sum: 4 + 5',
            targetValue: 9,
            initialValue: 0,
            hint: 'Visualise 4 lower beads up, then snap the upper 5-bead down.',
            strategy: 'Mental 4 + 5 = 9',
          },
          {
            question: 'Mental Sum: 7 + 2',
            targetValue: 9,
            initialValue: 0,
            hint: 'Start with 7 (5 + 2). Add 2 lower beads.',
            strategy: 'Mental 7 + 2 = 9',
          },
        ],
      },
    ],
  },

  {
    level: 12,
    title: 'Expert Challenge',
    category: 'Grandmastery',
    description: 'Complex calculation sequences, rapid fire multi-term chains, speed calculations, and mastery exams.',
    badgeTitle: 'Speed Calculator',
    color: 'from-rose-600 to-red-600',
    lessons: [
      {
        id: 'l12-expert',
        title: 'Multi-Term Rapid Arithmetic',
        subtitle: 'Sequential Chains: 15 + 27 - 8 + 42',
        level: 12,
        badgeName: 'Grandmaster',
        conceptText: 'In advanced competitive abacus, students solve chains of 4 to 10 numbers in seconds. Steady rhythm, flawless complement recall, and absolute focus create astonishing computational speed.',
        keyRule: 'Rhythm, complement mastery, and fluid rod transitions.',
        demoSteps: [
          {
            stepNumber: 1,
            title: 'Chain: 15 + 27',
            explanation: '15 + 27 = 42.',
            rodIndex: 4,
            actionType: 'set_rod',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 42),
            runningValue: 42,
            mathDisplay: '15 + 27 = 42',
          },
          {
            stepNumber: 2,
            title: 'Chain: 42 - 8',
            explanation: '42 - 8 = 34.',
            rodIndex: 4,
            actionType: 'set_rod',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 34),
            runningValue: 34,
            mathDisplay: '42 - 8 = 34',
          },
          {
            stepNumber: 3,
            title: 'Chain: 34 + 42 = 76',
            explanation: '34 + 42 = 76.',
            rodIndex: 4,
            actionType: 'set_rod',
            resultingState: setAbacusFromNumber(createEmptyAbacus(5, 4), 76),
            runningValue: 76,
            mathDisplay: '34 + 42 = 76',
          },
        ],
        guidedPractice: [
          {
            question: 'Solve Chain: 12 + 18 + 15',
            targetValue: 45,
            initialValue: 0,
            hint: '12 + 18 = 30; 30 + 15 = 45',
            strategy: '12 + 18 + 15 = 45',
          },
          {
            question: 'Solve Chain: 50 - 15 + 25',
            targetValue: 60,
            initialValue: 0,
            hint: '50 - 15 = 35; 35 + 25 = 60',
            strategy: '50 - 15 + 25 = 60',
          },
        ],
      },
    ],
  },
];
