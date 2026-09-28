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
import {Bell, ChevronRight} from 'lucide-react-native';

import {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/navigationTypes';

import FeatureIcon, {
  type FeatureIconName,
} from '../../components/FeatureIcon';

import {API_BASE_URL} from '../../services/authApi';
import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = BottomTabScreenProps<MainTabParamList, 'Home'>;

type Dashboard = {
  name: string;
  course: string;
  status: string;
  paid: number | null;
  remaining: number | null;
  attendancePercent: number | null;
  present: number | null;
  absent: number | null;
  totalDays: number | null;
  pendingAssignments: number | null;
  testsCount: number | null;
  upcomingCount: number | null;
};

const INITIAL: Dashboard = {
  name: 'Student',
  course: '—',
  status: '—',
  paid: null,
  remaining: null,
  attendancePercent: null,
  present: null,
  absent: null,
  totalDays: null,
  pendingAssignments: null,
  testsCount: null,
  upcomingCount: null,
};

function obj(value: any): Record<string, any> {
  return value &&
    typeof value === 'object' &&
    !Array.isArray(value)
    ? value
    : {};
}

function firstNumber(...values: any[]): number | null {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ''
    ) {
      continue;
    }

    if (
      typeof value !== 'string' &&
      typeof value !== 'number'
    ) {
      continue;
    }

    const numberValue = Number(value);

    if (Number.isFinite(numberValue)) {
      return numberValue;
    }
  }

  return null;
}

