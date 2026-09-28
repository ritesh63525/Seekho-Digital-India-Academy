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

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
  UserCheck,
  UserMinus,
  UserX,
} from 'lucide-react-native';

import {
  AttendanceItem,
  AttendanceSummary,
  getStudentAttendance,
} from '../../services/studentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

function useAttendanceTheme() {
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

export default function AttendanceScreen() {
  const {theme, styles} = useAttendanceTheme();
  const {accessToken} = useApp();

  const [
    summary,
    setSummary,
  ] =
    useState<AttendanceSummary | null>(
      null,
    );

  const [
    attendance,
    setAttendance,
  ] = useState<AttendanceItem[]>(
    [],
  );

  const [
    studentName,
    setStudentName,
  ] = useState('');

  const [
    course,
    setCourse,
  ] = useState('');

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

  const loadAttendance =
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

          const response =
            await getStudentAttendance(
              accessToken,
              1,
              30,
            );

          setSummary(
            response.data.summary,
          );

          setAttendance(
            response.data.items || [],
          );

          setStudentName(
            response.data.student
              ?.name || '',
          );

          setCourse(
            response.data.student
              ?.course || '',
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load attendance.';

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
    loadAttendance();
  }, [loadAttendance]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadAttendance(false);

      setRefreshing(false);
    };

  const percentage =
    summary
      ?.attendance_percentage ??
    0;

  const percentageText =
    useMemo(
      () =>
        `${Number(
          percentage,
        ).toFixed(
          Number.isInteger(
            percentage,
          )
            ? 0
            : 1,
        )}%`,
      [percentage],
    );

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
            Loading attendance...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  if (error && !summary) {
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

          <UserX
            size={44}
            color={
              theme.colors
                .textSecondary
            }
          />

          <Text
            style={
              styles.errorTitle
            }>
            Attendance unavailable
          </Text>

          <Text
            style={
              styles.errorText
            }>
            {error}
          </Text>

          <Pressable
            onPress={() =>
              loadAttendance()
            }
            style={
              styles.retryButton
            }>

            <RefreshCw
              size={17}
              color={theme.colors.black}
            />

            <Text
              style={
                styles
                  .retryButtonText
              }>
              Try Again
            </Text>

          </Pressable>

        </View>
      </SafeAreaView>
    );
  }

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
            refreshing={refreshing}
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

        {/* PREMIUM HEADER */}

        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerCopy}>
              <View style={styles.eyebrowRow}>
                <Sparkles
                  size={13}
                  color={theme.colors.primary}
                  strokeWidth={2.3}
                />

                <Text style={styles.eyebrow}>
                  ACADEMIC RECORD
                </Text>
              </View>

              <Text style={styles.pageTitle}>
                Attendance
              </Text>

              {!!studentName && (
                <Text style={styles.studentText}>
                  {studentName}
                  {course
                    ? ` • ${course}`
                    : ''}
                </Text>
              )}
            </View>

            <View style={styles.headerRight}>
              <Image
                source={require('../../assets/seekho-login-logo-transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.headerIcon}>
                <CalendarDays
                  size={22}
                  color={theme.colors.primary}
                  strokeWidth={2.2}
                />
              </View>
            </View>
          </View>

          <View style={styles.headerAccentRow}>
            <View style={styles.headerAccentOrange} />
            <View style={styles.headerAccentGreen} />
          </View>
        </View>

        {/* ATTENDANCE PERCENTAGE */}

        <View
          style={
            styles.percentageCard
          }>

          <View
            style={
              styles.percentageCircle
            }>

            <Text
              style={
                styles
                  .percentageValue
              }>
              {percentageText}
            </Text>

            <Text
              style={
                styles
                  .percentageLabel
              }>
              Attendance
            </Text>

          </View>

          <View
            style={
              styles.percentageInfo
            }>

            <Text
              style={
                styles
                  .percentageTitle
              }>
              Overall Attendance
            </Text>

            <Text
              style={
                styles
                  .percentageDescription
              }>
              Based on your complete
              attendance record.
            </Text>

            <View
              style={
                styles.daysRow
              }>

              <Text
                style={
                  styles.daysText
                }>
                {
                  summary?.present ??
                  0
                }{' '}
                present
              </Text>

              <Text
                style={
                  styles.dotText
                }>
                •
              </Text>

              <Text
                style={
                  styles.daysText
                }>
                {
                  summary
                    ?.total_days ?? 0
                }{' '}
                total days
              </Text>

            </View>

          </View>

        </View>

        {/* SUMMARY */}

        <Text
          style={
            styles.sectionTitle
          }>
          SUMMARY
        </Text>

        <View
          style={
            styles.summaryGrid
          }>

          <SummaryCard
            icon={
              <CheckCircle2
                size={21}
                color={
                  theme.colors.secondary
                }
              />
            }
            value={
              summary?.present ?? 0
            }
            label="Present"
          />

          <SummaryCard
            icon={
              <UserX
                size={21}
                color={theme.colors.danger}
              />
            }
            value={
              summary?.absent ?? 0
            }
            label="Absent"
          />

          <SummaryCard
            icon={
              <Clock3
                size={21}
                color={theme.colors.warning}
              />
            }
            value={
              summary?.late ?? 0
            }
            label="Late"
          />

          <SummaryCard
            icon={
              <UserMinus
                size={21}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            value={
              (summary?.leave ??
                0) +
              (summary?.half_day ??
                0)
            }
            label="Leave / Half"
          />

        </View>

        {/* RECORDS */}

        <View
          style={
            styles.recordsHeader
          }>

          <View>

            <Text
              style={
                styles.sectionTitleNoMargin
              }>
              ATTENDANCE HISTORY
            </Text>

            <Text
              style={
                styles.recordsSubtitle
              }>
              Latest attendance records
            </Text>

          </View>

          <Text
            style={
              styles.recordCount
            }>
            {attendance.length}
          </Text>

        </View>

        {attendance.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <CalendarDays
              size={30}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }>
              No attendance records
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your attendance history
              will appear here once it
              is marked by the academy.
            </Text>

          </View>
        ) : (
          <View
            style={
              styles.recordsCard
            }>

            {attendance.map(
              (
                item,
                index,
              ) => (
                <React.Fragment
                  key={item.id}>

                  <AttendanceRow
                    item={item}
                  />

                  {index !==
                    attendance.length -
                      1 && (
                    <View
                      style={
                        styles.divider
                      }
                    />
                  )}

                </React.Fragment>
              ),
            )}

          </View>
        )}

        {/* INFO NOTE */}

        <View
          style={
            styles.infoBox
          }>

          <UserCheck
            size={20}
            color={
              theme.colors.secondary
            }
            strokeWidth={2.2}
          />

          <Text
            style={
              styles.infoText
            }>
            Attendance is recorded
            and managed by the
            academy. Contact support
            if you notice an incorrect
            entry.
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * COMPONENTS
 * =====================================================
 */

function SummaryCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  const {styles} = useAttendanceTheme();

  return (
    <View
      style={
        styles.summaryCard
      }>

      <View
        style={
          styles.summaryIcon
        }>
        {icon}
      </View>

      <Text
        style={
          styles.summaryValue
        }>
        {value}
      </Text>

      <Text
        style={
          styles.summaryLabel
        }>
        {label}
      </Text>

    </View>
  );
}

