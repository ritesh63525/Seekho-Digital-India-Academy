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
  View,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  GraduationCap,
  HelpCircle,
  Info,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import {
  getStudentProfile,
  StudentProfileData,
} from '../../services/studentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

function useProfileTheme() {
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

export default function ProfileScreen() {
  const {theme, styles} = useProfileTheme();

  const navigation =
    useNavigation<any>();

  const {
    accessToken,
    portalEmail,
    logout,
  } = useApp();

  const [
    student,
    setStudent,
  ] =
    useState<StudentProfileData | null>(
      null,
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
  ] = useState<string | null>(
    null,
  );

  const loadProfile =
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
            await getStudentProfile(
              accessToken,
            );

          setStudent(
            response.data.student,
          );
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to load student profile.';

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
    loadProfile();
  }, [loadProfile]);

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await loadProfile(false);

      setRefreshing(false);
    };

  const handleLogout = () => {
    Alert.alert(
      'Sign out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign out',
          style: 'destructive',

          onPress: () => {
            logout();

            navigation.reset({
              index: 0,

              routes: [
                {
                  name: 'Login',
                },
              ],
            });
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
            Loading your profile...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

  if (!student) {
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

          <UserRound
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
            Profile unavailable
          </Text>

          <Text
            style={
              styles.errorText
            }>
            {error ||
              'Unable to load your profile.'}
          </Text>

          <Pressable
            onPress={() =>
              loadProfile()
            }
            style={
              styles.retryButton
            }>

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

  const initials =
    getInitials(
      student.name,
    );

  return (
    <SafeAreaView
      style={styles.safe}>
      <StatusBar
        barStyle={theme.dark ? "light-content" : "dark-content"}
      />

      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
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
              STUDENT PROFILE
            </Text>

            <Text
              style={
                styles.pageTitle
              }>
              My Profile
            </Text>

          </View>

          <View
            style={
              styles.verifiedIcon
            }>

            <BadgeCheck
              size={24}
              color={
                theme.colors.secondary
              }
            />

          </View>

        </View>

        {/* PROFILE CARD */}

        <View
          style={
            styles.profileCard
          }>

          <View
            style={
              styles.avatar
            }>

            <Text
              style={
                styles.avatarText
              }>
              {initials}
            </Text>

          </View>

          <View
            style={
              styles.profileTextArea
            }>

            <Text
              style={
                styles.name
              }>
              {student.name ||
                'Student'}
            </Text>

            <Text
              style={
                styles.course
              }>
              {student.course ||
                'Course not available'}
            </Text>

            <View
              style={
                styles.statusRow
              }>

              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }>
                {formatStatus(
                  student.status,
                )}
              </Text>

            </View>

          </View>

        </View>

        {/* LOGIN ACCOUNT */}

        <SectionTitle
          title="Portal Account"
        />

        <View
          style={
            styles.sectionCard
          }>

          <InfoRow
            icon={
              <ShieldCheck
                size={19}
                color={
                  theme.colors
                    .primary
                }
              />
            }
            label="Portal Email"
            value={
              portalEmail ||
              'Not available'
            }
          />

          <Divider />

          <InfoRow
            icon={
              <UserRound
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            label="Student ID"
            value={
              student.id ||
              'Not available'
            }
          />

        </View>

        {/* PERSONAL DETAILS */}

        <SectionTitle
          title="Personal Details"
        />

        <View
          style={
            styles.sectionCard
          }>

          <InfoRow
            icon={
              <Mail
                size={19}
                color={
                  theme.colors
                    .primary
                }
              />
            }
            label="Personal Email"
            value={
              student.email ||
              'Not available'
            }
          />

          <Divider />

          <InfoRow
            icon={
              <Phone
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            label="Phone"
            value={
              student.phone ||
              'Not available'
            }
          />

          <Divider />

          <InfoRow
            icon={
              <MapPin
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            label="Address"
            value={
              student.address ||
              'Not available'
            }
          />

        </View>

        {/* ACADEMIC DETAILS */}

        <SectionTitle
          title="Academic Details"
        />

        <View
          style={
            styles.sectionCard
          }>

          <InfoRow
            icon={
              <BookOpen
                size={19}
                color={
                  theme.colors
                    .primary
                }
              />
            }
            label="Course"
            value={
              student.course ||
              'Not available'
            }
          />

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
            label="Admission Date"
            value={
              formatDate(
                student
                  .admission_date,
              )
            }
          />

          <Divider />

          <InfoRow
            icon={
              <GraduationCap
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            label="Student Status"
            value={
              formatStatus(
                student.status,
              )
            }
          />

        </View>

        {/* FEE DETAILS */}

        <SectionTitle
          title="Fee Details"
        />

        <View
          style={
            styles.feeCard
          }>

          <View
            style={
              styles.feeHeader
            }>

            <CircleDollarSign
              size={22}
              color={
                theme.colors.primary
              }
            />

            <View>

              <Text
                style={
                  styles.feeHeading
                }>
                Fee Status
              </Text>

              <Text
                style={
                  styles.feeStatus
                }>
                {formatStatus(
                  student.fees_status,
                )}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.feeGrid
            }>

            <FeeItem
              label="Total"
              value={
                formatMoney(
                  student.total_fees,
                )
              }
            />

            <FeeItem
              label="Paid"
              value={
                formatMoney(
                  student.paid_fees,
                )
              }
            />

            <FeeItem
              label="Remaining"
              value={
                formatMoney(
                  student
                    .remaining_fees,
                )
              }
            />

          </View>

        </View>

        {/* NOTE */}

        <View
          style={
            styles.readOnlyBox
          }>

          <ShieldCheck
            size={20}
            color={
              theme.colors.primary
            }
          />

          <Text
            style={
              styles.readOnlyText
            }>
            Profile details are
            managed by the academy.
            Contact support if any
            information needs to be
            corrected.
          </Text>

        </View>

        {/* ACCOUNT OPTIONS */}

        <SectionTitle
          title="Account"
        />

        <View
          style={
            styles.sectionCard
          }>

          <MenuRow
            icon={
              <Settings
                size={20}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            title="Settings"
            onPress={() =>
              navigation.navigate(
                'Settings',
              )
            }
          />

          <Divider />

          <MenuRow
            icon={
              <HelpCircle
                size={20}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            title="Support"
            onPress={() =>
              navigation.navigate(
                'Support',
              )
            }
          />

          <Divider />

          <MenuRow
            icon={
              <Info
                size={20}
                color={
                  theme.colors
                    .textSecondary
                }
              />
            }
            title="About"
            onPress={() =>
              navigation.navigate(
                'About',
              )
            }
          />

        </View>

        {/* LOGOUT */}

        <Pressable
          onPress={
            handleLogout
          }
          style={({pressed}) => [
            styles.logoutButton,

            pressed &&
              styles
                .logoutButtonPressed,
          ]}>

          <LogOut
            size={20}
            color={theme.colors.danger}
          />

          <Text
            style={
              styles.logoutText
            }>
            Sign Out
          </Text>

        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================================
 * COMPONENTS
 * =====================================================
 */

function SectionTitle({
  title,
}: {
  title: string;
}) {
  const {styles} = useProfileTheme();

  return (
    <Text
      style={
        styles.sectionTitle
      }>
      {title}
    </Text>
  );
}

function Divider() {
  const {styles} = useProfileTheme();

  return (
    <View
      style={
        styles.divider
      }
    />
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
  const {styles} = useProfileTheme();

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

function FeeItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const {styles} = useProfileTheme();

  return (
    <View
      style={styles.feeItem}>

      <Text
        style={
          styles.feeItemLabel
        }>
        {label}
      </Text>

      <Text
        style={
          styles.feeItemValue
        }>
        {value}
      </Text>

    </View>
  );
}

function MenuRow({
  icon,
  title,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  onPress: () => void;
}) {
  const {theme, styles} = useProfileTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.menuRow,

        pressed &&
          styles.menuPressed,
      ]}>

      <View
        style={
          styles.menuLeft
        }>

        <View
          style={
            styles.infoIcon
          }>
          {icon}
        </View>

        <Text
          style={
            styles.menuTitle
          }>
          {title}
        </Text>

      </View>

      <ChevronRight
        size={19}
        color={
          theme.colors.textLight
        }
      />

    </Pressable>
  );
}

/*
 * =====================================================
 * HELPERS
 * =====================================================
 */

function getInitials(
  name?: string | null,
) {
  if (!name) {
    return 'S';
  }

  const parts =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return 'S';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

function formatStatus(
  value?: string | null,
) {
  if (!value) {
    return 'Not available';
  }

  return value
    .replace(/_/g, ' ')
    .replace(
      /\b\w/g,
      character =>
        character.toUpperCase(),
    );
}

function formatDate(
  value?: string | null,
) {
  if (!value) {
    return 'Not available';
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

function formatMoney(
  value?: number | null,
) {
  if (
    value === null ||
    value === undefined
  ) {
    return '₹0';
  }

  return `₹${Number(
    value,
  ).toLocaleString('en-IN')}`;
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
      flexDirection: 'row',

      alignItems: 'center',

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

    verifiedIcon: {
      width: 48,

      height: 48,

      borderRadius: 16,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .secondarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.secondary,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.06,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    profileCard: {
      marginTop: 24,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 16,

      padding: 20,

      borderRadius: 24,

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
          ? 0.20
          : 0.06,

      shadowRadius: 14,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      elevation: 3,
    },

    avatar: {
      width: 72,

      height: 72,

      borderRadius: 24,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors.primary,

      borderWidth: 4,

      borderColor:
        theme.colors
          .primarySoft,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.07,

      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 4,
      },

      elevation: 2,
    },

    avatarText: {
      color:
        theme.colors.black,

      fontSize: 22,

      fontWeight: '900',
    },

    profileTextArea: {
      flex: 1,
    },

    name: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 20,

      fontWeight: '900',
    },

    course: {
      marginTop: 4,

      color:
        theme.colors
          .textSecondary,

      fontSize: 12,

      fontWeight: '600',
    },

    statusRow: {
      marginTop: 9,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 7,
    },

    statusDot: {
      width: 7,

      height: 7,

      borderRadius: 10,

      backgroundColor:
        theme.colors.secondary,
    },

    statusText: {
      color:
        theme.colors.secondary,

      fontSize: 10,

      fontWeight: '800',
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

      textTransform:
        'uppercase',
    },

    sectionCard: {
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
          : 0.035,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    infoRow: {
      flexDirection: 'row',

      alignItems: 'center',

      paddingHorizontal: 15,

      paddingVertical: 15,

      gap: 13,
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
        theme.colors
          .textSecondary,

      fontSize: 10,

      fontWeight: '700',
    },

    infoValue: {
      marginTop: 3,

      color:
        theme.colors
          .textPrimary,

      fontSize: 13,

      lineHeight: 19,

      fontWeight: '700',
    },

    divider: {
      height: 1,

      marginLeft: 66,

      backgroundColor:
        theme.colors
          .borderStrong,
    },

    feeCard: {
      padding: 18,

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
          : 0.035,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 1,
    },

    feeHeader: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,
    },

    feeHeading: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      fontWeight: '700',
    },

    feeStatus: {
      marginTop: 2,

      color:
        theme.colors.primary,

      fontSize: 14,

      fontWeight: '900',
    },

    feeGrid: {
      marginTop: 18,

      flexDirection: 'row',

      gap: 8,
    },

    feeItem: {
      flex: 1,

      paddingVertical: 12,

      paddingHorizontal: 8,

      alignItems: 'center',

      borderRadius: 13,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    feeItemLabel: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      fontWeight: '700',
    },

    feeItemValue: {
      marginTop: 4,

      color:
        theme.colors
          .textPrimary,

      fontSize: 13,

      fontWeight: '900',
    },

    readOnlyBox: {
      marginTop: 18,

      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 11,

      padding: 15,

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

      backgroundColor:
        theme.colors
          .primarySoft,
    },

    readOnlyText: {
      flex: 1,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    menuRow: {
      minHeight: 62,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      paddingHorizontal: 14,
    },

    menuPressed: {
      opacity: 0.65,
    },

    menuLeft: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 13,
    },

    menuTitle: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 13,

      fontWeight: '700',
    },

    logoutButton: {
      height: 56,

      marginTop: 25,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 9,

      borderRadius: 18,

      borderWidth: 1,

      borderColor:
        theme.colors.danger,

      backgroundColor:
        theme.colors.surfaceSoft,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.08
          : 0.025,

      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 1,
    },

    logoutButtonPressed: {
      opacity: 0.7,
    },

    logoutText: {
      color:
        theme.colors.danger,

      fontSize: 13,

      fontWeight: '900',
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

      paddingHorizontal: 22,

      paddingVertical: 12,

      borderRadius: 14,

      backgroundColor:
        theme.colors.primary,
    },

    retryButtonText: {
      color:
        theme.colors.black,

      fontSize: 12,

      fontWeight: '900',
    },
  });