function firstText(...values: any[]): string {
  for (const value of values) {
    if (
      typeof value === 'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return '';
}

function getList(
  response: any,
  names: string[],
): any[] | null {
  if (Array.isArray(response)) {
    return response;
  }

  const root = obj(response);

  if (Array.isArray(root.data)) {
    return root.data;
  }

  const data = obj(root.data);

  for (const name of names) {
    if (Array.isArray(root[name])) {
      return root[name];
    }

    if (Array.isArray(data[name])) {
      return data[name];
    }
  }

  return null;
}

/* =====================================================
 * PROFILE DATA
 * ===================================================== */

function readProfile(
  response: any,
): Partial<Dashboard> {
  const root = obj(response);

  const body = obj(
    root.data ?? root,
  );

  const student = obj(
    body.student ??
      body.profile ??
      body,
  );

  const account = obj(
    body.account,
  );

  if (
    Object.keys(student).length === 0
  ) {
    throw new Error(
      'Student profile response was empty.',
    );
  }

  const combinedName = [
    student.first_name,
    student.last_name,
  ]
    .filter(
      (part: any) =>
        typeof part === 'string' &&
        part.trim(),
    )
    .join(' ');

  return {
    name:
      firstText(
        student.name,
        student.full_name,
        combinedName,
      ) || 'Student',

    course:
      firstText(
        student.course,
        student.course_name,
        student.assigned_course,
      ) || '—',

    status:
      firstText(
        student.status,
        account.status,
      ) || '—',

    paid:
      firstNumber(
        student.paid_fees,
        student.fees_paid,
      ),

    remaining:
      firstNumber(
        student.remaining_fees,
        student.fees_remaining,
      ),
  };
}

/* =====================================================
 * ATTENDANCE DATA
 * ===================================================== */

function readAttendance(
  response: any,
): Partial<Dashboard> {
  const root = obj(response);

  const data = obj(
    root.data ?? root,
  );

  const summary = obj(
    data.summary ??
      data.attendance_summary ??
      root.summary,
  );

  const percentage =
    firstNumber(
      summary.percentage,
      summary.attendance_percentage,
      summary.overall_percentage,
      data.percentage,
      data.attendance_percentage,
      data.overall_percentage,
    );

  const present =
    firstNumber(
      summary.present,
      summary.present_days,
      summary.total_present,
      data.present,
      data.present_days,
      data.total_present,
    );

  const absent =
    firstNumber(
      summary.absent,
      summary.absent_days,
      summary.total_absent,
      data.absent,
      data.absent_days,
      data.total_absent,
    );

  const totalDays =
    firstNumber(
      summary.total_marked_days,
      summary.total_days,
      summary.totalMarkedDays,
      data.total_marked_days,
      data.total_days,

      present !== null &&
      absent !== null
        ? present + absent
        : null,
    );

  const calculatedPercent =
    percentage !== null
      ? percentage
      : present !== null &&
          totalDays !== null &&
          totalDays > 0
        ? (present / totalDays) * 100
        : null;

  return {
    attendancePercent:
      calculatedPercent !== null &&
      calculatedPercent >= 0 &&
      calculatedPercent <= 100
        ? Math.round(
            calculatedPercent,
          )
        : null,

    present,

    absent,

    totalDays,
  };
}

/* =====================================================
 * ASSIGNMENT DATA
 * ===================================================== */

function readPendingAssignments(
  response: any,
): number | null {
  const root =
    obj(response);

  const data =
    obj(root.data);

  const summary =
    obj(
      data.summary ??
        root.summary,
    );

  const explicit =
    firstNumber(
      summary.pending,
      summary.pending_count,
      data.pending_count,
      data.pending,
      root.pending_count,
    );

  if (
    explicit !== null
  ) {
    return explicit;
  }

  const list =
    getList(
      response,
      [
        'assignments',
        'items',
        'results',
        'records',
      ],
    );

  if (!list) {
    return null;
  }

  let pending = 0;

  for (
    const raw of list
  ) {
    const item =
      obj(raw);

    const status =
      firstText(
        item.submission_status,
        item.status,
      ).toLowerCase();

    if (
      item.is_submitted ===
        true ||
      item.submitted ===
        true ||
      [
        'submitted',
        'graded',
        'completed',
        'reviewed',
      ].includes(status)
    ) {
      continue;
    }

    if (
      item.is_submitted ===
        false ||
      item.submitted ===
        false ||
      [
        'pending',
        'assigned',
        'not_submitted',
        'not submitted',
      ].includes(status)
    ) {
      pending += 1;

      continue;
    }

    return null;
  }

  const page =
    obj(
      data.pagination ??
        root.pagination,
    );

  const total =
    firstNumber(
      page.total,
      data.total,
      root.total,
    );

  if (
    total !== null &&
    total > list.length
  ) {
    return null;
  }

  return pending;
}

/* =====================================================
 * TEST DATA
 * ===================================================== */

function readTestsCount(
  response: any,
): number | null {
  const root =
    obj(response);

  const data =
    obj(root.data);

  const summary =
    obj(
      data.summary ??
        root.summary,
    );

  const explicit =
    firstNumber(
      summary.total,
      data.total,
      root.total,
      data.pagination?.total,
      root.pagination?.total,
    );

  if (
    explicit !== null
  ) {
    return explicit;
  }

  const list =
    getList(
      response,
      [
        'tests',
        'quizzes',
        'items',
        'results',
      ],
    );

  return list
    ? list.length
    : null;
}

/* =====================================================
 * SCHEDULE DATA
 * ===================================================== */

function readUpcomingCount(
  response: any,
): number | null {
  const root =
    obj(response);

  const data =
    obj(root.data);

  const page =
    obj(
      data.pagination ??
        root.pagination,
    );

  const explicit =
    firstNumber(
      data.upcoming_count,
      root.upcoming_count,
      page.total,
      data.total,
      root.total,
    );

  if (
    explicit !== null
  ) {
    return explicit;
  }

  const list =
    getList(
      response,
      [
        'schedules',
        'schedule',
        'items',
        'results',
        'events',
      ],
    );

  return (
    list &&
    list.length < 100
      ? list.length
      : null
  );
}

/* =====================================================
 * COMMON API REQUEST
 * ===================================================== */

type StudentApiError =
  Error & {
    status?: number;
  };

async function fetchStudentJSON(
  path: string,
  token: string,
): Promise<any> {
  const baseURL =
    API_BASE_URL.replace(
      /\/+$/,
      '',
    );

  let response: Response;

  try {
    response =
      await fetch(
        `${baseURL}${path}`,
        {
          method: 'GET',

          headers: {
            Accept:
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },
        },
      );
  } catch {
    throw new Error(
      'Unable to connect to the academy server. Check your network and try again.',
    );
  }

  let result: any;

  try {
    result =
      await response.json();
  } catch {
    const error =
      new Error(
        'Invalid server response.',
      ) as StudentApiError;

    error.status =
      response.status;

    throw error;
  }

  if (
    !response.ok ||
    result?.success ===
      false
  ) {
    const error =
      new Error(
        firstText(
          result?.detail,
          result?.error?.message,
          result?.message,
        ) ||
          `Request failed (${response.status}).`,
      ) as StudentApiError;

    error.status =
      response.status;

    throw error;
  }

  return result;
}

/* =====================================================
 * AUTO TOKEN REFRESH
 * ===================================================== */

async function fetchStudentJSONWithRefresh(
  path: string,
  token: string,
  getSharedRefresh:
    () => Promise<string>,
): Promise<any> {
  try {
    return await fetchStudentJSON(
      path,
      token,
    );
  } catch (caughtError) {
    const error =
      caughtError as
        StudentApiError;

    /*
     * Normal server/network errors
     * should NOT trigger token refresh.
     */
    if (
      error.status !== 401 &&
      error.status !== 403
    ) {
      throw caughtError;
    }

    /*
     * 401 / 403 means current
     * access token may be expired.
     */
    const freshToken =
      await getSharedRefresh();

    /*
     * Retry exact same request
     * with new access token.
     */
    return fetchStudentJSON(
      path,
      freshToken,
    );
  }
}

/* =====================================================
 * THEME
 * ===================================================== */

function useHomeTheme() {
  const {theme} =
    useTheme();

  const styles =
    useMemo(
      () =>
        createStyles(
          theme,
        ),
      [theme],
    );

  return {
    theme,
    styles,
  };
}

/* =====================================================
 * MAIN HOME SCREEN
 * ===================================================== */

const HomeScreen = ({
  navigation,
}: Props) => {
  const {
    theme,
    styles,
  } = useHomeTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [
    dashboard,
    setDashboard,
  ] =
    useState<Dashboard>(
      INITIAL,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    reload,
    setReload,
  ] =
    useState(0);

  /*
   * =====================================================
   * LOAD DASHBOARD
   * =====================================================
   */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load =
        async () => {
          if (
            !accessToken
          ) {
            setDashboard(
              INITIAL,
            );

            setError(
              'No active student session. Please sign in again.',
            );

            setLoading(
              false,
            );

            return;
          }

          setLoading(
            true,
          );

          setError('');

          /*
           * Home dashboard APIs.
           */
          const paths = [
            '/api/v1/student-auth/profile',

            '/api/v1/student-auth/attendance?page=1&limit=100',

            '/api/v1/assignments/student?page=1&limit=100&unread_only=false',

            '/api/v1/tests-quizzes/student',

            '/api/v1/schedule/student?page=1&limit=100&unread_only=false&scope=upcoming',
          ];

          /*
           * If multiple Home APIs
           * return 401 together,
           * only ONE token refresh
           * request should run.
           */
          let refreshPromise:
            Promise<string> |
            null = null;

          const getSharedRefresh =
            () => {
              if (
                !refreshPromise
              ) {
                refreshPromise =
                  refreshAccessToken();
              }

              return (
                refreshPromise
              );
            };

          /*
           * Run dashboard APIs
           * in parallel.
           */
          const results =
            await Promise
              .allSettled(
                paths.map(
                  path =>
                    fetchStudentJSONWithRefresh(
                      path,
                      accessToken,
                      getSharedRefresh,
                    ),
                ),
              );

          if (!active) {
            return;
          }

          const next:
            Dashboard = {
            ...INITIAL,
          };

          try {
            /*
             * PROFILE
             */
            if (
              results[0]
                .status ===
              'fulfilled'
            ) {
              Object.assign(
                next,

                readProfile(
                  results[0]
                    .value,
                ),
              );
            } else {
              setError(
                'Student profile could not be loaded. Check server connection and retry.',
              );
            }

            /*
             * ATTENDANCE
             */
            if (
              results[1]
                .status ===
              'fulfilled'
            ) {
              Object.assign(
                next,

                readAttendance(
                  results[1]
                    .value,
                ),
              );
            }

            /*
             * ASSIGNMENTS
             */
            if (
              results[2]
                .status ===
              'fulfilled'
            ) {
              next
                .pendingAssignments =
                readPendingAssignments(
                  results[2]
                    .value,
                );
            }

            /*
             * QUIZZES
             */
            if (
              results[3]
                .status ===
              'fulfilled'
            ) {
              next.testsCount =
                readTestsCount(
                  results[3]
                    .value,
                );
            }

            /*
             * SCHEDULE
             */
            if (
              results[4]
                .status ===
              'fulfilled'
            ) {
              next
                .upcomingCount =
                readUpcomingCount(
                  results[4]
                    .value,
                );
            }
          } catch {
            setError(
              'Some student information could not be displayed.',
            );
          }

          setDashboard(
            next,
          );

          setLoading(
            false,
          );
        };

      void load();

      return () => {
        active = false;
      };
    }, [
      accessToken,
      refreshAccessToken,
      reload,
    ]),
  );

  /*
   * Parent root navigation
   */
  const rootNavigation =
    navigation.getParent<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const openRootScreen =
    (
      screen:
        | 'Assignments'
        | 'Quiz'
        | 'LiveClasses'
        | 'Attendance'
        | 'Certificates'
        | 'Notifications'
        | 'Support'
        | 'Settings'
        | 'CareerTools',
    ) => {
      rootNavigation
        ?.navigate(
          screen,
        );
    };

  /*
   * Helpers
   */

  const numText =
    (
      value:
        number | null,
    ): string =>
      value === null
        ? '—'
        : String(
            value,
          );

  const moneyText =
    (
      value:
        number | null,
    ): string =>
      value === null
        ? '—'
        : `₹${value.toLocaleString(
            'en-IN',
          )}`;

  const percentText =
    dashboard
      .attendancePercent ===
    null
      ? '—'
      : `${dashboard.attendancePercent}%`;

  const attendanceDetails =
    dashboard.present !==
      null &&
    dashboard.absent !==
      null
      ? `${dashboard.present} Present • ${dashboard.absent} Absent`
      : 'View your attendance';

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }>

      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* ==========================
            LOADING
        ========================== */}

        {loading && (
          <View
            style={
              styles.loadingNotice
            }>

            <ActivityIndicator
              size="small"
              color={
                theme.colors
                  .green
              }
            />

            <Text
              style={
                styles.loadingText
              }>
              Loading your student details...
            </Text>

          </View>
        )}

        {/* ==========================
            ERROR
        ========================== */}

        {!!error &&
          !loading && (
            <Pressable
              onPress={() =>
                setReload(
                  value =>
                    value +
                    1,
                )
              }
              style={
                styles.errorNotice
              }>

              <Text
                style={
                  styles.errorText
                }>
                {error}{' '}
                Tap to retry.
              </Text>

            </Pressable>
          )}

        {/* ==========================
            HEADER
        ========================== */}

        <View
          style={
            styles.header
          }>

          <View
            style={
              styles.headerText
            }>

            <Text
              style={
                styles.eyebrow
              }>
              STUDENT DASHBOARD
            </Text>

            <Text
              style={
                styles.title
              }>
              Welcome Back,
              {'\n'}
              {dashboard.name}.
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Your course,
              account and fee
              information in one
              place.
            </Text>

          </View>

          <Pressable
            onPress={() =>
              openRootScreen(
                'Notifications',
              )
            }
            style={
              styles
                .notificationButton
            }>

            <Bell
              size={18}
              color={
                theme.colors
                  .textSecondary
              }
              strokeWidth={
                2.1
              }
            />

          </Pressable>

        </View>

        {/* ==========================
            QUICK STATS
        ========================== */}

        <View
          style={
            styles.quickGrid
          }>

          <QuickStat
            label="ASSIGNED COURSE"
            value={
              dashboard.course
            }
            valueColor={
              theme.colors
                .textPrimary
            }
          />

          <QuickStat
            label="STUDENT STATUS"
            value={
              dashboard.status
            }
            valueColor={
              theme.colors.green
            }
          />

          <QuickStat
            label="FEES PAID"
            value={
              moneyText(
                dashboard.paid,
              )
            }
            valueColor={
              theme.colors.green
            }
          />

          <QuickStat
            label="FEES REMAINING"
            value={
              moneyText(
                dashboard
                  .remaining,
              )
            }
            valueColor={
              theme.colors
                .primary
            }
          />

        </View>

        {/* ==========================
            CONTINUE LEARNING
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Continue Learning
          </Text>

          <Pressable
            onPress={() =>
              navigation
                .navigate(
                  'Learning',
                )
            }>

            <Text
              style={
                styles
                  .sectionAction
              }>
              View Course →
            </Text>

          </Pressable>

        </View>

        <Pressable
          onPress={() =>
            navigation
              .navigate(
                'Learning',
              )
          }
          style={
            styles.courseCard
          }>

          <View
            style={
              styles.courseTop
            }>

            <FeatureIcon
              name="course"
              size={21}
              containerSize={
                49
              }
            />

            <View
              style={
                styles
                  .courseContent
              }>

              <Text
                style={
                  styles
                    .courseEyebrow
                }>
                ASSIGNED COURSE
              </Text>

              <Text
                style={
                  styles
                    .courseTitle
                }>
                {
                  dashboard.course
                }
              </Text>

              <Text
                style={
                  styles
                    .courseDescription
                }>
                View your course
                and available
                learning resources.
              </Text>

            </View>

          </View>

          <View
            style={
              styles
                .courseFooter
            }>

            <Text
              style={
                styles
                  .lessonText
              }>
              Learning progress
              will appear when
              available from your
              course.
            </Text>

            <Text
              style={
                styles
                  .continueText
              }>
              Open Learning →
            </Text>

          </View>

        </Pressable>

        {/* ==========================
            STUDENT OVERVIEW
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Student Overview
          </Text>

        </View>

        <View
          style={
            styles.overviewGrid
          }>

          <DashboardAction
            icon="attendance"
            accentColor={
              theme.colors
                .secondary
            }
            title="Attendance"
            value={
              percentText
            }
            subtitle={
              attendanceDetails
            }
            onPress={() =>
              openRootScreen(
                'Attendance',
              )
            }
          />

          <DashboardAction
            icon="assignment"
            accentColor={
              theme.colors
                .primary
            }
            title="Assignments"
            value={
              numText(
                dashboard
                  .pendingAssignments,
              )
            }
            subtitle="Assignments awaiting submission"
            onPress={() =>
              openRootScreen(
                'Assignments',
              )
            }
          />

          <DashboardAction
            icon="quiz"
            accentColor={
              theme.colors.info
            }
            title="Tests & Quizzes"
            value={
              numText(
                dashboard
                  .testsCount,
              )
            }
            subtitle="Tests in your portal"
            onPress={() =>
              openRootScreen(
                'Quiz',
              )
            }
          />

          <DashboardAction
            icon="schedule"
            accentColor={
              theme.colors
                .warning
            }
            title="Schedule"
            value={
              numText(
                dashboard
                  .upcomingCount,
              )
            }
            subtitle="Upcoming activities"
            onPress={() =>
              openRootScreen(
                'LiveClasses',
              )
            }
          />

        </View>

        {/* ==========================
            ACADEMIC HUB
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Academic Hub
          </Text>

          <Text
            style={
              styles.sectionSmall
            }>
            Quick access
          </Text>

        </View>

        <View
          style={
            styles.actionList
          }>

          <ActionRow
            icon="assignment"
            title="Assignments"
            subtitle="View pending and submitted work"
            onPress={() =>
              openRootScreen(
                'Assignments',
              )
            }
          />

          <ActionRow
            icon="quiz"
            title="Tests & Quizzes"
            subtitle="View assessments and results"
            onPress={() =>
              openRootScreen(
                'Quiz',
              )
            }
          />

          <ActionRow
            icon="schedule"
            title="Class Schedule"
            subtitle="Classes, labs, workshops and tests"
            onPress={() =>
              openRootScreen(
                'LiveClasses',
              )
            }
          />

          <ActionRow
            icon="attendance"
            title="Attendance"
            subtitle="View your daily attendance records"
            onPress={() =>
              openRootScreen(
                'Attendance',
              )
            }
          />

          <ActionRow
            icon="certificate"
            title="Certificates"
            subtitle="View available course certificates"
            onPress={() =>
              openRootScreen(
                'Certificates',
              )
            }
          />

        </View>

        {/* ==========================
            PRACTICE HUB
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Practice Hub
          </Text>

        </View>

        <Pressable
          onPress={() =>
            openRootScreen(
              'Quiz',
            )
          }
          style={
            styles.practiceCard
          }>

          <View
            style={
              styles.practiceTop
            }>

            <FeatureIcon
              name="quiz"
              size={20}
              containerSize={
                45
              }
            />

            <View
              style={
                styles
                  .practiceContent
              }>

              <Text
                style={
                  styles
                    .practiceEyebrow
                }>
                PRACTICE &
                ASSESSMENTS
              </Text>

              <Text
                style={
                  styles
                    .practiceTitle
                }>
                Explore available
                tests
              </Text>

              <Text
                style={
                  styles
                    .practiceDescription
                }>
                Open your
                assessments to view
                current practice
                opportunities.
              </Text>

            </View>

            <ChevronRight
              size={19}
              color={
                theme.colors.green
              }
            />

          </View>

        </Pressable>

        {/* ==========================
            CAREER & PLACEMENT
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Career & Placement
          </Text>

        </View>

        <View
          style={
            styles.careerGrid
          }>

          <Pressable
            onPress={() =>
              navigation
                .navigate(
                  'Placement',
                )
            }
            style={
              styles.careerCard
            }>

            <FeatureIcon
              name="placement"
              size={19}
              containerSize={
                38
              }
            />

            <Text
              style={
                styles.careerTitle
              }>
              Jobs & Internships
            </Text>

            <Text
              style={
                styles
                  .careerDescription
              }>
              Explore placement
              opportunities.
            </Text>

            <ChevronRight
              size={18}
              color={
                theme.colors
                  .secondaryStrong
              }
              strokeWidth={
                2.3
              }
            />

          </Pressable>

          <Pressable
            onPress={() =>
              openRootScreen(
                'CareerTools',
              )
            }
            style={
              styles.careerCard
            }>

            <FeatureIcon
              name="resume"
              size={19}
              containerSize={
                38
              }
            />

            <Text
              style={
                styles.careerTitle
              }>
              Resume / CV
            </Text>

            <Text
              style={
                styles
                  .careerDescription
              }>
              Build your
              professional
              profile.
            </Text>

            <ChevronRight
              size={18}
              color={
                theme.colors.info
              }
              strokeWidth={
                2.3
              }
            />

          </Pressable>

        </View>

        {/* ==========================
            ACCOUNT & SUPPORT
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Account & Support
          </Text>

        </View>

        <View
          style={
            styles.actionList
          }>

          <ActionRow
            icon="announcement"
            title="Announcements"
            subtitle="Important academy updates"
            onPress={() =>
              openRootScreen(
                'Notifications',
              )
            }
          />

          <ActionRow
            icon="support"
            title="Help & Support"
            subtitle="Contact the academy for help"
            onPress={() =>
              openRootScreen(
                'Support',
              )
            }
          />

          <ActionRow
            icon="settings"
            title="Settings"
            subtitle="Manage your account preferences"
            onPress={() =>
              openRootScreen(
                'Settings',
              )
            }
          />

        </View>

        {/* ==========================
            ATTENDANCE OVERVIEW
        ========================== */}

        <View
          style={
            styles
              .sectionHeader
          }>

          <Text
            style={
              styles
                .sectionTitle
            }>
            Attendance Overview
          </Text>

          <Pressable
            onPress={() =>
              openRootScreen(
                'Attendance',
              )
            }>

            <Text
              style={
                styles
                  .sectionAction
              }>
              Details →
            </Text>

          </Pressable>

        </View>

        <Pressable
          onPress={() =>
            openRootScreen(
              'Attendance',
            )
          }
          style={
            styles.attendanceCard
          }>

          <View
            style={
              styles
                .attendanceTop
            }>

            <View>

              <Text
                style={
                  styles
                    .attendanceLabel
                }>
                OVERALL ATTENDANCE
              </Text>

              <Text
                style={
                  styles
                    .attendanceValue
                }>
                {percentText}
              </Text>

            </View>

            <FeatureIcon
              name="attendance"
              size={20}
              containerSize={
                43
              }
            />

          </View>

          {dashboard
            .attendancePercent !==
            null && (

            <View
              style={
                styles
                  .attendanceProgress
              }>

              <View
                style={[
                  styles
                    .attendanceProgressFill,

                  {
                    width:
                      `${dashboard.attendancePercent}%` as `${number}%`,
                  },
                ]}
              />

            </View>
          )}

          <View
            style={
              styles
                .attendanceStats
            }>

            <AttendanceItem
              label="PRESENT"
              value={
                numText(
                  dashboard.present,
                )
              }
              color={
                theme.colors.green
              }
            />

            <AttendanceItem
              label="ABSENT"
              value={
                numText(
                  dashboard.absent,
                )
              }
              color={
                theme.colors
                  .danger
              }
            />

            <AttendanceItem
              label="TOTAL DAYS"
              value={
                numText(
                  dashboard
                    .totalDays,
                )
              }
              color={
                theme.colors
                  .textPrimary
              }
            />

          </View>

        </Pressable>

        {/* ==========================
            FINAL CTA
        ========================== */}

        <Pressable
          onPress={() =>
            navigation
              .navigate(
                'Learning',
              )
          }
          style={
            styles.ctaCard
          }>

          <View
            style={
              styles.ctaContent
            }>

            <Text
              style={
                styles.ctaEyebrow
              }>
              KEEP LEARNING
            </Text>

            <Text
              style={
                styles.ctaTitle
              }>
              {dashboard.course ===
              '—'
                ? 'Explore your learning'
                : `Explore ${dashboard.course}`}
            </Text>

            <Text
              style={
                styles
                  .ctaDescription
              }>
              View your assigned
              course and available
              learning resources.
            </Text>

          </View>

          <View
            style={
              styles.ctaButton
            }>

            <ChevronRight
              size={20}
              color={
                theme.colors.black
              }
              strokeWidth={
                2.5
              }
            />

          </View>

        </Pressable>

      </ScrollView>

    </SafeAreaView>
  );
};

