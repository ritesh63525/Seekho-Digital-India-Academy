
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
  Rocket,
  Target,
  Users,
} from 'lucide-react-native';

import {
  getOnboardingCourses,
  type OnboardingCourse,
} from '../../services/onboardingCoursesApi';

type Props = {
  onFinish: () => void;
};

const C = {
  bg: '#0B1925',
  card: '#152A3A',
  cardDark: '#102332',
  border: '#294455',
  white: '#FFFFFF',
  muted: '#B8C8D2',
  orange: '#FF862E',
  green: '#39D895',
  blue: '#78B6FF',
};

const WELCOME_LOGO = require('../../assets/seekho-welcome-logo.png');

const ACADEMY_LOGO = require('../../assets/seekho-login-logo-transparent.png');

// Your ORIGINAL Class 01 thumbnail.
// Keep this image at src/assets/seekho-maths-class01.png
const MATHS_THUMBNAIL = require('../../assets/seekho-maths-class01.png');

const SLIDES = [
  {
    title: 'Welcome to',
    highlight: 'Seekho Digital India Academy',
    description: '',
  },
  {
    title: 'Courses',
    highlight: 'We Offer',
    description:
      'Explore industry-focused courses and develop practical skills for your future.',
  },
  {
    title: 'About',
    highlight: 'Seekho Digital India',
    description:
      'Empowering learners with practical skills for a brighter future.',
  },
  {
    title: 'Best Institute',
    highlight: 'in Tricity',
    description:
      'Practical learning, expert guidance and career-focused training to help you grow.',
  },
  {
    title: 'Track Your',
    highlight: 'Progress',
    description:
      'Stay updated with your learning journey, assignments, tests and achievements — all in one place.',
  },
  {
    title: 'Learn Mathematics',
    highlight: 'On YouTube',
    description:
      'Easy-to-follow Hindi lessons for Data Science and Data Analytics.',
  },
  {
    title: "Let's",
    highlight: 'Get Started',
    description:
      'Your learning journey begins here. Sign in to your student portal and move forward with confidence.',
  },
];

