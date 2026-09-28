import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  RefreshCw,
  Send,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {
  getStudentAssignments,
  StudentAssignment,
  submitStudentAssignment,
} from '../../services/assignmentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AssignmentDetails'
>;

function useAssignmentDetailsTheme() {
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

export default function AssignmentDetailsScreen({
  navigation,
  route,
}: Props) {
  const {theme, styles} =
    useAssignmentDetailsTheme();

  const {
    accessToken,
    submitAssignment,
  } = useApp();

  const [
    assignment,
    setAssignment,
  ] =
    useState<StudentAssignment | null>(
      null,
    );

  const [
    answer,
    setAnswer,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadAssignment =
    useCallback(
      async () => {
        if (!accessToken) {
          setLoading(false);

          setError(
            'Student session not found. Please sign in again.',
          );

          return;
        }

        try {
          setLoading(true);

          setError(null);

          /*
           * Backend me separate student
           * assignment detail endpoint
           * confirmed nahi hai.
           *
           * Isliye student assignment
           * list load karke ID se exact
           * assignment find kar rahe hain.
           */
          const response =
            await getStudentAssignments(
              accessToken,
              {
                page: 1,
                limit: 100,
                unreadOnly: false,
              },
            );

          const found =
            response.items.find(
              item =>
                String(item.id) ===
                String(
                  route.params
                    .assignmentId,
                ),
            );

          if (!found) {
            throw new Error(
              'Assignment not found.',
            );
          }

          setAssignment(found);

          if (
            found.text_answer
          ) {
            setAnswer(
              found.text_answer,
            );
          }
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load assignment.';

          setError(message);
        } finally {
          setLoading(false);
        }
      },
      [
        accessToken,
        route.params.assignmentId,
      ],
    );

  useEffect(() => {
    loadAssignment();
  }, [loadAssignment]);

  const submitted =
    assignment
      ? isSubmitted(
          assignment,
        )
      : false;

  const overdue =
    assignment
      ? isOverdue(
          assignment,
        )
      : false;

  const canSubmit =
    Boolean(accessToken) &&
    Boolean(assignment) &&
    answer.trim().length > 0 &&
    !submitting &&
    !submitted;

  const handleSubmit =
    async () => {
      if (
        !accessToken ||
        !assignment
      ) {
        return;
      }

      if (!answer.trim()) {
        Alert.alert(
          'Answer required',
          'Please enter your assignment answer before submitting.',
        );

        return;
      }

      if (submitted) {
        Alert.alert(
          'Already submitted',
          'This assignment has already been submitted.',
        );

        return;
      }

      Alert.alert(
        'Submit assignment',
        'Are you sure you want to submit this answer?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Submit',

            onPress:
              submitNow,
          },
        ],
      );
    };

  const submitNow =
    async () => {
      if (
        !accessToken ||
        !assignment
      ) {
        return;
      }

      try {
        setSubmitting(true);

        const response =
          await submitStudentAssignment(
            accessToken,
            assignment.id,
            {
              textAnswer:
                answer.trim(),
            },
          );

        /*
         * Existing app context ko bhi
         * immediately update kar do.
         */
        submitAssignment(
          assignment.id,
        );

        setAssignment(
          previous =>
            previous
              ? {
                  ...previous,
                  submitted: true,
                  submission_status:
                    'submitted',
                  text_answer:
                    answer.trim(),
                  submitted_at:
                    new Date()
                      .toISOString(),
                }
              : previous,
        );

        Alert.alert(
          'Assignment submitted',
          getSuccessMessage(
            response,
          ),
          [
            {
              text: 'Done',

              onPress: () =>
                navigation.goBack(),
            },
          ],
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to submit assignment.';

        Alert.alert(
          'Submission failed',
          message,
        );
      } finally {
        setSubmitting(false);
      }
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
            Loading assignment...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  if (!assignment) {
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

          <FileText
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
            Assignment unavailable
          </Text>

          <Text
            style={
              styles.errorText
            }>
            {error ||
              'Unable to find this assignment.'}
          </Text>

          <Pressable
            onPress={
              loadAssignment
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
                styles.retryText
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
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }>

          {/* TOP */}

          <View
            style={styles.topBar}>

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
              style={
                styles.backButton
              }>

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
              Assignment
            </Text>

            <View
              style={styles.topSpacer}
            />

          </View>

          {/* HERO */}

          <View
            style={
              styles.heroCard
            }>

            <View
              style={
                styles.heroIcon
              }>

              <FileText
                size={25}
                color={
                  theme.colors.primary
                }
              />

            </View>

            <Text
              style={
                styles.title
              }>
              {assignment.title ||
                'Assignment'}
            </Text>

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

            <View
              style={
                styles.statusRow
              }>

              <StatusBadge
                submitted={
                  submitted
                }
                overdue={
                  overdue
                }
                status={
                  assignment
                    .submission_status
                }
              />

            </View>

          </View>

          {/* INFO */}

          <Text
            style={
              styles.sectionTitle
            }>
            DETAILS
          </Text>

          <View
            style={
              styles.infoCard
            }>

            <InfoRow
              icon={
                <CalendarDays
                  size={18}
                  color={
                    overdue
                      ? theme.colors.danger
                      : theme.colors
                          .textSecondary
                  }
                />
              }
              label="Due Date"
              value={
                formatDateTime(
                  assignment.due_at,
                )
              }
            />

            <Divider />

            <InfoRow
              icon={
                <GraduationCap
                  size={18}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />
              }
              label="Maximum Marks"
              value={
                assignment.max_marks !==
                null &&
                assignment.max_marks !==
                undefined
                  ? String(
                      assignment.max_marks,
                    )
                  : 'Not specified'
              }
            />

            {!!assignment
              .submitted_at && (
              <>
                <Divider />

                <InfoRow
                  icon={
                    <CheckCircle2
                      size={18}
                      color={
                        theme.colors
                          .primary
                      }
                    />
                  }
                  label="Submitted On"
                  value={
                    formatDateTime(
                      assignment
                        .submitted_at,
                    )
                  }
                />

              </>
            )}

          </View>

          {/* DESCRIPTION */}

          {!!assignment.description && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }>
                DESCRIPTION
              </Text>

              <View
                style={
                  styles.textCard
                }>

                <Text
                  style={
                    styles.bodyText
                  }>
                  {
                    assignment.description
                  }
                </Text>

              </View>
            </>
          )}

          {/* INSTRUCTIONS */}

          {!!assignment.instructions && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }>
                INSTRUCTIONS
              </Text>

              <View
                style={
                  styles.textCard
                }>

                <Text
                  style={
                    styles.bodyText
                  }>
                  {
                    assignment.instructions
                  }
                </Text>

              </View>
            </>
          )}

          {/* ANSWER */}

          <Text
            style={
              styles.sectionTitle
            }>
            {submitted
              ? 'YOUR SUBMISSION'
              : 'YOUR ANSWER'}
          </Text>

          <View
            style={[
              styles.answerBox,

              submitted &&
                styles
                  .answerBoxSubmitted,
            ]}>

            <TextInput
              value={answer}
              onChangeText={
                setAnswer
              }
              editable={
                !submitted &&
                !submitting
              }
              multiline
              textAlignVertical="top"
              placeholder="Write your assignment answer here..."
              placeholderTextColor={
                theme.colors
                  .textLight
              }
              selectionColor={
                theme.colors.primary
              }
              style={
                styles.answerInput
              }
            />

          </View>

          {!submitted && (
            <Text
              style={
                styles.answerHint
              }>
              Write your complete answer
              before submitting. File
              upload can be added later
              without changing the backend
              API.
            </Text>
          )}

          {/* FEEDBACK */}

          {!!assignment.feedback && (
            <>
              <Text
                style={
                  styles.sectionTitle
                }>
                TEACHER FEEDBACK
              </Text>

              <View
                style={
                  styles.feedbackCard
                }>

                <Text
                  style={
                    styles.feedbackText
                  }>
                  {
                    assignment.feedback
                  }
                </Text>

                {assignment
                  .marks_obtained !==
                  null &&
                  assignment
                    .marks_obtained !==
                    undefined && (
                    <Text
                      style={
                        styles.marksText
                      }>
                      Marks:{' '}
                      {
                        assignment
                          .marks_obtained
                      }
                      {assignment.max_marks
                        ? ` / ${assignment.max_marks}`
                        : ''}
                    </Text>
                  )}

              </View>
            </>
          )}

          {/* SUBMIT */}

          {!submitted ? (
            <Pressable
              disabled={
                !canSubmit
              }
              onPress={
                handleSubmit
              }
              style={({pressed}) => [
                styles.submitButton,

                !canSubmit &&
                  styles
                    .submitButtonDisabled,

                pressed &&
                  canSubmit &&
                  styles.pressed,
              ]}>

              {submitting ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.black}
                />
              ) : (
                <>
                  <Send
                    size={18}
                    color={
                      canSubmit
                        ? theme.colors.black
                        : theme.colors
                            .textLight
                    }
                  />

                  <Text
                    style={[
                      styles
                        .submitButtonText,

                      !canSubmit &&
                        styles
                          .submitButtonTextDisabled,
                    ]}>
                    Submit Assignment
                  </Text>
                </>
              )}

            </Pressable>
          ) : (
            <View
              style={
                styles.submittedBox
              }>

              <CheckCircle2
                size={21}
                color={
                  theme.colors.primary
                }
              />

              <View
                style={
                  styles
                    .submittedTextArea
                }>

                <Text
                  style={
                    styles
                      .submittedTitle
                  }>
                  Assignment Submitted
                </Text>

                <Text
                  style={
                    styles
                      .submittedText
                  }>
                  Your response has been
                  submitted to the
                  academy.
                </Text>

              </View>

            </View>
          )}

        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * COMPONENTS
 * =====================================================
 */

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
    useAssignmentDetailsTheme();

  return (
    <View
      style={styles.infoRow}>

      <View
        style={
          styles.infoIcon
        }>
        {icon}
      </View>

      <View
        style={
          styles.infoContent
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
    useAssignmentDetailsTheme();

  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

function StatusBadge({
  submitted,
  overdue,
  status,
}: {
  submitted: boolean;
  overdue: boolean;
  status?: string | null;
}) {
  const {theme, styles} =
    useAssignmentDetailsTheme();

  if (submitted) {
    return (
      <View
        style={[
          styles.badge,
          styles
            .submittedBadge,
        ]}>

        <CheckCircle2
          size={14}
          color={
            theme.colors.primary
          }
        />

        <Text
          style={
            styles
              .submittedBadgeText
          }>
          {formatLabel(
            status ||
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
          styles.badge,
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
        styles.badge,
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

  const date =
    new Date(item.due_at);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return false;
  }

  return (
    date.getTime() <
    Date.now()
  );
}

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return 'Not specified';
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

  return date.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
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
      character =>
        character.toUpperCase(),
    );
}

function getSuccessMessage(
  response: any,
) {
  return (
    response?.message ||
    response?.data?.message ||
    'Your assignment has been submitted successfully.'
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

    keyboard: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: 18,

      paddingTop: 14,

      paddingBottom: 40,
    },

    topBar: {
      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',
    },

    backButton: {
      width: 46,

      height: 46,

      borderRadius: 15,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.13
          : 0.035,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    topTitle: {
      color:
        theme.colors.textPrimary,

      fontSize: 15,

      fontWeight: '900',
    },

    topSpacer: {
      width: 44,
    },

    heroCard: {
      marginTop: 24,

      padding: 19,

      borderRadius: 23,

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surface,

      shadowColor:
        theme.colors.shadow,

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

    heroIcon: {
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

    title: {
      marginTop: 15,

      color:
        theme.colors.textPrimary,

      fontSize: 22,

      lineHeight: 29,

      fontWeight: '900',
    },

    courseName: {
      marginTop: 5,

      color:
        theme.colors.primary,

      fontSize: 10,

      fontWeight: '800',
    },

    statusRow: {
      marginTop: 14,

      flexDirection: 'row',
    },

    sectionTitle: {
      marginTop: 26,

      marginBottom: 10,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    infoCard: {
      overflow: 'hidden',

      borderRadius: 20,

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

    infoRow: {
      minHeight: 65,

      paddingHorizontal: 14,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 12,
    },

    infoIcon: {
      width: 40,

      height: 40,

      borderRadius: 13,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .surfaceSoft,

      borderWidth: 1,

      borderColor:
        theme.colors.border,
    },

    infoContent: {
      flex: 1,
    },

    infoLabel: {
      color:
        theme.colors.textLight,

      fontSize: 8,

      fontWeight: '700',
    },

    infoValue: {
      marginTop: 3,

      color:
        theme.colors.textPrimary,

      fontSize: 11,

      fontWeight: '800',
    },

    divider: {
      height: 1,

      marginLeft: 64,

      backgroundColor:
        theme.colors
          .borderStrong,
    },

    textCard: {
      padding: 17,

      borderRadius: 20,

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
          ? 0.09
          : 0.025,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    bodyText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 19,
    },

    answerBox: {
      minHeight: 180,

      padding: 16,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

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

    answerBoxSubmitted: {
      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    answerInput: {
      flex: 1,

      minHeight: 145,

      padding: 0,

      color:
        theme.colors.textPrimary,

      fontSize: 12,

      lineHeight: 20,

      fontWeight: '500',
    },

    answerHint: {
      marginTop: 8,

      paddingHorizontal: 4,

      color:
        theme.colors.textLight,

      fontSize: 8,

      lineHeight: 14,
    },

    feedbackCard: {
      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        theme.colors.secondary,

      backgroundColor:
        theme.colors.secondarySoft,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.09
          : 0.025,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    feedbackText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    marksText: {
      marginTop: 12,

      color:
        theme.colors.secondaryStrong,

      fontSize: 12,

      fontWeight: '900',
    },

    badge: {
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

      fontSize: 9,

      fontWeight: '900',
    },

    overdueBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    overdueBadgeText: {
      color:
        theme.colors.danger,

      fontSize: 9,

      fontWeight: '900',
    },

    pendingBadge: {
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    pendingBadgeText: {
      color:
        theme.colors.warning,

      fontSize: 9,

      fontWeight: '900',
    },

    submitButton: {
      height: 58,

      marginTop: 27,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 8,

      borderRadius: 18,

      backgroundColor:
        theme.colors.primary,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity: 0.12,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    submitButtonDisabled: {
      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    submitButtonText: {
      color: theme.colors.black,

      fontSize: 13,

      fontWeight: '900',
    },

    submitButtonTextDisabled: {
      color:
        theme.colors.textLight,
    },

    submittedBox: {
      marginTop: 27,

      padding: 16,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        theme.colors.secondary,

      backgroundColor:
        theme.colors.secondarySoft,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.09
          : 0.025,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    submittedTextArea: {
      flex: 1,
    },

    submittedTitle: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 11,

      fontWeight: '900',
    },

    submittedText: {
      marginTop: 3,

      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      lineHeight: 15,
    },

    centerState: {
      flex: 1,

      paddingHorizontal: 30,

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

    errorTitle: {
      marginTop: 14,

      color:
        theme.colors.textPrimary,

      fontSize: 18,

      fontWeight: '900',
    },

    errorText: {
      marginTop: 7,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,

      textAlign: 'center',
    },

    retryButton: {
      marginTop: 20,

      paddingHorizontal: 18,

      paddingVertical: 11,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 6,

      borderRadius: 13,

      backgroundColor:
        theme.colors.primary,
    },

    retryText: {
      color: theme.colors.black,

      fontSize: 10,

      fontWeight: '900',
    },

    pressed: {
      opacity: 0.78,
    },
  });