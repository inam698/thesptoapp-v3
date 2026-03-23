/**
 * The Spot App — Color System
 *
 * Canonical colors live in SpotColors.ts.
 * This file re-exports them and provides the Colors object
 * expected by some Expo/RN helpers.
 */

// Re-export the canonical brand palette
import { SpotColors } from './SpotColors';
export { SpotColors } from './SpotColors';

const tintColorLight = SpotColors.primary;
const tintColorDark = SpotColors.primaryLight;

export const Colors = {
  light: {
    text: SpotColors.textPrimary,
    background: SpotColors.background,
    tint: tintColorLight,
    icon: SpotColors.textSecondary,
    tabIconDefault: SpotColors.textSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
