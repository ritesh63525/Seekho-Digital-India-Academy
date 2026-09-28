
import React, {useCallback, useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  BookOpen,
  ChevronRight,
  RefreshCw,
} from 'lucide-react-native';

import {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/navigationTypes';

import FeatureIcon, {
  type FeatureIconName,
} from '../../components/FeatureIcon';

import {useApp} from '../../state/AppContext';

import {
  getLearningCourses,
  getStudentLearningProfile,
  type LearningCourse,
  type StudentLearningProfile,
} from '../../services/learningApi';

import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = BottomTabScreenProps<
  MainTabParamList,
  'Learning'
>;

type LearningTab =
  | 'myCourses'
  | 'explore'
  | 'history';

type LearningPalette = {
  bg: string;
  surface: string;
  border: string;
  borderStrong: string;
  white: string;
  muted: string;
  light: string;
  green: string;
  orange: string;
  blue: string;
};

function makeLearningPalette(
  theme: AppTheme,
): LearningPalette {
  return {
    bg: theme.colors.background,
    surface: theme.colors.surface,
    border: theme.colors.border,
    borderStrong: theme.colors.borderStrong,
    white: theme.colors.textPrimary,
    muted: theme.colors.textSecondary,
    light: theme.colors.textLight,
    green: theme.colors.secondary,
    orange: theme.colors.primary,
    blue: theme.colors.info,
  };
}

function useLearningTheme() {
  const {theme} = useTheme();

  const C = useMemo(
    () => makeLearningPalette(theme),
    [theme],
  );

  const styles = useMemo(
    () => createStyles(theme, C),
    [theme, C],
  );

  return {
    theme,
    C,
    styles,
  };
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

const LearningScreen = ({navigation}: Props) => {
  const {theme, C, styles} = useLearningTheme();
  const {accessToken} = useApp();

  const [activeTab, setActiveTab] =
    useState<LearningTab>('myCourses');

  const [profile, setProfile] =
    useState<StudentLearningProfile | null>(null);

  const [courses, setCourses] =
    useState<LearningCourse[]>([]);

  const [profileLoading, setProfileLoading] =
    useState(true);

  const [coursesLoading, setCoursesLoading] =
    useState(true);

  const [profileError, setProfileError] =
    useState('');

  const [coursesError, setCoursesError] =
    useState('');

  const [reload, setReload] = useState(0);

  const rootNavigation = navigation.getParent<
    NativeStackNavigationProp<RootStackParamList>
  >();

  /* LOAD REAL BACKEND DATA */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setProfileLoading(true);
        setCoursesLoading(true);

        setProfileError('');
        setCoursesError('');

        setProfile(null);
        setCourses([]);

        const profileRequest = accessToken
          ? getStudentLearningProfile(accessToken)
          : Promise.reject(
              new Error(
                'Student session is missing. Please sign in again.',
              ),
            );

        const coursesRequest = getLearningCourses();

        const results = await Promise.allSettled([
          profileRequest,
          coursesRequest,
        ]);

        if (!active) {
          return;
        }

        const profileResult = results[0];
        const coursesResult = results[1];

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
        } else {
          setProfileError(
            profileResult.reason instanceof Error
              ? profileResult.reason.message
              : 'Unable to load your student profile.',
          );
        }

        if (coursesResult.status === 'fulfilled') {
          setCourses(coursesResult.value);
        } else {
          setCoursesError(
            coursesResult.reason instanceof Error
              ? coursesResult.reason.message
              : 'Unable to load courses.',
          );
        }

        setProfileLoading(false);
        setCoursesLoading(false);
      };

      void load();

      return () => {
        active = false;
      };
    }, [accessToken, reload]),
  );

  const retry = () => {
    setReload(value => value + 1);
  };

  /* MATCH ASSIGNED COURSE WITH REAL CATALOG */

  const assignedCourse = profile
    ? courses.find(course => {
        const idMatches =
          !!profile.assignedCourseId &&
          normalize(course.id) ===
            normalize(profile.assignedCourseId);

        const titleMatches =
          !!profile.assignedCourseTitle &&
          normalize(course.title) ===
            normalize(profile.assignedCourseTitle);

        return idMatches || titleMatches;
      })
    : undefined;

  const assignedCourseTitle =
    profile?.assignedCourseTitle ||
    assignedCourse?.title ||
    '';

  const assignedCourseId =
    assignedCourse?.id ||
    profile?.assignedCourseId ||
    '';

  const assignedDescription =
    assignedCourse?.description || '';

  const openAssignedCourse = () => {
    if (!assignedCourseId) {
      return;
    }

    rootNavigation?.navigate('CourseLearning', {
      courseId: assignedCourseId,
    });
  };

  const openCourseDetails = (courseId: string) => {
    rootNavigation?.navigate('CourseDetails', {
      courseId,
    });
  };

  const openRoot = (
    screen:
      | 'Assignments'
      | 'Quiz'
      | 'LiveClasses'
      | 'Attendance'
      | 'Certificates',
  ) => {
    rootNavigation?.navigate(screen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerText}>

            <Text style={styles.eyebrow}>
              STUDENT PORTAL
            </Text>

            <Text style={styles.title}>
              My Learning
            </Text>

            <Text style={styles.subtitle}>
              Access your courses, assignments,
              assessments and academic activities.
            </Text>

          </View>

          <Pressable
            onPress={retry}
            accessibilityRole="button"
            accessibilityLabel="Refresh learning data"
            style={styles.refreshButton}>

            <RefreshCw
              size={19}
              color={C.green}
            />

          </Pressable>
        </View>

        {/* TABS */}

        <View style={styles.tabsContainer}>

          <TabButton
            title="My Courses"
            active={activeTab === 'myCourses'}
            onPress={() => setActiveTab('myCourses')}
          />

          <TabButton
            title="Explore"
            active={activeTab === 'explore'}
            onPress={() => setActiveTab('explore')}
          />

          <TabButton
            title="History"
            active={activeTab === 'history'}
            onPress={() => setActiveTab('history')}
          />

        </View>

        {/* MY COURSES */}

        {activeTab === 'myCourses' && (
          <>

            <View style={styles.sectionHeader}>

              <View style={styles.sectionHeaderText}>

                <Text style={styles.sectionTitle}>
                  Assigned Course
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Your current learning program.
                </Text>

              </View>

              {assignedCourseTitle ? (
                <View style={styles.assignedBadge}>
                  <View style={styles.assignedDot} />

                  <Text style={styles.assignedText}>
                    Assigned
                  </Text>
                </View>
              ) : null}

            </View>

            {profileLoading ? (
              <LoadingCard
                message="Loading your course..."
              />
            ) : profileError ? (
              <MessageCard
                title="Profile unavailable"
                description={profileError}
                buttonTitle="Retry"
                onPress={retry}
              />
            ) : assignedCourseTitle ? (
              <View style={styles.courseCard}>

                <View style={styles.courseTop}>

                  <FeatureIcon
                    name="course"
                    size={22}
                    containerSize={54}
                  />

                  <View style={styles.courseContent}>

                    <Text style={styles.courseEyebrow}>
                      YOUR COURSE
                    </Text>

                    <Text style={styles.courseTitle}>
                      {assignedCourseTitle}
                    </Text>

                    <Text style={styles.courseDescription}>
                      {assignedDescription ||
                        'Access your assigned course and available learning materials.'}
                    </Text>

                  </View>

                </View>

                <View style={styles.courseDivider} />

                <View style={styles.courseNotice}>

                  <BookOpen
                    size={18}
                    color={C.green}
                  />

                  <Text style={styles.courseNoticeText}>
                    Your lessons and progress will appear
                    when available from the student portal.
                  </Text>

                </View>

                {assignedCourseId ? (
                  <Pressable
                    onPress={openAssignedCourse}
                    accessibilityRole="button"
                    style={({pressed}) => [
                      styles.continueButton,
                      pressed && styles.pressed,
                    ]}>

                    <Text style={styles.continueButtonText}>
                      Open Course
                    </Text>

                    <ChevronRight
                      size={19}
                      color={theme.colors.black}
                    />

                  </Pressable>
                ) : (
                  <Text style={styles.missingIdText}>
                    Course details will be available
                    once its ID is linked to your profile.
                  </Text>
                )}

              </View>
            ) : (
              <MessageCard
                title="No assigned course found"
                description="Your student profile does not currently include an assigned course."
                buttonTitle="Explore Courses"
                onPress={() => setActiveTab('explore')}
              />
            )}

            {/* ACADEMIC TOOLS */}

            <View style={styles.sectionHeaderSimple}>

              <Text style={styles.sectionTitle}>
                Academic Tools
              </Text>

              <Text style={styles.sectionSubtitle}>
                Quick access to your learning activities.
              </Text>

            </View>

            <View style={styles.toolsGrid}>

              <ToolCard
                icon="assignment"
                accentColor={theme.colors.primary}
                title="Assignments"
                subtitle="View your work"
                onPress={() => openRoot('Assignments')}
              />

              <ToolCard
                icon="quiz"
                accentColor={theme.colors.info}
                title="Tests & Quizzes"
                subtitle="View assessments"
                onPress={() => openRoot('Quiz')}
              />

              <ToolCard
                icon="schedule"
                accentColor={theme.colors.warning}
                title="Schedule"
                subtitle="Upcoming classes"
                onPress={() => openRoot('LiveClasses')}
              />

              <ToolCard
                icon="attendance"
                accentColor={theme.colors.secondary}
                title="Attendance"
                subtitle="View records"
                onPress={() => openRoot('Attendance')}
              />

              <ToolCard
                icon="certificate"
                accentColor={theme.colors.warning}
                title="Certificates"
                subtitle="View achievements"
                onPress={() => openRoot('Certificates')}
              />

              <ToolCard
                icon="quiz"
                accentColor={theme.colors.info}
                title="Practice Quiz"
                subtitle="Start practicing"
                onPress={() => openRoot('Quiz')}
              />

            </View>

            {/* LEARNING SUMMARY */}

            <View style={styles.sectionHeaderSimple}>
              <Text style={styles.sectionTitle}>
                Learning Summary
              </Text>
            </View>

            <View style={styles.summaryCard}>

              <SummaryRow
                label="Student"
                value={profile?.name || '—'}
              />

              <Divider />

              <SummaryRow
                label="Course"
                value={assignedCourseTitle || '—'}
              />

              <Divider />

              <SummaryRow
                label="Student Status"
                value={profile?.studentStatus || '—'}
                green
              />

              <Divider />

              <SummaryRow
                label="Course Progress"
                value="Not available"
              />

              <Divider />

              <SummaryRow
                label="Completed Lessons"
                value="Not available"
              />

            </View>

            {/* QUICK ACCESS */}

            <View style={styles.sectionHeaderSimple}>

              <Text style={styles.sectionTitle}>
                Quick Access
              </Text>

              <Text style={styles.sectionSubtitle}>
                Open your academic records.
              </Text>

            </View>

            <View style={styles.quickList}>

              <QuickRow
                icon="assignment"
                title="Assignments"
                subtitle="View pending and submitted work"
                onPress={() => openRoot('Assignments')}
              />

              <QuickRow
                icon="quiz"
                title="Tests & Quizzes"
                subtitle="View assessments and results"
                onPress={() => openRoot('Quiz')}
              />

              <QuickRow
                icon="schedule"
                title="Class Schedule"
                subtitle="Classes, labs and workshops"
                onPress={() => openRoot('LiveClasses')}
              />

              <QuickRow
                icon="attendance"
                title="Attendance"
                subtitle="Daily attendance records"
                onPress={() => openRoot('Attendance')}
              />

              <QuickRow
                icon="certificate"
                title="Certificates"
                subtitle="Available course certificates"
                onPress={() => openRoot('Certificates')}
              />

            </View>

          </>
        )}

        {/* EXPLORE COURSES */}

        {activeTab === 'explore' && (
          <>

            <View style={styles.sectionHeader}>

              <View style={styles.sectionHeaderText}>

                <Text style={styles.sectionTitle}>
                  Explore Courses
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Discover the academy's available programs.
                </Text>

              </View>

              {!coursesLoading && !coursesError && (
                <Text style={styles.courseCount}>
                  {courses.length} Courses
                </Text>
              )}

            </View>

            {coursesLoading ? (
              <LoadingCard
                message="Loading available courses..."
              />
            ) : coursesError ? (
              <MessageCard
                title="Courses unavailable"
                description={coursesError}
                buttonTitle="Retry"
                onPress={retry}
              />
            ) : courses.length === 0 ? (
              <MessageCard
                title="No courses available"
                description="Please check back soon for available programs."
                buttonTitle="Refresh"
                onPress={retry}
              />
            ) : (
              <View style={styles.exploreList}>

                {courses.map((course, index) => (
                  <Pressable
                    key={`${course.id}-${index}`}
                    onPress={() =>
                      openCourseDetails(course.id)
                    }
                    accessibilityRole="button"
                    style={({pressed}) => [
                      styles.exploreCard,
                      pressed && styles.pressed,
                    ]}>

                    <View style={styles.exploreIcon}>

                      <BookOpen
                        size={23}
                        color={
                          index % 2 === 0
                            ? C.green
                            : C.orange
                        }
                      />

                    </View>

                    <View style={styles.exploreContent}>

                      <Text style={styles.exploreEyebrow}>
                        ACADEMY COURSE
                      </Text>

                      <Text style={styles.exploreTitle}>
                        {course.title}
                      </Text>

                      {!!course.description && (
                        <Text
                          style={styles.exploreDescription}
                          numberOfLines={2}>
                          {course.description}
                        </Text>
                      )}

                      {assignedCourseId === course.id && (
                        <Text style={styles.exploreAssigned}>
                          Your assigned course
                        </Text>
                      )}

                    </View>

                    <ChevronRight
                      size={18}
                      color={C.light}
                    />

                  </Pressable>
                ))}

              </View>
            )}

          </>
        )}

        {/* HISTORY — NO FAKE PURCHASE RECORDS */}

        {activeTab === 'history' && (
          <>

            <View style={styles.sectionHeaderSimple}>

              <Text style={styles.sectionTitle}>
                Learning History
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your course and learning record.
              </Text>

            </View>

            {profileLoading ? (
              <LoadingCard
                message="Loading your account..."
              />
            ) : profileError ? (
              <MessageCard
                title="Account unavailable"
                description={profileError}
                buttonTitle="Retry"
                onPress={retry}
              />
            ) : (
              <View style={styles.summaryCard}>

                <SummaryRow
                  label="Student"
                  value={profile?.name || '—'}
                />

                <Divider />

                <SummaryRow
                  label="Assigned Course"
                  value={assignedCourseTitle || '—'}
                />

                <Divider />

                <SummaryRow
                  label="Student Status"
                  value={profile?.studentStatus || '—'}
                  green
                />

              </View>
            )}

            <View style={styles.historyNotice}>

              <BookOpen
                size={28}
                color={C.orange}
              />

              <Text style={styles.historyTitle}>
                Purchase History
              </Text>

              <Text style={styles.historyDescription}>
                Verified purchase and enrollment history
                is not connected yet. No demo transactions
                are shown here.
              </Text>

            </View>

          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

/* -----------------------------------------
   REUSABLE UI
   ----------------------------------------- */

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  const {styles} = useLearningTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.tabButton,
        active && styles.tabButtonActive,
      ]}>

      <Text
        style={[
          styles.tabText,
          active && styles.tabTextActive,
        ]}>
        {title}
      </Text>

    </Pressable>
  );
}

