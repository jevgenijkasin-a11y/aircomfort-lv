// Run: npm test   (Node's built-in test runner; Node >= 23 strips TS types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendedPowerKw, roundToStandardSize, matchingPowerRange } from './calc.ts';

const base = { roomType: 'living', insulation: 'avg', windows: 2, floor: 'middle' };

const table: [string, Parameters<typeof recommendedPowerKw>[0], number, number][] = [
  // label, input, min acceptable kW, max acceptable kW
  ['15 m², living, avg, 2 windows', { ...base, area: 15 }, 2.0, 2.5],
  ['25 m², living, avg, 2 windows', { ...base, area: 25 }, 2.5, 3.5],
  ['40 m², living, avg, 2 windows', { ...base, area: 40 }, 4.2, 5.0],
  ['15 m², bedroom, good, 1 window', { ...base, area: 15, roomType: 'bedroom', insulation: 'good', windows: 1 }, 2.0, 2.0],
  ['25 m², kitchen, poor, top floor', { ...base, area: 25, roomType: 'kitchen', insulation: 'poor', floor: 'top' }, 3.5, 4.2],
];

for (const [label, input, min, max] of table) {
  test(label, () => {
    const kw = recommendedPowerKw(input);
    assert.ok(kw >= min && kw <= max, `${label}: got ${kw} kW, expected ${min}–${max}`);
  });
}

test('suitable range: never weaker than needed, up to +60%', () => {
  assert.deepEqual(matchingPowerRange(2.5), { min: 2.5, max: 4.0 });
  assert.deepEqual(matchingPowerRange(3.5), { min: 3.5, max: 5.6 });
});

test('rounds up to standard sizes', () => {
  assert.equal(roundToStandardSize(1.2), 2.0);
  assert.equal(roundToStandardSize(2.0), 2.0);
  assert.equal(roundToStandardSize(2.65), 3.5);
  assert.equal(roundToStandardSize(4.15), 4.2);
  assert.equal(roundToStandardSize(8.3), 8.5);
});
