import { colors, spacing, radii, tint } from '../theme/tokens';

describe('tokens', () => {
  it('exposes the brand palette verbatim', () => {
    expect(colors.canvas).toBe('#0A0A0E');
    expect(colors.amber).toBe('#F59E0B');
    expect(colors.border).toBe('#1E1E2A');
  });
  it('signature card radius is 16', () => {
    expect(radii.card).toBe(16);
  });
  it('screen gutter is 20', () => {
    expect(spacing.gutter).toBe(20);
  });
  it('tint() appends 22 alpha (~13%)', () => {
    expect(tint('#F59E0B')).toBe('#F59E0B22');
  });
});
