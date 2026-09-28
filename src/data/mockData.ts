import {
  Assignment,
  Certificate,
  Course,
  Job,
  LearningCourse,
  LearningModule,
  LiveClass,
  NotificationItem,
} from '../types/models';

export const academyStats = [
  {label: 'Students Trained', value: '2500+'},
  {label: 'Placement Rate', value: '85%'},
  {label: 'Hiring Partners', value: '150+'},
  {label: 'Students Placed', value: '500+'},
];

export const courses: Course[] = [
  {
    id: 'data-science',
    title: 'Data Science',
    shortCode: 'DS',
    category: 'Data',
    description: 'Master data analysis, statistics, machine learning and real-world problem solving with Python.',
    duration: '6 Months',
    level: 'Beginner to Advanced',
    accent: '#F58220',
    accentSoft: '#FFF3E8',
    tools: ['Python', 'Pandas', 'NumPy', 'SQL', 'Power BI', 'Scikit-learn'],
    syllabus: ['Python Programming', 'Statistics & Probability', 'Pandas & NumPy', 'Data Visualization', 'SQL', 'Machine Learning', 'Model Evaluation', 'Portfolio Projects'],
    careers: ['Data Analyst', 'Data Scientist', 'Business Analyst', 'ML Associate'],
    salary: '₹4-15 LPA',
    projects: '15+ practical projects',
    certificate: true,
    featured: true,
  },
  {
    id: 'data-analytics',
    title: 'Data Analytics',
    shortCode: 'DA',
    category: 'Data',
    description: 'Analyze data, build dashboards and drive business decisions using industry-standard analytics tools.',
    duration: '4 Months',
    level: 'Beginner Friendly',
    accent: '#2563EB',
    accentSoft: '#EFF6FF',
    tools: ['Excel', 'SQL', 'Power BI', 'Python', 'Tableau'],
    syllabus: ['Advanced Excel', 'SQL Fundamentals', 'Power BI', 'Data Cleaning', 'Python for Analytics', 'Dashboard Design', 'Business Case Studies'],
    careers: ['Data Analyst', 'MIS Analyst', 'BI Analyst', 'Reporting Analyst'],
    salary: '₹4-8 LPA',
    projects: '10+ dashboard projects',
    certificate: true,
    featured: true,
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning',
    shortCode: 'AI',
    category: 'AI',
    description: 'Build intelligent systems using machine learning, deep learning, NLP, computer vision and MLOps.',
    duration: '7 Months',
    level: 'Intermediate',
    accent: '#7C3AED',
    accentSoft: '#F5F3FF',
    tools: ['Python', 'TensorFlow', 'PyTorch', 'Keras', 'OpenCV', 'Scikit-learn'],
    syllabus: ['Python Programming', 'Mathematics for ML', 'Supervised & Unsupervised Learning', 'Neural Networks & Deep Learning', 'Natural Language Processing', 'Computer Vision', 'MLOps & Model Deployment', 'Capstone AI Projects'],
    careers: ['ML Engineer', 'AI Researcher', 'NLP Engineer', 'Computer Vision Engineer'],
    salary: '₹8-18 LPA',
    projects: '10+ AI projects',
    certificate: true,
    featured: true,
  },
  {
    id: 'ai-robotics',
    title: 'AI & Robotics',
    shortCode: 'AR',
    category: 'AI',
    description: 'Combine AI, computer vision and robotics to create intelligent autonomous systems.',
    duration: '8 Months',
    level: 'Intermediate',
    accent: '#0F9D70',
    accentSoft: '#ECFDF5',
    tools: ['Python', 'ROS', 'OpenCV', 'Arduino', 'Sensors', 'AI'],
    syllabus: ['Robotics Fundamentals', 'Python Programming', 'Electronics & Sensors', 'ROS Basics', 'Computer Vision', 'AI for Robotics', 'Autonomous Systems', 'Robotics Projects'],
    careers: ['Robotics Engineer', 'Automation Engineer', 'Computer Vision Engineer', 'AI Engineer'],
    salary: '₹6-16 LPA',
    projects: '8+ robotics projects',
    certificate: true,
  },
  {
    id: 'web-development',
    title: 'Web Development',
    shortCode: 'WD',
    category: 'Development',
    description: 'Build responsive full-stack web applications using modern frontend, backend and database tools.',
    duration: '5 Months',
    level: 'Beginner Friendly',
    accent: '#0EA5E9',
    accentSoft: '#F0F9FF',
    tools: ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    syllabus: ['HTML & CSS', 'JavaScript', 'Git & GitHub', 'React', 'Node.js', 'Express APIs', 'Database Basics', 'Full-Stack Projects'],
    careers: ['Frontend Developer', 'React Developer', 'Full-Stack Developer', 'Web Developer'],
    salary: '₹4-10 LPA',
    projects: '8+ full-stack projects',
    certificate: true,
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    shortCode: 'DM',
    category: 'Marketing',
    description: 'Master SEO, ads, analytics, content and social media through practical campaign-based learning.',
    duration: '3 Months',
    level: 'Beginner Friendly',
    accent: '#E11D48',
    accentSoft: '#FFF1F2',
    tools: ['Google Analytics', 'Google Ads', 'Meta Ads', 'SEO', 'Canva', 'Search Console'],
    syllabus: ['Marketing Fundamentals', 'SEO', 'Google Ads', 'Social Media Marketing', 'Content Marketing', 'Analytics', 'Lead Generation', 'Live Campaign Projects'],
    careers: ['SEO Executive', 'Digital Marketer', 'Performance Marketer', 'Social Media Executive'],
    salary: '₹3-8 LPA',
    projects: 'Live campaign practice',
    certificate: true,
  },
];

