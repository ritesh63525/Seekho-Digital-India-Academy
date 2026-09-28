import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  AlertCircle,
  Award,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';

import {
  downloadCertificateFile,
  getMyCertificates,
  type StudentCertificate,
  viewCertificateFile,
} from '../../services/certificateApi';

import {
  useApp,
} from '../../state/AppContext';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type CertificateFilter =
  | 'all'
  | 'available'
  | 'locked';

function useCertificatesTheme() {
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

function formatDate(
  value: string,
) {
  if (!value) {
    return 'Not provided';
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

export default function CertificatesScreen() {
  const {
    theme,
    styles,
  } = useCertificatesTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [
    certificates,
    setCertificates,
  ] =
    useState<StudentCertificate[]>(
      [],
    );

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<CertificateFilter>(
      'all',
    );

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
  ] = useState('');

  const [
    fileActionId,
    setFileActionId,
  ] = useState('');

  const loadCertificates =
    useCallback(
      async (
        pullToRefresh = false,
      ) => {
        const token =
          String(
            accessToken ?? '',
          ).trim();

        if (!token) {
          setCertificates([]);
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
          const items =
            await getMyCertificates(
              token,
              refreshAccessToken,
            );

          setCertificates(
            items,
          );
        } catch (err) {
          setCertificates([]);

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load certificates.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        refreshAccessToken,
      ],
    );

  React.useEffect(
    () => {
      void loadCertificates();
    },
    [loadCertificates],
  );

  const stats =
    useMemo(
      () => {
        const available =
          certificates.filter(
            item =>
              !item.locked,
          ).length;

        const locked =
          certificates.filter(
            item =>
              item.locked,
          ).length;

        return {
          total:
            certificates.length,

          available,

          locked,
        };
      },
      [certificates],
    );

  const filtered =
    useMemo(
      () =>
        certificates.filter(
          item => {
            if (
              activeFilter ===
              'available'
            ) {
              return !item.locked;
            }

            if (
              activeFilter ===
              'locked'
            ) {
              return item.locked;
            }

            return true;
          },
        ),
      [
        certificates,
        activeFilter,
      ],
    );

  const openCertificate =
    async (
      certificate:
        StudentCertificate,
    ) => {
      if (certificate.locked) {
        Alert.alert(
          'Certificate locked',
          'This certificate is not available yet.',
        );

        return;
      }

      const token =
        String(
          accessToken ?? '',
        ).trim();

      if (!token) {
        Alert.alert(
          'Session expired',
          'Please sign in again.',
        );

        return;
      }

      try {
        setFileActionId(
          `${certificate.id}:view`,
        );

        await viewCertificateFile(
          certificate,
          token,
          refreshAccessToken,
        );
      } catch (err) {
        Alert.alert(
          'Unable to open certificate',
          err instanceof Error
            ? err.message
            : 'Please try again.',
        );
      } finally {
        setFileActionId('');
      }
    };

  const downloadCertificate =
    async (
      certificate:
        StudentCertificate,
    ) => {
      if (certificate.locked) {
        Alert.alert(
          'Certificate locked',
          'This certificate is not available for download yet.',
        );

        return;
      }

      const token =
        String(
          accessToken ?? '',
        ).trim();

      if (!token) {
        Alert.alert(
          'Session expired',
          'Please sign in again.',
        );

        return;
      }

      try {
        setFileActionId(
          `${certificate.id}:download`,
        );

        await downloadCertificateFile(
          certificate,
          token,
          refreshAccessToken,
        );

        Alert.alert(
          'Download started',
          'Your certificate is being saved to your device.',
        );
      } catch (err) {
        Alert.alert(
          'Download failed',
          err instanceof Error
            ? err.message
            : 'Please try again.',
        );
      } finally {
        setFileActionId('');
      }
    };

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
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              void loadCertificates(
                true,
              )
            }
            tintColor={
              theme.colors.secondary
            }
            colors={[
              theme.colors.secondary,
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
                  ACHIEVEMENTS
                </Text>
              </View>

              <Text style={styles.title}>
                Your{' '}
                <Text style={styles.titleAccent}>
                  Certificates
                </Text>
              </Text>

              <Text style={styles.subtitle}>
                View and download certificates
                issued to your student account.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Image
                source={require('../../assets/seekho-login-logo-transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />

              <View style={styles.headerIcon}>
                <Award
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

        {/* STATS */}
        <View
          style={
            styles.statsGrid
          }>

          <StatCard
            label="TOTAL"
            value={
              stats.total
            }
            color={theme.colors.textPrimary}
            icon={
              <FileText
                size={18}
                color={theme.colors.textPrimary}
              />
            }
          />

          <StatCard
            label="AVAILABLE"
            value={
              stats.available
            }
            color={theme.colors.secondary}
            icon={
              <CheckCircle2
                size={18}
                color={theme.colors.secondary}
              />
            }
          />

          <StatCard
            label="LOCKED"
            value={
              stats.locked
            }
            color={theme.colors.primary}
            icon={
              <LockKeyhole
                size={18}
                color={theme.colors.primary}
              />
            }
          />

        </View>

        {/* SECURITY CARD */}
        <View
          style={
            styles.securityCard
          }>

          <View
            style={
              styles.securityIcon
            }>
            <ShieldCheck
              size={22}
              color={theme.colors.secondary}
            />
          </View>

          <View
            style={
              styles.securityContent
            }>
            <Text
              style={
                styles.securityTitle
              }>
              Verified academy
              certificates
            </Text>

            <Text
              style={
                styles.securityDescription
              }>
              Certificates shown
              here are loaded
              directly from your
              student profile.
            </Text>
          </View>

        </View>

        {/* FILTERS */}
        <View
          style={
            styles.filterContainer
          }>

          <FilterButton
            title="All"
            count={
              stats.total
            }
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
            title="Available"
            count={
              stats.available
            }
            active={
              activeFilter ===
              'available'
            }
            onPress={() =>
              setActiveFilter(
                'available',
              )
            }
          />

          <FilterButton
            title="Locked"
            count={
              stats.locked
            }
            active={
              activeFilter ===
              'locked'
            }
            onPress={() =>
              setActiveFilter(
                'locked',
              )
            }
          />

        </View>

        {/* SECTION TITLE */}
        <View
          style={
            styles.sectionHeader
          }>

          <View>
            <Text
              style={
                styles.sectionTitle
              }>
              {activeFilter ===
              'available'
                ? 'Available Certificates'
                : activeFilter ===
                    'locked'
                  ? 'Locked Certificates'
                  : 'All Certificates'}
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              {filtered.length}{' '}
              {filtered.length ===
              1
                ? 'certificate'
                : 'certificates'}
            </Text>
          </View>

          <Pressable
            onPress={() =>
              void loadCertificates()
            }
            disabled={
              loading
            }
            style={({pressed}) => [
              styles.refreshButton,
              pressed &&
                styles.pressed,
            ]}>

            <RefreshCw
              size={17}
              color={theme.colors.secondary}
            />

          </Pressable>

        </View>

        {/* LOADING */}
        {loading ? (
          <View
            style={
              styles.stateCard
            }>

            <ActivityIndicator
              size="large"
              color={theme.colors.secondary}
            />

            <Text
              style={
                styles.stateTitle
              }>
              Loading certificates
            </Text>

            <Text
              style={
                styles.stateDescription
              }>
              Syncing your latest
              certificate records.
            </Text>

          </View>
        ) : error ? (
          <View
            style={
              styles.stateCard
            }>

            <View
              style={
                styles.errorIcon
              }>
              <AlertCircle
                size={30}
                color={theme.colors.primary}
              />
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              Unable to load
              certificates
            </Text>

            <Text
              style={
                styles.stateDescription
              }>
              {error}
            </Text>

            <Pressable
              onPress={() =>
                void loadCertificates()
              }
              style={({pressed}) => [
                styles.retryButton,
                pressed &&
                  styles.pressed,
              ]}>

              <RefreshCw
                size={17}
                color={theme.colors.black}
              />

              <Text
                style={
                  styles.retryButtonText
                }>
                Try Again
              </Text>

            </Pressable>

          </View>
        ) : filtered.length ===
          0 ? (
          <View
            style={
              styles.stateCard
            }>

            <View
              style={
                styles.emptyIcon
              }>
              {activeFilter ===
              'locked' ? (
                <LockKeyhole
                  size={31}
                  color={theme.colors.primary}
                />
              ) : (
                <Award
                  size={31}
                  color={theme.colors.secondary}
                />
              )}
            </View>

            <Text
              style={
                styles.stateTitle
              }>
              {activeFilter ===
              'available'
                ? 'No certificates available'
                : activeFilter ===
                    'locked'
                  ? 'No locked certificates'
                  : 'No certificates yet'}
            </Text>

            <Text
              style={
                styles.stateDescription
              }>
              {activeFilter ===
              'available'
                ? 'Certificates ready for viewing and download will appear here.'
                : activeFilter ===
                    'locked'
                  ? 'Locked certificates will appear here until the academy unlocks them.'
                  : 'When the academy issues a certificate to your profile, it will appear here automatically.'}
            </Text>

          </View>
        ) : (
          <View
            style={
              styles.list
            }>

            {filtered.map(
              certificate => (
                <CertificateCard
                  key={
                    certificate.id
                  }
                  certificate={
                    certificate
                  }
                  viewLoading={
                    fileActionId ===
                    `${certificate.id}:view`
                  }
                  downloadLoading={
                    fileActionId ===
                    `${certificate.id}:download`
                  }
                  onView={() =>
                    void openCertificate(
                      certificate,
                    )
                  }
                  onDownload={() =>
                    void downloadCertificate(
                      certificate,
                    )
                  }
                />
              ),
            )}

          </View>
        )}

        {/* INFO */}
        <View
          style={
            styles.bottomInfo
          }>

          <BookOpen
            size={19}
            color={theme.colors.info}
          />

          <Text
            style={
              styles.bottomInfoText
            }>
            Pull down anytime to
            sync newly issued or
            unlocked certificates.
          </Text>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function CertificateCard({
  certificate,
  viewLoading,
  downloadLoading,
  onView,
  onDownload,
}: {
  certificate:
    StudentCertificate;

  viewLoading: boolean;
  downloadLoading: boolean;

  onView: () => void;
  onDownload: () => void;
}) {
  const {
    theme,
    styles,
  } = useCertificatesTheme();

  const busy =
    viewLoading ||
    downloadLoading;

  return (
    <View
      style={[
        styles.certificateCard,
        certificate.locked &&
          styles.certificateCardLocked,
      ]}>

      <View
        style={
          styles.certificateTop
        }>

        <View
          style={[
            styles.certificateBadge,
            certificate.locked &&
              styles.certificateBadgeLocked,
          ]}>

          {certificate.locked ? (
            <LockKeyhole
              size={22}
              color={theme.colors.primary}
            />
          ) : (
            <Award
              size={22}
              color={theme.colors.secondary}
            />
          )}

        </View>

        <View
          style={
            styles.certificateHeading
          }>

          <View
            style={
              styles.statusRow
            }>

            <Text
              style={
                styles.cardEyebrow
              }>
              CERTIFICATE
            </Text>

            <View
              style={[
                styles.statusPill,
                certificate.locked
                  ? styles.statusPillLocked
                  : styles.statusPillAvailable,
              ]}>

              <Text
                style={[
                  styles.statusPillText,
                  certificate.locked
                    ? styles.statusTextLocked
                    : styles.statusTextAvailable,
                ]}>
                {certificate.locked
                  ? 'LOCKED'
                  : 'AVAILABLE'}
              </Text>

            </View>

          </View>

          <Text
            style={
              styles.cardTitle
            }
            numberOfLines={2}>
            {certificate.title}
          </Text>

          {!!certificate.courseTitle && (
            <Text
              style={
                styles.cardCourse
              }
              numberOfLines={2}>
              {certificate.courseTitle}
            </Text>
          )}

        </View>

      </View>

      {!!certificate.description && (
        <Text
          style={
            styles.cardDescription
          }>
          {certificate.description}
        </Text>
      )}

      <View
        style={
          styles.metaGrid
        }>

        <MetaItem
          icon={
            <CalendarDays
              size={15}
              color={theme.colors.secondary}
            />
          }
          label="Issued"
          value={formatDate(
            certificate.issuedAt,
          )}
        />

        <MetaItem
          icon={
            <FileText
              size={15}
              color={theme.colors.primary}
            />
          }
          label="Certificate No."
          value={
            certificate.certificateNumber ||
            'Not provided'
          }
        />

      </View>

      {certificate.locked ? (
        <View
          style={
            styles.lockedMessage
          }>

          <LockKeyhole
            size={17}
            color={theme.colors.primary}
          />

          <Text
            style={
              styles.lockedMessageText
            }>
            This certificate is
            currently locked by the
            academy.
          </Text>

        </View>
      ) : (
        <View
          style={
            styles.actionRow
          }>

          <Pressable
            onPress={
              onView
            }
            disabled={
              busy
            }
            style={({pressed}) => [
              styles.secondaryAction,
              pressed &&
                !busy &&
                styles.pressed,
              busy &&
                styles.actionDisabled,
            ]}>

            {viewLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.secondary}
              />
            ) : (
              <Eye
                size={18}
                color={theme.colors.secondary}
              />
            )}

            <Text
              style={
                styles.secondaryActionText
              }>
              View
            </Text>

          </Pressable>

          <Pressable
            onPress={
              onDownload
            }
            disabled={
              busy
            }
            style={({pressed}) => [
              styles.primaryAction,
              pressed &&
                !busy &&
                styles.pressed,
              busy &&
                styles.actionDisabled,
            ]}>

            {downloadLoading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.black}
              />
            ) : (
              <Download
                size={18}
                color={theme.colors.black}
              />
            )}

            <Text
              style={
                styles.primaryActionText
              }>
              Download
            </Text>

          </Pressable>

        </View>
      )}

    </View>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const {styles} =
    useCertificatesTheme();

  return (
    <View
      style={
        styles.metaItem
      }>

      <View
        style={
          styles.metaIcon
        }>
        {icon}
      </View>

      <View
        style={
          styles.metaText
        }>

        <Text
          style={
            styles.metaLabel
          }>
          {label}
        </Text>

        <Text
          style={
            styles.metaValue
          }
          numberOfLines={2}>
          {value}
        </Text>

      </View>

    </View>
  );
}

function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  const {styles} =
    useCertificatesTheme();

  return (
    <View
      style={
        styles.statCard
      }>

      <View
        style={
          styles.statIcon
        }>
        {icon}
      </View>

      <Text
        style={[
          styles.statValue,
          {color},
        ]}>
        {value}
      </Text>

      <Text
        style={
          styles.statLabel
        }>
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
    useCertificatesTheme();

  return (
    <Pressable
      onPress={
        onPress
      }
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

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    container: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 42,
    },

    header: {
      overflow: 'hidden',
      marginBottom: 18,
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

    headerIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    eyebrow: {
      color:
        theme.colors.primary,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.8,
    },

    title: {
      marginTop: 6,
      color: theme.colors.textPrimary,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      letterSpacing: -0.7,
    },

    titleAccent: {
      color: theme.colors.primary,
    },

    subtitle: {
      marginTop: 7,
      maxWidth: 335,
      color:
        theme.colors.textSecondary,
      fontSize: 12,
      lineHeight: 19,
      fontWeight: '500',
    },

    statsGrid: {
      flexDirection: 'row',
      gap: 9,
      marginBottom: 14,
    },

    statCard: {
      flex: 1,
      minHeight: 115,
      padding: 12,
      borderRadius: 18,
      backgroundColor:
        theme.colors.surface,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.surfaceElevated,
    },

    statValue: {
      marginTop: 11,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: '900',
    },

    statLabel: {
      marginTop: 3,
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.7,
    },

    securityCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 18,
      backgroundColor:
        theme.colors.secondarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      marginBottom: 17,
    },

    securityIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.secondarySoft,
    },

    securityContent: {
      flex: 1,
      marginLeft: 12,
    },

    securityTitle: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '900',
    },

    securityDescription: {
      marginTop: 3,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 14,
    },

    filterContainer: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 15,
      backgroundColor:
        theme.colors.surface,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      marginBottom: 23,
    },

    filterButton: {
      flex: 1,
      minHeight: 41,
      borderRadius: 11,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
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
        theme.colors.textSecondary,
      fontSize: 9,
      fontWeight: '800',
    },

    filterTextActive: {
      color: theme.colors.black,
    },

    filterCount: {
      minWidth: 21,
      height: 21,
      paddingHorizontal: 5,
      marginLeft: 5,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.surfaceElevated,
    },

    filterCountActive: {
      backgroundColor:
        'rgba(0,0,0,0.13)',
    },

    filterCountText: {
      color:
        theme.colors.textSecondary,
      fontSize: 7,
      fontWeight: '900',
    },

    filterCountTextActive: {
      color: theme.colors.black,
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
    },

    sectionSubtitle: {
      marginTop: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
    },

    refreshButton: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.surface,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    stateCard: {
      minHeight: 275,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 27,
      paddingVertical: 30,
      borderRadius: 21,
      backgroundColor:
        theme.colors.surface,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    errorIcon: {
      width: 64,
      height: 64,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.secondarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    stateTitle: {
      marginTop: 16,
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
    },

    stateDescription: {
      marginTop: 8,
      maxWidth: 300,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    retryButton: {
      minHeight: 47,
      marginTop: 18,
      paddingHorizontal: 19,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor:
        theme.colors.primary,
    },

    retryButtonText: {
      color: theme.colors.black,
      fontSize: 12,
      fontWeight: '900',
    },

    list: {
      gap: 13,
    },

    certificateCard: {
      padding: 15,
      borderRadius: 20,
      backgroundColor:
        theme.colors.surface,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    certificateCardLocked: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    certificateTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    certificateBadge: {
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.secondarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    certificateBadgeLocked: {
      backgroundColor:
        theme.colors.primarySoft,
      borderColor:
        theme.colors.borderStrong,
    },

    certificateHeading: {
      flex: 1,
      marginLeft: 12,
    },

    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 8,
    },

    cardEyebrow: {
      color: theme.colors.info,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1.15,
    },

    statusPill: {
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },

    statusPillAvailable: {
      backgroundColor:
        theme.colors.secondarySoft,
      borderColor:
        theme.colors.borderStrong,
    },

    statusPillLocked: {
      backgroundColor:
        theme.colors.primarySoft,
      borderColor:
        theme.colors.borderStrong,
    },

    statusPillText: {
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.6,
    },

    statusTextAvailable: {
      color:
        theme.colors.secondaryStrong,
    },

    statusTextLocked: {
      color: theme.colors.primary,
    },

    cardTitle: {
      marginTop: 5,
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '900',
    },

    cardCourse: {
      marginTop: 4,
      color:
        theme.colors.secondaryStrong,
      fontSize: 10,
      lineHeight: 15,
      fontWeight: '700',
    },

    cardDescription: {
      marginTop: 13,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
    },

    metaGrid: {
      marginTop: 14,
      gap: 9,
    },

    metaItem: {
      minHeight: 53,
      paddingHorizontal: 11,
      paddingVertical: 9,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    metaIcon: {
      width: 31,
      height: 31,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    metaText: {
      flex: 1,
      marginLeft: 10,
    },

    metaLabel: {
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.5,
    },

    metaValue: {
      marginTop: 3,
      color: theme.colors.textPrimary,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: '700',
    },

    actionRow: {
      flexDirection: 'row',
      gap: 9,
      marginTop: 14,
    },

    secondaryAction: {
      flex: 1,
      minHeight: 49,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        theme.colors.secondarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    secondaryActionText: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 11,
      fontWeight: '900',
    },

    primaryAction: {
      flex: 1.2,
      minHeight: 49,
      borderRadius: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        theme.colors.primary,
      borderWidth: 1,
      borderColor:
        theme.colors.primaryStrong,
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

    primaryActionText: {
      color: theme.colors.black,
      fontSize: 11,
      fontWeight: '900',
    },

    actionDisabled: {
      opacity: 0.55,
    },

    lockedMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      padding: 12,
      borderRadius: 14,
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    lockedMessageText: {
      flex: 1,
      marginLeft: 9,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 14,
    },

    bottomInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 17,
      padding: 14,
      borderRadius: 17,
      backgroundColor:
        theme.colors.backgroundAlt,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    bottomInfoText: {
      flex: 1,
      marginLeft: 10,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    pressed: {
      opacity: 0.84,
    },
  });
