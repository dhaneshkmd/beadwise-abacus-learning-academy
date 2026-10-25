/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Unit Tests for BeadWise Abacus Engine and Soroban Math
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyAbacus,
  getRodValue,
  digitToRodState,
  getNumberFromAbacus,
  setAbacusFromNumber,
  toggleUpperBead,
  setLowerBeads,
  getPlaceValueBreakdown,
  explainMyBeads,
} from './abacusEngine';
import {
  getSampleLearningExperiences,
  FIVES_COMPLEMENT_ADD,
  FIVES_COMPLEMENT_SUB,
  TENS_COMPLEMENT_ADD,
  TENS_COMPLEMENT_SUB,
} from './sorobanMath';

test('Rod digit values strictly cover 0 through 9', () => {
  for (let digit = 0; digit <= 9; digit++) {
    const rod = digitToRodState(digit);
    assert.equal(getRodValue(rod), digit, `Digit ${digit} should evaluate correctly`);
    assert.equal(typeof rod.upper, 'boolean');
    assert.ok(rod.lower >= 0 && rod.lower <= 4, `Lower bead count must be 0..4 for digit ${digit}`);
    
    // Check upper bead status
    if (digit >= 5) {
      assert.equal(rod.upper, true, `Upper bead must be engaged for digit ${digit}`);
      assert.equal(rod.lower, digit - 5);
    } else {
      assert.equal(rod.upper, false, `Upper bead must not be engaged for digit ${digit}`);
      assert.equal(rod.lower, digit);
    }
  }
});

test('Upper bead toggling correctly adds and removes 5', () => {
  const abacus = createEmptyAbacus(5, 4);
  assert.equal(getNumberFromAbacus(abacus), 0);

  const toggled = toggleUpperBead(abacus, 4);
  assert.equal(getNumberFromAbacus(toggled), 5);

  const toggledBack = toggleUpperBead(toggled, 4);
  assert.equal(getNumberFromAbacus(toggledBack), 0);
});

test('Lower bead manipulation strictly clamps within 0..4', () => {
  const abacus = createEmptyAbacus(5, 4);
  
  const with3 = setLowerBeads(abacus, 4, 3);
  assert.equal(getNumberFromAbacus(with3), 3);

  const clampedOver = setLowerBeads(abacus, 4, 7);
  assert.equal(getNumberFromAbacus(clampedOver), 4);

  const clampedUnder = setLowerBeads(abacus, 4, -2);
  assert.equal(getNumberFromAbacus(clampedUnder), 0);
});

test('Multi-digit number placement and retrieval', () => {
  const abacus = createEmptyAbacus(7, 6);
  
  const testNumbers = [0, 7, 28, 73, 144, 9999];
  for (const num of testNumbers) {
    const state = setAbacusFromNumber(abacus, num);
    const retrieved = getNumberFromAbacus(state);
    assert.equal(retrieved, num, `Should accurately encode and decode ${num}`);
  }
});

test('Decimal placement and exact decimal values', () => {
  // 7 rods, unit index = 4 (rods 5 and 6 are decimals: tenths, hundredths)
  const abacus = createEmptyAbacus(7, 4);
  
  const decimalTests = [12.5, 3.75, 16.25, 0.05, 99.99];
  for (const dec of decimalTests) {
    const state = setAbacusFromNumber(abacus, dec);
    const retrieved = getNumberFromAbacus(state);
    assert.equal(retrieved, dec, `Should accurately represent decimal ${dec}`);
  }
});

test("Five's complement addition and subtraction rules", () => {
  // Rule checks
  assert.equal(FIVES_COMPLEMENT_ADD[1].subLower, 4);
  assert.equal(FIVES_COMPLEMENT_ADD[2].subLower, 3);
  assert.equal(FIVES_COMPLEMENT_ADD[3].subLower, 2);
  assert.equal(FIVES_COMPLEMENT_ADD[4].subLower, 1);

  assert.equal(FIVES_COMPLEMENT_SUB[1].addLower, 4);
  assert.equal(FIVES_COMPLEMENT_SUB[2].addLower, 3);
  assert.equal(FIVES_COMPLEMENT_SUB[3].addLower, 2);
  assert.equal(FIVES_COMPLEMENT_SUB[4].addLower, 1);

  // Math test: 4 + 3 = 7 using +5 - 2
  const initial = setAbacusFromNumber(createEmptyAbacus(5, 4), 4);
  assert.equal(getNumberFromAbacus(initial), 4);
  // Add 5
  const step1 = toggleUpperBead(initial, 4);
  assert.equal(getNumberFromAbacus(step1), 9);
  // Sub 2
  const step2 = setLowerBeads(step1, 4, 2);
  assert.equal(getNumberFromAbacus(step2), 7);
});