export default function OnboardingScreen({onFinish}: Props) {
  const {width} = useWindowDimensions();

  const sliderRef = useRef<any>(null);
  const mountedRef = useRef(true);
  const requestRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(0);

  const [courses, setCourses] = useState<OnboardingCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const loadCourses = useCallback(async () => {
    const requestId = ++requestRef.current;

    setCoursesLoading(true);
    setCoursesError('');

    try {
      const result = await getOnboardingCourses();

      if (
        !mountedRef.current ||
        requestId !== requestRef.current
      ) {
        return;
      }

      setCourses(result);
    } catch (error) {
      if (
        !mountedRef.current ||
        requestId !== requestRef.current
      ) {
        return;
      }

      setCoursesError(
        error instanceof Error
          ? error.message
          : 'Unable to load courses. Please try again.',
      );
    } finally {
      if (
        mountedRef.current &&
        requestId === requestRef.current
      ) {
        setCoursesLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    void loadCourses();

    return () => {
      mountedRef.current = false;
      requestRef.current += 1;
    };
  }, [loadCourses]);

  const isFirst = activeIndex === 0;
  const isLast = activeIndex === SLIDES.length - 1;

  const moveTo = (index: number) => {
    const next = Math.max(
      0,
      Math.min(index, SLIDES.length - 1),
    );

    setActiveIndex(next);

    sliderRef.current?.scrollTo({
      x: next * width,
      animated: true,
    });
  };

  const handleBack = () => {
    if (!isFirst) {
      moveTo(activeIndex - 1);
    }
  };

  const handleNext = () => {
    if (isLast) {
      onFinish();
      return;
    }

    moveTo(activeIndex + 1);
  };

  const handleSwipe = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / width,
    );

    setActiveIndex(
      Math.max(
        0,
        Math.min(index, SLIDES.length - 1),
      ),
    );
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}>

      <StatusBar barStyle="light-content" />

      {/* ALL SEVEN SLIDES */}

      <ScrollView
        ref={sliderRef as any}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleSwipe}
        style={styles.slider}>

        {SLIDES.map((slide, index) => (
          <ScrollView
            key={index}
            style={{width}}
            contentContainerStyle={[
              styles.pageContent,
              index > 0 && styles.pageContentWithFixedLogo,
            ]}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled>

            {index === 0 ? (

              /* PAGE 1 — WELCOME */

              <WelcomeContent />

            ) : index === 5 ? (

              /*
               * PAGE 6 — MATHEMATICS
               *
               * Independent compact layout.
               * Only one thumbnail.
               * Does not use the normal visualArea.
               */

              <MathsVisual screenWidth={width} />

            ) : (

              /* ALL OTHER PAGES */

              <>
<View style={styles.headingArea}>

                  <Text style={styles.heading}>
                    {slide.title}
                  </Text>

                  <Text style={styles.headingHighlight}>
                    {slide.highlight}
                  </Text>

                  <Text style={styles.description}>
                    {slide.description}
                  </Text>

                </View>

                <View
                  style={[
                    styles.visualArea,
                    index === 1 && styles.coursesVisualArea,
                  ]}>

                  {index === 1 ? (
                    <CoursesVisual
                      courses={courses}
                      loading={coursesLoading}
                      error={coursesError}
                      onRetry={loadCourses}
                    />
                  ) : (
                    <SlideVisual index={index} />
                  )}

                </View>
              </>

            )}

          </ScrollView>
        ))}

      </ScrollView>

      {/* FIXED TOP LOGO — PAGES 2 TO 7 ONLY */}
      {activeIndex > 0 && (
        <View
          pointerEvents="none"
          style={styles.fixedTopLogoArea}>
          <Image
            source={ACADEMY_LOGO}
            style={styles.fixedTopLogo}
            resizeMode="contain"
            accessibilityLabel="Seekho Digital India Academy"
          />
        </View>
      )}

      {/* FIXED FOOTER — NEVER INSIDE PAGE SCROLL */}

      <View style={styles.footer}>

        <View style={styles.dots}>

          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
            />
          ))}

        </View>

        <View style={styles.buttonRow}>

          <Pressable
            onPress={handleBack}
            disabled={isFirst}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={[
              styles.secondaryButton,
              isFirst && styles.disabledButton,
            ]}>

            <ArrowLeft size={16} color={C.white} />

            <Text style={styles.secondaryButtonText}>
              Back
            </Text>

          </Pressable>

          <Pressable
            onPress={onFinish}
            disabled={isLast}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={[
              styles.secondaryButton,
              isLast && styles.disabledButton,
            ]}>

            <Text style={styles.secondaryButtonText}>
              Skip
            </Text>

          </Pressable>

          <Pressable
            onPress={handleNext}
            accessibilityRole="button"
            accessibilityLabel={
              isLast ? 'Get Started' : 'Next'
            }
            style={[
              styles.primaryButton,
              isLast && styles.getStartedButton,
            ]}>

            <Text style={styles.primaryButtonText}>
              {isLast ? 'Get Started' : 'Next'}
            </Text>

            <ArrowRight size={18} color={C.bg} />

          </Pressable>

        </View>

      </View>

    </SafeAreaView>
  );
}

/* ==================================================
   PAGE 1 — WELCOME
   ================================================== */

function WelcomeContent() {
  return (
    <View style={styles.welcomeContainer}>

      <View style={styles.welcomeHeading}>

        <Text style={styles.welcomeTitle}>
          Welcome to
        </Text>

        <Text style={styles.welcomeAcademyName}>
          Seekho Digital India Academy
        </Text>

      </View>

      <Image
        source={WELCOME_LOGO}
        style={styles.welcomeMainLogo}
        resizeMode="contain"
        accessibilityLabel="Seekho Digital India Academy logo"
      />

      <Text style={styles.welcomeTagline}>
        Learn • Practice • Grow
      </Text>

      <Text style={styles.welcomeSubtext}>
        Your skills. Your future.
      </Text>

      <View style={styles.orangeLine} />

      <Text style={styles.welcomeDescription}>
        Learn practical skills, grow with confidence
        and build a brighter future.
      </Text>

    </View>
  );
}

/* ==================================================
   PAGE 2 — COURSES FROM REAL API
   ================================================== */

