/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Core Abacus Engine for Soroban (Japanese Abacus)
 * Rod: 1 upper bead (value 5) + 4 lower beads (value 1 each).
 * Legal states: digits 0 through 9 per rod.
 */

export interface RodState {
  upper: boolean; // true = moved DOWN to reckoning beam (engaged, value 5)
  lower: number;  // 0..4 = count of beads moved UP to reckoning beam (engaged, value 1 each)
}

export interface AbacusState {
  rods: RodState[];
  unitRodIndex: number; // 0-indexed column that represents 10^0 (Units)
}

/**
 * Returns value of single rod (0..9)
 */
export function getRodValue(rod: RodState): number {
  return (rod.upper ? 5 : 0) + rod.lower;
}

/**
 * Create an empty zeroed abacus with specified rod count and unit index.
 */
export function createEmptyAbacus(rodCount = 7, unitRodIndex = 4): AbacusState {
  const safeCount = Math.max(3, Math.min(15, rodCount));
  const safeUnit = Math.max(0, Math.min(safeCount - 1, unitRodIndex));
  return {
    rods: Array.from({ length: safeCount }, () => ({ upper: false, lower: 0 })),
    unitRodIndex: safeUnit,
  };
}

/**
 * Deep clone an abacus state
 */
export function cloneAbacus(state: AbacusState): AbacusState {
  return {
    rods: state.rods.map(r => ({ upper: r.upper, lower: r.lower })),
    unitRodIndex: state.unitRodIndex,
  };
}

/**
 * Convert a digit (0..9) to RodState
 */
export function digitToRodState(digit: number): RodState {
  const d = Math.max(0, Math.min(9, Math.floor(digit)));
  return {
    upper: d >= 5,
    lower: d % 5,
  };
}

/**
 * Read the full numeric value from an abacus.
 * Accounts for unit rod index (decimal rods to the right of unitRodIndex).
 */
export function getNumberFromAbacus(state: AbacusState): number {
  let value = 0;
  for (let i = 0; i < state.rods.length; i++) {
    const rodVal = getRodValue(state.rods[i]);
    const power = state.unitRodIndex - i;
    value += rodVal * Math.pow(10, power);
  }
  // Round to avoid floating point precision artifacts
  const decimals = Math.max(0, state.rods.length - 1 - state.unitRodIndex);
  return Number(value.toFixed(decimals));
}

/**
 * Format abacus number as a clean string representation.
 */
export function getFormattedNumber(state: AbacusState): string {
  const num = getNumberFromAbacus(state);
  const decimals = Math.max(0, state.rods.length - 1 - state.unitRodIndex);
  if (decimals === 0) {
    return Math.round(num).toString();
  }
  // If decimals are enabled, trim trailing unnecessary zeros or keep formatted
  const str = num.toFixed(decimals);
  return str.replace(/\.?0+$/, '') || '0';
}

/**
 * Set the abacus beads to represent an exact positive number.
 */
export function setAbacusFromNumber(state: AbacusState, targetNum: number): AbacusState {
  const cloned = cloneAbacus(state);
  const num = Math.abs(targetNum);
  const decimals = Math.max(0, cloned.rods.length - 1 - cloned.unitRodIndex);
  
  // Scale by 10^decimals to handle as integer
  const scale = Math.pow(10, decimals);
  let scaledInt = Math.round(num * scale);

  for (let i = cloned.rods.length - 1; i >= 0; i--) {
    const digit = scaledInt % 10;
    cloned.rods[i] = digitToRodState(digit);
    scaledInt = Math.floor(scaledInt / 10);
  }

  return cloned;
}

/**
 * Toggle upper bead for a rod
 */
export function toggleUpperBead(state: AbacusState, rodIndex: number): AbacusState {
  if (rodIndex < 0 || rodIndex >= state.rods.length) return state;
  const cloned = cloneAbacus(state);
  cloned.rods[rodIndex].upper = !cloned.rods[rodIndex].upper;
  return cloned;
}

/**
 * Set lower bead count for a rod (0..4)
 */
export function setLowerBeads(state: AbacusState, rodIndex: number, count: number): AbacusState {
  if (rodIndex < 0 || rodIndex >= state.rods.length) return state;
  const clamped = Math.max(0, Math.min(4, count));
  const cloned = cloneAbacus(state);
  cloned.rods[rodIndex].lower = clamped;
  return cloned;
}

/**
 * Set rod to exact digit (0..9)
 */