function AttendanceRow({
  item,
}: {
  item: AttendanceItem;
}) {
  const {theme, styles} = useAttendanceTheme();

  const status =
    normalizeStatus(
      item.status,
    );

  const config =
    getStatusConfig(status, theme);

  return (
    <View
      style={
        styles.attendanceRow
      }>

      <View
        style={
          styles.dateBox
        }>

        <Text
          style={
            styles.dateDay
          }>
          {getDay(item.date)}
        </Text>

        <Text
          style={
            styles.dateMonth
          }>
          {getMonth(
            item.date,
          )}
        </Text>

      </View>

      <View
        style={
          styles.attendanceInfo
        }>

        <Text
          style={
            styles
              .attendanceDate
          }>
          {formatFullDate(
            item.date,
          )}
        </Text>

        <Text
          style={
            styles
              .attendanceCourse
          }>
          {item.course ||
            'Course'}
        </Text>

        {(item.check_in ||
          item.check_out) && (
          <Text
            style={
              styles.timeText
            }>
            {item.check_in
              ? `In: ${formatTime(
                  item.check_in,
                )}`
              : ''}

            {item.check_in &&
            item.check_out
              ? '  •  '
              : ''}

            {item.check_out
              ? `Out: ${formatTime(
                  item.check_out,
                )}`
              : ''}
          </Text>
        )}

      </View>

      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              config.background,
          },
        ]}>

        <View
          style={[
            styles.statusDot,
            {
              backgroundColor:
                config.color,
            },
          ]}
        />

        <Text
          style={[
            styles.statusBadgeText,
            {
              color:
                config.color,
            },
          ]}>
          {config.label}
        </Text>

      </View>

    </View>
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function normalizeStatus(
  status?: string,
) {
  return (
    status
      ?.trim()
      .toLowerCase() ||
    'unknown'
  );
}

