import type { Visual } from './types';
import { isLight, luminance } from './format';

/** Named roles derived from a brand's palette, with safe Arctic Mint defaults. */
export interface BrandPalette {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  light: string;
  onPrimary: string;
  heading: string;
  body: string;
}

export function brandPalette(visual?: Visual): BrandPalette {
  const colors = visual?.colors ?? [];
  const byLum = [...colors].sort((a, b) => luminance(a.hex) - luminance(b.hex));
  const primary = colors[0]?.hex ?? '#14B8A6';
  return {
    primary,
    secondary: colors[1]?.hex ?? '#22D3EE',
    accent: colors[2]?.hex ?? '#60A5FA',
    dark: byLum[0]?.hex && !isLight(byLum[0].hex) ? byLum[0].hex : '#0F172A',
    light: byLum[byLum.length - 1]?.hex && isLight(byLum[byLum.length - 1].hex) ? byLum[byLum.length - 1].hex : '#F8FAFC',
    onPrimary: isLight(primary) ? '#0F172A' : '#FFFFFF',
    heading: visual?.typography.heading ?? 'Inter',
    body: visual?.typography.body ?? 'Inter',
  };
}

export const fontStack = (family: string) => `'${family}', Inter, ui-sans-serif, system-ui, sans-serif`;