/* =====================================================
 * REUSABLE COMPONENTS
 * ===================================================== */

type QuickStatProps = {
  label: string;
  value: string;
  valueColor: string;
};

const QuickStat = ({
  label,
  value,
  valueColor,
}: QuickStatProps) => {
  const {
    styles,
  } = useHomeTheme();

  return (
    <View
      style={
        styles.quickCard
      }>

      <Text
        style={
          styles.quickLabel
        }>
        {label}
      </Text>

      <Text
        numberOfLines={2}
        style={[
          styles.quickValue,

          {
            color:
              valueColor,
          },
        ]}>
        {value}
      </Text>

    </View>
  );
};

type DashboardActionProps = {
  icon: FeatureIconName;
  accentColor: string;
  title: string;
  value: string;
  subtitle: string;
  onPress: () => void;
};

const DashboardAction = ({
  icon,
  accentColor,
  title,
  value,
  subtitle,
  onPress,
}: DashboardActionProps) => {
  const {
    theme,
    styles,
  } = useHomeTheme();

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles
          .overviewCard,

        pressed &&
          styles.pressed,
      ]}>

      <View
        style={
          styles.overviewTop
        }>

        <FeatureIcon
          name={icon}
          size={17}
          containerSize={
            36
          }
        />

        <ChevronRight
          size={17}
          color={
            theme.colors
              .textLight
          }
          strokeWidth={
            2.2
          }
        />

      </View>

      <Text
        style={[
          styles
            .overviewValue,

          {
            color:
              accentColor,
          },
        ]}>
        {value}
      </Text>

      <Text
        style={
          styles
            .overviewTitle
        }>
        {title}
      </Text>

      <Text
        style={
          styles
            .overviewSubtitle
        }>
        {subtitle}
      </Text>

    </Pressable>
  );
};