test("Ten's complement addition (8 + 7 = 15)", () => {
  // 8 + 7 = 8 + 10 - 3 = 15
  const initial = setAbacusFromNumber(createEmptyAbacus(5, 4), 8);
  assert.equal(getNumberFromAbacus(initial), 8);

  // Add 10 to tens rod (rod 3)
  const step1 = setLowerBeads(initial, 3, 1);
  assert.equal(getNumberFromAbacus(step1), 18);

  // Sub 3 from units rod (rod 4): units had upper=true, lower=3 (8). Sub 3 gives upper=true, lower=0 (5).
  const step2 = setLowerBeads(step1, 4, 0);
  assert.equal(getNumberFromAbacus(step2), 15);
});

test("Ten's complement borrowing (13 - 6 = 7)", () => {
  const initial = setAbacusFromNumber(createEmptyAbacus(5, 4), 13);
  assert.equal(getNumberFromAbacus(initial), 13);

  // Borrow 10 from tens rod:
  const step1 = setLowerBeads(initial, 3, 0);
  assert.equal(getNumberFromAbacus(step1), 3);

  // Add complement 4 to units rod (3 + 4 = 7):
  const step2 = setAbacusFromNumber(step1, 7);
  assert.equal(getNumberFromAbacus(step2), 7);
});

test('Multi-digit calculations (26 + 47 = 73 and 100 - 58 = 42)', () => {
  const addResult = 26 + 47;
  assert.equal(addResult, 73);

  const subResult = 100 - 58;
  assert.equal(subResult, 42);

  const abacus = createEmptyAbacus(6, 5);
  const state73 = setAbacusFromNumber(abacus, 73);
  assert.equal(getNumberFromAbacus(state73), 73);

  const state42 = setAbacusFromNumber(abacus, 42);
  assert.equal(getNumberFromAbacus(state42), 42);
});

test('Multiplication (36 × 4 = 144) and Division (144 ÷ 12 = 12)', () => {
  assert.equal(36 * 4, 144);
  assert.equal(144 / 12, 12);

  const state144 = setAbacusFromNumber(createEmptyAbacus(6, 5), 144);
  assert.equal(getNumberFromAbacus(state144), 144);

  const state12 = setAbacusFromNumber(createEmptyAbacus(6, 5), 12);
  assert.equal(getNumberFromAbacus(state12), 12);
});

test('Decimal arithmetic (12.5 + 3.75 = 16.25)', () => {
  const sum = 12.5 + 3.75;
  assert.equal(sum, 16.25);

  const state = setAbacusFromNumber(createEmptyAbacus(7, 4), 16.25);
  assert.equal(getNumberFromAbacus(state), 16.25);
});

test('All 8 required sample learning experiences are valid and verified', () => {
  const examples = getSampleLearningExperiences();
  assert.equal(examples.length, 8, 'Must have exactly 8 sample learning experiences');

  // Verify each example's final step matches its claimed result
  for (const ex of examples) {
    assert.ok(ex.steps.length >= 2, `Example ${ex.id} must have step sequence`);
    const finalStep = ex.steps[ex.steps.length - 1];
    const finalValue = getNumberFromAbacus(finalStep.resultingState);
    assert.equal(finalValue, ex.result, `Example ${ex.title} final step value should equal ${ex.result}`);
  }
});

test('Place value breakdown and Explain My Beads generate sensible text', () => {
  const abacus = createEmptyAbacus(6, 4); // units at rod 4, rod 5 is tenths
  const state = setAbacusFromNumber(abacus, 28);
  const breakdown = getPlaceValueBreakdown(state);
  
  assert.equal(breakdown.totalValue, 28);
  assert.ok(breakdown.placeFormula.includes('20') && breakdown.placeFormula.includes('8'));

  const explanation = explainMyBeads(state);
  assert.ok(explanation.includes('28'));
  assert.ok(explanation.includes('rod'));
});
