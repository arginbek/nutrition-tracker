export const colors = {
  canvas: '#0A0A0E',
  card: '#13131A',
  raised: '#18181F',
  muted: '#16161E',
  secondary: '#1C1C26',
  border: '#1E1E2A',
  text: '#F0EDE8',
  textSecondary: '#B8B4BE',
  textMuted: '#6B6875',
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  success: '#22C55E',
  danger: '#EF4444',
  onAccent: '#0A0A0E',
} as const;

// macro accent colors (within brand palette)
export const macroColors = {
  calories: colors.amber,
  protein: colors.success,
  carbs: '#60A5FA', // blue — distinct from the amber calorie ring so the ring doesn't read as "carbs"
  fat: '#A78BFA', // soft violet purely for the 3rd macro bar; not "commitment purple"
} as const;

export const spacing = {
  xs: 4, sm: 8, s10: 10, md: 12, s14: 14,
  base: 16, s18: 18, gutter: 20, lg: 24, xl: 28, xxl: 32,
} as const;

export const radii = {
  badge: 8, control: 12, row: 14, card: 16, tile: 20, pill: 999,
} as const;

export const type = {
  family: 'Inter_400Regular',
  familyMedium: 'Inter_500Medium',
  familySemibold: 'Inter_600SemiBold',
  familyBold: 'Inter_700Bold',
  screenTitle: 26,
  heading: 18,
  body: 16,
  bodySm: 14,
  caption: 13,
  captionSm: 11,
  eyebrow: 13,
} as const;

/** Append ~13% alpha (the design system's `color + "22"` idiom). */
export function tint(hex: string): string {
  return `${hex}22`;
}