function CoursesVisual({
  courses,
  loading,
  error,
  onRetry,
}: {
  courses: OnboardingCourse[];
  loading: boolean;
  error: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <View style={styles.messageBox}>

        <ActivityIndicator
          size="large"
          color={C.orange}
        />

        <Text style={styles.messageTitle}>
          Loading courses
        </Text>

        <Text style={styles.messageDescription}>
          Fetching the latest courses from the academy.
        </Text>

      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.messageBox}>

        <BookOpen size={37} color={C.orange} />

        <Text style={styles.messageTitle}>
          Courses unavailable
        </Text>

        <Text style={styles.messageDescription}>
          {error}
        </Text>

        <RetryButton
          label="Retry"
          onPress={onRetry}
        />

      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.messageBox}>

        <BookOpen size={37} color={C.orange} />

        <Text style={styles.messageTitle}>
          No courses available
        </Text>

        <Text style={styles.messageDescription}>
          Please check back soon for available courses.
        </Text>

        <RetryButton
          label="Refresh"
          onPress={onRetry}
        />

      </View>
    );
  }

  return (
    <View style={styles.coursesContainer}>

      <View style={styles.catalogHeader}>

        <Text style={styles.catalogEyebrow}>
          EXPLORE OUR PROGRAMS
        </Text>

        <Text style={styles.catalogCount}>
          {courses.length}{' '}
          {courses.length === 1 ? 'Course' : 'Courses'}
        </Text>

      </View>

      <View style={styles.courseList}>

        {courses.map((course, index) => (
          <CourseRow
            key={`${course.id}-${index}`}
            course={course}
            index={index}
          />
        ))}

      </View>

      <Text style={styles.catalogFooter}>
        Scroll to explore all available courses
      </Text>

    </View>
  );
}

function RetryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={styles.retryButton}>

      <RefreshCw size={17} color={C.bg} />

      <Text style={styles.retryButtonText}>
        {label}
      </Text>

    </Pressable>
  );
}

function CourseRow({
  course,
  index,
}: {
  course: OnboardingCourse;
  index: number;
}) {
  const accents = [
    C.blue,
    C.green,
    C.orange,
    '#C39AFF',
  ];

  const accent = accents[index % accents.length];

  return (
    <View style={styles.courseRow}>

      <View style={styles.courseIconBox}>
        <BookOpen
          size={23}
          color={accent}
        />
      </View>

      <View style={styles.courseTextArea}>

        <Text
          style={styles.courseTitle}
          numberOfLines={2}>
          {course.title}
        </Text>

        {!!course.description && (
          <Text
            style={styles.courseDescription}
            numberOfLines={2}>
            {course.description}
          </Text>
        )}

      </View>

      <Text style={styles.courseNumber}>
        {String(index + 1).padStart(2, '0')}
      </Text>

    </View>
  );
}

/* ==================================================
   PAGES 3, 4, 5 AND 7
   ================================================== */

function SlideVisual({index}: {index: number}) {
  switch (index) {
    case 2:
      return <AboutVisual />;

    case 3:
      return <WhyChooseUsVisual />;

    case 4:
      return <ProgressVisual />;

    default:
      return <GetStartedVisual />;
  }
}

/* PAGE 3 — ABOUT */

function AboutVisual() {
  return (
    <View style={styles.featureList}>

      <FeatureRow
        icon={<BookOpen size={23} color={C.green} />}
        title="Industry-Focused Learning"
        description="Build skills through practical education."
      />

      <FeatureRow
        icon={<Users size={23} color={C.orange} />}
        title="Expert Mentorship"
        description="Learn with guidance from experienced professionals."
      />

      <FeatureRow
        icon={
          <BriefcaseBusiness
            size={23}
            color={C.blue}
          />
        }
        title="Career-Focused Skills"
        description="Prepare for real-world opportunities."
      />

    </View>
  );
}

/* PAGE 4 — WHY CHOOSE US */

