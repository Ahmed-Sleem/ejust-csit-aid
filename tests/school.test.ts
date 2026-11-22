import { describe, expect, it } from 'vitest';
import { FIXED_STEP } from '../src/config';
import { School } from '../src/school';

describe('EJUST intro koi', () => {
  it('contains exactly three koi', () => {
    const school = new School();
    expect(school.count).toBe(3);
    expect(school.fish).toHaveLength(3);
  });

  it('follows a persistent intro pointer target', () => {
    const school = new School();
    const before = school.fish.reduce((sum, fish) => sum + fish.position.x, 0) / 3;
    school.follow({ x: 900, y: 300 });
    for (let step = 0; step < 240; step += 1) school.update(FIXED_STEP, step * FIXED_STEP);
    const after = school.fish.reduce((sum, fish) => sum + fish.position.x, 0) / 3;
    expect(after).toBeGreaterThan(before);
    expect(school.targetActive).toBe(true);
  });
});
