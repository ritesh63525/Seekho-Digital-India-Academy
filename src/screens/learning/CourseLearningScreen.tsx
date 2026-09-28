import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react-native';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  getLearningCourseDetails,
  type LearningCourseDetails,
} from '../../services/learningApi';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CourseLearning'
>;

function useCourseLearningTheme() {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  return {
    theme,
    styles,
  };
}

export default function CourseLearningScreen({
  navigation,
  route,
}: Props) {
  const {
    theme,
    styles,
  } = useCourseLearningTheme();

  const courseId =
    route.params.courseId;

  const [course, setCourse] =
    useState<LearningCourseDetails | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [reload, setReload] =
    useState(0);

  const refresh =
    useCallback(() => {
      setReload(
        value => value + 1,
      );
    }, []);

  /*
   * REAL COURSE DETAILS
   *
   * Existing learning service call
   * preserved exactly.
   */
  useEffect(() => {
    let active = true;

    const loadCourse =
      async () => {
        setLoading(true);
        setError('');
        setCourse(null);

        try {
          const result =
            await getLearningCourseDetails(
              courseId,
            );

          if (!active) {
            return;
          }

          setCourse(result);
        } catch (caughtError) {
          if (!active) {
            return;
          }

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load course details.',
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    void loadCourse();

    return () => {
      active = false;
    };
  }, [
    courseId,
    reload,
  ]);

  return (
    <SafeAreaView
      style={styles.safe}>

      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      {/* TOP BAR */}

      <View style={styles.topBar}>
        <Pressable
          onPress={() =>
            navigation.goBack()
          }
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({pressed}) => [
            styles.topButton,
            pressed &&
              styles.pressed,
          ]}>
          <ArrowLeft
            size={20}
            color={
              theme.colors.textPrimary
            }
            strokeWidth={2.4}
          />
        </Pressable>

        <View style={styles.topTitleArea}>
          <Text
            numberOfLines={1}
            style={styles.topTitle}>
            {course?.title ||
              'Course Learning'}
          </Text>

          <Text style={styles.topSubtitle}>
            Course workspace
          </Text>
        </View>

        <Pressable
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh course"
          style={({pressed}) => [
            styles.topButton,
            pressed &&
              styles.pressed,
          ]}>
          <RefreshCw
            size={19}
            color={
              theme.colors.primary
            }
            strokeWidth={2.3}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scroll
        }>

        {/* LOADING */}

        {loading && (
          <View
            style={styles.stateCard}>

            <ActivityIndicator
              size="large"
              color={
                theme.colors.secondary
              }
            />

            <Text
              style={
                styles.stateTitle
              }>
              Loading your course
            </Text>

            <Text
              style={
                styles.stateDescription
              }>
              Fetching the latest course
              information.
            </Text>
          </View>
        )}

        {/* API ERROR */}

        {!loading &&
          !!error && (
          <View
            style={styles.stateCard}>

            <View
              style={
                styles.stateIcon
              }>
              <BookOpen
                size={32}
                color={
                  theme.colors.primary
                }
                strokeWidth={2.2}
              />
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              Course unavailable
            </Text>

            <Text
              style={
                styles.stateDescription
              }>
              {error}
            </Text>

            <Pressable
              onPress={refresh}
              accessibilityRole="button"
              accessibilityLabel="Retry loading course"
              style={({pressed}) => [
                styles.retryButton,
                pressed &&
                  styles.pressed,
              ]}>

              <RefreshCw
                size={17}
                color={
                  theme.colors.black
                }
                strokeWidth={2.3}
              />

              <Text
                style={
                  styles.retryText
                }>
                Retry
              </Text>

            </Pressable>
          </View>
        )}

        {/* REAL COURSE CONTENT */}

        {!loading &&
          !error &&
          course && (
          <>

            {/* COURSE HERO */}

            <View
              style={styles.courseCard}>

              <View style={styles.courseTop}>
                <View
                  style={
                    styles.courseIcon
                  }>
                  <BookOpen
                    size={27}
                    color={
                      theme.colors.primary
                    }
                    strokeWidth={2.2}
                  />
                </View>

                <Image
                  source={require('../../assets/seekho-login-logo-transparent.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.kickerRow}>
                <Sparkles
                  size={13}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.2}
                />

                <Text style={styles.kicker}>
                  COURSE WORKSPACE
                </Text>
              </View>

              <Text
                style={
                  styles.courseTitle
                }>
                {course.title}
              </Text>

              <View
                style={styles.divider}
              />

              <Text
                style={
                  styles.descriptionLabel
                }>
                ABOUT THIS COURSE
              </Text>

              <Text
                style={
                  styles.courseDescription
                }>
                {course.description ||
                  'Explore your course and access available academic resources.'}
              </Text>

              <View
                style={
                  styles.heroAccentRow
                }>
                <View
                  style={
                    styles.heroAccentOrange
                  }
                />

                <View
                  style={
                    styles.heroAccentGreen
                  }
                />
              </View>
            </View>

            {/* QUICK ACADEMIC ACTIONS */}

            <View style={styles.sectionHeader}>
              <Text
                style={
                  styles.sectionEyebrow
                }>
                ACADEMIC TOOLS
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }>
                Continue Learning
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }>
                Open your learning
                activities.
              </Text>
            </View>

            <View
              style={styles.quickRow}>

              <QuickAction
                icon={
                  <Target
                    size={23}
                    color={
                      theme.colors.secondary
                    }
                    strokeWidth={2.2}
                  />
                }
                title="Practice Quiz"
                onPress={() =>
                  navigation.navigate(
                    'Quiz',
                  )
                }
              />

              <QuickAction
                icon={
                  <ClipboardList
                    size={23}
                    color={
                      theme.colors.primary
                    }
                    strokeWidth={2.2}
                  />
                }
                title="Assignments"
                onPress={() =>
                  navigation.navigate(
                    'Assignments',
                  )
                }
              />

              <QuickAction
                icon={
                  <CalendarDays
                    size={23}
                    color={
                      theme.colors.info
                    }
                    strokeWidth={2.2}
                  />
                }
                title="Live Classes"
                onPress={() =>
                  navigation.navigate(
                    'LiveClasses',
                  )
                }
              />
            </View>

            {/* COURSE CONTENT */}

            <View style={styles.sectionHeader}>
              <Text
                style={
                  styles.sectionEyebrow
                }>
                COURSE CONTENT
              </Text>

              <Text
                style={
                  styles.sectionTitle
                }>
                Lessons & Modules
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }>
                Your course content will
                appear here when the backend
                learning-content API is
                available.
              </Text>
            </View>

            <View
              style={
                styles.contentCard
              }>

              <View
                style={
                  styles.contentIcon
                }>
                <BookOpen
                  size={31}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.2}
                />
              </View>

              <Text
                style={
                  styles.contentTitle
                }>
                Lessons & Modules
              </Text>

              <Text
                style={
                  styles.contentDescription
                }>
                Your course details are
                connected. Lesson and module
                information will appear here
                when the academy's
                learning-content API is
                connected.
              </Text>

              <View
                style={
                  styles.contentBadge
                }>

                <Text
                  style={
                    styles.contentBadgeText
                  }>
                  Content integration pending
                </Text>
              </View>
            </View>

            {/* PROGRESS NOTICE */}

            <View
              style={
                styles.progressNotice
              }>

              <View
                style={
                  styles.progressIcon
                }>
                <Target
                  size={20}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.progressNoticeBody
                }>

                <Text
                  style={
                    styles.progressNoticeTitle
                  }>
                  Learning Progress
                </Text>

                <Text
                  style={
                    styles.progressNoticeText
                  }>
                  Your completed lessons and
                  course progress will be
                  displayed when verified
                  progress data becomes
                  available.
                </Text>

              </View>
            </View>

            {/* BACK TO LEARNING */}

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
              accessibilityRole="button"
              style={({pressed}) => [
                styles.backButton,
                pressed &&
                  styles.pressed,
              ]}>

              <Text
                style={
                  styles.backButtonText
                }>
                Back to My Learning
              </Text>

              <ChevronRight
                size={19}
                color={
                  theme.colors.black
                }
                strokeWidth={2.3}
              />
            </Pressable>

          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  title,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}) {
  const {
    theme,
    styles,
  } = useCourseLearningTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({pressed}) => [
        styles.quick,
        pressed &&
          styles.pressed,
      ]}>

      <View
        style={styles.quickIcon}>
        {icon}
      </View>

      <Text
        style={styles.quickTitle}>
        {title}
      </Text>

      <View
        style={styles.quickArrow}>
        <ChevronRight
          size={16}
          color={
            theme.colors.iconMuted
          }
          strokeWidth={2.2}
        />
      </View>

    </Pressable>
  );
}

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    topBar: {
      minHeight: 72,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,
      backgroundColor:
        theme.colors.surface,
    },

    topButton: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    topTitleArea: {
      flex: 1,
      paddingHorizontal: 12,
      alignItems: 'center',
    },

    topTitle: {
      maxWidth: '100%',
      color:
        theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '900',
      textAlign: 'center',
    },

    topSubtitle: {
      marginTop: 2,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '700',
    },

    scroll: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 42,
    },

    stateCard: {
      minHeight: 270,
      padding: 23,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    stateIcon: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor:
        theme.colors.primarySoft,
    },

    stateTitle: {
      marginTop: 15,
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
    },

    stateDescription: {
      maxWidth: 290,
      marginTop: 8,
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 18,
      textAlign: 'center',
    },

    retryButton: {
      minHeight: 47,
      marginTop: 18,
      paddingHorizontal: 21,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 13,
      backgroundColor:
        theme.colors.primary,
    },

    retryText: {
      color:
        theme.colors.black,
      fontSize: 12,
      fontWeight: '900',
    },

    courseCard: {
      overflow: 'hidden',
      padding: 18,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      borderRadius: 22,
      backgroundColor:
        theme.colors.surface,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity:
        theme.dark ? 0.22 : 0.10,
      shadowRadius: 18,
      elevation: 4,
    },

    courseTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    courseIcon: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 17,
      backgroundColor:
        theme.colors.primarySoft,
    },

    logo: {
      width: 90,
      height: 36,
    },

    kickerRow: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    kicker: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    courseTitle: {
      marginTop: 7,
      color:
        theme.colors.textPrimary,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: '900',
      letterSpacing: -0.35,
    },

    divider: {
      height: 1,
      marginVertical: 17,
      backgroundColor:
        theme.colors.divider,
    },

    descriptionLabel: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    courseDescription: {
      marginTop: 9,
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 19,
    },

    heroAccentRow: {
      height: 4,
      marginTop: 17,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
    },

    heroAccentOrange: {
      flex: 1.25,
      backgroundColor:
        theme.colors.primary,
    },

    heroAccentGreen: {
      flex: 1,
      backgroundColor:
        theme.colors.secondary,
    },

    sectionHeader: {
      marginTop: 26,
      marginBottom: 12,
    },

    sectionEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    sectionTitle: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },

    sectionSubtitle: {
      marginTop: 5,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 16,
    },

    quickRow: {
      flexDirection: 'row',
      gap: 9,
    },

    quick: {
      flex: 1,
      minHeight: 124,
      padding: 11,
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    quickIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    quickTitle: {
      marginTop: 10,
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: '800',
    },

    quickArrow: {
      width: 27,
      height: 27,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    contentCard: {
      minHeight: 235,
      padding: 23,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      borderRadius: 19,
      backgroundColor:
        theme.colors.surface,
    },

    contentIcon: {
      width: 64,
      height: 64,
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 19,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    contentTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
    },

    contentDescription: {
      maxWidth: 300,
      marginTop: 10,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    contentBadge: {
      marginTop: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius:
        theme.radius.pill,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.primarySoft,
    },

    contentBadgeText: {
      color:
        theme.colors.primary,
      fontSize: 9,
      fontWeight: '800',
    },

    progressNotice: {
      marginTop: 15,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    progressIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.primarySoft,
    },

    progressNoticeBody: {
      flex: 1,
    },

    progressNoticeTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '900',
    },

    progressNoticeText: {
      marginTop: 5,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
    },

    backButton: {
      minHeight: 50,
      marginTop: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      borderRadius: 14,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity:
        theme.dark ? 0.20 : 0.10,
      shadowRadius: 12,
      elevation: 3,
    },

    backButtonText: {
      color:
        theme.colors.black,
      fontSize: 12,
      fontWeight: '900',
    },

    pressed: {
      opacity: 0.76,
    },
  });