export const learningCourses: LearningCourse[] = [
  {courseId: 'data-science', progress: 72, completedLessons: 43, totalLessons: 60, nextLesson: 'Model Evaluation & Cross Validation'},
  {courseId: 'data-analytics', progress: 38, completedLessons: 15, totalLessons: 40, nextLesson: 'Power BI Dashboard Design'},
];

export const learningModules: LearningModule[] = [
  {
    id: 'm1', title: '01 · Python Foundation', progress: 100, lessons: [
      {id: 'l1', title: 'Python Setup & Basics', type: 'Video', duration: '24 min', completed: true},
      {id: 'l2', title: 'Variables & Data Types', type: 'Video', duration: '31 min', completed: true},
      {id: 'l3', title: 'Functions & Collections', type: 'Video', duration: '42 min', completed: true},
      {id: 'l4', title: 'Python Foundation Quiz', type: 'Quiz', duration: '10 questions', completed: true},
    ],
  },
  {
    id: 'm2', title: '02 · Data Analysis', progress: 80, lessons: [
      {id: 'l5', title: 'NumPy Essentials', type: 'Video', duration: '38 min', completed: true},
      {id: 'l6', title: 'Pandas DataFrames', type: 'Video', duration: '46 min', completed: true},
      {id: 'l7', title: 'Data Cleaning & EDA', type: 'Video', duration: '39 min', completed: true},
      {id: 'l8', title: 'Exploratory Analysis Assignment', type: 'Assignment', duration: 'Due Friday', completed: false},
    ],
  },
  {
    id: 'm3', title: '03 · Machine Learning', progress: 45, lessons: [
      {id: 'l9', title: 'Supervised Learning', type: 'Video', duration: '44 min', completed: true},
      {id: 'l10', title: 'Regression Models', type: 'Video', duration: '48 min', completed: true},
      {id: 'l11', title: 'Model Evaluation & Cross Validation', type: 'Video', duration: '52 min', completed: false},
      {id: 'l12', title: 'Machine Learning Quiz', type: 'Quiz', duration: '10 questions', completed: false},
    ],
  },
  {
    id: 'm4', title: '04 · Career Launch', progress: 0, lessons: [
      {id: 'l13', title: 'Portfolio Project', type: 'Assignment', duration: 'Capstone', completed: false, locked: true},
      {id: 'l14', title: 'Resume & GitHub Review', type: 'Resource', duration: 'Guide', completed: false, locked: true},
      {id: 'l15', title: 'Final Assessment', type: 'Quiz', duration: '25 questions', completed: false, locked: true},
    ],
  },
];

