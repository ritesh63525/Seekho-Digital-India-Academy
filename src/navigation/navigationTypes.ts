export type RootStackParamList = {
  Splash: undefined;

  // Auth
  Login: undefined;

  // Old OTP route temporarily rakha hai
  // taaki existing files abhi break na hon.
  OTP: {
    phone: string;
  };

  ChangePassword: {
    portalEmail: string;
  };

  ForgotPassword: undefined;

  ForgotOtp: {
    portalEmail: string;
    maskedEmail?: string;
  };

  ResetPassword: {
    portalEmail: string;
    resetToken?: string;
  };

  // Main App
  Main: undefined;

  Notifications: undefined;

  CourseDetails: {
    courseId: string;
  };

  BookDemo:
    | {
        courseId?: string;
      }
    | undefined;

  CourseLearning: {
    courseId: string;
  };

  Lesson: {
    lessonId: string;
    title: string;
    type: string;
    duration: string;
  };

  Quiz: undefined;

  QuizResult: {
    score: number;
    total: number;
  };

  Assignments: undefined;

  AssignmentDetails: {
    assignmentId: string;
  };

  LiveClasses: undefined;

  Attendance: undefined;

  Certificates: undefined;

  JobDetails: {
    jobId: string;
  };

  Applications: undefined;

  CareerTools: undefined;

  EditProfile: undefined;

  Settings: undefined;

  Support: undefined;

  About: undefined;

  CareerRoadmap: undefined;

  Legal: {
    type: 'privacy' | 'terms';
  };
};

export type MainTabParamList = {
  Home: undefined;
  Courses: undefined;
  Learning: undefined;
  Placement: undefined;
  Profile: undefined;
};