// QRShield Design System — matches qrshieldpro.com exactly

export const Colors = {
  // Backgrounds
  bg: '#060a12',
  bg2: '#0b1120',
  surface: 'rgba(14, 22, 38, 0.78)',
  surf2: 'rgba(10, 16, 28, 0.92)',
  surf3: 'rgba(18, 28, 46, 0.94)',

  // Borders
  border: 'rgba(100, 160, 255, 0.12)',
  border2: 'rgba(100, 160, 255, 0.22)',

  // Accent
  accent: '#3d84ff',
  accent2: '#50d0ff',

  // Status
  success: '#00f5a0',
  success2: '#00d4ff',
  danger: '#ff3d6b',
  warn: '#ffb836',
  purple: '#a855f7',
  pink: '#f472b6',

  // Text
  text: '#eaf2ff',
  muted: '#7a8faf',
  muted2: '#9eb3d4',

  // Special
  cardBg: 'rgba(12, 20, 36, 0.72)',
  inputBg: 'rgba(10, 16, 28, 0.92)',
  overlayDark: 'rgba(0, 0, 0, 0.52)',
} as const;

export const FontFamily = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  sansExtraBold: 'Inter_800ExtraBold',
  heading: 'Syne_800ExtraBold',
  headingBold: 'Syne_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 20,
  },
  button: {
    shadowColor: '#3d84ff',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
} as const;

export type StatusType = 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN' | 'DISTORTED_QR' | 'ERROR';

export function getStatusColors(status: StatusType) {
  switch (status) {
    case 'SAFE':
      return {
        color: Colors.success,
        bg: 'rgba(0, 245, 160, 0.08)',
        border: 'rgba(0, 245, 160, 0.28)',
        glow: 'rgba(0, 245, 160, 0.12)',
        label: '✅ SAFE',
      };
    case 'SUSPICIOUS':
      return {
        color: Colors.warn,
        bg: 'rgba(255, 184, 54, 0.08)',
        border: 'rgba(255, 184, 54, 0.28)',
        glow: 'rgba(255, 184, 54, 0.12)',
        label: '⚠️ SUSPICIOUS',
      };
    case 'MALICIOUS':
      return {
        color: Colors.danger,
        bg: 'rgba(255, 61, 107, 0.08)',
        border: 'rgba(255, 61, 107, 0.30)',
        glow: 'rgba(255, 61, 107, 0.15)',
        label: '🚨 MALICIOUS',
      };
    case 'DISTORTED_QR':
      return {
        color: Colors.purple,
        bg: 'rgba(168, 85, 247, 0.08)',
        border: 'rgba(168, 85, 247, 0.28)',
        glow: 'rgba(168, 85, 247, 0.12)',
        label: '🔍 DISTORTED QR',
      };
    default:
      return {
        color: Colors.muted2,
        bg: 'rgba(120, 140, 180, 0.07)',
        border: 'rgba(120, 140, 180, 0.20)',
        glow: 'transparent',
        label: '❓ UNKNOWN',
      };
  }
}
