/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Soroban Arithmetic Rules, Complement Logic, and Step-by-Step Demonstrations
 */

import {
  AbacusState,
  createEmptyAbacus,
  cloneAbacus,
  getRodValue,
  setAbacusFromNumber,
  setRodDigit,
  toggleUpperBead,
  setLowerBeads,
  digitToRodState,
} from './abacusEngine';

export interface DemonstrationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  ruleName?: string;
  rodIndex: number;
  actionType: 'init' | 'engage_upper' | 'disengage_upper' | 'add_lower' | 'sub_lower' | 'set_rod';
  highlightUpper?: boolean;
  highlightLowerIndices?: number[]; // indices of lower beads to highlight (0..3)
  resultingState: AbacusState;
  runningValue: number;
  mathDisplay: string;
}

export interface WorkedExample {
  id: string;
  title: string;
  level: number;
  formula: string;
  result: number;
  rodCount: number;
  unitRodIndex: number;
  conceptSummary: string;
  steps: DemonstrationStep[];
}

/**
 * Five's complement rules:
 * Adding:
 * +4 = +5 - 1
 * +3 = +5 - 2
 * +2 = +5 - 3
 * +1 = +5 - 4
 * Subtracting:
 * -4 = +1 - 5
 * -3 = +2 - 5
 * -2 = +3 - 5
 * -1 = +4 - 5
 */
export const FIVES_COMPLEMENT_ADD: Record<number, { addUpper: boolean; subLower: number; rule: string }> = {
  1: { addUpper: true, subLower: 4, rule: "Five's Complement: +1 = +5 - 4" },
  2: { addUpper: true, subLower: 3, rule: "Five's Complement: +2 = +5 - 3" },
  3: { addUpper: true, subLower: 2, rule: "Five's Complement: +3 = +5 - 2" },
  4: { addUpper: true, subLower: 1, rule: "Five's Complement: +4 = +5 - 1" },
};

export const FIVES_COMPLEMENT_SUB: Record<number, { subUpper: boolean; addLower: number; rule: string }> = {
  1: { subUpper: true, addLower: 4, rule: "Five's Complement: -1 = +4 - 5" },
  2: { subUpper: true, addLower: 3, rule: "Five's Complement: -2 = +3 - 5" },
  3: { subUpper: true, addLower: 2, rule: "Five's Complement: -3 = +2 - 5" },
  4: { subUpper: true, addLower: 1, rule: "Five's Complement: -4 = +1 - 5" },
};

/**
 * Ten's complement rules:
 * Adding (+x when rod cannot hold +x):
 * +x = +10 - (10 - x)
 */
export const TENS_COMPLEMENT_ADD: Record<number, { subUnits: number; rule: string }> = {
  1: { subUnits: 9, rule: "Ten's Complement: +1 = +10 - 9" },
  2: { subUnits: 8, rule: "Ten's Complement: +2 = +10 - 8" },
  3: { subUnits: 7, rule: "Ten's Complement: +3 = +10 - 7" },
  4: { subUnits: 6, rule: "Ten's Complement: +4 = +10 - 6" },
  5: { subUnits: 5, rule: "Ten's Complement: +5 = +10 - 5" },
  6: { subUnits: 4, rule: "Ten's Complement: +6 = +10 - 4" },
  7: { subUnits: 3, rule: "Ten's Complement: +7 = +10 - 3" },
  8: { subUnits: 2, rule: "Ten's Complement: +8 = +10 - 2" },
  9: { subUnits: 1, rule: "Ten's Complement: +9 = +10 - 1" },
};

export const TENS_COMPLEMENT_SUB: Record<number, { addUnits: number; rule: string }> = {
  1: { addUnits: 9, rule: "Ten's Complement: -1 = -10 + 9" },
  2: { addUnits: 8, rule: "Ten's Complement: -2 = -10 + 8" },
  3: { addUnits: 7, rule: "Ten's Complement: -3 = -10 + 7" },
  4: { addUnits: 6, rule: "Ten's Complement: -4 = -10 + 6" },
  5: { addUnits: 5, rule: "Ten's Complement: -5 = -10 + 5" },
  6: { addUnits: 4, rule: "Ten's Complement: -6 = -10 + 4" },
  7: { addUnits: 3, rule: "Ten's Complement: -7 = -10 + 3" },
  8: { addUnits: 2, rule: "Ten's Complement: -8 = -10 + 2" },
  9: { addUnits: 1, rule: "Ten's Complement: -9 = -10 + 1" },
};

/**
 * Generate Worked Examples explicitly matching Section 17 of Prompt.
 */