function WhyChooseUsVisual() {
  return (
    <View style={styles.featureList}>

      <FeatureRow
        icon={
          <BookOpenCheck
            size={23}
            color={C.green}
          />
        }
        title="Hands-on Learning"
        description="Build practical skills through projects and practice."
      />

      <FeatureRow
        icon={<Users size={23} color={C.orange} />}
        title="Guidance from Experts"
        description="Learn with support from experienced trainers."
      />

      <FeatureRow
        icon={<Target size={23} color={C.blue} />}
        title="Career-Focused Training"
        description="Develop skills relevant to the job market."
      />

      <Text style={styles.featureTagline}>
        Learn Better. Grow Stronger. Build Your Future.
      </Text>

    </View>
  );
}

/* PAGE 5 — TRACK PROGRESS */

function ProgressVisual() {
  return (
    <View style={styles.progressContainer}>

      <View style={styles.progressHeading}>

        <View style={styles.progressHeadingIcon}>
          <BarChart3 size={25} color={C.green} />
        </View>

        <View style={styles.progressHeadingText}>

          <Text style={styles.progressEyebrow}>
            YOUR STUDENT PORTAL
          </Text>

          <Text style={styles.progressTitle}>
            Your Learning Journey
          </Text>

        </View>

      </View>

      <View style={styles.progressDivider} />

      <FeatureRow
        icon={
          <BookOpenCheck
            size={23}
            color={C.green}
          />
        }
        title="Course Progress"
        description="Follow your lessons and keep moving forward."
      />

      <FeatureRow
        icon={
          <CheckCircle2 size={23} color={C.blue} />
        }
        title="Assignments & Tests"
        description="Practice and check your understanding."
      />

      <FeatureRow
        icon={<Award size={23} color={C.orange} />}
        title="Certificates & Achievements"
        description="View your milestones and achievements."
      />

    </View>
  );
}

/* ==================================================
   PAGE 6 — MATHEMATICS ON YOUTUBE
   ONE COMPLETE THUMBNAIL — NO CROPPING
   ================================================== */

function MathsVisual({
  screenWidth,
}: {
  screenWidth: number;
}) {
  /*
   * Your original image is 962 x 537.
   *
   * Using numeric width and height fixes the
   * oversized / zoomed image problem on Android.
   *
   * The outer frame and Image are exactly the
   * same dimensions.
   */

  const imageWidth = Math.min(screenWidth - 46, 420);

  const imageHeight = Math.round(
    imageWidth * (537 / 962),
  );

  return (
    <View style={styles.mathsPage}>

      {/* Academy logo is rendered once as a fixed overlay by OnboardingScreen. */}
{/* HEADING */}

      <Text style={styles.mathsTitle}>
        Learn Mathematics
      </Text>

      <Text style={styles.mathsTitleHighlight}>
        On YouTube
      </Text>

      <Text style={styles.mathsSubtitle}>
        Easy Hindi lessons for Data Science
        {'\n'}and Data Analytics.
      </Text>

      {/* SERIES NAME */}

      <View style={styles.mathsEyebrowRow}>

        <View style={styles.mathsLiveDot} />

        <Text style={styles.mathsEyebrow}>
          MATHEMATICS FOR DATA SCIENCE
        </Text>

        <View style={styles.mathsFreeBadge}>

          <Text style={styles.mathsFreeText}>
            FREE
          </Text>

        </View>

      </View>

      {/* ORIGINAL THUMBNAIL — ONLY ONCE */}

      <View
        style={[
          styles.mathsImageFrame,
          {
            width: imageWidth,
            height: imageHeight,
          },
        ]}>

        <Image
          source={MATHS_THUMBNAIL}
          resizeMode="contain"
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
          accessibilityLabel="Mathematics for Data Science Class 01 thumbnail"
        />

      </View>

      {/* SHORT CONTENT */}

      <Text style={styles.mathsDetailsTitle}>
        Learn from the Basics
      </Text>

      <Text style={styles.mathsDetailsDescription}>
        Build strong maths fundamentals with
        {'\n'}step-by-step Hindi lessons.
      </Text>

      {/* TOPICS */}

      <View style={styles.mathsTopics}>

        <TopicChip
          title="Linear Algebra"
          color={C.orange}
        />

        <TopicChip
          title="Calculus"
          color={C.green}
        />

        <TopicChip
          title="Trigonometry"
          color={C.blue}
        />

        <TopicChip
          title="Ratio & Percentage"
          color="#C39AFF"
        />

      </View>

      <Text style={styles.mathsBottomText}>
        Watch • Learn • Practice • Grow
      </Text>

    </View>
  );
}

