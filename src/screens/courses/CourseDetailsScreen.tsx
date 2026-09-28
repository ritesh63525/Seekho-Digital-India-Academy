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
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {
  CourseItem,
  getCourses,
} from '../../services/studentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CourseDetails'
>;

function useCourseDetailsTheme() {
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

export default function CourseDetailsScreen({
  navigation,
  route,
}: Props) {
  const {theme, styles} =
    useCourseDetailsTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [course, setCourse] =
    useState<CourseItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const loadCourse =
    useCallback(
      async (
        showLoader = true,
      ) => {
        if (!accessToken) {
          setLoading(false);

          setError(
            'Student session not found. Please sign in again.',
          );

          return;
        }

        try {
          if (showLoader) {
            setLoading(true);
          }

          setError(null);

          const fetchCourse =
            async (
              token: string,
            ) => {
              const response =
                await getCourses(
                  token,
                );

              const foundCourse =
                (response.items || []).find(
                  item =>
                    String(item.id) ===
                    String(
                      route.params.courseId,
                    ),
                );

              if (!foundCourse) {
                throw new Error(
                  'Course not found in the current course catalog.',
                );
              }

              return foundCourse;
            };

          try {
            const foundCourse =
              await fetchCourse(
                accessToken,
              );

            setCourse(
              foundCourse,
            );
          } catch (
            requestError
          ) {
            const message =
              requestError instanceof Error
                ? requestError.message
                : '';

            const unauthorized =
              message.includes(
                '401',
              ) ||
              message.includes(
                '403',
              );

            if (!unauthorized) {
              throw requestError;
            }

            const freshToken =
              await refreshAccessToken();

            const foundCourse =
              await fetchCourse(
                freshToken,
              );

            setCourse(
              foundCourse,
            );
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load course details.';

          setError(message);
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [
        accessToken,
        refreshAccessToken,
        route.params.courseId,
      ],
    );

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadCourse(false);

      setRefreshing(false);
    };

  const handleBookDemo = () => {
    navigation.navigate(
      'BookDemo',
      {
        courseId:
          route.params.courseId,
      },
    );
  };

  if (loading) {
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
            Loading course details...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  if (!course) {
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

        <View
          style={
            styles.centerState
          }>

          <BookOpen
            size={42}
            color={
              theme.colors
                .textSecondary
            }
          />

          <Text
            style={
              styles.errorTitle
            }>
            Course unavailable
          </Text>

          <Text
            style={
              styles.errorText
            }>
            {error ||
              'Unable to load this course.'}
          </Text>

          <Pressable
            onPress={() =>
              loadCourse()
            }
            style={
              styles.retryButton
            }>

            <RefreshCw
              size={17}
              color={
                theme.colors.black
              }
            />

            <Text
              style={
                styles.retryButtonText
              }>
              Try Again
            </Text>

          </Pressable>

        </View>
      </SafeAreaView>
    );
  }

  const active =
    course.is_active !== false;

  const enrollmentOpen =
    course.enrollment_open !==
    false;

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

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              handleRefresh
            }
            tintColor={
              theme.colors.primary
            }
            colors={[
              theme.colors.primary,
            ]}
          />
        }>

        {/* TOP BAR */}

        <View
          style={
            styles.topBar
          }>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            style={({pressed}) => [
              styles.backButton,

              pressed &&
                styles.buttonPressed,
            ]}
            hitSlop={10}>

            <ArrowLeft
              size={22}
              color={
                theme.colors
                  .textPrimary
              }
            />

          </Pressable>

          <Text
            style={
              styles.topTitle
            }>
            Course Details
          </Text>

          <View
            style={
              styles.topSpacer
            }
          />

        </View>

        {/* HERO */}

        <View
          style={
            styles.heroCard
          }>

          <View
            style={
              styles.heroTop
            }>

            <View
              style={
                styles.heroIcon
              }>

              <Sparkles
                size={27}
                color={
                  theme.colors.primary
                }
                strokeWidth={2.2}
              />

            </View>

            <Image
              source={require('../../assets/seekho-login-logo-transparent.png')}
              style={
                styles.logo
              }
              resizeMode="contain"
            />

          </View>

          <Text
            style={
              styles.courseTitle
            }>
            {course.title ||
              'Course'}
          </Text>

          {!!course.slug && (
            <Text
              style={
                styles.slug
              }>
              {course.slug}
            </Text>
          )}

          <View
            style={
              styles.badgeRow
            }>

            <StatusBadge
              label={
                active
                  ? 'Active'
                  : 'Inactive'
              }
              active={
                active
              }
            />

            <StatusBadge
              label={
                enrollmentOpen
                  ? 'Enrollment Open'
                  : 'Enrollment Closed'
              }
              active={
                enrollmentOpen
              }
            />

          </View>

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

        {/* DESCRIPTION */}

        <Text
          style={
            styles.sectionTitle
          }>
          ABOUT THIS COURSE
        </Text>

        <View
          style={
            styles.sectionCard
          }>

          <Text
            style={
              styles.description
            }>
            {String(
              course.description ||
                course.short_description ||
                'Course description is not available yet.',
            )}
          </Text>

        </View>

        {/* COURSE INFO */}

        <Text
          style={
            styles.sectionTitle
          }>
          COURSE INFORMATION
        </Text>

        <View
          style={
            styles.sectionCard
          }>

          <InfoRow
            icon={
              <BookOpen
                size={19}
                color={
                  theme.colors.primary
                }
              />
            }
            label="Course"
            value={
              course.title ||
              'Not available'
            }
          />

          {!!course.duration && (
            <>
              <Divider />

              <InfoRow
                icon={
                  <CalendarDays
                    size={19}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                }
                label="Duration"
                value={
                  String(
                    course.duration,
                  )
                }
              />
            </>
          )}

          <Divider />

          <InfoRow
            icon={
              <CheckCircle2
                size={19}
                color={
                  theme.colors.secondary
                }
              />
            }
            label="Enrollment"
            value={
              enrollmentOpen
                ? 'Open'
                : 'Closed'
            }
          />

        </View>

        {/* FEE */}

        <Text
          style={
            styles.sectionTitle
          }>
          COURSE FEE
        </Text>

        <View
          style={
            styles.feeCard
          }>

          <IndianRupee
            size={25}
            color={
              theme.colors.primary
            }
          />

          <View
            style={
              styles.feeContent
            }>

            {course.is_free ? (
              <Text
                style={
                  styles.freeText
                }>
                Free Course
              </Text>
            ) : (
              <>
                <Text
                  style={
                    styles.price
                  }>
                  ₹
                  {formatNumber(
                    getFinalPrice(
                      course,
                    ),
                  )}
                </Text>

                {hasDiscount(
                  course,
                ) && (
                  <Text
                    style={
                      styles.originalPrice
                    }>
                    Original ₹
                    {formatNumber(
                      course.price,
                    )}
                  </Text>
                )}
              </>
            )}

          </View>

        </View>

        {/* BOOK DEMO */}

        <Pressable
          disabled={
            !enrollmentOpen
          }
          onPress={
            handleBookDemo
          }
          style={({pressed}) => [
            styles.demoButton,

            !enrollmentOpen &&
              styles.demoButtonDisabled,

            pressed &&
              enrollmentOpen &&
              styles.buttonPressed,
          ]}>

          <CalendarDays
            size={18}
            color={
              enrollmentOpen
                ? theme.colors.black
                : theme.colors.textLight
            }
            strokeWidth={2.3}
          />

          <Text
            style={[
              styles.demoButtonText,

              !enrollmentOpen &&
                styles.demoButtonTextDisabled,
            ]}>
            {enrollmentOpen
              ? 'Book Demo Class'
              : 'Enrollment Closed'}
          </Text>

        </Pressable>

        <Text
          style={
            styles.note
          }>
          Learning modules and lesson
          progress will be enabled once
          the student learning APIs are
          available from the backend.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * COMPONENTS
 * =====================================================
 */

function StatusBadge({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  const {styles} =
    useCourseDetailsTheme();

  return (
    <View
      style={[
        styles.badge,

        active
          ? styles.activeBadge
          : styles.inactiveBadge,
      ]}>

      <Text
        style={[
          styles.badgeText,

          active
            ? styles.activeBadgeText
            : styles.inactiveBadgeText,
        ]}>
        {label}
      </Text>

    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const {styles} =
    useCourseDetailsTheme();

  return (
    <View
      style={
        styles.infoRow
      }>

      <View
        style={
          styles.infoIcon
        }>
        {icon}
      </View>

      <View
        style={
          styles.infoTextArea
        }>

        <Text
          style={
            styles.infoLabel
          }>
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }>
          {value}
        </Text>

      </View>

    </View>
  );
}

function Divider() {
  const {styles} =
    useCourseDetailsTheme();

  return (
    <View
      style={
        styles.divider
      }
    />
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
    Number(
      course.price || 0,
    );

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

function getFinalPrice(
  course: CourseItem,
) {
  if (
    hasDiscount(course)
  ) {
    return Number(
      course.discount_price,
    );
  }

  return Number(
    course.price || 0,
  );
}

function formatNumber(
  value?: number | null,
) {
  return Number(
    value || 0,
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

      paddingTop: 14,

      paddingBottom: 40,
    },

    topBar: {
      minHeight: 50,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    backButton: {
      width: 44,

      height: 44,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surfaceSoft,
    },

    topTitle: {
      color:
        theme.colors.textPrimary,

      fontSize:
        15,

      fontWeight:
        '900',
    },

    topSpacer: {
      width:
        44,
    },

    heroCard: {
      marginTop:
        24,

      padding:
        20,

      borderRadius:
        22,

      borderWidth:
        1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

      shadowOffset: {
        width: 0,
        height: 8,
      },

      shadowOpacity:
        theme.dark
          ? 0.22
          : 0.10,

      shadowRadius:
        18,

      elevation:
        4,
    },

    heroTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    logo: {
      width:
        88,

      height:
        36,
    },

    heroAccentRow: {
      height:
        4,

      marginTop:
        18,

      flexDirection:
        'row',

      overflow:
        'hidden',

      borderRadius:
        theme.radius.pill,
    },

    heroAccentOrange: {
      flex:
        1.25,

      backgroundColor:
        theme.colors.primary,
    },

    heroAccentGreen: {
      flex:
        1,

      backgroundColor:
        theme.colors.secondary,
    },

    heroIcon: {
      width:
        58,

      height:
        58,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors.primarySoft,
    },

    courseTitle: {
      marginTop:
        17,

      color:
        theme.colors.textPrimary,

      fontSize:
        24,

      lineHeight:
        31,

      fontWeight:
        '900',

      letterSpacing:
        -0.5,
    },

    slug: {
      marginTop:
        5,

      color:
        theme.colors.secondaryStrong,

      fontSize:
        10,

      fontWeight:
        '700',
    },

    badgeRow: {
      marginTop:
        15,

      flexDirection:
        'row',

      flexWrap:
        'wrap',

      gap:
        8,
    },

    badge: {
      paddingHorizontal:
        10,

      paddingVertical:
        7,

      borderRadius:
        10,
    },

    badgeText: {
      fontSize:
        9,

      fontWeight:
        '900',
    },

    activeBadge: {
      backgroundColor:
        theme.colors.secondarySoft,
    },

    activeBadgeText: {
      color:
        theme.colors.secondaryStrong,
    },

    inactiveBadge: {
      backgroundColor:
        theme.dark
          ? 'rgba(255,116,116,0.10)'
          : '#FDEFEF',
    },

    inactiveBadgeText: {
      color:
        theme.colors.danger,
    },

    sectionTitle: {
      marginTop:
        27,

      marginBottom:
        10,

      color:
        theme.colors.textSecondary,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.1,
    },

    sectionCard: {
      overflow:
        'hidden',

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    description: {
      padding:
        17,

      color:
        theme.colors.textSecondary,

      fontSize:
        12,

      lineHeight:
        20,
    },

    infoRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        12,

      paddingHorizontal:
        15,

      paddingVertical:
        15,
    },

    infoIcon: {
      width:
        39,

      height:
        39,

      borderRadius:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors.surfaceSoft,
    },

    infoTextArea: {
      flex:
        1,
    },

    infoLabel: {
      color:
        theme.colors.textSecondary,

      fontSize:
        9,

      fontWeight:
        '700',
    },

    infoValue: {
      marginTop:
        3,

      color:
        theme.colors.textPrimary,

      fontSize:
        12,

      fontWeight:
        '800',
    },

    divider: {
      height:
        1,

      marginLeft:
        66,

      backgroundColor:
        theme.colors.borderStrong,
    },

    feeCard: {
      padding:
        18,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        13,

      borderRadius:
        18,

      borderWidth:
        1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    feeContent: {
      flex:
        1,
    },

    price: {
      color:
        theme.colors.textPrimary,

      fontSize:
        24,

      fontWeight:
        '900',
    },

    originalPrice: {
      marginTop:
        3,

      color:
        theme.colors.textLight,

      fontSize:
        10,

      textDecorationLine:
        'line-through',
    },

    freeText: {
      color:
        theme.colors.secondaryStrong,

      fontSize:
        20,

      fontWeight:
        '900',
    },

    demoButton: {
      height:
        58,

      marginTop:
        27,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,

      borderRadius:
        17,

      backgroundColor:
        theme.colors.primary,

      shadowColor:
        theme.colors.shadow,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity:
        theme.dark
          ? 0.20
          : 0.10,

      shadowRadius:
        12,

      elevation:
        3,
    },

    demoButtonDisabled: {
      backgroundColor:
        theme.colors.surfaceElevated,
    },

    demoButtonText: {
      color:
        theme.colors.black,

      fontSize:
        14,

      fontWeight:
        '900',
    },

    demoButtonTextDisabled: {
      color:
        theme.colors.textLight,
    },

    buttonPressed: {
      opacity:
        0.8,
    },

    note: {
      marginTop:
        17,

      paddingHorizontal:
        12,

      color:
        theme.colors.textLight,

      fontSize:
        9,

      lineHeight:
        15,

      textAlign:
        'center',
    },

    centerState: {
      flex:
        1,

      paddingHorizontal:
        30,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop:
        15,

      color:
        theme.colors.textSecondary,

      fontSize:
        12,

      fontWeight:
        '600',
    },

    errorTitle: {
      marginTop:
        14,

      color:
        theme.colors.textPrimary,

      fontSize:
        19,

      fontWeight:
        '900',
    },

    errorText: {
      marginTop:
        8,

      color:
        theme.colors.textSecondary,

      fontSize:
        12,

      lineHeight:
        19,

      textAlign:
        'center',
    },

    retryButton: {
      marginTop:
        20,

      paddingHorizontal:
        20,

      paddingVertical:
        12,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        7,

      borderRadius:
        14,

      backgroundColor:
        theme.colors.primary,
    },

    retryButtonText: {
      color:
        theme.colors.black,

      fontSize:
        12,

      fontWeight:
        '900',
    },
  });