export const quizQuestions = [
  {question: 'Which Python library is commonly used for tabular data manipulation?', options: ['NumPy', 'Pandas', 'Flask', 'OpenCV'], answer: 1},
  {question: 'Which technique evaluates a model across multiple data splits?', options: ['Cross Validation', 'Tokenization', 'Web Scraping', 'One-hot encoding'], answer: 0},
  {question: 'Power BI is mainly used for:', options: ['Mobile development', 'Data visualization', 'Operating systems', 'Networking'], answer: 1},
  {question: 'SQL is primarily used to:', options: ['Style web pages', 'Query databases', 'Train neural networks only', 'Create images'], answer: 1},
  {question: 'Which is a supervised learning task?', options: ['Clustering', 'Classification', 'Association rules', 'PCA only'], answer: 1},
];

export const assignments: Assignment[] = [
  {id: 'a1', title: 'Exploratory Data Analysis', course: 'Data Science', due: '18 Sep', status: 'Pending', description: 'Analyze the supplied retail dataset and communicate meaningful business findings.', tasks: ['Clean missing values and duplicates', 'Create at least 5 meaningful visualizations', 'Write a short insight summary', 'Submit notebook and PDF report']},
  {id: 'a2', title: 'Power BI Executive Dashboard', course: 'Data Analytics', due: '22 Sep', status: 'Pending', description: 'Build an executive-level sales dashboard with filters, KPIs and clear visual hierarchy.', tasks: ['Create KPI cards', 'Add date and region filters', 'Build 3 interactive charts', 'Add a one-page insight summary']},
  {id: 'a3', title: 'Python Mini Project', course: 'Data Science', due: 'Completed', status: 'Evaluated', marks: '92/100', description: 'Create a command-line data utility using Python fundamentals.', tasks: ['Use functions', 'Validate input', 'Handle files', 'Write clean README']},
];

export const liveClasses: LiveClass[] = [
  {id: 'c1', title: 'ML Doubt Clearing Session', course: 'Data Science', date: 'Today', time: '4:00 PM', instructor: 'Industry Mentor', status: 'Live'},
  {id: 'c2', title: 'Power BI Dashboard Review', course: 'Data Analytics', date: '17 Sep', time: '11:00 AM', instructor: 'Analytics Faculty', status: 'Upcoming'},
  {id: 'c3', title: 'Career Q&A: Breaking into AI', course: 'Career Support', date: '20 Sep', time: '5:30 PM', instructor: 'Placement Team', status: 'Upcoming'},
];

export const certificates: Certificate[] = [
  {id: 'cert1', course: 'Python Programming Foundation', issuedOn: '12 Aug 2026', credential: 'SDIA-PY-2026-0187'},
];