function TopicChip({
  title,
  color,
}: {
  title: string;
  color: string;
}) {
  return (
    <View
      style={[
        styles.mathsTopicChip,
        {borderColor: color},
      ]}>

      <Text style={styles.mathsTopicText}>
        {title}
      </Text>

    </View>
  );
}

/* PAGE 7 — GET STARTED */

function GetStartedVisual() {
  return (
    <View style={styles.startContent}>

      <View style={styles.startOuterCircle}>

        <View style={styles.startInnerCircle}>
          <Rocket
            size={66}
            color={C.green}
            strokeWidth={1.7}
          />
        </View>

      </View>

      <Text style={styles.startHeadline}>
        Your Future Starts Here
      </Text>

      <Text style={styles.startDescription}>
        Build Skills. Grow Confidently. Move Forward.
      </Text>

      <View style={styles.startBadge}>

        <GraduationCap
          size={19}
          color={C.orange}
        />

        <Text style={styles.startBadgeText}>
          Learn • Practice • Grow • Succeed
        </Text>

      </View>

    </View>
  );
}

/* REUSABLE FEATURE CARD */

function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <View style={styles.featureRow}>

      <View style={styles.featureIcon}>
        {icon}
      </View>

      <View style={styles.featureText}>

        <Text style={styles.featureTitle}>
          {title}
        </Text>

        <Text style={styles.featureDescription}>
          {description}
        </Text>

      </View>

    </View>
  );
}

