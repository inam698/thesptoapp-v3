/**
 * The Spot App — Official Brand Color System
 *
 * Primary (Wisteria): #C69FD5
 * Background (Lemon):  #FDFDC9
 *
 * These are the only official brand colors.
 * All UI components must import and use SpotColors.
 */

export const SpotColors = {
  // ─── Brand ────────────────────────────────
  primary: "#C69FD5",
  background: "#FDFDC9",

  // ─── Surfaces ─────────────────────────────
  surface: "#FFFFFF",

  // ─── Text ─────────────────────────────────
  textPrimary: "#2E2E2E",
  textSecondary: "#6B6B6B",
  textOnPrimary: "#FFFFFF",

  // ─── Border / Shadow ────────────────────────
  border: "#EFEFEF",
  shadow: "#000000",

  // ─── Derived (lighter tint for gradients) ─
  primaryLight: "#E8D5F0",

  // ─── Status (functional, not brand) ───────
  error: "#FF5252",
  success: "#4CAF50",
  warning: "#FF9800",
  info: "#2196F3",

  // ─── Derived palette (distinct tones) ──────
  secondary: "#B388C9",
  accent: "#D4A9E0",
  rose: "#E8879C",
  deepPink: "#9B6DAE",
  blush: "#F2C4CE",
  peach: "#F5B895",
  lavender: "#B8A9D1",
  softPink: "#F0D0D9",
  gradientLight: "#F5EEF8",
  gradientMid: "#E8D5F0",
  gradientCard: "#F9F4FC",
  textOnSecondary: "#FFFFFF",
  textOnAccent: "#2E2E2E",
} as const;
