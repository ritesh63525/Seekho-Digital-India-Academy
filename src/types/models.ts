export type Course = {
  id: string;
  title: string;
  shortCode: string;
  category: string;
  description: string;
  duration: string;
  level: string;
  accent: string;
  accentSoft: string;
  tools: string[];
  syllabus: string[];
  careers: string[];
  salary: string;
  projects: string;
  certificate: boolean;
  featured?: boolean;
};

export type LearningCourse = {
  courseId: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  nextLesson: string;
};

export type Lesson = {
  id: string;
  title: string;
  type: 'Video' | 'Quiz' | 'Assignment' | 'Resource';
  duration: string;
  completed: boolean;
  locked?: boolean;
};

export type LearningModule = {
  id: string;
  title: string;
  progress: number;
  lessons: Lesson[];
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  experience: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  eligibility: string;
  posted: string;
  deadline: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'class' | 'placement' | 'quiz' | 'assignment' | 'course' | 'general';
};

export type Assignment = {
  id: string;
  title: string;
  course: string;
  due: string;
  status: 'Pending' | 'Submitted' | 'Evaluated';
  marks?: string;
  description: string;
  tasks: string[];
};

export type LiveClass = {
  id: string;
  title: string;
  course: string;
  date: string;
  time: string;
  instructor: string;
  status: 'Live' | 'Upcoming' | 'Completed';
};

export type Certificate = {
  id: string;
  course: string;
  issuedOn: string;
  credential: string;
};

export type UserProfile = {
  name: string;
  phone: string;
  email: string;
  city: string;
  education: string;
  college: string;
  graduationYear: string;
  skills: string[];
};
