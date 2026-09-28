import React, {
  useCallback,
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
  TextInput,
  View,
} from 'react-native';

import {useFocusEffect} from '@react-navigation/native';

import {
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  History,
  PlayCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
} from 'lucide-react-native';

import {
  getStudentTestHistory,
  getStudentTests,
  type StudentTest,
  type StudentTestHistory,
} from '../../services/quizApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type QuizTab = 'available' | 'history';

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  softColor: string;
};

type SummaryRowProps = {
  label: string;
  value: string;
  color: string;
  icon: React.ComponentType<any>;
};

function useQuizTheme() {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  return {theme, styles};
}

function safeStatus(value: string) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function isUpcoming(test: StudentTest) {
  const status = safeStatus(test.status);

  if (
    status.includes('upcoming') ||
    status.includes('scheduled') ||
    status.includes('future')
  ) {
    return true;
  }

  if (test.startAt) {
    const time = Date.parse(test.startAt);

    if (
      Number.isFinite(time) &&
      time > Date.now()
    ) {
      return true;
    }
  }

  return false;
}

function isCompletedTest(test: StudentTest) {
  const status = safeStatus(test.status);

  return [
    'completed',
    'submitted',
    'finished',
    'graded',
  ].some(value => status.includes(value));
}

function formatDate(value: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function QuizScreen() {
  const {theme, styles} = useQuizTheme();
  const {accessToken} = useApp();

  const [activeTab, setActiveTab] =
    useState<QuizTab>('available');

  const [search, setSearch] =
    useState('');

  const [tests, setTests] =
    useState<StudentTest[]>([]);

  const [history, setHistory] =
    useState<StudentTestHistory[]>([]);

  const [serverAvailable, setServerAvailable] =
    useState<number | null>(null);

  const [serverUpcoming, setServerUpcoming] =
    useState<number | null>(null);

  const [serverCompleted, setServerCompleted] =
    useState<number | null>(null);

  const [serverPassed, setServerPassed] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadData = useCallback(
    async (showLoader = true) => {
      if (!accessToken) {
        setTests([]);
        setHistory([]);
        setError(
          'Student session not found. Please sign in again.',
        );
        setLoading(false);
        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        }

        setError('');

        const [testsResult, historyResult] =
          await Promise.allSettled([
            getStudentTests(accessToken),
            getStudentTestHistory(accessToken),
          ]);

        if (testsResult.status === 'fulfilled') {
          setTests(testsResult.value.items);
          setServerAvailable(
            testsResult.value.summary.available,
          );
          setServerUpcoming(
            testsResult.value.summary.upcoming,
          );
        } else {
          setTests([]);
          setServerAvailable(null);
          setServerUpcoming(null);
        }

        if (historyResult.status === 'fulfilled') {
          setHistory(historyResult.value.items);
          setServerCompleted(
            historyResult.value.summary.completed,
          );
          setServerPassed(
            historyResult.value.summary.passed,
          );
        } else {
          setHistory([]);
          setServerCompleted(null);
          setServerPassed(null);
        }

        if (
          testsResult.status === 'rejected' &&
          historyResult.status === 'rejected'
        ) {
          const reason =
            testsResult.reason instanceof Error
              ? testsResult.reason.message
              : historyResult.reason instanceof Error
                ? historyResult.reason.message
                : 'Unable to load tests and quiz history.';

          setError(reason);
        } else if (testsResult.status === 'rejected') {
          setError(
            'Available tests could not be loaded. Quiz history is still available.',
          );
        } else if (historyResult.status === 'rejected') {
          setError(
            'Quiz history could not be loaded. Available tests are still shown.',
          );
        }
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [accessToken],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();

      return undefined;
    }, [loadData]),
  );

  const handleRefresh =
    useCallback(async () => {
      setRefreshing(true);
      await loadData(false);
      setRefreshing(false);
    }, [loadData]);

  const upcomingDerived = useMemo(
    () => tests.filter(isUpcoming).length,
    [tests],
  );

  const availableDerived = useMemo(
    () =>
      tests.filter(
        item =>
          !isUpcoming(item) &&
          !isCompletedTest(item),
      ).length,
    [tests],
  );

  const completedDerived = history.length;

  const passedDerived = useMemo(
    () =>
      history.filter(
        item => item.passed === true,
      ).length,
    [history],
  );

  const availableCount =
    serverAvailable ?? availableDerived;

  const upcomingCount =
    serverUpcoming ?? upcomingDerived;

  const completedCount =
    serverCompleted ?? completedDerived;

  const passedCount =
    serverPassed ?? passedDerived;

  const normalizedSearch =
    search.trim().toLowerCase();

  const visibleTests = useMemo(
    () =>
      tests.filter(item => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          item.title,
          item.description,
          item.status,
          item.type,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      }),
    [tests, normalizedSearch],
  );

  const visibleHistory = useMemo(
    () =>
      history.filter(item => {
        if (!normalizedSearch) {
          return true;
        }

        return [
          item.title,
          item.status,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      }),
    [history, normalizedSearch],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.brandPill}>
              <Sparkles
                size={14}
                color={theme.colors.primary}
                strokeWidth={2.3}
              />

              <Text style={styles.eyebrow}>
                ASSESSMENT CENTER
              </Text>
            </View>

            <Image
              source={require('../../assets/seekho-login-logo-transparent.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.heroTitleRow}>
            <View style={styles.heroTitleArea}>
              <Text style={styles.title}>
                Tests & Quizzes
              </Text>

              <Text style={styles.subtitle}>
                Real assessments assigned to your student account,
                with attempt history from the academy server.
              </Text>
            </View>

            <View style={styles.heroIcon}>
              <ClipboardCheck
                size={27}
                color={theme.colors.primary}
                strokeWidth={2.1}
              />
            </View>
          </View>

          <View style={styles.heroAccentRow}>
            <View style={styles.heroAccentOrange} />
            <View style={styles.heroAccentGreen} />
          </View>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="AVAILABLE NOW"
            value={availableCount}
            icon={PlayCircle}
            color={theme.colors.primary}
            softColor={theme.colors.primarySoft}
          />

          <StatCard
            label="UPCOMING"
            value={upcomingCount}
            icon={Clock3}
            color={theme.colors.info}
            softColor={
              theme.dark
                ? 'rgba(120, 182, 255, 0.10)'
                : '#EEF5FD'
            }
          />

          <StatCard
            label="COMPLETED"
            value={completedCount}
            icon={CheckCircle2}
            color={theme.colors.secondary}
            softColor={theme.colors.secondarySoft}
          />

          <StatCard
            label="PASSED"
            value={passedCount}
            icon={Trophy}
            color={theme.colors.secondaryStrong}
            softColor={theme.colors.secondarySoft}
          />
        </View>

        <View style={styles.toolbar}>
          <View style={styles.tabs}>
            <Pressable
              onPress={() => setActiveTab('available')}
              style={({pressed}) => [
                styles.tabButton,
                activeTab === 'available' &&
                  styles.tabButtonActive,
                pressed && styles.pressed,
              ]}>
              <PlayCircle
                size={15}
                color={
                  activeTab === 'available'
                    ? theme.colors.black
                    : theme.colors.iconMuted
                }
                strokeWidth={2.2}
              />

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'available' &&
                    styles.tabTextActive,
                ]}>
                Available Tests
              </Text>

              <View
                style={[
                  styles.tabCount,
                  activeTab === 'available' &&
                    styles.tabCountActive,
                ]}>
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === 'available' &&
                      styles.tabCountTextActive,
                  ]}>
                  {availableCount + upcomingCount}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('history')}
              style={({pressed}) => [
                styles.tabButton,
                activeTab === 'history' &&
                  styles.tabButtonActive,
                pressed && styles.pressed,
              ]}>
              <History
                size={15}
                color={
                  activeTab === 'history'
                    ? theme.colors.black
                    : theme.colors.iconMuted
                }
                strokeWidth={2.2}
              />

              <Text
                style={[
                  styles.tabText,
                  activeTab === 'history' &&
                    styles.tabTextActive,
                ]}>
                My History
              </Text>

              <View
                style={[
                  styles.tabCount,
                  activeTab === 'history' &&
                    styles.tabCountActive,
                ]}>
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === 'history' &&
                      styles.tabCountTextActive,
                  ]}>
                  {completedCount}
                </Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.searchBox}>
            <View style={styles.searchIconBox}>
              <Search
                size={17}
                color={theme.colors.primary}
                strokeWidth={2.2}
              />
            </View>

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={
                activeTab === 'available'
                  ? 'Search tests...'
                  : 'Search history...'
              }
              placeholderTextColor={theme.colors.textLight}
              selectionColor={theme.colors.primary}
              style={styles.searchInput}
            />
          </View>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <View style={styles.errorTopRow}>
              <RefreshCw
                size={18}
                color={theme.colors.warning}
                strokeWidth={2.2}
              />

              <Text style={styles.errorTitle}>
                Some assessment data could not be loaded
              </Text>
            </View>

            <Text style={styles.errorText}>
              {error}
            </Text>

            <Pressable
              onPress={() => void loadData()}
              style={({pressed}) => [
                styles.retryButton,
                pressed && styles.pressed,
              ]}>
              <RefreshCw
                size={14}
                color={theme.colors.primary}
                strokeWidth={2.3}
              />

              <Text style={styles.retryButtonText}>
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
            />

            <Text style={styles.loadingTitle}>
              Loading assessments
            </Text>

            <Text style={styles.loadingText}>
              Fetching your tests and attempt history from the academy.
            </Text>
          </View>
        ) : activeTab === 'available' ? (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleArea}>
                <Text style={styles.sectionEyebrow}>
                  READY TO ATTEMPT
                </Text>

                <Text style={styles.sectionTitle}>
                  Available Assessments
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Tests currently assigned to your student account.
                </Text>
              </View>

              <View style={styles.availableBadge}>
                <PlayCircle
                  size={13}
                  color={theme.colors.primary}
                  strokeWidth={2.2}
                />

                <Text style={styles.availableBadgeText}>
                  {visibleTests.length} Tests
                </Text>
              </View>
            </View>

            {visibleTests.length > 0 ? (
              <View style={styles.listGap}>
                {visibleTests.map(item => (
                  <TestCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </View>
            ) : (
              <EmptyState
                history={false}
              />
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleArea}>
                <Text style={styles.sectionEyebrow}>
                  PERFORMANCE
                </Text>

                <Text style={styles.sectionTitle}>
                  Assessment History
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Review completed tests, scores and results returned by the academy.
                </Text>
              </View>

              <View style={styles.availableBadge}>
                <History
                  size={13}
                  color={theme.colors.primary}
                  strokeWidth={2.2}
                />

                <Text style={styles.availableBadgeText}>
                  {visibleHistory.length} Attempts
                </Text>
              </View>
            </View>

            {visibleHistory.length > 0 ? (
              <View style={styles.listGap}>
                {visibleHistory.map(item => (
                  <HistoryCard
                    key={item.id}
                    item={item}
                  />
                ))}
              </View>
            ) : (
              <EmptyState history />
            )}
          </>
        )}

        {!loading ? (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.summaryIconBox}>
                <BookOpenCheck
                  size={21}
                  color={theme.colors.secondary}
                  strokeWidth={2.2}
                />
              </View>

              <View style={styles.summaryHeaderText}>
                <Text style={styles.summaryEyebrow}>
                  YOUR ASSESSMENTS
                </Text>

                <Text style={styles.summaryTitle}>
                  Assessment Summary
                </Text>
              </View>
            </View>

            <Text style={styles.summaryDescription}>
              These counts are now populated from the student tests and quiz-history APIs.
            </Text>

            <View style={styles.summaryRows}>
              <SummaryRow
                label="Available now"
                value={`${availableCount}`}
                color={theme.colors.primary}
                icon={PlayCircle}
              />

              <Divider />

              <SummaryRow
                label="Upcoming"
                value={`${upcomingCount}`}
                color={theme.colors.info}
                icon={Clock3}
              />

              <Divider />

              <SummaryRow
                label="Completed"
                value={`${completedCount}`}
                color={theme.colors.secondary}
                icon={CheckCircle2}
              />

              <Divider />

              <SummaryRow
                label="Passed"
                value={`${passedCount}`}
                color={theme.colors.secondaryStrong}
                icon={Trophy}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function TestCard({item}: {item: StudentTest}) {
  const {theme, styles} = useQuizTheme();

  const upcoming = isUpcoming(item);

  const meta: string[] = [];

  if (item.type) {
    meta.push(item.type);
  }

  if (item.questionsCount !== null) {
    meta.push(`${item.questionsCount} questions`);
  }

  if (item.durationMinutes !== null) {
    meta.push(`${item.durationMinutes} min`);
  }

  const dateText = formatDate(
    item.startAt || item.endAt,
  );

  return (
    <View style={styles.assessmentCard}>
      <View style={styles.assessmentTopRow}>
        <View
          style={[
            styles.assessmentIcon,
            {
              backgroundColor: upcoming
                ? theme.dark
                  ? 'rgba(120, 182, 255, 0.10)'
                  : '#EEF5FD'
                : theme.colors.primarySoft,
            },
          ]}>
          {upcoming ? (
            <Clock3
              size={20}
              color={theme.colors.info}
              strokeWidth={2.2}
            />
          ) : (
            <PlayCircle
              size={20}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          )}
        </View>

        <View style={styles.assessmentContent}>
          <Text
            style={styles.assessmentTitle}
            numberOfLines={2}>
            {item.title}
          </Text>

          {meta.length > 0 ? (
            <Text style={styles.assessmentMeta}>
              {meta.join(' • ')}
            </Text>
          ) : null}
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: upcoming
                ? theme.dark
                  ? 'rgba(120, 182, 255, 0.10)'
                  : '#EEF5FD'
                : theme.colors.primarySoft,
            },
          ]}>
          <Text
            style={[
              styles.statusBadgeText,
              {
                color: upcoming
                  ? theme.colors.info
                  : theme.colors.primary,
              },
            ]}>
            {item.status ||
              (upcoming ? 'Upcoming' : 'Available')}
          </Text>
        </View>
      </View>

      {item.description ? (
        <Text
          style={styles.assessmentDescription}
          numberOfLines={3}>
          {item.description}
        </Text>
      ) : null}

      {dateText ? (
        <View style={styles.dateRow}>
          <Clock3
            size={13}
            color={theme.colors.iconMuted}
            strokeWidth={2}
          />

          <Text style={styles.dateText}>
            {dateText}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function HistoryCard({item}: {item: StudentTestHistory}) {
  const {theme, styles} = useQuizTheme();

  const passed = item.passed;
  const resultColor =
    passed === true
      ? theme.colors.secondary
      : passed === false
        ? theme.colors.danger
        : theme.colors.info;

  return (
    <View style={styles.assessmentCard}>
      <View style={styles.assessmentTopRow}>
        <View
          style={[
            styles.assessmentIcon,
            {
              backgroundColor:
                passed === true
                  ? theme.colors.secondarySoft
                  : theme.colors.surfaceSoft,
            },
          ]}>
          {passed === true ? (
            <Trophy
              size={20}
              color={theme.colors.secondary}
              strokeWidth={2.2}
            />
          ) : (
            <History
              size={20}
              color={resultColor}
              strokeWidth={2.2}
            />
          )}
        </View>

        <View style={styles.assessmentContent}>
          <Text
            style={styles.assessmentTitle}
            numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.assessmentMeta}>
            {item.completedAt
              ? formatDate(item.completedAt)
              : item.status || 'Completed attempt'}
          </Text>
        </View>

        {item.percentage !== null ? (
          <View style={styles.scorePill}>
            <Text
              style={[
                styles.scorePillText,
                {color: resultColor},
              ]}>
              {Math.round(item.percentage)}%
            </Text>
          </View>
        ) : null}
      </View>

      {item.score !== null &&
      item.total !== null ? (
        <View style={styles.historyFooter}>
          <CheckCircle2
            size={14}
            color={resultColor}
            strokeWidth={2.1}
          />

          <Text style={styles.historyFooterText}>
            {item.score} correct out of {item.total}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function EmptyState({history}: {history: boolean}) {
  const {theme, styles} = useQuizTheme();

  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyGlow} />

      <View style={styles.emptyIconBox}>
        {history ? (
          <History
            size={29}
            color={theme.colors.secondary}
            strokeWidth={2}
          />
        ) : (
          <ClipboardCheck
            size={30}
            color={theme.colors.primary}
            strokeWidth={2}
          />
        )}
      </View>

      <Text style={styles.emptyTitle}>
        {history
          ? 'No test history'
          : 'No tests available'}
      </Text>

      <Text style={styles.emptyDescription}>
        {history
          ? 'Your completed assessments and results will appear here.'
          : 'Published tests assigned to you will appear here automatically.'}
      </Text>

      <View style={styles.emptyHint}>
        <ShieldCheck
          size={14}
          color={theme.colors.secondary}
          strokeWidth={2.2}
        />

        <Text style={styles.emptyHintText}>
          Assessment data is loaded from your authenticated student account.
        </Text>
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  softColor,
}: StatCardProps) {
  const {styles} = useQuizTheme();

  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <Text style={styles.statLabel}>
          {label}
        </Text>

        <View
          style={[
            styles.statIcon,
            {backgroundColor: softColor},
          ]}>
          <Icon
            size={17}
            color={color}
            strokeWidth={2.2}
          />
        </View>
      </View>

      <Text style={[styles.statValue, {color}]}>
        {value}
      </Text>

      <View
        style={[
          styles.statAccent,
          {backgroundColor: color},
        ]}
      />
    </View>
  );
}

function SummaryRow({
  label,
  value,
  color,
  icon: Icon,
}: SummaryRowProps) {
  const {styles} = useQuizTheme();

  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLabelArea}>
        <View style={styles.summaryRowIcon}>
          <Icon
            size={15}
            color={color}
            strokeWidth={2.1}
          />
        </View>

        <Text style={styles.summaryLabel}>
          {label}
        </Text>
      </View>

      <Text style={[styles.summaryValue, {color}]}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  const {styles} = useQuizTheme();
  return <View style={styles.divider} />;
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 44,
    },

    heroCard: {
      overflow: 'hidden',
      padding: 18,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: theme.dark ? 0.22 : 0.12,
      shadowRadius: 18,
      elevation: 4,
    },

    heroTopRow: {
      minHeight: 38,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    brandPill: {
      minHeight: 31,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.primarySoft,
    },

    eyebrow: {
      color: theme.colors.primary,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.25,
    },

    logo: {
      width: 84,
      height: 34,
    },

    heroTitleRow: {
      marginTop: 18,
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 14,
    },

    heroTitleArea: {flex: 1},

    title: {
      color: theme.colors.textPrimary,
      fontSize: 29,
      lineHeight: 35,
      fontWeight: '900',
      letterSpacing: -0.6,
    },

    subtitle: {
      marginTop: 7,
      maxWidth: 285,
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 18,
    },

    heroIcon: {
      width: 52,
      height: 52,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.primarySoft,
    },

    heroAccentRow: {
      height: 4,
      marginTop: 18,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius: theme.radius.pill,
    },

    heroAccentOrange: {
      flex: 1.25,
      backgroundColor: theme.colors.primary,
    },

    heroAccentGreen: {
      flex: 1,
      backgroundColor: theme.colors.secondary,
    },

    statsGrid: {
      marginTop: 17,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    statCard: {
      width: '48.5%',
      minHeight: 112,
      marginBottom: 10,
      padding: 14,
      overflow: 'hidden',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },

    statTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },

    statLabel: {
      flex: 1,
      color: theme.colors.textLight,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 0.7,
    },

    statIcon: {
      width: 33,
      height: 33,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },

    statValue: {
      marginTop: 13,
      fontSize: 28,
      fontWeight: '900',
      letterSpacing: -0.5,
    },

    statAccent: {
      width: 28,
      height: 3,
      marginTop: 8,
      borderRadius: theme.radius.pill,
    },

    toolbar: {
      marginTop: 7,
      marginBottom: 25,
      padding: 6,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },

    tabs: {
      flexDirection: 'row',
      gap: 5,
    },

    tabButton: {
      flex: 1,
      minHeight: 44,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: 'transparent',
    },

    tabButtonActive: {
      borderColor: theme.colors.primaryStrong,
      backgroundColor: theme.colors.primary,
    },

    tabText: {
      color: theme.colors.textSecondary,
      fontSize: 9,
      fontWeight: '800',
    },

    tabTextActive: {color: theme.colors.black},

    tabCount: {
      minWidth: 21,
      height: 21,
      paddingHorizontal: 5,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSoft,
    },

    tabCountActive: {
      backgroundColor: 'rgba(5, 6, 5, 0.12)',
    },

    tabCountText: {
      color: theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '900',
    },

    tabCountTextActive: {color: theme.colors.black},

    searchBox: {
      height: 48,
      marginTop: 6,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 13,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.backgroundAlt,
    },

    searchIconBox: {
      width: 31,
      height: 31,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      backgroundColor: theme.colors.primarySoft,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      paddingVertical: 0,
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '600',
    },

    errorCard: {
      marginBottom: 18,
      padding: 15,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },

    errorTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    errorTitle: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    errorText: {
      marginTop: 7,
      color: theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    retryButton: {
      alignSelf: 'flex-start',
      minHeight: 34,
      marginTop: 11,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 10,
      backgroundColor: theme.colors.primarySoft,
    },

    retryButtonText: {
      color: theme.colors.primary,
      fontSize: 9,
      fontWeight: '900',
    },

    loadingCard: {
      minHeight: 220,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },

    loadingTitle: {
      marginTop: 15,
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '900',
    },

    loadingText: {
      maxWidth: 260,
      marginTop: 6,
      color: theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      textAlign: 'center',
    },

    sectionHeader: {
      marginBottom: 13,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },

    sectionTitleArea: {flex: 1},

    sectionEyebrow: {
      marginBottom: 4,
      color: theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.2,
    },

    sectionSubtitle: {
      maxWidth: 250,
      marginTop: 4,
      color: theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    availableBadge: {
      minHeight: 31,
      paddingHorizontal: 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.primarySoft,
    },

    availableBadgeText: {
      color: theme.colors.primaryStrong,
      fontSize: 8,
      fontWeight: '900',
    },

    listGap: {gap: 10},

    assessmentCard: {
      padding: 15,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },

    assessmentTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    assessmentIcon: {
      width: 43,
      height: 43,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },

    assessmentContent: {flex: 1},

    assessmentTitle: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '900',
    },

    assessmentMeta: {
      marginTop: 4,
      color: theme.colors.textSecondary,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: '700',
      textTransform: 'capitalize',
    },

    statusBadge: {
      maxWidth: 92,
      minHeight: 28,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
    },

    statusBadgeText: {
      fontSize: 7,
      fontWeight: '900',
      textTransform: 'capitalize',
      textAlign: 'center',
    },

    assessmentDescription: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    dateRow: {
      marginTop: 11,
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },

    dateText: {
      color: theme.colors.textLight,
      fontSize: 8,
      fontWeight: '700',
    },

    scorePill: {
      minWidth: 54,
      minHeight: 34,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      backgroundColor: theme.colors.surfaceSoft,
    },

    scorePillText: {
      fontSize: 12,
      fontWeight: '900',
    },

    historyFooter: {
      marginTop: 12,
      paddingTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: theme.colors.divider,
    },

    historyFooterText: {
      color: theme.colors.textSecondary,
      fontSize: 9,
      fontWeight: '700',
    },

    emptyCard: {
      minHeight: 282,
      paddingHorizontal: 28,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surface,
    },

    emptyGlow: {
      position: 'absolute',
      top: -55,
      right: -55,
      width: 150,
      height: 150,
      borderRadius: 150,
      backgroundColor: theme.colors.primarySoft,
    },

    emptyIconBox: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      backgroundColor: theme.colors.surfaceSoft,
    },

    emptyTitle: {
      marginTop: 18,
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
    },

    emptyDescription: {
      maxWidth: 270,
      marginTop: 7,
      color: theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    emptyHint: {
      minHeight: 38,
      marginTop: 18,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius: 12,
      backgroundColor: theme.colors.surfaceSoft,
    },

    emptyHintText: {
      maxWidth: 220,
      color: theme.colors.textSecondary,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: '700',
    },

    summaryCard: {
      marginTop: 17,
      padding: 17,
      borderWidth: 1,
      borderColor: theme.colors.borderStrong,
      borderRadius: 19,
      backgroundColor: theme.colors.surface,
    },

    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    summaryIconBox: {
      width: 43,
      height: 43,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor: theme.colors.secondarySoft,
    },

    summaryHeaderText: {flex: 1},

    summaryEyebrow: {
      color: theme.colors.secondaryStrong,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    summaryTitle: {
      marginTop: 3,
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },

    summaryDescription: {
      marginTop: 11,
      color: theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    summaryRows: {
      marginTop: 13,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: theme.colors.surfaceSoft,
    },

    summaryRow: {
      minHeight: 49,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    summaryLabelArea: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    summaryRowIcon: {
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      backgroundColor: theme.colors.surface,
    },

    summaryLabel: {
      color: theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },

    summaryValue: {
      fontSize: 12,
      fontWeight: '900',
    },

    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
    },

    pressed: {opacity: 0.82},
  });
