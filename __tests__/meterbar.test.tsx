import { fillPercent } from '../components/ui/meter';

describe('fillPercent', () => {
  it('is 50 at half', () => expect(fillPercent(50, 100)).toBe(50));
  it('clamps over max to 100', () => expect(fillPercent(150, 100)).toBe(100));
  it('clamps negative to 0', () => expect(fillPercent(-5, 100)).toBe(0));
  it('is 0 when max is 0', () => expect(fillPercent(10, 0)).toBe(0));
});
