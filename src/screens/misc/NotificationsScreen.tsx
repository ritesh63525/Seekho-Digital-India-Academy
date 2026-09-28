import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AlertCircle,
  BellRing,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Inbox,
  Megaphone,
  RefreshCw,
  Sparkles,
} from 'lucide-react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {
  getStudentAnnouncements,
  markStudentAnnouncementRead,
  type StudentAnnouncement,
} from '../../services/announcementApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type AnnouncementFilter =
  | 'all'
  | 'unread';

const PAGE_SIZE = 20;

type NotificationPalette = {
  bg: string;
  panel: string;
  panel2: string;
  panel3: string;
  border: string;
  borderStrong: string;

  white: string;
  text: string;
  muted: string;
  onAccent: string;

  green: string;
  greenSoft: string;
  greenBorder: string;

  orange: string;
  orangeSoft: string;
  orangeBorder: string;

  blue: string;
  blueSoft: string;
  blueBorder: string;

  danger: string;
  dangerSoft: string;
};

function makeNotificationPalette(
  theme: AppTheme,
): NotificationPalette {
  return {
    bg: theme.colors.background,
    panel: theme.colors.surface,
    panel2: theme.colors.surfaceElevated,
    panel3: theme.colors.surfaceSoft,
    border: theme.colors.border,
    borderStrong: theme.colors.borderStrong,

    white: theme.colors.textPrimary,
    text: theme.colors.textSecondary,
    muted: theme.colors.textLight,
    onAccent: theme.colors.black,

    green: theme.colors.secondary,
    greenSoft: theme.colors.secondarySoft,
    greenBorder: theme.dark
      ? 'rgba(66, 177, 107, 0.28)'
      : '#BFE3CD',

    orange: theme.colors.primary,
    orangeSoft: theme.colors.primarySoft,
    orangeBorder: theme.dark
      ? 'rgba(248, 114, 39, 0.28)'
      : '#F2C5AA',

    blue: theme.colors.info,
    blueSoft: theme.dark
      ? 'rgba(120, 182, 255, 0.10)'
      : '#EEF5FD',
    blueBorder: theme.dark
      ? 'rgba(120, 182, 255, 0.26)'
      : '#C9DCF3',

    danger: theme.colors.danger,
    dangerSoft: theme.dark
      ? 'rgba(255, 116, 116, 0.10)'
      : '#FDEFEF',
  };
}