export const jobs: Job[] = [
  {id: 'j1', title: 'Data Analyst', company: 'TechNova Solutions', location: 'Mohali, Punjab', salary: '₹4-6 LPA', type: 'Full Time', experience: '0-2 years', skills: ['SQL', 'Excel', 'Power BI'], description: 'Work with business datasets, dashboards and reporting to support data-driven decisions.', responsibilities: ['Prepare recurring business dashboards', 'Analyze data quality and trends', 'Work with stakeholders on reporting needs'], eligibility: 'Graduate with strong analytics fundamentals. Freshers with portfolio projects may apply.', posted: '2 days ago', deadline: '30 Sep'},
  {id: 'j2', title: 'Python Developer', company: 'CloudAxis Labs', location: 'Chandigarh', salary: '₹4.5-7 LPA', type: 'Full Time', experience: '0-2 years', skills: ['Python', 'REST API', 'SQL'], description: 'Build backend services, APIs and automation workflows using Python.', responsibilities: ['Develop Python modules', 'Integrate REST APIs', 'Write tests and maintain documentation'], eligibility: 'Good Python fundamentals and at least two practical projects.', posted: '3 days ago', deadline: '28 Sep'},
  {id: 'j3', title: 'Machine Learning Intern', company: 'InsightAI', location: 'Hybrid', salary: '₹18k-25k / month', type: 'Internship', experience: 'Fresher', skills: ['Python', 'ML', 'Pandas'], description: 'Support model experiments, dataset preparation and evaluation for AI products.', responsibilities: ['Prepare datasets', 'Run model experiments', 'Document evaluation results'], eligibility: 'Students or recent graduates with ML projects.', posted: 'Today', deadline: '25 Sep'},
  {id: 'j4', title: 'React Developer', company: 'WebSprint Technologies', location: 'Mohali, Punjab', salary: '₹4-8 LPA', type: 'Full Time', experience: '0-2 years', skills: ['React', 'JavaScript', 'Git'], description: 'Develop responsive production web interfaces and reusable components.', responsibilities: ['Build UI components', 'Integrate APIs', 'Review and improve frontend performance'], eligibility: 'Strong JavaScript basics and React project experience.', posted: '5 days ago', deadline: '02 Oct'},
  {id: 'j5', title: 'SEO Executive', company: 'GrowthMint Digital', location: 'Mohali, Punjab', salary: '₹3-5 LPA', type: 'Full Time', experience: '0-1 year', skills: ['SEO', 'Search Console', 'Analytics'], description: 'Plan and execute on-page and technical SEO improvements for client websites.', responsibilities: ['Keyword research', 'On-page optimization', 'Monthly reporting'], eligibility: 'Digital marketing fundamentals and basic SEO portfolio.', posted: '1 week ago', deadline: '05 Oct'},
];

export const notifications: NotificationItem[] = [
  {id: 'n1', title: 'Live class today', body: 'Machine Learning doubt session starts at 4:00 PM.', time: '10 min ago', read: false, type: 'class'},
  {id: 'n2', title: 'New placement opening', body: 'A new Machine Learning Intern role has been added.', time: '1 hour ago', read: false, type: 'placement'},
  {id: 'n3', title: 'Quiz available', body: 'Module 3 Machine Learning quiz is ready to attempt.', time: 'Yesterday', read: true, type: 'quiz'},
  {id: 'n4', title: 'Assignment reminder', body: 'Power BI dashboard assignment is due this week.', time: '2 days ago', read: true, type: 'assignment'},
  {id: 'n5', title: 'New course resource', body: 'A model evaluation cheat sheet has been added.', time: '3 days ago', read: true, type: 'course'},
];

export const hiringPartners = ['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Accenture', 'IBM', 'Cognizant', 'Capgemini', 'Oracle', 'Amazon', 'Flipkart'];

export const placementSupport = [
  {title: 'Resume Building', text: 'Professional resume crafting to highlight your skills.', icon: 'CV'},
  {title: 'Interview Prep', text: 'Mock interviews and technical preparation sessions.', icon: 'IP'},
  {title: 'Soft Skills', text: 'Communication and personality development workshops.', icon: 'SS'},
  {title: 'Portfolio Projects', text: 'Real-world projects designed for your portfolio.', icon: 'PF'},
  {title: 'Job Assistance', text: 'Placement opportunities through the partner network.', icon: 'JA'},
  {title: 'Career Counseling', text: 'One-on-one guidance for career planning.', icon: 'CC'},
];

export const careerRoadmap = [
  {step: '01', title: 'Foundation', time: '2-3 weeks', detail: 'Python, programming basics and data structures'},
  {step: '02', title: 'Data Analysis', time: '4-6 weeks', detail: 'Pandas, NumPy, visualization and statistics'},
  {step: '03', title: 'Machine Learning', time: '6-8 weeks', detail: 'Algorithms, Scikit-learn and practical projects'},
  {step: '04', title: 'Deep Learning', time: '6-8 weeks', detail: 'TensorFlow, Keras, CNN, RNN and NLP'},
  {step: '05', title: 'Deployment', time: '3-4 weeks', detail: 'Cloud, APIs, Docker and MLOps'},
  {step: '06', title: 'Job Ready', time: '2-3 weeks', detail: 'Resume, portfolio, interview prep and placement'},
];