function getStatusConfig(
  status: string,
  theme: AppTheme,
) {
  switch (status) {
    case 'present':
      return {
        label: 'Present',
        color:
          theme.colors.secondary,
        background:
          theme.colors.secondarySoft,
      };

    case 'absent':
      return {
        label: 'Absent',
        color:
          theme.colors.danger,
        background:
          theme.dark
            ? 'rgba(255,116,116,0.10)'
            : '#FDEFEF',
      };

    case 'late':
      return {
        label: 'Late',
        color:
          theme.colors.warning,
        background:
          theme.dark
            ? 'rgba(255,170,85,0.10)'
            : '#FFF6EC',
      };

    case 'leave':
      return {
        label: 'Leave',
        color:
          theme.colors.info,
        background:
          theme.dark
            ? 'rgba(120,182,255,0.10)'
            : '#EEF5FD',
      };

    case 'half_day':
    case 'half day':
      return {
        label: 'Half Day',
        color:
          theme.colors.primary,
        background:
          theme.colors.primarySoft,
      };

    default:
      return {
        label:
          status
            .replace(/_/g, ' ')
            .replace(
              /\b\w/g,
              letter =>
                letter.toUpperCase(),
            ),
        color:
          theme.colors
            .textSecondary,
        background:
          theme.colors
            .surfaceElevated,
      };
  }
}

function parseDate(
  value: string,
) {
  return new Date(
    `${value}T00:00:00`,
  );
}

function getDay(
  value: string,
) {
  const date =
    parseDate(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '--';
  }

  return String(
    date.getDate(),
  ).padStart(2, '0');
}