export function setRodDigit(state: AbacusState, rodIndex: number, digit: number): AbacusState {
  if (rodIndex < 0 || rodIndex >= state.rods.length) return state;
  const cloned = cloneAbacus(state);
  cloned.rods[rodIndex] = digitToRodState(digit);
  return cloned;
}

/**
 * Clear abacus to zero
 */
export function resetAbacus(state: AbacusState): AbacusState {
  return {
    rods: state.rods.map(() => ({ upper: false, lower: 0 })),
    unitRodIndex: state.unitRodIndex,
  };
}

/**
 * Get place value name for a rod index
 */
export function getPlaceValueName(rodIndex: number, unitIndex: number): string {
  const power = unitIndex - rodIndex;
  switch (power) {
    case 4: return 'Ten Thousands';
    case 3: return 'Thousands';
    case 2: return 'Hundreds';
    case 1: return 'Tens';
    case 0: return 'Ones (Units)';
    case -1: return 'Tenths';
    case -2: return 'Hundredths';
    case -3: return 'Thousandths';
    default:
      if (power > 0) return `10^${power}`;
      return `10^${power}`;
  }
}

/**
 * Get short place label for display on the reckoning beam
 */
export function getShortPlaceLabel(rodIndex: number, unitIndex: number): string {
  const power = unitIndex - rodIndex;
  switch (power) {
    case 5: return '100k';
    case 4: return '10k';
    case 3: return '1,000';
    case 2: return '100';
    case 1: return '10';
    case 0: return '1';
    case -1: return '0.1';
    case -2: return '0.01';
    case -3: return '0.001';
    default:
      return `${Math.pow(10, power)}`;
  }
}

/**
 * Mathematical breakdown of the current abacus configuration.
 * e.g. "20 + 8 = 28" or "5 + 1 + 1 + 1 = 8"
 */
export function getPlaceValueBreakdown(state: AbacusState): {
  terms: { label: string; value: number; formatted: string }[];
  placeFormula: string;
  beadFormula: string;
  totalValue: number;
} {
  const terms: { label: string; value: number; formatted: string }[] = [];
  const beadParts: string[] = [];
  const placeParts: string[] = [];

  for (let i = 0; i < state.rods.length; i++) {
    const rod = state.rods[i];
    const rodVal = getRodValue(rod);
    const power = state.unitRodIndex - i;
    const factor = Math.pow(10, power);
    const placeVal = rodVal * factor;

    if (rodVal > 0) {
      const placeName = getPlaceValueName(i, state.unitRodIndex);
      const formatted = power < 0 ? placeVal.toFixed(Math.abs(power)) : placeVal.toString();
      terms.push({ label: placeName, value: placeVal, formatted });
      placeParts.push(formatted);

      // Bead parts
      const rodBeads: string[] = [];
      if (rod.upper) rodBeads.push(`${5 * factor}`);
      for (let b = 0; b < rod.lower; b++) {
        rodBeads.push(`${1 * factor}`);
      }
      if (rodBeads.length > 0) {
        beadParts.push(rodBeads.join(' + '));
      }
    }
  }

  const totalValue = getNumberFromAbacus(state);
  const placeFormula = placeParts.length > 0 ? `${placeParts.join(' + ')} = ${totalValue}` : '0';
  const beadFormula = beadParts.length > 0 ? `${beadParts.join(' + ')} = ${totalValue}` : '0';

  return {
    terms,
    placeFormula,
    beadFormula,
    totalValue,
  };
}

/**
 * "Explain My Beads" translation into simple educational language.
 */
export function explainMyBeads(state: AbacusState): string {
  const total = getNumberFromAbacus(state);
  if (total === 0) {
    return 'All beads are at their starting positions away from the reckoning bar. The abacus currently represents 0.';
  }

  const activeRods = state.rods
    .map((rod, idx) => ({ rod, idx, val: getRodValue(rod), name: getPlaceValueName(idx, state.unitRodIndex) }))
    .filter(r => r.val > 0);

  const sentences = activeRods.map(r => {
    const parts: string[] = [];
    if (r.rod.upper) parts.push('upper 5-bead');
    if (r.rod.lower > 0) parts.push(`${r.rod.lower} lower 1-bead${r.rod.lower > 1 ? 's' : ''}`);
    return `In the ${r.name} rod: digit is ${r.val} (active: ${parts.join(' + ')}).`;
  });

  return `${sentences.join(' ')} Combining all rods gives ${total}.`;
}