type ActionRowProps = {
  icon: FeatureIconName;
  title: string;
  subtitle: string;
  onPress: () => void;
};

const ActionRow = ({
  icon,
  title,
  subtitle,
  onPress,
}: ActionRowProps) => {
  const {
    theme,
    styles,
  } = useHomeTheme();

  return (
    <Pressable
      onPress={
        onPress
      }
      style={({
        pressed,
      }) => [
        styles.actionRow,

        pressed &&
          styles.pressed,
      ]}>

      <FeatureIcon
        name={icon}
        size={17}
        containerSize={
          38
        }
      />

      <View
        style={
          styles.actionContent
        }>

        <Text
          style={
            styles
              .actionTitle
          }>
          {title}
        </Text>

        <Text
          style={
            styles
              .actionSubtitle
          }>
          {subtitle}
        </Text>

      </View>

      <ChevronRight
        size={17}
        color={
          theme.colors
            .textLight
        }
        strokeWidth={
          2.2
        }
      />

    </Pressable>
  );
};

type AttendanceItemProps = {
  label: string;
  value: string;
  color: string;
};

const AttendanceItem = ({
  label,
  value,
  color,
}: AttendanceItemProps) => {
  const {
    styles,
  } = useHomeTheme();

  return (
    <View
      style={
        styles
          .attendanceItem
      }>

      <Text
        style={[
          styles
            .attendanceItemValue,

          {color},
        ]}>
        {value}
      </Text>

      <Text
        style={
          styles
            .attendanceItemLabel
        }>
        {label}
      </Text>

    </View>
  );
};

