import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
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
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileQuestion,
  GraduationCap,
  Play,
  RefreshCw,
  Send,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {
  getAttemptId,
  getAttemptQuestions,
  getStudentTests,
  saveStudentTestAnswer,
  startStudentTest,
  StudentTest,
  submitStudentTest,
  TestQuestion,
} from '../../services/testApi';

import {useApp} from '../../state/AppContext';
import {theme} from '../../theme/theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Quiz'
>;

type AnswerMap = Record<
  string,
  {
    selectedOption: string;
    answerText: string;
  }
>;

export default function QuizScreen({
  navigation,
}: Props) {
  const {accessToken} = useApp();

  const [tests, setTests] =
    useState<StudentTest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTest, setActiveTest] =
    useState<StudentTest | null>(null);

  const [attemptId, setAttemptId] =
    useState<string | null>(null);

  const [questions, setQuestions] =
    useState<TestQuestion[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState<AnswerMap>({});

  const [startingId, setStartingId] =
    useState<string | null>(null);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const loadTests =
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
            await getStudentTests(
              accessToken,
            );

          setTests(
            response.items || [],
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load tests.';

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
    loadTests();
  }, [loadTests]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadTests(false);

      setRefreshing(false);
    };

  const startTest =
    async (
      test: StudentTest,
    ) => {
      if (
        !accessToken ||
        startingId
      ) {
        return;
      }

      try {
        setStartingId(test.id);

        const response =
          await startStudentTest(
            accessToken,
            test.id,
          );

        const newAttemptId =
          getAttemptId(response);

        const attemptQuestions =
          getAttemptQuestions(
            response,
          );

        if (!newAttemptId) {
          throw new Error(
            'Test started but attempt ID was not returned by the server.',
          );
        }

        if (
          attemptQuestions.length === 0
        ) {
          throw new Error(
            'No questions were returned for this test.',
          );
        }

        setActiveTest(
          response.data?.test ||
            response.test ||
            test,
        );

        setAttemptId(
          newAttemptId,
        );

        setQuestions(
          attemptQuestions,
        );

        setCurrentIndex(0);

        setAnswers({});
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to start test.';

        Alert.alert(
          'Unable to start test',
          message,
        );
      } finally {
        setStartingId(null);
      }
    };

  const currentQuestion =
    questions[currentIndex];

  const currentQuestionId =
    currentQuestion
      ? getQuestionId(
          currentQuestion,
        )
      : '';

  const currentAnswer =
    answers[
      currentQuestionId
    ] || {
      selectedOption: '',
      answerText: '',
    };

  const answeredCount =
    useMemo(
      () =>
        Object.values(
          answers,
        ).filter(
          item =>
            item.selectedOption ||
            item.answerText.trim(),
        ).length,
      [answers],
    );

  const saveCurrentAnswer =
    async () => {
      if (
        !accessToken ||
        !attemptId ||
        !currentQuestion
      ) {
        return false;
      }

      const questionId =
        getQuestionId(
          currentQuestion,
        );

      if (!questionId) {
        Alert.alert(
          'Question error',
          'Question ID was not returned by the server.',
        );

        return false;
      }

      const answer =
        answers[questionId];

      if (
        !answer ||
        (!answer.selectedOption &&
          !answer.answerText.trim())
      ) {
        Alert.alert(
          'Answer required',
          'Please answer this question first.',
        );

        return false;
      }

      try {
        setSaving(true);

        await saveStudentTestAnswer(
          accessToken,
          attemptId,
          {
            test_question_id:
              questionId,

            selected_option:
              answer.selectedOption,

            answer_text:
              answer.answerText.trim(),
          },
        );

        return true;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to save answer.';

        Alert.alert(
          'Answer not saved',
          message,
        );

        return false;
      } finally {
        setSaving(false);
      }
    };

  const goNext =
    async () => {
      const saved =
        await saveCurrentAnswer();

      if (!saved) {
        return;
      }

      if (
        currentIndex <
        questions.length - 1
      ) {
        setCurrentIndex(
          previous =>
            previous + 1,
        );
      }
    };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(
        previous =>
          previous - 1,
      );
    }
  };

  const submitAttempt =
    async () => {
      if (
        !accessToken ||
        !attemptId ||
        !activeTest
      ) {
        return;
      }

      const saved =
        await saveCurrentAnswer();

      if (!saved) {
        return;
      }

      Alert.alert(
        'Submit test',
        `You have answered ${answeredCount}/${questions.length} questions. Submit your test now?`,
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
        !attemptId
      ) {
        return;
      }

      try {
        setSubmitting(true);

        const response =
          await submitStudentTest(
            accessToken,
            attemptId,
          );

        const result =
          response.data ||
          response;

        const score =
          Number(
            result.obtained_marks ??
              result.score ??
              0,
          );

        const total =
          Number(
            result.total_marks ??
              result.total ??
              getTotalMarks(
                questions,
              ),
          );

        /*
         * Agar backend immediate
         * result deta hai to
         * QuizResult screen open.
         */
        navigation.replace(
          'QuizResult',
          {
            score,
            total,
          },
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to submit test.';

        Alert.alert(
          'Submission failed',
          message,
        );
      } finally {
        setSubmitting(false);
      }
    };

  const exitAttempt = () => {
    Alert.alert(
      'Leave test?',
      'Your test attempt is still active. Saved answers will remain on the server.',
      [
        {
          text: 'Stay',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',

          onPress: () => {
            setActiveTest(null);
            setAttemptId(null);
            setQuestions([]);
            setAnswers({});
            setCurrentIndex(0);
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={styles.safe}>
        <StatusBar
          barStyle="light-content"
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
            Loading tests...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  /*
   * ===================================================
   * ACTIVE TEST
   * ===================================================
   */

  if (
    activeTest &&
    currentQuestion
  ) {
    const options =
      getQuestionOptions(
        currentQuestion,
      );

    const isMcq =
      options.length > 0;

    return (
      <SafeAreaView
        style={styles.safe}>
        <StatusBar
          barStyle="light-content"
        />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }>

          <View
            style={
              styles.testTopBar
            }>

            <Pressable
              onPress={
                exitAttempt
              }
              style={
                styles.backButton
              }>

              <ArrowLeft
                size={21}
                color={
                  theme.colors
                    .textPrimary
                }
              />

            </Pressable>

            <View
              style={
                styles.testTopText
              }>

              <Text
                numberOfLines={1}
                style={
                  styles.testTopTitle
                }>
                {activeTest.title}
              </Text>

              <Text
                style={
                  styles.questionCounter
                }>
                Question{' '}
                {currentIndex + 1}{' '}
                of{' '}
                {questions.length}
              </Text>

            </View>

          </View>

          {/* PROGRESS */}

          <View
            style={
              styles.progressBackground
            }>

            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(
                    ((currentIndex +
                      1) /
                      questions.length) *
                      100,
                  )}%`,
                },
              ]}
            />

          </View>

          {/* QUESTION */}

          <View
            style={
              styles.questionCard
            }>

            <View
              style={
                styles.questionHeader
              }>

              <View
                style={
                  styles.questionIcon
                }>

                <FileQuestion
                  size={22}
                  color={
                    theme.colors.primary
                  }
                />

              </View>

              {!!currentQuestion.marks && (
                <Text
                  style={
                    styles.marksBadge
                  }>
                  {
                    currentQuestion.marks
                  }{' '}
                  mark
                  {Number(
                    currentQuestion.marks,
                  ) === 1
                    ? ''
                    : 's'}
                </Text>
              )}

            </View>

            <Text
              style={
                styles.questionText
              }>
              {
                currentQuestion.question_text
              }
            </Text>

            {!!currentQuestion.difficulty && (
              <Text
                style={
                  styles.difficulty
                }>
                {currentQuestion.difficulty}
              </Text>
            )}

          </View>

          {/* MCQ OPTIONS */}

          {isMcq ? (
            <View
              style={
                styles.optionsArea
              }>

              {options.map(
                option => {
                  const selected =
                    currentAnswer.selectedOption ===
                    option.key;

                  return (
                    <Pressable
                      key={
                        option.key
                      }
                      disabled={
                        saving ||
                        submitting
                      }
                      onPress={() =>
                        setAnswers(
                          previous => ({
                            ...previous,

                            [currentQuestionId]:
                              {
                                ...(
                                  previous[
                                    currentQuestionId
                                  ] || {
                                    selectedOption:
                                      '',
                                    answerText:
                                      '',
                                  }
                                ),

                                selectedOption:
                                  option.key,
                              },
                          }),
                        )
                      }
                      style={[
                        styles.optionCard,

                        selected &&
                          styles
                            .optionCardSelected,
                      ]}>

                      <View
                        style={[
                          styles.optionLetter,

                          selected &&
                            styles
                              .optionLetterSelected,
                        ]}>

                        {selected ? (
                          <Check
                            size={15}
                            color="#07130B"
                            strokeWidth={
                              3
                            }
                          />
                        ) : (
                          <Text
                            style={
                              styles.optionLetterText
                            }>
                            {option.key}
                          </Text>
                        )}

                      </View>

                      <Text
                        style={[
                          styles.optionText,

                          selected &&
                            styles
                              .optionTextSelected,
                        ]}>
                        {option.text}
                      </Text>

                    </Pressable>
                  );
                },
              )}

            </View>
          ) : (
            <>
              <Text
                style={
                  styles.sectionTitle
                }>
                YOUR ANSWER
              </Text>

              <View
                style={
                  styles.answerBox
                }>

                <TextInput
                  value={
                    currentAnswer.answerText
                  }
                  onChangeText={
                    value =>
                      setAnswers(
                        previous => ({
                          ...previous,

                          [currentQuestionId]:
                            {
                              ...(
                                previous[
                                  currentQuestionId
                                ] || {
                                  selectedOption:
                                    '',
                                  answerText:
                                    '',
                                }
                              ),

                              answerText:
                                value,
                            },
                        }),
                      )
                  }
                  editable={
                    !saving &&
                    !submitting
                  }
                  multiline
                  textAlignVertical="top"
                  placeholder="Write your answer..."
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
            </>
          )}

          {/* NAVIGATION */}

          <View
            style={
              styles.navigationRow
            }>

            <Pressable
              disabled={
                currentIndex === 0 ||
                saving ||
                submitting
              }
              onPress={
                goPrevious
              }
              style={[
                styles.previousButton,

                currentIndex ===
                  0 &&
                  styles
                    .disabledButton,
              ]}>

              <ArrowLeft
                size={17}
                color={
                  currentIndex ===
                  0
                    ? theme.colors
                        .textLight
                    : theme.colors
                        .textPrimary
                }
              />

              <Text
                style={[
                  styles
                    .previousButtonText,

                  currentIndex ===
                    0 &&
                    styles.disabledText,
                ]}>
                Previous
              </Text>

            </Pressable>

            {currentIndex ===
            questions.length - 1 ? (
              <Pressable
                disabled={
                  saving ||
                  submitting
                }
                onPress={
                  submitAttempt
                }
                style={
                  styles.submitButton
                }>

                {submitting ||
                saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#07130B"
                  />
                ) : (
                  <>
                    <Send
                      size={17}
                      color="#07130B"
                    />

                    <Text
                      style={
                        styles
                          .submitButtonText
                      }>
                      Submit Test
                    </Text>
                  </>
                )}

              </Pressable>
            ) : (
              <Pressable
                disabled={saving}
                onPress={
                  goNext
                }
                style={
                  styles.nextButton
                }>

                {saving ? (
                  <ActivityIndicator
                    size="small"
                    color="#07130B"
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles
                          .nextButtonText
                      }>
                      Save & Next
                    </Text>

                    <ArrowRight
                      size={17}
                      color="#07130B"
                    />
                  </>
                )}

              </Pressable>
            )}

          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  /*
   * ===================================================
   * TEST LIST
   * ===================================================
   */

  return (
    <SafeAreaView
      style={styles.safe}>
      <StatusBar
        barStyle="light-content"
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

        <View
          style={styles.header}>

          <View>

            <Text
              style={
                styles.eyebrow
              }>
              TEST YOUR SKILLS
            </Text>

            <Text
              style={
                styles.pageTitle
              }>
              Tests & Quizzes
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Attempt your published
              tests and quizzes.
            </Text>

          </View>

          <View
            style={
              styles.headerIcon
            }>

            <GraduationCap
              size={26}
              color={
                theme.colors.primary
              }
            />

          </View>

        </View>

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
                loadTests()
              }
              style={
                styles.retryButton
              }>

              <RefreshCw
                size={15}
                color="#07130B"
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

        <View
          style={
            styles.sectionHeader
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            AVAILABLE TESTS
          </Text>

          <View
            style={
              styles.countBadge
            }>

            <Text
              style={
                styles.countText
              }>
              {tests.length}
            </Text>

          </View>

        </View>

        {tests.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <FileQuestion
              size={36}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.emptyTitle
              }>
              No tests available
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Published tests and
              quizzes will appear here.
            </Text>

          </View>
        ) : (
          tests.map(test => (
            <TestCard
              key={test.id}
              test={test}
              starting={
                startingId ===
                test.id
              }
              onStart={() =>
                startTest(test)
              }
            />
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * TEST CARD
 * =====================================================
 */

function TestCard({
  test,
  starting,
  onStart,
}: {
  test: StudentTest;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <View
      style={styles.testCard}>

      <View
        style={
          styles.testCardTop
        }>

        <View
          style={
            styles.testIcon
          }>

          <FileQuestion
            size={22}
            color={
              theme.colors.primary
            }
          />

        </View>

        <View
          style={
            styles.testHeading
          }>

          <Text
            style={
              styles.testTitle
            }>
            {test.title ||
              'Test'}
          </Text>

          {!!test.target_course_name && (
            <Text
              style={
                styles.courseName
              }>
              {
                test.target_course_name
              }
            </Text>
          )}

        </View>

      </View>

      {!!test.description && (
        <Text
          numberOfLines={3}
          style={
            styles.description
          }>
          {test.description}
        </Text>
      )}

      <View
        style={
          styles.metaRow
        }>

        {!!test.duration_minutes && (
          <View
            style={
              styles.metaItem
            }>

            <Clock3
              size={15}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.metaText
              }>
              {
                test.duration_minutes
              }{' '}
              min
            </Text>

          </View>
        )}

        {!!test.passing_percentage && (
          <View
            style={
              styles.metaItem
            }>

            <CheckCircle2
              size={15}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.metaText
              }>
              Pass{' '}
              {
                test.passing_percentage
              }
              %
            </Text>

          </View>
        )}

        {!!test.max_attempts && (
          <View
            style={
              styles.metaItem
            }>

            <RefreshCw
              size={14}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <Text
              style={
                styles.metaText
              }>
              {
                test.max_attempts
              }{' '}
              attempt
              {test.max_attempts ===
              1
                ? ''
                : 's'}
            </Text>

          </View>
        )}

      </View>

      <Pressable
        disabled={
          starting ||
          test.can_attempt === false
        }
        onPress={onStart}
        style={[
          styles.startButton,

          test.can_attempt ===
            false &&
            styles.disabledButton,
        ]}>

        {starting ? (
          <ActivityIndicator
            size="small"
            color="#07130B"
          />
        ) : (
          <>
            <Play
              size={17}
              color={
                test.can_attempt ===
                false
                  ? theme.colors
                      .textLight
                  : '#07130B'
              }
            />

            <Text
              style={[
                styles.startButtonText,

                test.can_attempt ===
                  false &&
                  styles.disabledText,
              ]}>
              {test.can_attempt ===
              false
                ? 'No Attempts Available'
                : 'Start Test'}
            </Text>
          </>
        )}

      </Pressable>

    </View>
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function getQuestionId(
  question: TestQuestion,
) {
  return String(
    question.test_question_id ||
      question.id ||
      '',
  );
}

function getQuestionOptions(
  question: TestQuestion,
) {
  const values = [
    {
      key: 'A',
      text:
        question.option_a,
    },
    {
      key: 'B',
      text:
        question.option_b,
    },
    {
      key: 'C',
      text:
        question.option_c,
    },
    {
      key: 'D',
      text:
        question.option_d,
    },
  ];

  return values.filter(
    item =>
      typeof item.text ===
        'string' &&
      item.text.trim()
        .length > 0,
  ) as {
    key: string;
    text: string;
  }[];
}

function getTotalMarks(
  questions: TestQuestion[],
) {
  return questions.reduce(
    (total, question) =>
      total +
      Number(
        question.marks || 0,
      ),
    0,
  );
}

/*
 * =====================================================
 * STYLES
 * =====================================================
 */

const styles =
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
      letterSpacing: 1.5,
    },

    pageTitle: {
      marginTop: 4,
      color:
        theme.colors
          .textPrimary,
      fontSize: 28,
      fontWeight: '900',
    },

    subtitle: {
      marginTop: 6,
      color:
        theme.colors
          .textSecondary,
      fontSize: 11,
      lineHeight: 18,
    },

    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
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
      letterSpacing: 1,
    },

    countBadge: {
      minWidth: 30,
      paddingHorizontal: 8,
      paddingVertical: 5,
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor:
        'rgba(55,214,122,0.10)',
    },

    countText: {
      color:
        theme.colors.primary,
      fontSize: 10,
      fontWeight: '900',
    },

    errorCard: {
      marginTop: 17,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,107,107,0.08)',
    },

    errorText: {
      flex: 1,
      color: '#FF8C8C',
      fontSize: 10,
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

    retryText: {
      color: '#07130B',
      fontSize: 9,
      fontWeight: '900',
    },

    testCard: {
      marginBottom: 13,
      padding: 16,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    testCardTop: {
      flexDirection: 'row',
      gap: 12,
    },

    testIcon: {
      width: 47,
      height: 47,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    testHeading: {
      flex: 1,
    },

    testTitle: {
      color:
        theme.colors
          .textPrimary,
      fontSize: 15,
      fontWeight: '900',
    },

    courseName: {
      marginTop: 4,
      color:
        theme.colors.primary,
      fontSize: 9,
      fontWeight: '800',
    },

    description: {
      marginTop: 12,
      color:
        theme.colors
          .textSecondary,
      fontSize: 10,
      lineHeight: 17,
    },

    metaRow: {
      marginTop: 14,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 13,
    },

    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    metaText: {
      color:
        theme.colors
          .textSecondary,
      fontSize: 9,
      fontWeight: '700',
    },

    startButton: {
      height: 48,
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      borderRadius: 14,
      backgroundColor:
        theme.colors.primary,
    },

    startButtonText: {
      color: '#07130B',
      fontSize: 11,
      fontWeight: '900',
    },

    emptyCard: {
      paddingVertical: 38,
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
      color:
        theme.colors
          .textSecondary,
      fontSize: 10,
    },

    testTopBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    testTopText: {
      flex: 1,
    },

    testTopTitle: {
      color:
        theme.colors
          .textPrimary,
      fontSize: 14,
      fontWeight: '900',
    },

    questionCounter: {
      marginTop: 3,
      color:
        theme.colors
          .textSecondary,
      fontSize: 9,
    },

    progressBackground: {
      height: 7,
      marginTop: 20,
      overflow: 'hidden',
      borderRadius: 10,
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    progressFill: {
      height: 7,
      borderRadius: 10,
      backgroundColor:
        theme.colors.primary,
    },

    questionCard: {
      marginTop: 20,
      padding: 18,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    questionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    questionIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    marksBadge: {
      color:
        theme.colors.primary,
      fontSize: 9,
      fontWeight: '900',
    },

    questionText: {
      marginTop: 16,
      color:
        theme.colors
          .textPrimary,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '800',
    },

    difficulty: {
      marginTop: 10,
      color:
        theme.colors
          .textSecondary,
      fontSize: 9,
    },

    optionsArea: {
      marginTop: 16,
      gap: 9,
    },

    optionCard: {
      minHeight: 58,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    optionCardSelected: {
      borderColor:
        theme.colors.primary,
      backgroundColor:
        'rgba(55,214,122,0.06)',
    },

    optionLetter: {
      width: 30,
      height: 30,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    optionLetterSelected: {
      backgroundColor:
        theme.colors.primary,
    },

    optionLetterText: {
      color:
        theme.colors
          .textSecondary,
      fontSize: 10,
      fontWeight: '900',
    },

    optionText: {
      flex: 1,
      color:
        theme.colors
          .textSecondary,
      fontSize: 11,
      lineHeight: 17,
    },

    optionTextSelected: {
      color:
        theme.colors
          .textPrimary,
      fontWeight: '700',
    },

    answerBox: {
      minHeight: 160,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    answerInput: {
      minHeight: 130,
      padding: 0,
      color:
        theme.colors
          .textPrimary,
      fontSize: 12,
      lineHeight: 19,
    },

    navigationRow: {
      marginTop: 24,
      flexDirection: 'row',
      gap: 10,
    },

    previousButton: {
      flex: 1,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 6,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.colors
          .borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    previousButtonText: {
      color:
        theme.colors
          .textPrimary,
      fontSize: 10,
      fontWeight: '900',
    },

    nextButton: {
      flex: 1.2,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 6,
      borderRadius: 14,
      backgroundColor:
        theme.colors.primary,
    },

    nextButtonText: {
      color: '#07130B',
      fontSize: 10,
      fontWeight: '900',
    },

    submitButton: {
      flex: 1.2,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
      borderRadius: 14,
      backgroundColor:
        theme.colors.primary,
    },

    submitButtonText: {
      color: '#07130B',
      fontSize: 10,
      fontWeight: '900',
    },

    disabledButton: {
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    disabledText: {
      color:
        theme.colors.textLight,
    },
  });