export function getSampleLearningExperiences(): WorkedExample[] {
  return [
    // Example 1: Recognising 7
    {
      id: 'ex-1-recognise-7',
      title: 'Example 1: Recognising 7',
      level: 1,
      formula: 'Represent 7',
      result: 7,
      rodCount: 5,
      unitRodIndex: 4,
      conceptSummary: 'Represent 7 on a single rod using the upper 5-bead and two lower 1-beads.',
      steps: [
        {
          stepNumber: 1,
          title: 'Start at Zero',
          explanation: 'All beads start at rest away from the reckoning bar.',
          rodIndex: 4,
          actionType: 'init',
          resultingState: createEmptyAbacus(5, 4),
          runningValue: 0,
          mathDisplay: 'Current Value = 0',
        },
        {
          stepNumber: 2,
          title: 'Engage the Upper 5-Bead',
          explanation: 'Push down the upper bead on the units rod (rod 4) towards the reckoning beam. This adds 5.',
          rodIndex: 4,
          actionType: 'engage_upper',
          highlightUpper: true,
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4].upper = true;
            return s;
          })(),
          runningValue: 5,
          mathDisplay: '5',
        },
        {
          stepNumber: 3,
          title: 'Engage Two Lower 1-Beads',
          explanation: 'Push up two lower beads on the units rod towards the reckoning beam. 5 + 2 = 7.',
          rodIndex: 4,
          actionType: 'add_lower',
          highlightLowerIndices: [0, 1],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4].upper = true;
            s.rods[4].lower = 2;
            return s;
          })(),
          runningValue: 7,
          mathDisplay: '5 + 1 + 1 = 7',
        },
      ],
    },

    // Example 2: 4 + 3
    {
      id: 'ex-2-fives-complement',
      title: "Example 2: 4 + 3 (Five's Complement)",
      level: 4,
      formula: '4 + 3 = 7',
      result: 7,
      rodCount: 5,
      unitRodIndex: 4,
      conceptSummary: "Teach the five's complement technique. Since there are not 3 lower beads free, use +5 - 2.",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Initial Value 4',
          explanation: 'Push up all 4 lower beads on the units rod.',
          rodIndex: 4,
          actionType: 'add_lower',
          highlightLowerIndices: [0, 1, 2, 3],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4].lower = 4;
            return s;
          })(),
          runningValue: 4,
          mathDisplay: '4',
        },
        {
          stepNumber: 2,
          title: "Apply Five's Complement (+5)",
          explanation: "We need to add 3, but only 0 lower beads are free. Use the 5-bead: push down the upper bead (+5).",
          ruleName: "Five's Complement: +3 = +5 - 2",
          rodIndex: 4,
          actionType: 'engage_upper',
          highlightUpper: true,
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4].upper = true;
            s.rods[4].lower = 4;
            return s;
          })(),
          runningValue: 9,
          mathDisplay: '4 + 5 = 9',
        },
        {
          stepNumber: 3,
          title: "Complete the Complement (-2)",
          explanation: "Subtract 2 lower beads (push 2 lower beads down away from the beam). 9 - 2 = 7.",
          ruleName: "Five's Complement: +3 = +5 - 2",
          rodIndex: 4,
          actionType: 'sub_lower',
          highlightLowerIndices: [2, 3],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4].upper = true;
            s.rods[4].lower = 2;
            return s;
          })(),
          runningValue: 7,
          mathDisplay: '4 + 5 - 2 = 7',
        },
      ],
    },

    // Example 3: 8 + 7
    {
      id: 'ex-3-tens-complement',
      title: "Example 3: 8 + 7 (Ten's Complement)",
      level: 5,
      formula: '8 + 7 = 15',
      result: 15,
      rodCount: 5,
      unitRodIndex: 4,
      conceptSummary: "Teach the ten's complement technique. 7's friend of 10 is 3, so apply +10 - 3.",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Initial Value 8',
          explanation: 'On the units rod (rod 4), engage upper bead (5) and 3 lower beads (3). Value = 8.',
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[4] = { upper: true, lower: 3 };
            return s;
          })(),
          runningValue: 8,
          mathDisplay: '8',
        },
        {
          stepNumber: 2,
          title: 'Carry 1 to the Tens Rod (+10)',
          explanation: "Units rod only has 1 lower bead free, so 7 cannot be added directly. Push up 1 lower bead on the tens rod (rod 3).",
          ruleName: "Ten's Complement: +7 = +10 - 3",
          rodIndex: 3,
          actionType: 'add_lower',
          highlightLowerIndices: [0],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[3] = { upper: false, lower: 1 };
            s.rods[4] = { upper: true, lower: 3 };
            return s;
          })(),
          runningValue: 18,
          mathDisplay: '8 + 10 = 18',
        },
        {
          stepNumber: 3,
          title: 'Subtract 3 from Units (-3)',
          explanation: "Subtract 3 from the units rod (push down 3 lower beads). 18 - 3 = 15.",
          ruleName: "Ten's Complement: +7 = +10 - 3",
          rodIndex: 4,
          actionType: 'sub_lower',
          highlightLowerIndices: [0, 1, 2],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[3] = { upper: false, lower: 1 }; // 10
            s.rods[4] = { upper: true, lower: 0 };  // 5
            return s;
          })(),
          runningValue: 15,
          mathDisplay: '8 + 10 - 3 = 15',
        },
      ],
    },

    // Example 4: 13 - 6
    {
      id: 'ex-4-borrowing',
      title: "Example 4: 13 - 6 (Borrowing)",
      level: 5,
      formula: '13 - 6 = 7',
      result: 7,
      rodCount: 5,
      unitRodIndex: 4,
      conceptSummary: "Teach borrowing from the tens place: -6 = -10 + 4.",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Initial Value 13',
          explanation: 'Tens rod has 1 lower bead (10); Units rod has 3 lower beads (3). Total = 13.',
          rodIndex: 4,
          actionType: 'init',
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[3] = { upper: false, lower: 1 };
            s.rods[4] = { upper: false, lower: 3 };
            return s;
          })(),
          runningValue: 13,
          mathDisplay: '13',
        },
        {
          stepNumber: 2,
          title: 'Borrow 10 from Tens Rod (-10)',
          explanation: "Units rod only has 3, which is less than 6. Take away 1 lower bead from the tens rod (rod 3).",
          ruleName: "Borrowing: -6 = -10 + 4",
          rodIndex: 3,
          actionType: 'sub_lower',
          highlightLowerIndices: [0],
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[3] = { upper: false, lower: 0 };
            s.rods[4] = { upper: false, lower: 3 };
            return s;
          })(),
          runningValue: 3,
          mathDisplay: '13 - 10 = 3',
        },
        {
          stepNumber: 3,
          title: 'Add Complement 4 to Units (+4)',
          explanation: "Now add 4 to units rod. Since 3 beads were up, use +5 - 1: engage upper bead (+5) and push down 1 lower bead (-1).",
          ruleName: "+4 = +5 - 1",
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: (() => {
            const s = createEmptyAbacus(5, 4);
            s.rods[3] = { upper: false, lower: 0 };
            s.rods[4] = { upper: true, lower: 2 }; // 7
            return s;
          })(),
          runningValue: 7,
          mathDisplay: '3 + 4 = 7',
        },
      ],
    },

    // Example 5: 26 + 47 = 73
    {
      id: 'ex-5-multi-digit',
      title: "Example 5: 26 + 47 (Multi-Digit Addition)",
      level: 6,
      formula: '26 + 47 = 73',
      result: 73,
      rodCount: 6,
      unitRodIndex: 5,
      conceptSummary: "Multi-rod addition demonstrating tens addition (+40) and carried units addition (+7).",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Initial Value 26',
          explanation: 'Rod 4 (Tens) = 2; Rod 5 (Units) = 6 (upper bead 5 + 1 lower bead).',
          rodIndex: 5,
          actionType: 'init',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 26),
          runningValue: 26,
          mathDisplay: '26',
        },
        {
          stepNumber: 2,
          title: 'Add 40 on Tens Rod (+50 - 10)',
          explanation: "On the tens rod, add 4 tens using five's complement (+5 - 1): engage upper bead, push down 1 lower bead. Tens rod becomes 6.",
          ruleName: "+4 = +5 - 1",
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 66),
          runningValue: 66,
          mathDisplay: '26 + 40 = 66',
        },
        {
          stepNumber: 3,
          title: 'Add 7 to Units via Carry (+10 - 3)',
          explanation: "Add 7 units to 66: add 1 to tens rod (6 -> 7) and subtract 3 from units rod (6 - 3 = 3). Total is 73.",
          ruleName: "+7 = +10 - 3",
          rodIndex: 5,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 73),
          runningValue: 73,
          mathDisplay: '66 + 7 = 73',
        },
      ],
    },

    // Example 6: 36 × 4 = 144
    {
      id: 'ex-6-multiplication',
      title: "Example 6: 36 × 4 (Multiplication)",
      level: 7,
      formula: '36 × 4 = 144',
      result: 144,
      rodCount: 6,
      unitRodIndex: 5,
      conceptSummary: "Multiply 30 × 4 = 120, then 6 × 4 = 24. Combine to get 144.",
      steps: [
        {
          stepNumber: 1,
          title: 'Decompose Factors',
          explanation: 'Break 36 × 4 into two parts: (30 × 4) + (6 × 4).',
          rodIndex: 5,
          actionType: 'init',
          resultingState: createEmptyAbacus(6, 5),
          runningValue: 0,
          mathDisplay: '36 × 4 = (30 × 4) + (6 × 4)',
        },
        {
          stepNumber: 2,
          title: 'Step 1: 30 × 4 = 120',
          explanation: 'Set 1 in Hundreds rod (rod 3) and 2 in Tens rod (rod 4). 120 is on the abacus.',
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 120),
          runningValue: 120,
          mathDisplay: '30 × 4 = 120',
        },
        {
          stepNumber: 3,
          title: 'Step 2: Add 6 × 4 = 24',
          explanation: 'Add 20 to the Tens rod (2 + 2 = 4 tens) and 4 to the Units rod (0 + 4 = 4 units). Result is 144.',
          rodIndex: 5,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 144),
          runningValue: 144,
          mathDisplay: '120 + 24 = 144',
        },
      ],
    },

    // Example 7: 144 ÷ 12 = 12
    {
      id: 'ex-7-division',
      title: "Example 7: 144 ÷ 12 (Division)",
      level: 8,
      formula: '144 ÷ 12 = 12',
      result: 12,
      rodCount: 6,
      unitRodIndex: 5,
      conceptSummary: "Divide dividend 144 by divisor 12. 12 × 10 = 120, remainder 24. 24 ÷ 12 = 2. Quotient = 12.",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Dividend 144',
          explanation: 'Set 144 on the rods: Hundreds = 1, Tens = 4, Units = 4.',
          rodIndex: 5,
          actionType: 'init',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 144),
          runningValue: 144,
          mathDisplay: 'Dividend = 144, Divisor = 12',
        },
        {
          stepNumber: 2,
          title: 'First Quotient Digit: 1 (Tens)',
          explanation: '12 goes into 14 once. Subtract 12 from 14 (leaving 2). Remaining dividend is 24.',
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 24),
          runningValue: 24,
          mathDisplay: '144 - 120 = 24 (Quotient tens = 1)',
        },
        {
          stepNumber: 3,
          title: 'Second Quotient Digit: 2 (Units)',
          explanation: '12 goes into 24 exactly 2 times. Subtract 24 to leave 0. Total quotient is 12.',
          rodIndex: 5,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(6, 5), 12),
          runningValue: 12,
          mathDisplay: '24 ÷ 12 = 2 (Final Quotient = 12)',
        },
      ],
    },

    // Example 8: 12.5 + 3.75 = 16.25
    {
      id: 'ex-8-decimals',
      title: "Example 8: 12.5 + 3.75 (Decimal Arithmetic)",
      level: 9,
      formula: '12.5 + 3.75 = 16.25',
      result: 16.25,
      rodCount: 7,
      unitRodIndex: 4, // 2 rods for decimals: tenths (5), hundredths (6)
      conceptSummary: "Demonstrate exact decimal alignment. Unit dot is on rod 4. Tenths is rod 5, hundredths is rod 6.",
      steps: [
        {
          stepNumber: 1,
          title: 'Set Initial Decimal 12.50',
          explanation: 'Rod 3 (Tens) = 1, Rod 4 (Units) = 2, Rod 5 (Tenths) = 5 (upper bead). Value = 12.50.',
          rodIndex: 4,
          actionType: 'init',
          resultingState: setAbacusFromNumber(createEmptyAbacus(7, 4), 12.5),
          runningValue: 12.5,
          mathDisplay: '12.50',
        },
        {
          stepNumber: 2,
          title: 'Add 3 Units (Rod 4)',
          explanation: 'Add 3 to the Units rod (2 + 3 = 5). Engage the upper bead on rod 4 and clear lower beads. Value is 15.50.',
          ruleName: "Five's Complement: +3 = +5 - 2",
          rodIndex: 4,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(7, 4), 15.5),
          runningValue: 15.5,
          mathDisplay: '12.5 + 3.0 = 15.50',
        },
        {
          stepNumber: 3,
          title: 'Add 0.70 to Tenths (Carry to Units)',
          explanation: 'Tenths rod has 5. Adding 7 gives 12 tenths (1.2). Carry 1 to units rod (15 + 1 = 16) and leave 2 in tenths. Value is 16.20.',
          ruleName: "+7 = +10 - 3 (Decimal Carry)",
          rodIndex: 5,
          actionType: 'set_rod',
          resultingState: setAbacusFromNumber(createEmptyAbacus(7, 4), 16.2),
          runningValue: 16.2,
          mathDisplay: '15.5 + 0.7 = 16.20',
        },
        {
          stepNumber: 4,
          title: 'Add 0.05 to Hundredths',
          explanation: 'Engage the upper 5-bead in the hundredths rod (rod 6). Final result: 16.25.',
          rodIndex: 6,
          actionType: 'engage_upper',
          resultingState: setAbacusFromNumber(createEmptyAbacus(7, 4), 16.25),
          runningValue: 16.25,
          mathDisplay: '16.20 + 0.05 = 16.25',
        },
      ],
    },
  ];
}
