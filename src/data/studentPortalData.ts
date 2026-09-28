export const studentPortalData = {
  student: {
    id: 'SDIA-2026-001',
    firstName: 'Ritesh',
    lastName: '',
    fullName: 'Ritesh',
    email: 'ritesh@sdi.com',
    phone: '8894487839',
    address: 'Not available',
    avatarInitial: 'R',
    status: 'Active',
    portalStatus: 'Active',
    learningMode: 'Not Available',
    admissionDate: 'Not available',
  },

  course: {
    id: 'course-data-analytics',
    title: 'Data Analytics',
    description:
      'Learn to analyze data, create visualizations, and drive business decisions.',
    status: 'Assigned',
    linkedToProfile: true,
    progress: 42,
    totalLessons: 48,
    completedLessons: 20,
  },

  fees: {
    total: 18000,
    paid: 18000,
    remaining: 0,
    status: 'Paid',
    currency: '₹',
  },

  attendance: {
    percentage: 73.5,
    totalMarkedDays: 49,
    present: 36,
    absent: 13,
    late: 0,
    leave: 0,
    halfDay: 0,

    records: [
      {
        id: 'attendance-1',
        date: '14 Sept 2026',
        status: 'Absent',
        course: 'Data Analytics',
        checkIn: '--',
        checkOut: '--',
        remarks: '--',
      },
      {
        id: 'attendance-2',
        date: '11 Sept 2026',
        status: 'Absent',
        course: 'Data Analytics',
        checkIn: '--',
        checkOut: '--',
        remarks: '--',
      },
      {
        id: 'attendance-3',
        date: '10 Sept 2026',
        status: 'Absent',
        course: 'Data Analytics',
        checkIn: '--',
        checkOut: '--',
        remarks: '--',
      },
    ],
  },

  practiceHub: {
    totalQuestions: 420,
    interviewPreparation: 663,
    difficulty: {
      easy: 288,
      medium: 66,
      hard: 66,
    },

    questionSets: [
      {
        id: 'question-set-1',
        title: 'Topic Question Collection',
        subtitle: 'Practice questions for Data Analytics',
        totalQuestions: 420,
      },
    ],
  },

  assignments: {
    all: 0,
    pending: 0,
    overdue: 0,
    submitted: 0,
    reviewed: 0,
    items: [],
  },

  tests: {
    available: 0,
    upcoming: 0,
    completed: 0,
    passed: 0,
    items: [],
    history: [],
  },

  schedule: {
    upcomingCount: 0,
    upcoming: [],
    past: [],
  },

  certificates: {
    total: 0,
    locked: 0,
    available: 0,
    items: [],
  },

  career: {
    activeOpportunities: 0,
    jobs: 0,
    internships: 0,
    opportunities: [],
  },

  resume: {
    title: 'Professional Resume',
    status: 'Draft saved',
    strength: 0,

    sectionsCompleted: 0,
    totalSections: 8,

    sections: {
      personalInformation: false,
      education: false,
      skills: false,
      projects: false,
      experience: false,
      certifications: false,
      languages: false,
      achievements: false,
    },
  },

  announcements: {
    total: 0,
    unread: 0,
    items: [],
  },

  support: {
    open: 0,
    inProgress: 0,
    resolved: 0,
    totalRequests: 0,
    tickets: [],
  },

  dashboard: {
    greeting: 'Welcome Back, Ritesh.',
    subtitle: 'Your course, account and fee information in one place.',

    quickStats: [
      {
        id: 'course',
        title: 'Data Analytics',
        label: 'Assigned Course',
      },
      {
        id: 'status',
        title: 'Active',
        label: 'Student Status',
      },
      {
        id: 'fees-paid',
        title: 'DONE',
        label: 'Fees Paid',
      },
      {
        id: 'fees-remaining',
        title: '₹0',
        label: 'Fees Remaining',
      },
    ],
  },
} as const;

export type StudentPortalData = typeof studentPortalData;