/* ==================================================
   STYLES
   ================================================== */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  slider: {
    flex: 1,
  },

  pageContent: {
    flexGrow: 1,
    paddingHorizontal: 23,
    paddingTop: 8,
    paddingBottom: 14,
    alignItems: 'center',
  },

  /*
   * Pages 2-7 reserve the same fixed area at the top.
   * Page 1 keeps the original layout unchanged.
   */
  pageContentWithFixedLogo: {
    paddingTop: 133,
  },

  /* FIXED LOGO — PAGES 2 TO 7 */
  fixedTopLogoArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 100,
    elevation: 20,
    backgroundColor: C.bg,
  },

  fixedTopLogo: {
    width: 270,
    height: 122,
    transform: [{scale: 1.9}],
  },

  /* LEGACY STANDARD LOGO STYLES */

  logoArea: {
    width: '100%',
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  academyLogo: {
    width: 270,
    height: 122,
    transform: [{scale: 1.9}],
  },

  /* STANDARD HEADINGS */

  headingArea: {
    width: '100%',
    alignItems: 'center',
    marginTop: 9,
  },

  heading: {
    color: C.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },

  headingHighlight: {
    color: C.orange,
    fontSize: 29,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 3,
  },

  description: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 15,
    maxWidth: 340,
  },

  visualArea: {
    flexGrow: 1,
    width: '100%',
    minHeight: 230,
    justifyContent: 'center',
    paddingTop: 23,
    paddingBottom: 10,
  },

  coursesVisualArea: {
    justifyContent: 'flex-start',
    paddingTop: 26,
    paddingBottom: 18,
  },

  /* WELCOME */

  welcomeContainer: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 16,
  },

  welcomeHeading: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },

  welcomeTitle: {
    color: C.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },

  welcomeAcademyName: {
    color: C.orange,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 325,
  },

  welcomeMainLogo: {
    width: 300,
    maxWidth: '100%',
    height: 240,
    backgroundColor: 'transparent',
    marginVertical: 12,
  },

  welcomeTagline: {
    color: C.white,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 7,
  },

  welcomeSubtext: {
    color: C.green,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },

  orangeLine: {
    width: 60,
    height: 4,
    borderRadius: 4,
    backgroundColor: C.orange,
    marginTop: 24,
    marginBottom: 18,
  },

  welcomeDescription: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },

  /* REAL COURSES */

  coursesContainer: {
    width: '100%',
  },

  catalogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },

  catalogEyebrow: {
    color: C.green,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  catalogCount: {
    color: C.orange,
    fontSize: 12,
    fontWeight: '800',
  },

  courseList: {
    width: '100%',
    gap: 10,
  },

  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 79,
    gap: 12,
    padding: 13,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
  },

  courseIconBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: C.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  courseTextArea: {
    flex: 1,
  },

  courseTitle: {
    color: C.white,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },

  courseDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  courseNumber: {
    color: '#718D9E',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 27,
    textAlign: 'right',
  },

  catalogFooter: {
    color: C.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 17,
    marginBottom: 4,
  },

  messageBox: {
    minHeight: 270,
    width: '100%',
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },

  messageTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  messageDescription: {
    color: C.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },

  retryButton: {
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: C.orange,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginTop: 6,
  },

  retryButtonText: {
    color: C.bg,
    fontSize: 14,
    fontWeight: '800',
  },

  /* ABOUT / TRICITY */

  featureList: {
    gap: 13,
  },

  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
  },

  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  featureText: {
    flex: 1,
  },

  featureTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '800',
  },

  featureDescription: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  featureTagline: {
    color: C.green,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
  },

  /* TRACK PROGRESS */

  progressContainer: {
    width: '100%',
    backgroundColor: C.cardDark,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 22,
    padding: 14,
    gap: 11,
  },

  progressHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 5,
  },

  progressHeadingIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#12382F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressHeadingText: {
    flex: 1,
  },

  progressEyebrow: {
    color: C.green,
    fontSize: 10,
    letterSpacing: 1.1,
    fontWeight: '800',
  },

  progressTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 4,
  },

  progressDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },

  /* MATHEMATICS — COMPACT SCREEN */

  mathsPage: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 0,
    paddingBottom: 9,
  },

  mathsLogoArea: {
    width: '100%',
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  mathsLogo: {
    width: 245,
    height: 103,
    transform: [{scale: 1.55}],
  },

  mathsTitle: {
    color: C.white,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  mathsTitleHighlight: {
    color: C.orange,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '800',
    textAlign: 'center',
  },

  mathsSubtitle: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 290,
  },

  mathsEyebrowRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 15,
    marginBottom: 10,
  },

  mathsLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: C.orange,
  },

  mathsEyebrow: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
    flex: 1,
  },

  mathsFreeBadge: {
    backgroundColor: '#17392F',
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  mathsFreeText: {
    color: C.green,
    fontSize: 10,
    fontWeight: '800',
  },

  mathsImageFrame: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
    overflow: 'hidden',
    alignSelf: 'center',
    flexShrink: 0,
  },

  mathsDetailsTitle: {
    color: C.white,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 15,
  },

  mathsDetailsDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 5,
    maxWidth: 290,
  },

  mathsTopics: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 7,
    marginTop: 15,
  },

  mathsTopicChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    backgroundColor: C.cardDark,
  },

  mathsTopicText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '700',
  },

  mathsBottomText: {
    color: C.green,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },

  /* GET STARTED */

  startContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  startOuterCircle: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    borderColor: '#255343',
    backgroundColor: '#10291F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },

  startInnerCircle: {
    width: 136,
    height: 136,
    borderRadius: 68,
    backgroundColor: '#153A2C',
    alignItems: 'center',
    justifyContent: 'center',
  },

  startHeadline: {
    color: C.white,
    fontSize: 23,
    fontWeight: '800',
    textAlign: 'center',
  },

  startDescription: {
    color: C.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 290,
  },

  startBadge: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 15,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },

  startBadgeText: {
    color: C.white,
    fontSize: 12,
    fontWeight: '700',
  },

  /* FIXED FOOTER */

  footer: {
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 12,
    gap: 16,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#455A6A',
  },

  activeDot: {
    width: 23,
    backgroundColor: C.green,
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  secondaryButton: {
    width: 70,
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  secondaryButtonText: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },

  disabledButton: {
    opacity: 0.3,
  },

  primaryButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: C.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 9,
  },

  getStartedButton: {
    backgroundColor: C.green,
  },

  primaryButtonText: {
    color: C.bg,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
});