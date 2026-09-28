import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
  Clock3,
  ExternalLink,
  MapPin,
  MonitorPlay,
  RefreshCw,
  Sparkles,
  UserRound,
  Video,
} from 'lucide-react-native';

import {
  getStudentSchedule,
  StudentScheduleItem,
} from '../../services/scheduleApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type ScheduleScope =
  | 'all'
  | 'upcoming'
  | 'past';

function useLiveClassesTheme() {
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

export default function LiveClassesScreen() {
  const {theme, styles} = useLiveClassesTheme();
  const {accessToken} = useApp();

  const [
    scope,
    setScope,
  ] =
    useState<ScheduleScope>(
      'upcoming',
    );

  const [
    sessions,
    setSessions,
  ] = useState<
    StudentScheduleItem[]
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
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadClasses =
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
            await getStudentSchedule(
              accessToken,
              {
                page: 1,
                limit: 20,
                unreadOnly: false,
                scope,
              },
            );

          setSessions(
            response.items || [],
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load live classes.';

          setError(message);
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [
        accessToken,
        scope,
      ],
    );

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadClasses(false);

      setRefreshing(false);
    };

  const handleScopeChange = (
    nextScope: ScheduleScope,
  ) => {
    if (nextScope === scope) {
      return;
    }

    setScope(nextScope);
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
            Loading classes...
          </Text>

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
                  CLASS SCHEDULE
                </Text>
              </View>

              <Text style={styles.pageTitle}>
                Live Classes
              </Text>

              <Text style={styles.subtitle}>
                Check your upcoming and
                previous academy sessions.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Image
                source={require('../../assets/seekho-login-logo-transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.headerIcon}>
                <MonitorPlay
                  size={23}
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

        {/* FILTER */}

        <View
          style={
            styles.filterContainer
          }>

          <FilterButton
            title="Upcoming"
            active={
              scope === 'upcoming'
            }
            onPress={() =>
              handleScopeChange(
                'upcoming',
              )
            }
          />

          <FilterButton
            title="Past"
            active={
              scope === 'past'
            }
            onPress={() =>
              handleScopeChange(
                'past',
              )
            }
          />

          <FilterButton
            title="All"
            active={
              scope === 'all'
            }
            onPress={() =>
              handleScopeChange(
                'all',
              )
            }
          />

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
                loadClasses()
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
                  styles
                    .retryButtonText
                }>
                Retry
              </Text>

            </Pressable>

          </View>
        )}

        {/* COUNT */}

        <View
          style={
            styles.sectionHeader
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            {getScopeHeading(
              scope,
            )}
          </Text>

          <View
            style={
              styles.countBadge
            }>

            <Text
              style={
                styles.countText
              }>
              {sessions.length}
            </Text>

          </View>

        </View>

        {/* SESSIONS */}

        {sessions.length === 0 ? (
          <View
            style={
              styles.emptyCard
            }>

            <CalendarDays
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
              {scope ===
              'upcoming'
                ? 'No upcoming classes'
                : scope ===
                    'past'
                  ? 'No past classes'
                  : 'No classes available'}
            </Text>

            <Text
              style={
                styles.emptyText
              }>
              Your academy schedule
              will appear here when
              sessions are published.
            </Text>

          </View>
        ) : (
          sessions.map(
            session => (
              <ScheduleCard
                key={
                  String(
                    session.id,
                  )
                }
                session={
                  session
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
 * FILTER BUTTON
 * =====================================================
 */

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  const {styles} = useLiveClassesTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.filterButton,

        active &&
          styles
            .filterButtonActive,

        pressed &&
          styles.pressed,
      ]}>

      <Text
        style={[
          styles.filterText,

          active &&
            styles
              .filterTextActive,
        ]}>
        {title}
      </Text>

    </Pressable>
  );
}

/*
 * =====================================================
 * SESSION CARD
 * =====================================================
 */

function ScheduleCard({
  session,
}: {
  session: StudentScheduleItem;
}) {
  const {theme, styles} = useLiveClassesTheme();

  const online =
    isOnlineSession(
      session,
    );

  const start =
    parseDate(
      session.start_at,
    );

  const end =
    parseDate(
      session.end_at,
    );

  const openMeeting =
    async () => {
      const url =
        session.meeting_url?.trim();

      if (!url) {
        Alert.alert(
          'Meeting link unavailable',
          'The academy has not added a meeting link for this class yet.',
        );

        return;
      }

      try {
        const canOpen =
          await Linking.canOpenURL(
            url,
          );

        if (!canOpen) {
          Alert.alert(
            'Unable to open link',
            'This meeting link cannot be opened on your device.',
          );

          return;
        }

        await Linking.openURL(
          url,
        );
      } catch {
        Alert.alert(
          'Unable to open link',
          'Please try again later.',
        );
      }
    };

  return (
    <View
      style={
        styles.sessionCard
      }>

      {/* TOP */}

      <View
        style={
          styles.sessionTop
        }>

        <View
          style={
            styles.sessionIcon
          }>

          {online ? (
            <Video
              size={22}
              color={
                theme.colors.primary
              }
            />
          ) : (
            <MapPin
              size={22}
              color={
                theme.colors.primary
              }
            />
          )}

        </View>

        <View
          style={
            styles.sessionHeading
          }>

          <Text
            style={
              styles.sessionTitle
            }>
            {session.title ||
              'Live Class'}
          </Text>

          <View
            style={
              styles.badgeRow
            }>

            <View
              style={
                styles.modeBadge
              }>

              <Text
                style={
                  styles.modeText
                }>
                {formatLabel(
                  session.mode ||
                    (online
                      ? 'online'
                      : 'offline'),
                )}
              </Text>

            </View>

            {!!session
              .session_type && (
              <View
                style={
                  styles.typeBadge
                }>

                <Text
                  style={
                    styles.typeText
                  }>
                  {formatLabel(
                    session
                      .session_type,
                  )}
                </Text>

              </View>
            )}

          </View>

        </View>

      </View>

      {/* DESCRIPTION */}

      {!!session.description && (
        <Text
          style={
            styles.description
          }>
          {session.description}
        </Text>
      )}

      {/* DETAILS */}

      <View
        style={
          styles.detailsBox
        }>

        <DetailRow
          icon={
            <CalendarDays
              size={18}
              color={
                theme.colors
                  .textSecondary
              }
            />
          }
          label="Date"
          value={
            start
              ? formatDate(
                  start,
                )
              : 'Not available'
          }
        />

        <Divider />

        <DetailRow
          icon={
            <Clock3
              size={18}
              color={
                theme.colors
                  .textSecondary
              }
            />
          }
          label="Time"
          value={
            formatSessionTime(
              start,
              end,
            )
          }
        />

        {!!session
          .instructor && (
          <>
            <Divider />

            <DetailRow
              icon={
                <UserRound
                  size={18}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />
              }
              label="Instructor"
              value={
                session.instructor
              }
            />

          </>
        )}

        {!!session
          .target_course && (
          <>
            <Divider />

            <DetailRow
              icon={
                <MonitorPlay
                  size={18}
                  color={
                    theme.colors
                      .textSecondary
                  }
                />
              }
              label="Course"
              value={
                session
                  .target_course
              }
            />

          </>
        )}

        {!online &&
          !!session.location && (
            <>
              <Divider />

              <DetailRow
                icon={
                  <MapPin
                    size={18}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                }
                label="Location"
                value={
                  session.location
                }
              />

            </>
          )}

      </View>

      {/* ONLINE JOIN BUTTON */}

      {online && (
        <Pressable
          disabled={
            !session.meeting_url
          }
          onPress={
            openMeeting
          }
          style={({pressed}) => [
            styles.joinButton,

            !session.meeting_url &&
              styles
                .joinButtonDisabled,

            pressed &&
              !!session.meeting_url &&
              styles.pressed,
          ]}>

          <Video
            size={18}
            color={
              session.meeting_url
                ? theme.colors.black
                : theme.colors
                    .textLight
            }
          />

          <Text
            style={[
              styles.joinButtonText,

              !session
                .meeting_url &&
                styles
                  .joinButtonTextDisabled,
            ]}>
            {session.meeting_url
              ? 'Join Class'
              : 'Meeting Link Pending'}
          </Text>

          {!!session.meeting_url && (
            <ExternalLink
              size={16}
              color="#07130B"
            />
          )}

        </Pressable>
      )}

      {/* OFFLINE LOCATION */}

      {!online &&
        !!session.location && (
          <View
            style={
              styles.locationBox
            }>

            <MapPin
              size={17}
              color={
                theme.colors.primary
              }
            />

            <Text
              style={
                styles.locationText
              }>
              {session.location}
            </Text>

          </View>
        )}

      {!!session.status && (
        <Text
          style={
            styles.statusText
          }>
          Status:{' '}
          {formatLabel(
            session.status,
          )}
        </Text>
      )}

    </View>
  );
}

/*
 * =====================================================
 * DETAILS
 * =====================================================
 */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const {styles} = useLiveClassesTheme();

  return (
    <View
      style={
        styles.detailRow
      }>

      <View
        style={
          styles.detailIcon
        }>
        {icon}
      </View>

      <View
        style={
          styles.detailContent
        }>

        <Text
          style={
            styles.detailLabel
          }>
          {label}
        </Text>

        <Text
          style={
            styles.detailValue
          }>
          {value}
        </Text>

      </View>

    </View>
  );
}

function Divider() {
  const {styles} = useLiveClassesTheme();

  return (
    <View
      style={styles.divider}
    />
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function getScopeHeading(
  scope: ScheduleScope,
) {
  switch (scope) {
    case 'upcoming':
      return 'UPCOMING CLASSES';

    case 'past':
      return 'PAST CLASSES';

    default:
      return 'ALL CLASSES';
  }
}

function isOnlineSession(
  session: StudentScheduleItem,
) {
  const mode =
    session.mode
      ?.trim()
      .toLowerCase();

  if (mode === 'online') {
    return true;
  }

  if (
    mode === 'offline'
  ) {
    return false;
  }

  return Boolean(
    session.meeting_url,
  );
}

function parseDate(
  value?: string | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function formatDate(
  date: Date,
) {
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
  date: Date,
) {
  return date.toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    },
  );
}

function formatSessionTime(
  start: Date | null,
  end: Date | null,
) {
  if (!start && !end) {
    return 'Not available';
  }

  if (
    start &&
    end
  ) {
    return `${formatTime(
      start,
    )} - ${formatTime(
      end,
    )}`;
  }

  if (start) {
    return formatTime(start);
  }

  return formatTime(
    end as Date,
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
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
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

    subtitle: {
      marginTop: 6,

      maxWidth: 270,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
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

    filterContainer: {
      marginTop: 23,

      padding: 5,

      flexDirection: 'row',

      gap: 6,

      borderRadius: 16,

      backgroundColor:
        theme.colors.surface,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,
    },

    filterButton: {
      flex: 1,

      height: 40,

      alignItems: 'center',

      justifyContent:
        'center',

      borderRadius: 12,
    },

    filterButtonActive: {
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.dark ? 0.20 : 0.10,
      shadowRadius: 8,
      elevation: 2,
    },

    filterText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      fontWeight: '800',
    },

    filterTextActive: {
      color: theme.colors.black,
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
        theme.dark
          ? 'rgba(255,116,116,0.28)'
          : 'rgba(226,85,85,0.22)',

      backgroundColor:
        theme.dark
          ? 'rgba(255,116,116,0.08)'
          : '#FFF3F3',
    },

    errorText: {
      flex: 1,

      color: theme.colors.danger,

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
      minWidth: 30,

      paddingHorizontal: 8,

      paddingVertical: 5,

      alignItems: 'center',

      borderRadius: 10,

      backgroundColor:
        theme.colors.secondarySoft,
    },

    countText: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 10,

      fontWeight: '900',
    },

    sessionCard: {
      marginBottom: 14,

      padding: 17,

      borderRadius: 20,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    sessionTop: {
      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 12,
    },

    sessionIcon: {
      width: 48,

      height: 48,

      borderRadius: 15,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    sessionHeading: {
      flex: 1,
    },

    sessionTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 15,

      lineHeight: 21,

      fontWeight: '900',
    },

    badgeRow: {
      marginTop: 8,

      flexDirection: 'row',

      flexWrap: 'wrap',

      gap: 6,
    },

    modeBadge: {
      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 8,

      backgroundColor:
        theme.colors.secondarySoft,
    },

    modeText: {
      color:
        theme.colors.secondaryStrong,

      fontSize: 8,

      fontWeight: '900',
    },

    typeBadge: {
      paddingHorizontal: 8,

      paddingVertical: 5,

      borderRadius: 8,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    typeText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 8,

      fontWeight: '900',
    },

    description: {
      marginTop: 13,

      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 17,
    },

    detailsBox: {
      marginTop: 15,

      overflow: 'hidden',

      borderRadius: 15,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    detailRow: {
      paddingHorizontal: 12,

      paddingVertical: 11,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,
    },

    detailIcon: {
      width: 34,

      height: 34,

      borderRadius: 10,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors.surface,
    },

    detailContent: {
      flex: 1,
    },

    detailLabel: {
      color:
        theme.colors
          .textLight,

      fontSize: 8,

      fontWeight: '700',
    },

    detailValue: {
      marginTop: 2,

      color:
        theme.colors
          .textPrimary,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: '800',
    },

    divider: {
      height: 1,

      marginLeft: 57,

      backgroundColor:
        theme.colors
          .borderStrong,
    },

    joinButton: {
      height: 50,

      marginTop: 15,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 7,

      borderRadius: 14,

      backgroundColor:
        theme.colors.primary,
    },

    joinButtonDisabled: {
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    joinButtonText: {
      color: theme.colors.black,

      fontSize: 11,

      fontWeight: '900',
    },

    joinButtonTextDisabled: {
      color:
        theme.colors.textLight,
    },

    locationBox: {
      marginTop: 14,

      padding: 12,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 9,

      borderRadius: 13,

      backgroundColor:
        theme.colors.secondarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,
    },

    locationText: {
      flex: 1,

      color:
        theme.colors
          .textPrimary,

      fontSize: 10,

      lineHeight: 16,

      fontWeight: '700',
    },

    statusText: {
      marginTop: 12,

      color:
        theme.colors.textLight,

      fontSize: 8,

      textAlign: 'right',

      fontWeight: '700',
    },

    emptyCard: {
      paddingVertical: 38,

      paddingHorizontal: 22,

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