function useNotificationsTheme() {
  const {theme} = useTheme();

  const C = useMemo(
    () => makeNotificationPalette(theme),
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

function formatAnnouncementDate(
  value: string,
): string {
  const raw =
    String(value ?? '').trim();

  if (!raw) {
    return 'Recently';
  }

  const parsed =
    new Date(raw);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return raw;
  }

  return parsed.toLocaleString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

function getCategoryStyle(
  category: string,
  C: NotificationPalette,
) {
  const value =
    String(category ?? '')
      .trim()
      .toLowerCase();

  if (
    value.includes('placement') ||
    value.includes('job') ||
    value.includes('career') ||
    value.includes('intern')
  ) {
    return {
      Icon: BriefcaseBusiness,
      color: C.blue,
      soft: C.blueSoft,
      border: C.blueBorder,
      label: category || 'Placement',
    };
  }

  if (
    value.includes('assignment') ||
    value.includes('task') ||
    value.includes('test') ||
    value.includes('quiz')
  ) {
    return {
      Icon: ClipboardCheck,
      color: C.orange,
      soft: C.orangeSoft,
      border: C.orangeBorder,
      label: category || 'Academic',
    };
  }

  if (
    value.includes('class') ||
    value.includes('schedule') ||
    value.includes('workshop') ||
    value.includes('event')
  ) {
    return {
      Icon: CalendarDays,
      color: C.blue,
      soft: C.blueSoft,
      border: C.blueBorder,
      label: category || 'Schedule',
    };
  }

  if (
    value.includes('course') ||
    value.includes('lesson') ||
    value.includes('module')
  ) {
    return {
      Icon: BookOpenCheck,
      color: C.green,
      soft: C.greenSoft,
      border: C.greenBorder,
      label: category || 'Course',
    };
  }

  return {
    Icon: Megaphone,
    color: C.green,
    soft: C.greenSoft,
    border: C.greenBorder,
    label: category || 'General',
  };
}

export default function NotificationsScreen() {
  const {theme, C, styles} =
    useNotificationsTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<AnnouncementFilter>(
      'all',
    );

  const [
    announcements,
    setAnnouncements,
  ] =
    useState<
      StudentAnnouncement[]
    >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    hasMore,
    setHasMore,
  ] = useState(false);

  const [
    totalCount,
    setTotalCount,
  ] =
    useState<number | null>(
      null,
    );

  const [
    unreadCount,
    setUnreadCount,
  ] =
    useState<number | null>(
      null,
    );

  const [
    readingId,
    setReadingId,
  ] =
    useState<string | null>(
      null,
    );

  const loadFirstPage =
    useCallback(
      async (
        pullToRefresh = false,
      ) => {
        const token =
          String(
            accessToken ?? '',
          ).trim();

        if (!token) {
          setAnnouncements([]);
          setError(
            'Student session not found. Please sign in again.',
          );
          setLoading(false);
          setRefreshing(false);
          return;
        }

        if (pullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        try {
          const unreadOnly =
            activeFilter ===
            'unread';

          const [
            currentResult,
            otherResult,
          ] =
            await Promise.all([
              getStudentAnnouncements(
                token,
                refreshAccessToken,
                {
                  page: 1,
                  limit: PAGE_SIZE,
                  unreadOnly:
                    unreadOnly
                      ? true
                      : undefined,
                },
              ),

              getStudentAnnouncements(
                token,
                refreshAccessToken,
                {
                  page: 1,
                  limit: 1,
                  unreadOnly:
                    unreadOnly
                      ? undefined
                      : true,
                },
              ),
            ]);

          setAnnouncements(
            currentResult.items,
          );

          setPage(
            currentResult.page,
          );

          setHasMore(
            currentResult.hasMore,
          );

          if (unreadOnly) {
            setUnreadCount(
              currentResult.total ??
                currentResult.items
                  .length,
            );

            setTotalCount(
              otherResult.total ??
                otherResult.items
                  .length,
            );
          } else {
            setTotalCount(
              currentResult.total ??
                currentResult.items
                  .length,
            );

            setUnreadCount(
              otherResult.total ??
                otherResult.items
                  .length,
            );
          }
        } catch (err) {
          setAnnouncements([]);

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load announcements.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        activeFilter,
        refreshAccessToken,
      ],
    );

  useFocusEffect(
    useCallback(() => {
      void loadFirstPage();

      return undefined;
    }, [loadFirstPage]),
  );

  const loadMore =
    async () => {
      if (
        loadingMore ||
        !hasMore ||
        !accessToken
      ) {
        return;
      }

      try {
        setLoadingMore(true);
        setError('');

        const result =
          await getStudentAnnouncements(
            accessToken,
            refreshAccessToken,
            {
              page:
                page + 1,
              limit:
                PAGE_SIZE,
              unreadOnly:
                activeFilter ===
                'unread'
                  ? true
                  : undefined,
            },
          );

        setAnnouncements(
          previous => {
            const map =
              new Map(
                previous.map(
                  item => [
                    item.id,
                    item,
                  ],
                ),
              );

            result.items.forEach(
              item => {
                map.set(
                  item.id,
                  item,
                );
              },
            );

            return Array.from(
              map.values(),
            );
          },
        );

        setPage(
          result.page,
        );

        setHasMore(
          result.hasMore,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load more announcements.',
        );
      } finally {
        setLoadingMore(false);
      }
    };

  const markAsRead =
    async (
      item:
        StudentAnnouncement,
    ) => {
      if (
        item.isRead ||
        readingId ||
        !accessToken
      ) {
        return;
      }

      try {
        setReadingId(
          item.id,
        );

        await markStudentAnnouncementRead(
          accessToken,
          item.id,
          refreshAccessToken,
        );

        if (
          activeFilter ===
          'unread'
        ) {
          setAnnouncements(
            previous =>
              previous.filter(
                current =>
                  current.id !==
                  item.id,
              ),
          );
        } else {
          setAnnouncements(
            previous =>
              previous.map(
                current =>
                  current.id ===
                  item.id
                    ? {
                        ...current,
                        isRead: true,
                      }
                    : current,
              ),
          );
        }

        setUnreadCount(
          previous =>
            previous === null
              ? previous
              : Math.max(
                  0,
                  previous - 1,
                ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to mark announcement as read.',
        );
      } finally {
        setReadingId(null);
      }
    };

  const resolvedTotal =
    totalCount ??
    (
      activeFilter === 'all'
        ? announcements.length
        : 0
    );

  const resolvedUnread =
    unreadCount ??
    (
      activeFilter ===
      'unread'
        ? announcements.length
        : announcements.filter(
            item =>
              !item.isRead,
          ).length
    );

  const readCount =
    Math.max(
      0,
      resolvedTotal -
        resolvedUnread,
    );

  const emptyTitle =
    useMemo(
      () =>
        activeFilter ===
        'unread'
          ? 'You are all caught up'
          : 'No announcements yet',
      [activeFilter],
    );

  const emptyDescription =
    useMemo(
      () =>
        activeFilter ===
        'unread'
          ? 'There are no unread academy updates right now.'
          : 'New academy announcements will appear here as soon as they are published.',
      [activeFilter],
    );

  return (
    <SafeAreaView
      style={styles.safeArea}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              void loadFirstPage(
                true,
              )
            }
            tintColor={C.green}
            colors={[
              C.green,
              C.orange,
            ]}
          />
        }>

        {/* HERO */}
        <View
          style={styles.hero}>
          <View
            style={styles.heroGlowOne}
          />

          <View
            style={styles.heroGlowTwo}
          />

          <View
            style={styles.heroTopRow}>
            <View
              style={styles.livePill}>
              <Sparkles
                size={13}
                color={C.green}
                strokeWidth={2.2}
              />

              <Text
                style={styles.liveText}>
                LIVE ACADEMY FEED
              </Text>
            </View>

            <View
              style={styles.heroBell}>
              <BellRing
                size={20}
                color={C.white}
                strokeWidth={2}
              />

              {resolvedUnread >
                0 && (
                <View
                  style={
                    styles.heroUnreadDot
                  }
                />
              )}
            </View>
          </View>

          <Text
            style={styles.heroTitle}>
            Announcements
          </Text>

          <Text
            style={styles.heroSubtitle}>
            Important updates,
            deadlines and academy
            notices — all in one
            place.
          </Text>

          <View
            style={styles.statsRow}>
            <StatItem
              value={
                loading
                  ? '—'
                  : resolvedTotal
              }
              label="Total"
              accent="green"
            />

            <View
              style={styles.statDivider}
            />

            <StatItem
              value={
                loading
                  ? '—'
                  : resolvedUnread
              }
              label="Unread"
              accent="orange"
            />

            <View
              style={styles.statDivider}
            />

            <StatItem
              value={
                loading
                  ? '—'
                  : readCount
              }
              label="Read"
              accent="blue"
            />
          </View>
        </View>

        {/* FILTER */}
        <View
          style={styles.filterWrap}>
          <FilterButton
            title="All"
            count={resolvedTotal}
            active={
              activeFilter ===
              'all'
            }
            onPress={() =>
              setActiveFilter(
                'all',
              )
            }
          />

          <FilterButton
            title="Unread"
            count={resolvedUnread}
            active={
              activeFilter ===
              'unread'
            }
            onPress={() =>
              setActiveFilter(
                'unread',
              )
            }
          />
        </View>

        {/* SECTION TITLE */}
        <View
          style={styles.sectionHeader}>
          <View>
            <Text
              style={
                styles.sectionEyebrow
              }>
              LATEST UPDATES
            </Text>

            <Text
              style={
                styles.sectionTitle
              }>
              {activeFilter ===
              'all'
                ? 'Your feed'
                : 'Unread only'}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              void loadFirstPage(
                true,
              )
            }
            disabled={refreshing}
            style={({pressed}) => [
              styles.refreshButton,
              pressed &&
                styles.pressed,
            ]}>
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={C.green}
              />
            ) : (
              <RefreshCw
                size={17}
                color={C.green}
                strokeWidth={2.2}
              />
            )}
          </Pressable>
        </View>

        {/* STATES */}
        {loading ? (
          <StateCard
            loading
            title="Loading your feed"
            description="Fetching the latest announcements from the academy."
          />
        ) : error &&
          announcements.length ===
            0 ? (
          <StateCard
            error
            title="Could not load updates"
            description={error}
            onRetry={() =>
              void loadFirstPage()
            }
          />
        ) : announcements.length >
          0 ? (
          <>
            {announcements.map(
              item => (
                <AnnouncementCard
                  key={item.id}
                  item={item}
                  marking={
                    readingId ===
                    item.id
                  }
                  onPress={() =>
                    void markAsRead(
                      item,
                    )
                  }
                />
              ),
            )}

            {hasMore && (
              <Pressable
                onPress={() =>
                  void loadMore()
                }
                disabled={
                  loadingMore
                }
                style={({pressed}) => [
                  styles.loadMoreButton,
                  pressed &&
                    styles.pressed,
                ]}>
                {loadingMore ? (
                  <ActivityIndicator
                    size="small"
                    color={C.green}
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.loadMoreText
                      }>
                      Load more
                    </Text>

                    <ChevronRight
                      size={16}
                      color={C.green}
                      strokeWidth={2.2}
                    />
                  </>
                )}
              </Pressable>
            )}

            {!!error && (
              <View
                style={
                  styles.inlineError
                }>
                <AlertCircle
                  size={16}
                  color={C.danger}
                />

                <Text
                  style={
                    styles.inlineErrorText
                  }>
                  {error}
                </Text>
              </View>
            )}
          </>
        ) : (
          <StateCard
            empty
            title={emptyTitle}
            description={
              emptyDescription
            }
          />
        )}

        {/* FOOT NOTE */}
        <View
          style={styles.footNote}>
          <CheckCircle2
            size={16}
            color={C.green}
            strokeWidth={2.2}
          />

          <Text
            style={styles.footText}>
            Updates shown here are
            loaded directly from the
            academy announcement
            system.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function AnnouncementCard({
  item,
  marking,
  onPress,
}: {
  item: StudentAnnouncement;
  marking: boolean;
  onPress: () => void;
}) {
  const {C, styles} =
    useNotificationsTheme();

  const category =
    getCategoryStyle(
      item.category,
      C,
    );

  const Icon =
    category.Icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={
        item.isRead ||
        marking
      }
      style={({pressed}) => [
        styles.card,
        !item.isRead &&
          styles.cardUnread,
        pressed &&
          styles.pressed,
      ]}>

      {!item.isRead && (
        <View
          style={
            styles.unreadRail
          }
        />
      )}

      <View
        style={styles.cardTop}>
        <View
          style={[
            styles.cardIcon,
            {
              backgroundColor:
                category.soft,
              borderColor:
                category.border,
            },
          ]}>
          <Icon
            size={20}
            color={
              category.color
            }
            strokeWidth={2.1}
          />
        </View>

        <View
          style={styles.cardBody}>
          <View
            style={
              styles.cardMetaRow
            }>
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor:
                    category.soft,
                  borderColor:
                    category.border,
                },
              ]}>
              <Text
                numberOfLines={1}
                style={[
                  styles.categoryPillText,
                  {
                    color:
                      category.color,
                  },
                ]}>
                {category.label}
              </Text>
            </View>

            {!item.isRead && (
              <View
                style={
                  styles.newPill
                }>
                <View
                  style={
                    styles.newDot
                  }
                />

                <Text
                  style={
                    styles.newText
                  }>
                  NEW
                </Text>
              </View>
            )}
          </View>

          <Text
            style={
              styles.cardTitle
            }>
            {item.title}
          </Text>

          {!!(
            item.message ||
            item.summary
          ) && (
            <Text
              style={
                styles.cardMessage
              }>
              {item.message ||
                item.summary}
            </Text>
          )}

          <View
            style={styles.cardFooter}>
            <View
              style={
                styles.dateWrap
              }>
              <Clock3
                size={13}
                color={C.muted}
                strokeWidth={2}
              />

              <Text
                style={
                  styles.cardDate
                }>
                {formatAnnouncementDate(
                  item.createdAt,
                )}
              </Text>
            </View>

            {!item.isRead ? (
              <View
                style={
                  styles.tapHint
                }>
                {marking ? (
                  <ActivityIndicator
                    size="small"
                    color={C.green}
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.tapHintText
                      }>
                      Mark read
                    </Text>

                    <ChevronRight
                      size={14}
                      color={C.green}
                    />
                  </>
                )}
              </View>
            ) : (
              <View
                style={
                  styles.readState
                }>
                <CheckCircle2
                  size={13}
                  color={C.muted}
                />

                <Text
                  style={
                    styles.readStateText
                  }>
                  Read
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function StatItem({
  value,
  label,
  accent,
}: {
  value:
    | number
    | string;
  label: string;
  accent:
    | 'green'
    | 'orange'
    | 'blue';
}) {
  const {C, styles} =
    useNotificationsTheme();

  const color =
    accent === 'orange'
      ? C.orange
      : accent === 'blue'
        ? C.blue
        : C.green;

  return (
    <View
      style={styles.statItem}>
      <Text
        style={[
          styles.statValue,
          {color},
        ]}>
        {value}
      </Text>

      <Text
        style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

function FilterButton({
  title,
  count,
  active,
  onPress,
}: {
  title: string;
  count: number;
  active: boolean;
  onPress: () => void;
}) {
  const {styles} =
    useNotificationsTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.filterButton,
        active &&
          styles.filterButtonActive,
        pressed &&
          styles.pressed,
      ]}>
      <Text
        style={[
          styles.filterText,
          active &&
            styles.filterTextActive,
        ]}>
        {title}
      </Text>

      <View
        style={[
          styles.filterCount,
          active &&
            styles.filterCountActive,
        ]}>
        <Text
          style={[
            styles.filterCountText,
            active &&
              styles.filterCountTextActive,
          ]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function StateCard({
  loading = false,
  error = false,
  empty = false,
  title,
  description,
  onRetry,
}: {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const {C, styles} =
    useNotificationsTheme();

  return (
    <View
      style={styles.stateCard}>
      <View
        style={[
          styles.stateIcon,
          error &&
            styles.stateIconError,
        ]}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color={C.green}
          />
        ) : error ? (
          <AlertCircle
            size={27}
            color={C.danger}
            strokeWidth={2}
          />
        ) : empty ? (
          <Inbox
            size={27}
            color={C.green}
            strokeWidth={2}
          />
        ) : (
          <GraduationCap
            size={27}
            color={C.green}
            strokeWidth={2}
          />
        )}
      </View>

      <Text
        style={styles.stateTitle}>
        {title}
      </Text>

      <Text
        style={
          styles.stateDescription
        }>
        {description}
      </Text>

      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          style={({pressed}) => [
            styles.retryButton,
            pressed &&
              styles.pressed,
          ]}>
          <RefreshCw
            size={15}
            color={C.onAccent}
            strokeWidth={2.3}
          />

          <Text
            style={
              styles.retryText
            }>
            Try again
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (
  theme: AppTheme,
  C: NotificationPalette,
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
      paddingTop: 14,
      paddingBottom: 38,
    },

    hero: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: C.panel,
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 28,
      padding: 21,
      marginBottom: 18,
      shadowColor: theme.colors.shadow,
      shadowOpacity:
        theme.dark
          ? 0.24
          : 0.07,
      shadowRadius: 16,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      elevation: 4,
    },

    heroGlowOne: {
      position: 'absolute',
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor:
        C.greenSoft,
      top: -82,
      right: -52,
    },

    heroGlowTwo: {
      position: 'absolute',
      width: 125,
      height: 125,
      borderRadius: 63,
      backgroundColor:
        C.orangeSoft,
      bottom: -68,
      left: -38,
    },

    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: C.greenBorder,
      backgroundColor:
        C.greenSoft,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },

    liveText: {
      color: C.green,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.2,
      marginLeft: 7,
    },

    heroBell: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: C.panel2,
      borderWidth: 1,
      borderColor: C.greenBorder,
      alignItems: 'center',
      justifyContent: 'center',
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

    heroUnreadDot: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: C.orange,
      right: 8,
      top: 8,
      borderWidth: 1.5,
      borderColor: C.panel2,
    },

    heroTitle: {
      color: C.white,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: '900',
      letterSpacing: -0.8,
      marginTop: 22,
    },

    heroSubtitle: {
      color: C.text,
      fontSize: 12,
      lineHeight: 19,
      maxWidth: 290,
      marginTop: 7,
    },

    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        C.panel3,
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 20,
      marginTop: 21,
      paddingVertical: 14,
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

    statItem: {
      flex: 1,
      alignItems: 'center',
    },

    statValue: {
      fontSize: 20,
      fontWeight: '900',
    },

    statLabel: {
      color: C.muted,
      fontSize: 8,
      fontWeight: '800',
      textTransform:
        'uppercase',
      letterSpacing: 0.8,
      marginTop: 3,
    },

    statDivider: {
      width: 1,
      height: 31,
      backgroundColor:
        C.border,
    },

    filterWrap: {
      flexDirection: 'row',
      backgroundColor: C.panel,
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 18,
      padding: 5,
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

    filterButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    filterButtonActive: {
      backgroundColor: C.green,
    },

    filterText: {
      color: C.text,
      fontSize: 10,
      fontWeight: '900',
    },

    filterTextActive: {
      color: C.onAccent,
    },

    filterCount: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      marginLeft: 7,
      paddingHorizontal: 6,
      backgroundColor: C.panel3,
      alignItems: 'center',
      justifyContent: 'center',
    },

    filterCountActive: {
      backgroundColor:
        theme.dark
          ? 'rgba(5, 6, 5, 0.16)'
          : 'rgba(255, 255, 255, 0.28)',
    },

    filterCountText: {
      color: C.text,
      fontSize: 8,
      fontWeight: '900',
    },

    filterCountTextActive: {
      color: C.onAccent,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 13,
    },

    sectionEyebrow: {
      color: C.green,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 5,
    },

    sectionTitle: {
      color: C.white,
      fontSize: 19,
      fontWeight: '900',
      letterSpacing: -0.2,
    },

    refreshButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor:
        C.greenSoft,
      borderWidth: 1,
      borderColor:
        C.greenBorder,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.03,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      elevation: 1,
    },

    card: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: C.panel,
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 22,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.shadow,
      shadowOpacity:
        theme.dark
          ? 0.13
          : 0.035,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 2,
    },

    cardUnread: {
      backgroundColor: C.panel2,
      borderColor:
        C.greenBorder,
    },

    unreadRail: {
      position: 'absolute',
      left: 0,
      top: 18,
      bottom: 18,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
      backgroundColor: C.green,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems:
        'flex-start',
    },

    cardIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.shadow,
      shadowOpacity:
        theme.dark
          ? 0.10
          : 0.025,
      shadowRadius: 5,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 1,
    },

    cardBody: {
      flex: 1,
      marginLeft: 12,
    },

    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      minHeight: 24,
    },

    categoryPill: {
      maxWidth: '68%',
      minHeight: 24,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 5,
      justifyContent: 'center',
    },

    categoryPillText: {
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.55,
      textTransform:
        'uppercase',
    },

    newPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        C.orangeSoft,
      borderWidth: 1,
      borderColor:
        C.orangeBorder,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 5,
    },

    newDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.orange,
      marginRight: 5,
    },

    newText: {
      color: C.orange,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.7,
    },

    cardTitle: {
      color: C.white,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '900',
      marginTop: 9,
    },

    cardMessage: {
      color: C.text,
      fontSize: 10,
      lineHeight: 17,
      marginTop: 6,
    },

    cardFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginTop: 13,
      paddingTop: 11,
      borderTopWidth: 1,
      borderTopColor: C.border,
    },

    dateWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 8,
    },

    cardDate: {
      flex: 1,
      color: C.muted,
      fontSize: 8,
      lineHeight: 12,
      marginLeft: 5,
    },

    tapHint: {
      minHeight: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        C.greenSoft,
      borderRadius: 999,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor:
        C.greenBorder,
    },

    tapHintText: {
      color: C.green,
      fontSize: 8,
      fontWeight: '900',
    },

    readState: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    readStateText: {
      color: C.muted,
      fontSize: 8,
      fontWeight: '800',
      marginLeft: 4,
    },

    stateCard: {
      minHeight: 245,
      backgroundColor: C.panel,
      borderWidth: 1,
      borderColor: C.borderStrong,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
      paddingVertical: 30,
      marginBottom: 11,
      shadowColor: theme.colors.shadow,
      shadowOpacity:
        theme.dark
          ? 0.12
          : 0.03,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 1,
    },

    stateIcon: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor:
        C.greenSoft,
      borderWidth: 1,
      borderColor:
        C.greenBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },

    stateIconError: {
      backgroundColor:
        C.dangerSoft,
      borderColor:
        C.danger,
    },

    stateTitle: {
      color: C.white,
      fontSize: 16,
      fontWeight: '900',
      textAlign: 'center',
      marginTop: 15,
    },

    stateDescription: {
      color: C.text,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
      maxWidth: 290,
      marginTop: 7,
    },

    retryButton: {
      minHeight: 43,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.green,
      borderRadius: 13,
      paddingHorizontal: 17,
      marginTop: 16,
    },

    retryText: {
      color: C.onAccent,
      fontSize: 10,
      fontWeight: '900',
      marginLeft: 7,
    },

    loadMoreButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        C.greenSoft,
      borderWidth: 1,
      borderColor:
        C.greenBorder,
      borderRadius: 16,
      marginTop: 4,
      marginBottom: 10,
    },

    loadMoreText: {
      color: C.green,
      fontSize: 10,
      fontWeight: '900',
      marginRight: 4,
    },

    inlineError: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor:
        C.dangerSoft,
      borderWidth: 1,
      borderColor:
        C.danger,
      borderRadius: 13,
      padding: 12,
      marginTop: 4,
    },

    inlineErrorText: {
      flex: 1,
      color: C.danger,
      fontSize: 9,
      lineHeight: 14,
      marginLeft: 8,
    },

    footNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor:
        C.greenSoft,
      borderWidth: 1,
      borderColor:
        C.greenBorder,
      borderRadius: 16,
      padding: 13,
      marginTop: 13,
    },

    footText: {
      flex: 1,
      color: C.text,
      fontSize: 9,
      lineHeight: 15,
      marginLeft: 9,
    },

    pressed: {
      opacity: 0.82,
      transform: [
        {scale: 0.995},
      ],
    },
  });
