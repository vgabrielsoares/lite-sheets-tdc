import { applyDeltaToHP } from '@/utils/calculations';

describe('applyDeltaToHP', () => {
  it('subtracts from temporary first, then current', () => {
    const hp = { max: 15, current: 10, temporary: 5 };
    const updated = applyDeltaToHP(hp, -7);
    expect(updated.temporary).toBe(0); // 5 temp absorbed
    expect(updated.current).toBe(8); // remaining 2 from current
  });

  it('does not go below zero current', () => {
    const hp = { max: 15, current: 3, temporary: 0 };
    const updated = applyDeltaToHP(hp, -10);
    expect(updated.current).toBe(0);
    expect(updated.temporary).toBe(0);
  });

  it('heals current up to max, does not affect temporary', () => {
    const hp = { max: 15, current: 12, temporary: 3 };
    const updated = applyDeltaToHP(hp, 5);
    expect(updated.current).toBe(15);
    expect(updated.temporary).toBe(3);
  });

  it('no change on zero delta', () => {
    const hp = { max: 15, current: 12, temporary: 3 };
    const updated = applyDeltaToHP(hp, 0);
    expect(updated).toEqual(hp);
  });
});