function getMonth(
  value: string,
) {
  const date =
    parseDate(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  return date
    .toLocaleDateString(
      'en-IN',
      {
        month: 'short',
      },
    )
    .toUpperCase();
}

function formatFullDate(
  value: string,
) {
  const date =
    parseDate(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatTime(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
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
        theme.colors
          .background,
    },

    scrollContent: {
      paddingHorizontal: 18,

      paddingTop: 18,

      paddingBottom: 40,
    },

    header: {
      overflow: 'hidden',
      padding: 18,
      borderRadius: 23,
      borderWidth: 1,
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
        theme.dark ? 0.22 : 0.10,
      shadowRadius: 18,
      elevation: 4,
    },

    headerTopRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'flex-start',
      gap: 14,
    },

    headerCopy: {
      flex: 1,
    },

    eyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    headerRight: {
      alignItems: 'flex-end',
      gap: 8,
    },

    logo: {
      width: 76,
      height: 30,
    },

    headerAccentRow: {
      height: 4,
      marginTop: 17,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
    },

    headerAccentOrange: {
      flex: 1.25,
      backgroundColor:
        theme.colors.primary,
    },

    headerAccentGreen: {
      flex: 1,
      backgroundColor:
        theme.colors.secondary,
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

    studentText: {
      marginTop: 5,

      maxWidth: 270,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '600',
    },

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.primarySoft,
    },

    percentageCard: {
      marginTop: 24,

      padding: 18,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 18,

      borderRadius: 22,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity:
        theme.dark ? 0.20 : 0.09,
      shadowRadius: 16,
      elevation: 3,
    },

    percentageCircle: {
      width: 104,

      height: 104,

      borderRadius: 52,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 7,

      borderColor:
        theme.colors.secondary,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    percentageValue: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 24,

      fontWeight: '900',

      letterSpacing: -0.7,
    },

    percentageLabel: {
      marginTop: 1,

      color:
        theme.colors
          .textSecondary,

      fontSize: 8,

      fontWeight: '800',

      textTransform:
        'uppercase',

      letterSpacing: 0.8,
    },

    percentageInfo: {
      flex: 1,
    },

    percentageTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 16,

      fontWeight: '900',
    },

    percentageDescription: {
      marginTop: 5,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 16,
    },

    daysRow: {
      marginTop: 11,

      flexDirection: 'row',

      flexWrap: 'wrap',

      alignItems: 'center',

      gap: 6,
    },

    daysText: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 10,

      fontWeight: '800',
    },

    dotText: {
      color:
        theme.colors
          .textLight,
    },

    sectionTitle: {
      marginTop: 28,

      marginBottom: 10,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    sectionTitleNoMargin: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    summaryGrid: {
      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 10,
    },

    summaryCard: {
      width: '48%',

      padding: 15,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    summaryIcon: {
      width: 39,

      height: 39,

      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 12,

      backgroundColor:
        theme.colors.surfaceSoft,
    },

    summaryValue: {
      marginTop: 11,

      color:
        theme.colors
          .textPrimary,

      fontSize: 21,

      fontWeight: '900',
    },

    summaryLabel: {
      marginTop: 2,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      fontWeight: '700',
    },

    recordsHeader: {
      marginTop: 28,

      marginBottom: 10,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',
    },

    recordsSubtitle: {
      marginTop: 4,

      color:
        theme.colors
          .textLight,

      fontSize: 9,
    },

    recordCount: {
      minWidth: 30,

      paddingHorizontal: 8,

      paddingVertical: 5,

      textAlign: 'center',

      borderRadius: 10,

      overflow: 'hidden',

      color:
        theme.colors.secondaryStrong,

      fontSize: 10,

      fontWeight: '900',

      backgroundColor:
        theme.colors.secondarySoft,
    },

    recordsCard: {
      overflow: 'hidden',

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    attendanceRow: {
      minHeight: 82,

      paddingHorizontal: 13,

      paddingVertical: 13,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 12,
    },

    dateBox: {
      width: 48,

      height: 55,

      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 13,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    dateDay: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 17,

      fontWeight: '900',
    },

    dateMonth: {
      marginTop: 1,

      color:
        theme.colors
          .textSecondary,

      fontSize: 8,

      fontWeight: '800',
    },

    attendanceInfo: {
      flex: 1,
    },

    attendanceDate: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 11,

      fontWeight: '800',
    },

    attendanceCourse: {
      marginTop: 3,

      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      fontWeight: '600',
    },

    timeText: {
      marginTop: 4,

      color:
        theme.colors
          .textLight,

      fontSize: 8,
    },

    statusBadge: {
      paddingHorizontal: 9,

      paddingVertical: 7,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 5,

      borderRadius: 11,
    },

    statusDot: {
      width: 6,

      height: 6,

      borderRadius: 10,
    },

    statusBadgeText: {
      fontSize: 9,

      fontWeight: '900',
    },

    divider: {
      height: 1,

      marginLeft: 73,

      backgroundColor:
        theme.colors
          .borderStrong,
    },

    emptyCard: {
      paddingVertical: 35,

      paddingHorizontal: 20,

      alignItems: 'center',

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    emptyTitle: {
      marginTop: 12,

      color:
        theme.colors
          .textPrimary,

      fontSize: 14,

      fontWeight: '900',
    },

    emptyText: {
      marginTop: 6,

      maxWidth: 260,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 17,

      textAlign: 'center',
    },

    infoBox: {
      marginTop: 18,

      padding: 15,

      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 11,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    infoText: {
      flex: 1,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 17,
    },

    centerState: {
      flex: 1,

      paddingHorizontal: 30,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 15,

      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      fontWeight: '600',
    },

    errorTitle: {
      marginTop: 14,

      color:
        theme.colors
          .textPrimary,

      fontSize: 19,

      fontWeight: '900',
    },

    errorText: {
      marginTop: 8,

      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      lineHeight: 19,

      textAlign: 'center',
    },

    retryButton: {
      marginTop: 20,

      paddingHorizontal: 20,

      paddingVertical: 12,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 7,

      borderRadius: 14,

      backgroundColor:
        theme.colors.primary,
    },

    retryButtonText: {
      color: theme.colors.black,

      fontSize: 12,

      fontWeight: '900',
    },
  });