import React, {
  useCallback,
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

import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {
  getStudentAssignments,
  markAllAssignmentsRead,
  markAssignmentRead,
  StudentAssignment,
} from '../../services/assignmentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Assignments'
>;

function useAssignmentsTheme() {
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

export default function AssignmentsScreen({
  navigation,
}: Props) {
  const {theme, styles} =
    useAssignmentsTheme();

  const {accessToken} = useApp();

  const [
    assignments,
    setAssignments,
  ] = useState<StudentAssignment[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    markingAll,
    setMarkingAll,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const loadAssignments =
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
            await getStudentAssignments(
              accessToken,
              {
                page: 1,
                limit: 20,
                unreadOnly: false,
              },
            );

          setAssignments(
            response.items || [],
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load assignments.';

          setError(message);
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [accessToken],
    );

  /*
   * Screen open hone par
   * aur Assignment Details se
   * wapas aane par fresh data load.
   */
  useFocusEffect(
    useCallback(() => {
      loadAssignments();

      return undefined;
    }, [loadAssignments]),
  );

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadAssignments(false);

      setRefreshing(false);
    };

  const unreadCount =
    useMemo(
      () =>
        assignments.filter(
          item =>
            !isAssignmentRead(
              item,
            ),
        ).length,
      [assignments],
    );

  const submittedCount =
    useMemo(
      () =>
        assignments.filter(
          item =>
            isSubmitted(item),
        ).length,
      [assignments],
    );

  const overdueCount =
    useMemo(
      () =>
        assignments.filter(
          item =>
            isOverdue(item),
        ).length,
      [assignments],
    );

  const handleMarkAllRead =
    async () => {
      if (
        !accessToken ||
        unreadCount === 0 ||
        markingAll
      ) {
        return;
      }

      try {
        setMarkingAll(true);

        await markAllAssignmentsRead(
          accessToken,
        );

        setAssignments(
          previous =>
            previous.map(
              item => ({
                ...item,
                is_read: true,
                read: true,
              }),
            ),
        );
      } catch {
        /*
         * Read status failure se
         * assignment list block nahi hogi.
         */
      } finally {
        setMarkingAll(false);
      }
    };

  const openAssignment =
    async (
      assignment: StudentAssignment,
    ) => {
      /*
       * UI immediately read dikha do.
       */
      setAssignments(
        previous =>
          previous.map(item =>
            item.id ===
            assignment.id
              ? {
                  ...item,
                  is_read: true,
                  read: true,
                }
              : item,
          ),
      );

      /*
       * Backend read update best-effort.
       */
      if (
        accessToken &&
        !isAssignmentRead(
          assignment,
        )
      ) {
        try {
          await markAssignmentRead(
            accessToken,
            assignment.id,
          );
        } catch {
          // Details screen fir bhi open hogi.
        }
      }

      navigation.navigate(
        'AssignmentDetails',
        {
          assignmentId:
            assignment.id,
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
            Loading assignments...
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
              LEARNING TASKS
            </Text>

            <Text
              style={
                styles.pageTitle
              }>
              Assignments
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              View your assignments,
              deadlines and submission
              status.
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <BookOpenCheck
              size={25}
              color={
                theme.colors.primary
              }
            />

          </View>

        </View>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryRow
          }>

          <SummaryCard
            value={
              assignments.length
            }
            label="Total"
          />

          <SummaryCard
            value={
              submittedCount
            }
            label="Submitted"
          />

          <SummaryCard
            value={
              overdueCount
            }
            label="Overdue"
          />

        </View>

        {/* UNREAD */}

        {unreadCount > 0 && (
          <View
            style={
              styles.unreadCard
            }>

            <View>

              <Text
                style={
                  styles.unreadTitle
                }>
                {unreadCount}{' '}
                new{' '}
                {unreadCount === 1
                  ? 'assignment'
                  : 'assignments'}
              </Text>

              <Text
                style={
                  styles.unreadText
                }>
                You have unread
                assignment updates.
              </Text>

            </View>

            <Pressable
              disabled={
                markingAll
              }
              onPress={
                handleMarkAllRead
              }
              style={
                styles.markAllButton
              }>

              {markingAll ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.black}
                />
              ) : (
                <Text
                  style={
                    styles
                      .markAllText
                  }>
                  Mark all read
                </Text>
              )}

            </Pressable>

          </View>
        )}

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
                loadAssignments()
              }
              style={
                styles.retryButton
              }>

              <RefreshCw
                size={15}
                color={theme.colors.black}
              />

              <Text
                style={
                  styles
                    .retryButtonText
                }>
                Retry
              </Text>

            </Pressable>

          </View>
        )}

        {/* LIST */}

        <View
          style={
            styles.sectionHeader
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            YOUR ASSIGNMENTS
          </Text>

          <View
            style={
              styles.countBadge
            }>

            <Text
              style={
                styles.countText
              }>
              {assignments.length}
            </Text>

          </View>

        </View>

        {assignments.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <FileText
              size={35}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }>
              No assignments yet
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your assignments will
              appear here when they
              are published by the
              academy.
            </Text>

          </View>
        ) : (
          assignments.map(
            assignment => (
              <AssignmentCard
                key={
                  assignment.id
                }
                assignment={
                  assignment
                }
                onPress={() =>
                  openAssignment(
                    assignment,
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
 * SUMMARY
 * =====================================================
 */

function SummaryCard({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const {styles} =
    useAssignmentsTheme();

  return (
    <View
      style={
        styles.summaryCard
      }>

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

/*
 * =====================================================
 * ASSIGNMENT CARD
 * =====================================================
 */

function AssignmentCard({
  assignment,
  onPress,
}: {
  assignment: StudentAssignment;
  onPress: () => void;
}) {
  const {theme, styles} =
    useAssignmentsTheme();

  const submitted =
    isSubmitted(
      assignment,
    );

  const overdue =
    isOverdue(
      assignment,
    );

  const read =
    isAssignmentRead(
      assignment,
    );

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.assignmentCard,

        !read &&
          styles
            .assignmentUnread,

        pressed &&
          styles.pressed,
      ]}>

      <View
        style={
          styles.cardTop
        }>

        <View
          style={
            styles.assignmentIcon
          }>

          <FileText
            size={21}
            color={
              theme.colors.primary
            }
          />

        </View>

        <View
          style={
            styles.cardHeading
          }>

          <View
            style={
              styles.titleRow
            }>

            <Text
              style={
                styles.assignmentTitle
              }>
              {assignment.title ||
                'Assignment'}
            </Text>

            {!read && (
              <View
                style={
                  styles.newDot
                }
              />
            )}

          </View>

          {!!assignment
            .target_course_name && (
            <Text
              style={
                styles.courseName
              }>
              {
                assignment
                  .target_course_name
              }
            </Text>
          )}

        </View>

      </View>

      {!!assignment.description && (
        <Text
          numberOfLines={3}
          style={
            styles.description
          }>
          {assignment.description}
        </Text>
      )}

      {/* META */}

      <View
        style={
          styles.metaBox
        }>

        <View
          style={
            styles.metaItem
          }>

          <CalendarDays
            size={16}
            color={
              overdue
                ? theme.colors.danger
                : theme.colors
                    .textSecondary
            }
          />

          <View>

            <Text
              style={
                styles.metaLabel
              }>
              Due Date
            </Text>

            <Text
              style={[
                styles.metaValue,

                overdue &&
                  styles
                    .overdueText,
              ]}>
              {formatDueDate(
                assignment.due_at,
              )}
            </Text>

          </View>

        </View>

        <View
          style={
            styles.metaItem
          }>

          <CheckCircle2
            size={16}
            color={
              theme.colors
                .textSecondary
            }
          />

          <View>

            <Text
              style={
                styles.metaLabel
              }>
              Max Marks
            </Text>

            <Text
              style={
                styles.metaValue
              }>
              {assignment.max_marks ??
                '—'}
            </Text>

          </View>

        </View>

      </View>

      {/* STATUS */}

      <View
        style={
          styles.cardBottom
        }>

        <StatusBadge
          submitted={
            submitted
          }
          overdue={
            overdue
          }
          assignment={
            assignment
          }
        />

        <View
          style={
            styles.openArea
          }>

          <Text
            style={
              styles.openText
            }>
            View
          </Text>

          <ArrowRight
            size={17}
            color={
              theme.colors.primary
            }
          />

        </View>

      </View>

    </Pressable>
  );
}

/*
 * =====================================================
 * STATUS
 * =====================================================
 */

function StatusBadge({
  submitted,
  overdue,
  assignment,
}: {
  submitted: boolean;
  overdue: boolean;
  assignment: StudentAssignment;
}) {
  const {theme, styles} =
    useAssignmentsTheme();

  if (submitted) {
    return (
      <View
        style={[
          styles.statusBadge,
          styles
            .submittedBadge,
        ]}>

        <CheckCircle2
          size={14}
          color={
            theme.colors.secondary
          }
        />

        <Text
          style={
            styles
              .submittedBadgeText
          }>
          {formatLabel(
            assignment
              .submission_status ||
              'submitted',
          )}
        </Text>

      </View>
    );
  }

  if (overdue) {
    return (
      <View
        style={[
          styles.statusBadge,
          styles.overdueBadge,
        ]}>

        <Clock3
          size={14}
          color={theme.colors.danger}
        />

        <Text
          style={
            styles
              .overdueBadgeText
          }>
          Overdue
        </Text>

      </View>
    );
  }

  return (
    <View
      style={[
        styles.statusBadge,
        styles.pendingBadge,
      ]}>

      <Clock3
        size={14}
        color={theme.colors.warning}
      />

      <Text
        style={
          styles
            .pendingBadgeText
        }>
        Pending
      </Text>

    </View>
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function isAssignmentRead(
  item: StudentAssignment,
) {
  if (
    typeof item.is_read ===
    'boolean'
  ) {
    return item.is_read;
  }

  if (
    typeof item.read ===
    'boolean'
  ) {
    return item.read;
  }

  return true;
}

function isSubmitted(
  item: StudentAssignment,
) {
  if (
    item.submitted === true
  ) {
    return true;
  }

  const status =
    item.submission_status
      ?.trim()
      .toLowerCase();

  return [
    'submitted',
    'graded',
    'reviewed',
    'evaluated',
    'completed',
  ].includes(status || '');
}

function isOverdue(
  item: StudentAssignment,
) {
  if (
    isSubmitted(item) ||
    !item.due_at
  ) {
    return false;
  }

  const due =
    new Date(item.due_at);

  if (
    Number.isNaN(
      due.getTime(),
    )
  ) {
    return false;
  }

  return (
    due.getTime() <
    Date.now()
  );
}

function formatDueDate(
  value?: string | null,
) {
  if (!value) {
    return 'No deadline';
  }

  const date =
    new Date(value);

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
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  );
}

function formatLabel(
  value: string,
) {
  return value
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase(),
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

    summaryRow: {
      marginTop: 23,

      flexDirection: 'row',

      gap: 9,
    },

    summaryCard: {
      flex: 1,

      paddingVertical: 16,

      alignItems: 'center',

      borderRadius: 18,

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
          ? 0.11
          : 0.03,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    summaryValue: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 20,

      fontWeight: '900',
    },

    summaryLabel: {
      marginTop: 3,

      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      fontWeight: '700',
    },

    unreadCard: {
      marginTop: 15,

      padding: 15,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      gap: 10,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

      backgroundColor:
        theme.colors.primarySoft,

      shadowColor:
        theme.colors.shadow,

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

    unreadTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 11,

      fontWeight: '900',
    },

    unreadText: {
      marginTop: 3,

      color:
        theme.colors
          .textSecondary,

      fontSize: 9,
    },

    markAllButton: {
      minWidth: 96,

      minHeight: 38,

      paddingHorizontal: 12,

      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 12,

      backgroundColor:
        theme.colors.primary,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity: 0.10,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    markAllText: {
      color: theme.colors.black,

      fontSize: 9,

      fontWeight: '900',
    },

    errorCard: {
      marginTop: 14,

      padding: 15,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      gap: 10,

      borderRadius: 18,

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

    retryButton: {
      paddingHorizontal: 11,

      paddingVertical: 8,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 5,

      borderRadius: 10,

      backgroundColor:
        theme.colors.primary,
    },

    retryButtonText: {
      color: theme.colors.black,

      fontSize: 9,

      fontWeight: '900',
    },

    sectionHeader: {
      marginTop: 27,

      marginBottom: 10,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    sectionTitle: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    countBadge: {
      minWidth: 32,

      paddingHorizontal: 9,

      paddingVertical: 6,

      alignItems: 'center',

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

      backgroundColor:
        theme.colors.primarySoft,
    },

    countText: {
      color:
        theme.colors.primary,

      fontSize: 10,

      fontWeight: '900',
    },

    assignmentCard: {
      marginBottom: 14,

      padding: 17,

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
          ? 0.15
          : 0.04,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 2,
    },

    assignmentUnread: {
      borderColor:
        theme.colors.primary,
    },

    cardTop: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 12,
    },

    assignmentIcon: {
      width: 48,

      height: 48,

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

    cardHeading: {
      flex: 1,
    },

    titleRow: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 7,
    },

    assignmentTitle: {
      flex: 1,

      color:
        theme.colors
          .textPrimary,

      fontSize: 14,

      lineHeight: 20,

      fontWeight: '900',
    },

    newDot: {
      width: 8,

      height: 8,

      marginTop: 5,

      borderRadius: 8,

      backgroundColor:
        theme.colors.primary,
    },

    courseName: {
      marginTop: 4,

      color:
        theme.colors.primary,

      fontSize: 9,

      fontWeight: '700',
    },

    description: {
      marginTop: 12,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 17,
    },

    metaBox: {
      marginTop: 15,

      padding: 13,

      flexDirection: 'row',

      gap: 12,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        theme.colors.border,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    metaItem: {
      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 8,
    },

    metaLabel: {
      color:
        theme.colors.textLight,

      fontSize: 8,

      fontWeight: '700',
    },

    metaValue: {
      marginTop: 2,

      color:
        theme.colors
          .textPrimary,

      fontSize: 9,

      fontWeight: '800',
    },

    overdueText: {
      color:
        theme.colors.danger,
    },

    cardBottom: {
      marginTop: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    statusBadge: {
      minHeight: 32,

      paddingHorizontal: 10,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 5,

      borderRadius: 999,

      borderWidth: 1,

      borderColor:
        theme.colors.border,
    },

    submittedBadge: {
      backgroundColor:
        theme.colors.secondarySoft,
    },

    submittedBadgeText: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 8,

      fontWeight: '900',
    },

    overdueBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    overdueBadgeText: {
      color:
        theme.colors.danger,

      fontSize: 8,

      fontWeight: '900',
    },

    pendingBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    pendingBadgeText: {
      color:
        theme.colors.warning,

      fontSize: 8,

      fontWeight: '900',
    },

    openArea: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 4,
    },

    openText: {
      color:
        theme.colors.primary,

      fontSize: 9,

      fontWeight: '900',
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

      maxWidth: 255,

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

      fontSize: 11,

      fontWeight: '600',
    },

    pressed: {
      opacity: 0.76,
    },
  });