/* =====================================================
 * STYLES
 * ===================================================== */

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({

    safeArea: {
      flex: 1,

      backgroundColor:
        theme.colors
          .background,
    },

    container: {
      flex: 1,

      backgroundColor:
        theme.colors
          .background,
    },

    content: {
      paddingHorizontal:
        18,

      paddingTop:
        18,

      paddingBottom:
        35,
    },

    loadingNotice: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        9,

      padding:
        13,

      borderRadius:
        15,

      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      marginBottom:
        13,
    },

    loadingText: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        12,
    },

    errorNotice: {
      padding:
        13,

      borderRadius:
        15,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .primary,

      backgroundColor:
        theme.colors
          .primarySoft,

      marginBottom:
        13,
    },

    errorText: {
      color:
        theme.colors
          .secondary,

      fontSize:
        12,

      lineHeight:
        18,
    },

    header: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      marginBottom:
        24,
    },

    headerText: {
      flex:
        1,
    },

    eyebrow: {
      color:
        theme.colors
          .green,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        1.7,

      marginBottom:
        7,
    },

    title: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        31,

      lineHeight:
        37,

      fontWeight:
        '900',

      letterSpacing:
        -0.8,
    },

    subtitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        11,

      lineHeight:
        18,

      marginTop:
        8,

      maxWidth:
        285,
    },

    notificationButton: {
      width:
        46,

      height:
        46,

      borderRadius:
        15,

      backgroundColor:
        theme.colors
          .secondarySoft,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .greenDark,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginLeft:
        10,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.16
          : 0.05,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    quickGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      justifyContent:
        'space-between',

      marginBottom:
        14,
    },

    quickCard: {
      width:
        '48.5%',

      minHeight:
        98,

      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        19,

      padding:
        14,

      marginBottom:
        11,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.035,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    quickLabel: {
      color:
        theme.colors
          .textLight,

      fontSize:
        8,

      fontWeight:
        '900',

      letterSpacing:
        0.85,
    },

    quickValue: {
      fontSize:
        16,

      lineHeight:
        22,

      fontWeight:
        '900',

      marginTop:
        12,
    },

    sectionHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        14,

      marginBottom:
        12,
    },

    sectionTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        18,

      fontWeight:
        '900',

      letterSpacing:
        -0.25,
    },

    sectionAction: {
      color:
        theme.colors
          .green,

      fontSize:
        8,

      fontWeight:
        '900',
    },

    sectionSmall: {
      color:
        theme.colors
          .textLight,

      fontSize:
        8,
    },

    courseCard: {
      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        23,

      padding:
        17,

      marginBottom:
        14,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.05,

      shadowRadius:
        12,

      shadowOffset: {
        width: 0,
        height: 6,
      },

      elevation:
        3,
    },

    courseTop: {
      flexDirection:
        'row',
    },

    courseContent: {
      flex:
        1,

      marginLeft:
        12,
    },

    courseEyebrow: {
      color:
        theme.colors
          .primary,

      fontSize:
        8,

      fontWeight:
        '900',

      letterSpacing:
        1.0,
    },

    courseTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        16,

      lineHeight:
        22,

      fontWeight:
        '900',

      marginTop:
        4,
    },

    courseDescription: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        5,
    },

    courseFooter: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        14,

      gap:
        9,

      paddingTop:
        13,

      borderTopWidth:
        1,

      borderTopColor:
        theme.colors
          .divider,
    },

    lessonText: {
      color:
        theme.colors
          .textLight,

      fontSize:
        8,

      lineHeight:
        13,

      flex:
        1,
    },

    continueText: {
      color:
        theme.colors
          .green,

      fontSize:
        8,

      fontWeight:
        '900',
    },

    overviewGrid: {
      flexDirection:
        'row',

      flexWrap:
        'wrap',

      justifyContent:
        'space-between',
    },

    overviewCard: {
      width:
        '48.5%',

      minHeight:
        156,

      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        20,

      padding:
        15,

      marginBottom:
        11,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.035,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    overviewTop: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    overviewValue: {
      color:
        theme.colors.green,

      fontSize:
        24,

      fontWeight:
        '900',

      marginTop:
        14,
    },

    overviewTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        11,

      fontWeight:
        '900',

      marginTop:
        4,
    },

    overviewSubtitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        8,

      lineHeight:
        13,

      marginTop:
        5,
    },

    actionList: {
      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        21,

      overflow:
        'hidden',

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.10
          : 0.03,

      shadowRadius:
        7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation:
        1,
    },

    actionRow: {
      minHeight:
        76,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        15,

      paddingVertical:
        12,

      borderBottomWidth:
        1,

      borderBottomColor:
        theme.colors
          .divider,
    },

    actionContent: {
      flex:
        1,

      marginLeft:
        11,
    },

    actionTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        11,

      fontWeight:
        '900',
    },

    actionSubtitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        9,

      lineHeight:
        14,

      marginTop:
        4,
    },

    practiceCard: {
      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        21,

      padding:
        16,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.035,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    practiceTop: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },

    practiceContent: {
      flex:
        1,

      marginLeft:
        11,
    },

    practiceEyebrow: {
      color:
        theme.colors.info,

      fontSize:
        7,

      fontWeight:
        '900',

      letterSpacing:
        0.8,
    },

    practiceTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        14,

      fontWeight:
        '900',

      marginTop:
        3,
    },

    practiceDescription: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        8,

      lineHeight:
        13,

      marginTop:
        4,
    },

    careerGrid: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',
    },

    careerCard: {
      width:
        '48.5%',

      minHeight:
        160,

      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        20,

      padding:
        15,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.035,

      shadowRadius:
        8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    careerTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        11,

      fontWeight:
        '900',

      marginTop:
        12,
    },

    careerDescription: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        8,

      lineHeight:
        13,

      marginTop:
        4,
    },

    attendanceCard: {
      backgroundColor:
        theme.colors
          .surface,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        22,

      padding:
        17,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.13
          : 0.04,

      shadowRadius:
        9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    attendanceTop: {
      flexDirection:
        'row',

      justifyContent:
        'space-between',
    },

    attendanceLabel: {
      color:
        theme.colors
          .textLight,

      fontSize:
        7,

      fontWeight:
        '900',

      letterSpacing:
        0.7,
    },

    attendanceValue: {
      color:
        theme.colors
          .secondary,

      fontSize:
        29,

      fontWeight:
        '900',

      marginTop:
        5,
    },

    attendanceProgress: {
      height:
        7,

      borderRadius:
        999,

      backgroundColor:
        theme.colors
          .surfaceSoft,

      overflow:
        'hidden',

      marginTop:
        14,
    },

    attendanceProgressFill: {
      height:
        '100%',

      backgroundColor:
        theme.colors
          .secondary,

      borderRadius:
        999,
    },

    attendanceStats: {
      flexDirection:
        'row',

      marginTop:
        16,
    },

    attendanceItem: {
      flex:
        1,

      alignItems:
        'center',
    },

    attendanceItemValue: {
      fontSize:
        14,

      fontWeight:
        '900',
    },

    attendanceItemLabel: {
      color:
        theme.colors
          .textLight,

      fontSize:
        6,

      fontWeight:
        '900',

      marginTop:
        3,
    },

    ctaCard: {
      flexDirection:
        'row',

      alignItems:
        'center',

      backgroundColor:
        theme.colors
          .secondarySoft,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .greenDark,

      borderRadius:
        22,

      padding:
        17,

      marginTop:
        25,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.14
          : 0.04,

      shadowRadius:
        9,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    ctaContent: {
      flex:
        1,
    },

    ctaEyebrow: {
      color:
        theme.colors.green,

      fontSize:
        7,

      fontWeight:
        '900',

      letterSpacing:
        1,
    },

    ctaTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        13,

      lineHeight:
        18,

      fontWeight:
        '900',

      marginTop:
        5,
    },

    ctaDescription: {
      color:
        theme.colors
          .textSecondary,

      fontSize:
        8,

      lineHeight:
        13,

      marginTop:
        4,
    },

    ctaButton: {
      width:
        46,

      height:
        46,

      borderRadius:
        15,

      backgroundColor:
        theme.colors
          .green,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginLeft:
        12,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        0.14,

      shadowRadius:
        7,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation:
        2,
    },

    pressed: {
      opacity:
        0.72,
    },
  });

export default HomeScreen;