function LoadingCard({
  message,
}: {
  message: string;
}) {
  const {C, styles} = useLearningTheme();

  return (
    <View style={styles.loadingCard}>

      <ActivityIndicator
        color={C.green}
        size="small"
      />

      <Text style={styles.loadingText}>
        {message}
      </Text>

    </View>
  );
}

function MessageCard({
  title,
  description,
  buttonTitle,
  onPress,
}: {
  title: string;
  description: string;
  buttonTitle: string;
  onPress: () => void;
}) {
  const {styles} = useLearningTheme();

  return (
    <View style={styles.messageCard}>

      <Text style={styles.messageTitle}>
        {title}
      </Text>

      <Text style={styles.messageDescription}>
        {description}
      </Text>

      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        style={styles.messageButton}>

        <Text style={styles.messageButtonText}>
          {buttonTitle}
        </Text>

      </Pressable>

    </View>
  );
}

function ToolCard({
  icon,
  accentColor,
  title,
  subtitle,
  onPress,
}: {
  icon: FeatureIconName;
  accentColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const {C, styles} = useLearningTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.toolCard,
        pressed && styles.pressed,
      ]}>

      <View style={styles.toolTop}>

        <FeatureIcon
          name={icon}
          size={17}
          containerSize={36}
        />

        <ChevronRight
          size={17}
          color={C.light}
        />

      </View>

      <Text
        style={[
          styles.toolAccent,
          {color: accentColor},
        ]}>
        Open →
      </Text>

      <Text style={styles.toolTitle}>
        {title}
      </Text>

      <Text style={styles.toolSubtitle}>
        {subtitle}
      </Text>

    </Pressable>
  );
}

function QuickRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: FeatureIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const {C, styles} = useLearningTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.quickRow,
        pressed && styles.pressed,
      ]}>

      <FeatureIcon
        name={icon}
        size={17}
        containerSize={38}
      />

      <View style={styles.quickContent}>

        <Text style={styles.quickTitle}>
          {title}
        </Text>

        <Text style={styles.quickSubtitle}>
          {subtitle}
        </Text>

      </View>

      <ChevronRight
        size={17}
        color={C.light}
      />

    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  const {styles} = useLearningTheme();

  return (
    <View style={styles.summaryRow}>

      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.summaryValue,
          green && styles.summaryValueGreen,
        ]}>
        {value}
      </Text>

    </View>
  );
}

function Divider() {
  const {styles} = useLearningTheme();

  return <View style={styles.divider} />;
}

/* -----------------------------------------
   STYLES
   ----------------------------------------- */

const createStyles = (
  theme: AppTheme,
  C: LearningPalette,
) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 23,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: C.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 7,
  },

  title: {
    color: C.white,
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '900',
  },

  subtitle: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 8,
  },

  refreshButton: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: theme.colors.secondarySoft,
    borderWidth: 1,
    borderColor: theme.colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.16
        : 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.borderStrong,
    padding: 5,
    gap: 5,
    marginBottom: 24,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.10
        : 0.025,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  tabButton: {
    flex: 1,
    minHeight: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  tabButtonActive: {
    backgroundColor: C.green,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.10,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  tabText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '800',
  },

  tabTextActive: {
    color: theme.colors.black,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    marginBottom: 13,
    gap: 9,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionHeaderSimple: {
    marginTop: 23,
    marginBottom: 13,
  },

  sectionTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  assignedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.greenSoft,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.greenDark,
  },

  assignedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.green,
  },

  assignedText: {
    color: C.green,
    fontSize: 9,
    fontWeight: '800',
  },

  courseCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 23,
    padding: 17,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.18
        : 0.05,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  courseTop: {
    flexDirection: 'row',
  },

  courseContent: {
    flex: 1,
    marginLeft: 12,
  },

  courseEyebrow: {
    color: C.orange,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  courseTitle: {
    color: C.white,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900',
    marginTop: 5,
  },

  courseDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  courseDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginTop: 17,
    marginBottom: 15,
  },

  courseNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 12,
  },

  courseNoticeText: {
    flex: 1,
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
  },

  continueButton: {
    minHeight: 50,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  continueButtonText: {
    color: theme.colors.black,
    fontSize: 13,
    fontWeight: '900',
  },

  missingIdText: {
    color: C.light,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 15,
  },

  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  toolCard: {
    width: '48.5%',
    minHeight: 136,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 19,
    padding: 14,
    marginBottom: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.12
        : 0.035,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  toolTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toolAccent: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 11,
  },

  toolTitle: {
    color: C.white,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 5,
  },

  toolSubtitle: {
    color: C.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  summaryCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.10
        : 0.03,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  summaryRow: {
    minHeight: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
  },

  summaryLabel: {
    color: C.muted,
    fontSize: 10,
    flex: 1,
  },

  summaryValue: {
    color: C.white,
    fontSize: 11,
    fontWeight: '800',
    flex: 1.2,
    textAlign: 'right',
  },

  summaryValueGreen: {
    color: C.green,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
  },

  quickList: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.10
        : 0.03,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  quickRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  quickContent: {
    flex: 1,
    marginLeft: 12,
  },

  quickTitle: {
    color: C.white,
    fontSize: 11,
    fontWeight: '800',
  },

  quickSubtitle: {
    color: C.muted,
    fontSize: 9,
    marginTop: 4,
  },

  courseCount: {
    color: C.orange,
    fontSize: 11,
    fontWeight: '800',
  },

  exploreList: {
    gap: 11,
  },

  exploreCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    gap: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.11
        : 0.03,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  exploreIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceSoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  exploreContent: {
    flex: 1,
  },

  exploreEyebrow: {
    color: C.orange,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  exploreTitle: {
    color: C.white,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },

  exploreDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 5,
  },

  exploreAssigned: {
    color: C.green,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 7,
  },

  historyNotice: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 21,
    padding: 27,
    marginTop: 20,
    gap: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.11
        : 0.03,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  historyTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },

  historyDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },

  loadingCard: {
    minHeight: 140,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },

  loadingText: {
    color: C.muted,
    fontSize: 12,
    textAlign: 'center',
  },

  messageCard: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.borderStrong,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: theme.colors.shadow,
    shadowOpacity:
      theme.dark
        ? 0.10
        : 0.03,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 1,
  },

  messageTitle: {
    color: C.white,
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },

  messageDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
  },

  messageButton: {
    backgroundColor: C.green,
    borderRadius: 11,
    minHeight: 42,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  messageButtonText: {
    color: theme.colors.black,
    fontSize: 12,
    fontWeight: '900',
  },

  pressed: {
    opacity: 0.73,
  },
});

export default LearningScreen;