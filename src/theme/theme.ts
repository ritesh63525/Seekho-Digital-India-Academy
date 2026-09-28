export const theme = {
  colors: {
    // Brand
    primary: '#37D67A',
    primaryDark: '#20B961',
    primarySoft: '#10251A',
    primaryPale: '#0B1710',

    // Premium accent
    secondary: '#E5A63D',
    orange: '#E5A63D',

    // Backgrounds
    background: '#060807',
    backgroundAlt: '#090C0A',

    surface: '#0C100E',
    surfaceAlt: '#101512',
    surfaceElevated: '#151B17',
    surfaceMuted: '#111613',

    // Basic
    white: '#F7F9F8',
    black: '#020302',

    // Text
    text: '#F4F7F5',
    textPrimary: '#F4F7F5',
    textSecondary: '#929C96',
    textLight: '#69736D',
    textOnDark: '#FFFFFF',
    muted: '#737D77',

    // Borders
    border: '#1C2420',
    borderStrong: '#29332E',
    borderDark: '#151C18',
    divider: '#18201C',

    // Green – only active/success
    green: '#37D67A',
    greenDark: '#217A4B',
    greenSoft: '#10251A',

    // Compatibility
    navy: '#F4F7F5',
    navySoft: '#141A17',
    navyMuted: '#929C96',

    // Functional accents
    blue: '#4C9EFF',
    blueSoft: '#0E2035',

    purple: '#A982F3',
    purpleSoft: '#211732',

    cyan: '#3FC8D8',
    cyanSoft: '#0D282C',

    red: '#EF6A70',
    redSoft: '#2A1013',

    amber: '#E5A63D',
    amberSoft: '#2A1D0B',

    // Feature colors
    course: '#E5A63D',
    courseSoft: '#2A1D0B',

    assignment: '#4C9EFF',
    assignmentSoft: '#0E2035',

    attendance: '#A982F3',
    attendanceSoft: '#211732',

    quiz: '#3FC8D8',
    quizSoft: '#0D282C',

    schedule: '#F28B44',
    scheduleSoft: '#2A170D',

    placement: '#35C6A0',
    placementSoft: '#0D281F',

    // Semantic
    success: '#37D67A',
    warning: '#E5A63D',
    danger: '#EF6A70',
    error: '#EF6A70',
    info: '#4C9EFF',

    // Attendance states
    present: '#37D67A',
    absent: '#EF6A70',
    late: '#E5A63D',
    leave: '#4C9EFF',

    disabled: '#2A302D',

    overlay: 'rgba(0, 0, 0, 0.78)',

    transparent: 'transparent',
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    xxl: 28,
    round: 999,
  },

  typography: {
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 30,
      display: 36,
    },

    fontWeight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
      black: '900' as const,
    },

    lineHeight: {
      xs: 14,
      sm: 18,
      md: 21,
      lg: 24,
      xl: 28,
      xxl: 32,
      xxxl: 38,
      display: 44,
    },
  },

  shadow: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 7,
  },

  shadowStrong: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },

  greenShadow: {
    shadowColor: '#37D67A',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },

  card: {
    backgroundColor: '#0C100E',
    borderColor: '#1C2420',
    borderWidth: 1,
    borderRadius: 18,
  },
} as const;

export type AppTheme = typeof theme;