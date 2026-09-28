export type AppThemeMode = 'light' | 'dark';

export type AppTheme = {
  mode: AppThemeMode;
  dark: boolean;

  colors: {
    primary: string;
    primarySoft: string;
    primaryStrong: string;

    secondary: string;
    secondarySoft: string;
    secondaryStrong: string;

    green: string;
    greenSoft: string;
    greenDark: string;

    background: string;
    backgroundAlt: string;
    surface: string;
    surfaceElevated: string;
    surfaceSoft: string;

    textPrimary: string;
    textSecondary: string;
    textLight: string;
    white: string;
    black: string;

    border: string;
    borderStrong: string;

    success: string;
    warning: string;
    danger: string;
    info: string;

    icon: string;
    iconMuted: string;
    divider: string;
    overlay: string;
    shadow: string;
  };

  radius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    pill: number;
  };

  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
};

export const brandColors = {
  orange: '#F87227',
  orangeWarm: '#FA931E',
  orangeDeep: '#E75E18',

  green: '#42B16B',
  greenBright: '#52C77B',
  greenDeep: '#2F8E52',

  black: '#050605',
  white: '#FFFFFF',
};

const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 30,
  pill: 999,
};

const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const lightTheme: AppTheme = {
  mode: 'light',
  dark: false,

  colors: {
    primary: brandColors.orange,
    primarySoft: '#FFF1E8',
    primaryStrong: brandColors.orangeDeep,

    secondary: brandColors.green,
    secondarySoft: '#EAF7EF',
    secondaryStrong: brandColors.greenDeep,

    green: brandColors.green,
    greenSoft: '#EAF7EF',
    greenDark: brandColors.greenDeep,

    background: '#F7F9F8',
    backgroundAlt: '#F1F5F2',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSoft: '#F5F8F6',

    textPrimary: '#121714',
    textSecondary: '#5F6E66',
    textLight: '#8A9891',
    white: '#FFFFFF',
    black: '#050605',

    border: '#E2E9E5',
    borderStrong: '#D2DDD7',

    success: brandColors.green,
    warning: brandColors.orangeWarm,
    danger: '#E25555',
    info: '#4E8BD8',

    icon: '#26342D',
    iconMuted: '#7E8C84',
    divider: '#E6ECE8',
    overlay: 'rgba(5, 6, 5, 0.42)',
    shadow: 'rgba(20, 40, 30, 0.10)',
  },

  radius,
  spacing,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  dark: true,

  colors: {
    primary: brandColors.orange,
    primarySoft: 'rgba(248, 114, 39, 0.12)',
    primaryStrong: '#FF934A',

    secondary: brandColors.green,
    secondarySoft: 'rgba(66, 177, 107, 0.12)',
    secondaryStrong: brandColors.greenBright,

    green: brandColors.green,
    greenSoft: 'rgba(66, 177, 107, 0.12)',
    greenDark: brandColors.greenDeep,

    background: '#07100D',
    backgroundAlt: '#0A1511',
    surface: '#0D1713',
    surfaceElevated: '#121F1A',
    surfaceSoft: '#101B17',

    textPrimary: '#F7FBF9',
    textSecondary: '#A4B2AB',
    textLight: '#74827B',
    white: '#FFFFFF',
    black: '#050605',

    border: '#1D2B24',
    borderStrong: '#2B4036',

    success: brandColors.greenBright,
    warning: '#FFAA55',
    danger: '#FF7474',
    info: '#78B6FF',

    icon: '#EAF3EE',
    iconMuted: '#7E8F86',
    divider: '#1C2B24',
    overlay: 'rgba(0, 0, 0, 0.62)',
    shadow: 'rgba(0, 0, 0, 0.32)',
  },

  radius,
  spacing,
};

export function getTheme(
  mode: AppThemeMode,
): AppTheme {
  return mode === 'light'
    ? lightTheme
    : darkTheme;
}
