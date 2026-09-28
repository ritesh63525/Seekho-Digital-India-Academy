import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  IndianRupee,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';

import {
  CourseItem,
  getCourses,
} from '../../services/studentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

export default function CoursesScreen() {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  const navigation =
    useNavigation<any>();

  const {accessToken} =
    useApp();

  const [
    courses,
    setCourses,
  ] = useState<CourseItem[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadCourses =
    useCallback(
      async (
        showLoader = true,
      ) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          setError(null);

          const response =
            await getCourses(
              accessToken,
            );

          setCourses(
            response.items || [],
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load courses.';

          setError(message);
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [accessToken],
    );

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadCourses(false);

      setRefreshing(false);
    };

  const openCourse = (
    course: CourseItem,
  ) => {
    navigation.navigate(
      'CourseDetails',
      {
        courseId:
          String(course.id),
      },
    );
  };

  const openBookDemo = (
    course: CourseItem,
  ) => {
    navigation.navigate(
      'BookDemo',
      {
        courseId:
          String(course.id),
      },
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}>
        <StatusBar
          barStyle={theme.dark ? "light-content" : "dark-content"}
        />

        <View
          style={
            styles.centerState
          }>

          <ActivityIndicator
            size="large"
            color={
              theme.colors.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }>
            Loading courses...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              handleRefresh
            }
            tintColor={
              theme.colors.primary
            }
          />
        }>

        {/* HEADER */}

        <View
          style={styles.header}>

          <View>

            <Text
              style={
                styles.eyebrow
              }>
              EXPLORE & LEARN
            </Text>

            <Text
              style={
                styles.pageTitle
              }>
              Courses
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Explore programs
              offered by Seekho
              Digital India Academy.
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <GraduationCap
              size={25}
              color={
                theme.colors.primary
              }
            />

          </View>

        </View>

        {/* TOTAL COURSES */}

        <View
          style={
            styles.summaryCard
          }>

          <View
            style={
              styles.summaryIcon
            }>

            <BookOpen
              size={22}
              color={
                theme.colors.primary
              }
            />

          </View>

          <View
            style={
              styles.summaryText
            }>

            <Text
              style={
                styles.summaryTitle
              }>
              Available Courses
            </Text>

            <Text
              style={
                styles.summaryDescription
              }>
              {courses.length}{' '}
              {courses.length === 1
                ? 'course'
                : 'courses'}{' '}
              available right now.
            </Text>

          </View>

        </View>

        {/* ERROR */}

        {!!error && (
          <View
            style={
              styles.errorCard
            }>

            <Text
              style={
                styles.errorText
              }>
              {error}
            </Text>

            <Pressable
              onPress={() =>
                loadCourses()
              }
              style={
                styles.retrySmall
              }>

              <RefreshCw
                size={15}
                color={theme.colors.black}
              />

              <Text
                style={
                  styles
                    .retrySmallText
                }>
                Retry
              </Text>

            </Pressable>

          </View>
        )}

        {/* COURSE LIST */}

        <Text
          style={
            styles.sectionTitle
          }>
          ALL COURSES
        </Text>

        {courses.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <BookOpen
              size={34}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }>
              No courses available
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Courses will appear
              here when they are
              available from the
              academy.
            </Text>

          </View>
        ) : (
          courses.map(
            course => (
              <CourseCard
                key={
                  String(
                    course.id,
                  )
                }
                course={course}
                onOpen={() =>
                  openCourse(
                    course,
                  )
                }
                onBookDemo={() =>
                  openBookDemo(
                    course,
                  )
                }
              />
            ),
          )
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * COURSE CARD
 * =====================================================
 */

function CourseCard({
  course,
  onOpen,
  onBookDemo,
}: {
  course: CourseItem;
  onOpen: () => void;
  onBookDemo: () => void;
}) {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  const price =
    getCoursePrice(course);

  const active =
    course.is_active !== false;

  const enrollmentOpen =
    course.enrollment_open !==
    false;

  return (
    <View
      style={
        styles.courseCard
      }>

      <View
        style={
          styles.courseTop
        }>

        <View
          style={
            styles.courseIcon
          }>

          <Sparkles
            size={23}
            color={
              theme.colors.primary
            }
          />

        </View>

        <View
          style={
            styles.courseTopText
          }>

          <View
            style={
              styles.titleRow
            }>

            <Text
              numberOfLines={2}
              style={
                styles.courseTitle
              }>
              {course.title ||
                'Course'}
            </Text>

          </View>

          {!!course.slug && (
            <Text
              numberOfLines={1}
              style={
                styles.courseSlug
              }>
              {course.slug}
            </Text>
          )}

        </View>

      </View>

      {!!(
        course.short_description ||
        course.description
      ) && (
        <Text
          numberOfLines={4}
          style={
            styles.description
          }>
          {String(
            course.short_description ||
              course.description,
          )}
        </Text>
      )}

      <View
        style={
          styles.badgeRow
        }>

        <View
          style={[
            styles.badge,
            active
              ? styles.activeBadge
              : styles.closedBadge,
          ]}>

          <Text
            style={[
              styles.badgeText,
              active
                ? styles
                    .activeBadgeText
                : styles
                    .closedBadgeText,
            ]}>
            {active
              ? 'Active'
              : 'Inactive'}
          </Text>

        </View>

        <View
          style={[
            styles.badge,
            enrollmentOpen
              ? styles
                  .enrollmentBadge
              : styles.closedBadge,
          ]}>

          <Text
            style={[
              styles.badgeText,
              enrollmentOpen
                ? styles
                    .enrollmentBadgeText
                : styles
                    .closedBadgeText,
            ]}>
            {enrollmentOpen
              ? 'Enrollment Open'
              : 'Enrollment Closed'}
          </Text>

        </View>

      </View>

      {/* PRICE */}

      <View
        style={
          styles.priceArea
        }>

        <View>

          <Text
            style={
              styles.priceLabel
            }>
            Course Fee
          </Text>

          {course.is_free ? (
            <Text
              style={
                styles.freeText
              }>
              FREE
            </Text>
          ) : (
            <View
              style={
                styles.priceRow
              }>

              <IndianRupee
                size={18}
                color={
                  theme.colors
                    .textPrimary
                }
                strokeWidth={2.4}
              />

              <Text
                style={
                  styles.priceText
                }>
                {price}
              </Text>

              {hasDiscount(
                course,
              ) && (
                <Text
                  style={
                    styles.oldPrice
                  }>
                  ₹
                  {formatNumber(
                    course.price,
                  )}
                </Text>
              )}

            </View>
          )}

        </View>

      </View>

      {/* ACTIONS */}

      <View
        style={
          styles.actionRow
        }>

        <Pressable
          onPress={onBookDemo}
          style={({
            pressed,
          }) => [
            styles.demoButton,

            pressed &&
              styles.buttonPressed,
          ]}>

          <Text
            style={
              styles.demoButtonText
            }>
            Book Demo
          </Text>

        </Pressable>

        <Pressable
          onPress={onOpen}
          style={({
            pressed,
          }) => [
            styles.detailsButton,

            pressed &&
              styles.buttonPressed,
          ]}>

          <Text
            style={
              styles
                .detailsButtonText
            }>
            View Details
          </Text>

          <ArrowRight
            size={17}
            color={theme.colors.black}
            strokeWidth={2.4}
          />

        </Pressable>

      </View>

    </View>
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function hasDiscount(
  course: CourseItem,
) {
  const original =
    Number(course.price || 0);

  const discount =
    Number(
      course.discount_price ||
        0,
    );

  return (
    original > 0 &&
    discount > 0 &&
    discount < original
  );
}

function getCoursePrice(
  course: CourseItem,
) {
  if (course.is_free) {
    return '0';
  }

  if (
    hasDiscount(course)
  ) {
    return formatNumber(
      course.discount_price,
    );
  }

  return formatNumber(
    course.price,
  );
}

function formatNumber(
  value?: number | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '0';
  }

  return Number(
    value,
  ).toLocaleString(
    'en-IN',
  );
}

/*
 * =====================================================
 * STYLES
 * =====================================================
 */

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        theme.colors.background,
    },

    scrollContent: {
      paddingHorizontal: 18,

      paddingTop: 18,

      paddingBottom: 40,
    },

    header: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      justifyContent:
        'space-between',
    },

    eyebrow: {
      color:
        theme.colors.primary,

      fontSize: 10,

      fontWeight: '900',

      letterSpacing: 1.6,
    },

    pageTitle: {
      marginTop: 4,

      color:
        theme.colors
          .textPrimary,

      fontSize: 28,

      fontWeight: '900',

      letterSpacing: -0.6,
    },

    subtitle: {
      marginTop: 6,

      maxWidth: 275,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    headerIcon: {
      width: 50,

      height: 50,

      borderRadius: 16,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

      backgroundColor:
        theme.colors.primarySoft,

      shadowColor:
        theme.colors.shadow,

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

    summaryCard: {
      marginTop: 23,

      padding: 17,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 14,

      borderRadius: 21,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.16
          : 0.045,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 2,
    },

    summaryIcon: {
      width: 46,

      height: 46,

      borderRadius: 15,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .primarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,
    },

    summaryText: {
      flex: 1,
    },

    summaryTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 13,

      fontWeight: '900',
    },

    summaryDescription: {
      marginTop: 3,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,
    },

    errorCard: {
      marginTop: 15,

      padding: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      gap: 10,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        theme.colors.danger,

      backgroundColor:
        theme.colors.surfaceSoft,
    },

    errorText: {
      flex: 1,

      color:
        theme.colors.danger,

      fontSize: 10,

      lineHeight: 16,
    },

    retrySmall: {
      paddingHorizontal: 11,

      paddingVertical: 8,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 5,

      borderRadius: 10,

      backgroundColor:
        theme.colors.primary,
    },

    retrySmallText: {
      color:
        theme.colors.black,

      fontSize: 9,

      fontWeight: '900',
    },

    sectionTitle: {
      marginTop: 29,

      marginBottom: 12,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.2,
    },

    courseCard: {
      marginBottom: 15,

      padding: 18,

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.16
          : 0.045,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 2,
    },

    courseTop: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 13,
    },

    courseIcon: {
      width: 52,

      height: 52,

      borderRadius: 17,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .primarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,
    },

    courseTopText: {
      flex: 1,
    },

    titleRow: {
      flexDirection: 'row',
    },

    courseTitle: {
      flex: 1,

      color:
        theme.colors
          .textPrimary,

      fontSize: 16,

      lineHeight: 22,

      fontWeight: '900',
    },

    courseSlug: {
      marginTop: 4,

      color:
        theme.colors.primary,

      fontSize: 9,

      fontWeight: '700',
    },

    description: {
      marginTop: 13,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    badgeRow: {
      marginTop: 14,

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 7,
    },

    badge: {
      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        theme.colors.border,
    },

    badgeText: {
      fontSize: 8,

      fontWeight: '900',
    },

    activeBadge: {
      backgroundColor:
        theme.colors.secondarySoft,
    },

    activeBadgeText: {
      color:
        theme.colors.secondaryStrong,
    },

    enrollmentBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    enrollmentBadgeText: {
      color:
        theme.colors.info,
    },

    closedBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    closedBadgeText: {
      color:
        theme.colors.danger,
    },

    priceArea: {
      marginTop: 17,

      paddingTop: 15,

      borderTopWidth: 1,

      borderTopColor:
        theme.colors.divider,
    },

    priceLabel: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      fontWeight: '700',
    },

    priceRow: {
      marginTop: 4,

      flexDirection: 'row',

      alignItems: 'center',
    },

    priceText: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 20,

      fontWeight: '900',
    },

    oldPrice: {
      marginLeft: 9,

      color:
        theme.colors
          .textLight,

      fontSize: 11,

      textDecorationLine:
        'line-through',
    },

    freeText: {
      marginTop: 4,

      color:
        theme.colors.primary,

      fontSize: 18,

      fontWeight: '900',
    },

    actionRow: {
      marginTop: 17,

      flexDirection: 'row',

      gap: 10,
    },

    demoButton: {
      flex: 1,

      height: 49,

      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    demoButtonText: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 11,

      fontWeight: '900',
    },

    detailsButton: {
      flex: 1.15,

      height: 49,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 6,

      borderRadius: 15,

      backgroundColor:
        theme.colors.primary,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity: 0.12,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    detailsButtonText: {
      color:
        theme.colors.black,

      fontSize: 11,

      fontWeight: '900',
    },

    buttonPressed: {
      opacity: 0.75,
    },

    emptyCard: {
      paddingVertical: 40,

      paddingHorizontal: 22,

      alignItems: 'center',

      borderRadius: 21,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

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

    emptyTitle: {
      marginTop: 13,

      color:
        theme.colors
          .textPrimary,

      fontSize: 14,

      fontWeight: '900',
    },

    emptyText: {
      marginTop: 6,

      maxWidth: 250,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 17,

      textAlign: 'center',
    },

    centerState: {
      flex: 1,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 14,

      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      fontWeight: '600',
    },
  });