import React, {useCallback, useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  Bell,
  BookOpen,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  CreditCard,
  FileText,
  GraduationCap,
  Info,
  LockKeyhole,
  LogOut,
  Megaphone,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  UserRound,
} from 'lucide-react-native';

import {
  useApp,
} from '../../state/AppContext';

import {
  getStudentLearningProfile,
  type StudentLearningProfile,
} from '../../services/learningApi';

import type {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import ThemeToggle from '../../components/ThemeToggle';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type ExpandedSection =
  | 'personal'
  | 'academic'
  | 'fees'
  | 'phone'
  | null;

function buildPalette(
  theme: AppTheme,
) {
  return {
    bg:
      theme.colors.background,

    card:
      theme.colors.surface,

    border:
      theme.colors.border,

    strongBorder:
      theme.colors.borderStrong,

    text:
      theme.colors.textPrimary,

    muted:
      theme.colors.textSecondary,

    light:
      theme.colors.textLight,

    green:
      theme.colors.secondary,

    orange:
      theme.colors.primary,

    greenSoft:
      theme.colors.secondarySoft,

    red:
      theme.colors.danger,
  };
}

function useSettingsTheme() {
  const {
    theme,
  } =
    useTheme();

  const C =
    useMemo(
      () =>
        buildPalette(
          theme,
        ),
      [
        theme,
      ],
    );

  const styles =
    useMemo(
      () =>
        createStyles(
          C,
          theme,
        ),
      [
        C,
        theme,
      ],
    );

  return {
    theme,
    C,
    styles,
  };
}

function isUnauthorized(
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : String(
          error ?? '',
        );

  return (
    message.includes(
      '401',
    ) ||
    message.includes(
      '403',
    )
  );
}

function money(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined ||
    value === ''
  ) {
    return 'Not available';
  }

  const numeric =
    Number(
      value,
    );

  if (
    !Number.isFinite(
      numeric,
    )
  ) {
    return String(
      value,
    );
  }

  return `₹${numeric.toLocaleString(
    'en-IN',
  )}`;
}

export default function SettingsScreen() {
  const {
    theme,
    C,
    styles,
  } =
    useSettingsTheme();

  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        RootStackParamList
      >
    >();

  const {
    accessToken,
    refreshAccessToken,
    logout,
  } =
    useApp();

  const [
    profile,
    setProfile,
  ] =
    useState<
      StudentLearningProfile | null
    >(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState(
      '',
    );

  const [
    reload,
    setReload,
  ] =
    useState(
      0,
    );

  const [
    expanded,
    setExpanded,
  ] =
    useState<
      ExpandedSection
    >(
      null,
    );

  /*
   * ============================================
   * LOAD PROFILE
   *
   * Current token first.
   * 401 / 403 -> refresh token -> retry once.
   * ============================================
   */

  const loadProfile =
    useCallback(
      async () => {
        if (
          !accessToken
        ) {
          throw new Error(
            'No active student session. Please sign in again.',
          );
        }

        try {
          return await getStudentLearningProfile(
            accessToken,
          );
        } catch (
          firstError
        ) {
          if (
            !isUnauthorized(
              firstError,
            )
          ) {
            throw firstError;
          }

          const freshToken =
            await refreshAccessToken();

          return getStudentLearningProfile(
            freshToken,
          );
        }
      },
      [
        accessToken,
        refreshAccessToken,
      ],
    );

  useFocusEffect(
    useCallback(
      () => {
        let active =
          true;

        const load =
          async () => {
            setLoading(
              true,
            );

            setError(
              '',
            );

            try {
              const result =
                await loadProfile();

              if (
                active
              ) {
                setProfile(
                  result,
                );
              }
            } catch (
              caughtError
            ) {
              if (
                active
              ) {
                setProfile(
                  null,
                );

                setError(
                  caughtError instanceof Error
                    ? caughtError.message
                    : 'Unable to load your student profile.',
                );
              }
            } finally {
              if (
                active
              ) {
                setLoading(
                  false,
                );
              }
            }
          };

        void load();

        return () => {
          active =
            false;
        };
      },
      [
        loadProfile,
        reload,
      ],
    ),
  );

  /*
   * ============================================
   * PROFILE VALUES
   * ============================================
   */

  const raw =
    (
      profile ??
      {}
    ) as
      StudentLearningProfile &
      Record<
        string,
        any
      >;

  const name =
    profile?.name ||
    'Student';

  const email =
    profile?.email ||
    '';

  const course =
    profile
      ?.assignedCourseTitle ||
    '';

  const status =
    profile
      ?.studentStatus ||
    '';

  const phone =
    String(
      raw.phone ??
        raw.mobile ??
        raw.phone_number ??
        raw.mobile_number ??
        '',
    ).trim();

  const totalFees =
    money(
      raw.total_fees ??
        raw.fees ??
        raw.course_fee,
    );

  const paidFees =
    money(
      raw.paid_fees ??
        raw.fees_paid ??
        raw.paid_amount,
    );

  const remainingFees =
    money(
      raw.remaining_fees ??
        raw.balance_fees ??
        raw.pending_fees ??
        raw.due_amount,
    );

  const feesStatus =
    String(
      raw.fees_status ??
        raw.fee_status ??
        raw.payment_status ??
        '',
    ).trim();

  const initial =
    name
      .trim()
      .charAt(
        0,
      )
      .toUpperCase() ||
    'S';

  /*
   * ============================================
   * EXPAND / COLLAPSE
   * ============================================
   */

  const toggle =
    (
      section:
        ExpandedSection,
    ) => {
      setExpanded(
        current =>
          current ===
          section
            ? null
            : section,
      );
    };

  /*
   * ============================================
   * LOGOUT
   * ============================================
   */

  const handleLogout =
    () => {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out from this device?',
        [
          {
            text:
              'Cancel',

            style:
              'cancel',
          },

          {
            text:
              'Log Out',

            style:
              'destructive',

            onPress:
              () => {
                logout();

                navigation.reset(
                  {
                    index:
                      0,

                    routes:
                      [
                        {
                          name:
                            'Login',
                        },
                      ],
                  },
                );
              },
          },
        ],
      );
    };

  return (
    <SafeAreaView
      style={
        styles.safe
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

        {/* =====================================
            HEADER
        ====================================== */}

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
              ACCOUNT
            </Text>

            <Text
              style={
                styles.title
              }>
              Settings
            </Text>

            <Text
              style={
                styles.subtitle
              }>
              Manage your student account and academy services.
            </Text>

          </View>

          <Pressable
            onPress={() =>
              setReload(
                value =>
                  value + 1,
              )
            }
            style={({
              pressed,
            }) => [
              styles.refreshButton,

              pressed &&
                styles.pressed,
            ]}>

            <RefreshCw
              size={
                19
              }
              color={
                C.green
              }
            />

          </Pressable>

        </View>

        {/* =====================================
            STUDENT CARD
        ====================================== */}

        <View
          style={
            styles.studentCard
          }>

          {loading ? (
            <View
              style={
                styles.stateRow
              }>

              <ActivityIndicator
                size="small"
                color={
                  C.green
                }
              />

              <Text
                style={
                  styles.stateText
                }>
                Loading your account...
              </Text>

            </View>
          ) : error ? (
            <Pressable
              onPress={() =>
                setReload(
                  value =>
                    value + 1,
                )
              }
              style={
                styles.errorBox
              }>

              <Text
                style={
                  styles.errorTitle
                }>
                Unable to load account
              </Text>

              <Text
                style={
                  styles.errorText
                }>
                {error}
              </Text>

              <Text
                style={
                  styles.retryText
                }>
                Tap to retry
              </Text>

            </Pressable>
          ) : (
            <>

              <View
                style={
                  styles.avatar
                }>

                <Text
                  style={
                    styles.avatarText
                  }>
                  {initial}
                </Text>

              </View>

              <View
                style={
                  styles.studentMain
                }>

                <Text
                  style={
                    styles.studentName
                  }
                  numberOfLines={
                    1
                  }>
                  {name}
                </Text>

                <Text
                  style={
                    styles.studentEmail
                  }
                  numberOfLines={
                    1
                  }>
                  {email ||
                    'Email unavailable'}
                </Text>

                {!!course && (
                  <Text
                    style={
                      styles.studentCourse
                    }
                    numberOfLines={
                      2
                    }>
                    {course}
                  </Text>
                )}

              </View>

              {!!status && (
                <View
                  style={
                    styles.statusBadge
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
                    {status}
                  </Text>

                </View>
              )}

            </>
          )}

        </View>

        {/* =====================================
            APPEARANCE
        ====================================== */}

        <SectionTitle
          title="Appearance"
          subtitle="Choose the look that feels best for you."
        />

        <View
          style={
            styles.card
          }>

          <View
            style={
              styles.appearance
            }>

            <View
              style={
                styles.row
              }>

              <IconBox>

                <Smartphone
                  size={
                    20
                  }
                  color={
                    C.orange
                  }
                />

              </IconBox>

              <View
                style={
                  styles.rowMain
                }>

                <Text
                  style={
                    styles.rowTitle
                  }>
                  App Theme
                </Text>

                <Text
                  style={
                    styles.rowSubtitle
                  }>
                  Premium Light and Dark mode.
                </Text>

              </View>

            </View>

            <View
              style={
                styles.toggleArea
              }>

              <ThemeToggle />

            </View>

          </View>

        </View>

        {/* =====================================
            ACCOUNT
        ====================================== */}

        <SectionTitle
          title="Account"
          subtitle="Personal, academic and fee information."
        />

        <View
          style={
            styles.card
          }>

          {/* STUDENT PROFILE */}

          <SettingAction
            icon={
              <UserRound
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Student Profile"
            subtitle="View your personal information"
            onPress={() =>
              toggle(
                'personal',
              )
            }
            expanded={
              expanded ===
              'personal'
            }
          />

          {expanded ===
            'personal' && (
            <ExpandedCard>

              <Detail
                label="Student Name"
                value={
                  name
                }
              />

              <Divider />

              <Detail
                label="Portal Email"
                value={
                  email ||
                  'Not available'
                }
              />

              <Divider />

              <Detail
                label="Phone Number"
                value={
                  phone ||
                  'Not available'
                }
              />

              <Divider />

              <Detail
                label="Account Status"
                value={
                  status ||
                  'Not available'
                }
              />

              <Text
                style={
                  styles.note
                }>
                Personal information is loaded from your student record.
                Changes are managed by the academy.
              </Text>

            </ExpandedCard>
          )}

          <Divider />

          {/* ACADEMIC */}

          <SettingAction
            icon={
              <GraduationCap
                size={
                  21
                }
                color={
                  C.orange
                }
              />
            }
            title="Academic Profile"
            subtitle="View your assigned course"
            onPress={() =>
              toggle(
                'academic',
              )
            }
            expanded={
              expanded ===
              'academic'
            }
          />

          {expanded ===
            'academic' && (
            <ExpandedCard>

              <Detail
                label="Assigned Course"
                value={
                  course ||
                  'Not available'
                }
              />

              <Divider />

              <Detail
                label="Course Progress"
                value="Not available"
              />

              <Text
                style={
                  styles.note
                }>
                Course progress will appear when the learning-progress
                API is connected.
              </Text>

            </ExpandedCard>
          )}

          <Divider />

          {/* FEES */}

          <SettingAction
            icon={
              <CreditCard
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Fees & Payments"
            subtitle="View your current fee summary"
            onPress={() =>
              toggle(
                'fees',
              )
            }
            expanded={
              expanded ===
              'fees'
            }
          />

          {expanded ===
            'fees' && (
            <ExpandedCard>

              <Detail
                label="Total Fees"
                value={
                  totalFees
                }
              />

              <Divider />

              <Detail
                label="Paid Fees"
                value={
                  paidFees
                }
              />

              <Divider />

              <Detail
                label="Remaining Fees"
                value={
                  remainingFees
                }
              />

              <Divider />

              <Detail
                label="Fee Status"
                value={
                  feesStatus ||
                  'Not available'
                }
              />

              <Text
                style={
                  styles.note
                }>
                Online payment and transaction history are not connected
                yet. This section shows the fee information available in
                your student record.
              </Text>

            </ExpandedCard>
          )}

        </View>

        {/* =====================================
            NOTIFICATIONS
        ====================================== */}

        <SectionTitle
          title="Notifications"
          subtitle="Academy announcements and preferences."
        />

        <View
          style={
            styles.card
          }>

          <SettingAction
            icon={
              <Bell
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Notifications"
            subtitle="Open academy announcements"
            onPress={() =>
              navigation.navigate(
                'Notifications',
              )
            }
          />

          <Divider />

          <SettingAction
            icon={
              <Megaphone
                size={
                  20
                }
                color={
                  C.orange
                }
              />
            }
            title="Update Preferences"
            subtitle="Notification preferences are not connected"
            status="Pending"
          />

        </View>

        <View
          style={
            styles.infoCard
          }>

          <Info
            size={
              19
            }
            color={
              C.orange
            }
          />

          <Text
            style={
              styles.infoText
            }>
            Notification switches will be enabled when the preferences
            API is available.
          </Text>

        </View>

        {/* =====================================
            SECURITY
        ====================================== */}

        <SectionTitle
          title="Security"
          subtitle="Student portal security and account access."
        />

        <View
          style={
            styles.card
          }>

          {/* CHANGE PASSWORD */}

          <SettingAction
            icon={
              <LockKeyhole
                size={
                  20
                }
                color={
                  C.orange
                }
              />
            }
            title="Change Password"
            subtitle="Update your student portal password"
            onPress={() =>
              navigation.navigate(
                'ChangePassword',
                {
                  portalEmail:
                    email ||
                    'Student',
                },
              )
            }
          />

          <Divider />

          {/* PHONE */}

          <SettingAction
            icon={
              <Phone
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Phone Number"
            subtitle={
              phone
                ? 'View your registered phone number'
                : 'Phone number is not available'
            }
            onPress={() =>
              toggle(
                'phone',
              )
            }
            expanded={
              expanded ===
              'phone'
            }
          />

          {expanded ===
            'phone' && (
            <ExpandedCard>

              <Detail
                label="Registered Number"
                value={
                  phone ||
                  'Not available'
                }
              />

              <Text
                style={
                  styles.note
                }>
                Student-side phone editing is not available.
                Contact the academy if this number needs updating.
              </Text>

            </ExpandedCard>
          )}

          <Divider />

          {/* ACTIVE SESSIONS */}

          <SettingAction
            icon={
              <ShieldCheck
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Active Sessions"
            subtitle="Signed-in device management"
            status="Backend Pending"
          />

        </View>

        {/* =====================================
            APPLICATION
        ====================================== */}

        <SectionTitle
          title="Application"
          subtitle="Support, legal information and app details."
        />

        <View
          style={
            styles.card
          }>

          {/* SUPPORT */}

          <SettingAction
            icon={
              <CircleHelp
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Help & Support"
            subtitle="Open support requests"
            onPress={() =>
              navigation.navigate(
                'Support',
              )
            }
          />

          <Divider />

          {/* PRIVACY */}

          <SettingAction
            icon={
              <FileText
                size={
                  20
                }
                color={
                  C.orange
                }
              />
            }
            title="Privacy Policy"
            subtitle="Read privacy information"
            onPress={() =>
              navigation.navigate(
                'Legal',
                {
                  type:
                    'privacy',
                },
              )
            }
          />

          <Divider />

          {/* TERMS */}

          <SettingAction
            icon={
              <BookOpen
                size={
                  20
                }
                color={
                  C.green
                }
              />
            }
            title="Terms & Conditions"
            subtitle="Read the app terms of use"
            onPress={() =>
              navigation.navigate(
                'Legal',
                {
                  type:
                    'terms',
                },
              )
            }
          />

          <Divider />

          {/* APPLICATION INFO */}

          <View
            style={
              styles.versionRow
            }>

            <IconBox>

              <Smartphone
                size={
                  20
                }
                color={
                  C.green
                }
              />

            </IconBox>

            <View
              style={
                styles.rowMain
              }>

              <Text
                style={
                  styles.rowTitle
                }>
                Application
              </Text>

              <Text
                style={
                  styles.rowSubtitle
                }>
                Seekho Digital India Academy
              </Text>

            </View>

          </View>

        </View>

        {/* =====================================
            LOGOUT
        ====================================== */}

        <Pressable
          onPress={
            handleLogout
          }
          style={({
            pressed,
          }) => [
            styles.logout,

            pressed &&
              styles.pressed,
          ]}>

          <LogOut
            size={
              20
            }
            color={
              C.red
            }
          />

          <View
            style={
              styles.logoutMain
            }>

            <Text
              style={
                styles.logoutTitle
              }>
              Log Out
            </Text>

            <Text
              style={
                styles.logoutSubtitle
              }>
              Sign out from this device
            </Text>

          </View>

          <ChevronRight
            size={
              19
            }
            color={
              C.red
            }
          />

        </Pressable>

        <Text
          style={
            styles.footer
          }>
          Seekho Digital India Academy
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
}

/*
 * ============================================
 * SECTION TITLE
 * ============================================
 */

function SectionTitle({
  title,
  subtitle,
}: {
  title:
    string;

  subtitle:
    string;
}) {
  const {
    styles,
  } =
    useSettingsTheme();

  return (
    <View
      style={
        styles.sectionHeader
      }>

      <Text
        style={
          styles.sectionTitle
        }>
        {title}
      </Text>

      <Text
        style={
          styles.sectionSubtitle
        }>
        {subtitle}
      </Text>

    </View>
  );
}

/*
 * ============================================
 * ICON BOX
 * ============================================
 */

function IconBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    styles,
  } =
    useSettingsTheme();

  return (
    <View
      style={
        styles.iconBox
      }>
      {children}
    </View>
  );
}

/*
 * ============================================
 * SETTING ACTION
 * ============================================
 */

function SettingAction({
  icon,
  title,
  subtitle,
  onPress,
  expanded,
  status,
}: {
  icon:
    React.ReactNode;

  title:
    string;

  subtitle:
    string;

  onPress?:
    () => void;

  expanded?:
    boolean;

  status?:
    string;
}) {
  const {
    C,
    styles,
  } =
    useSettingsTheme();

  const enabled =
    typeof onPress ===
    'function';

  return (
    <Pressable
      onPress={
        onPress
      }
      disabled={
        !enabled
      }
      style={({
        pressed,
      }) => [
        styles.settingRow,

        pressed &&
          enabled &&
          styles.pressed,
      ]}>

      <IconBox>
        {icon}
      </IconBox>

      <View
        style={
          styles.rowMain
        }>

        <Text
          style={
            styles.rowTitle
          }>
          {title}
        </Text>

        <Text
          style={
            styles.rowSubtitle
          }>
          {subtitle}
        </Text>

      </View>

      {enabled ? (
        expanded ? (
          <ChevronUp
            size={
              18
            }
            color={
              C.green
            }
          />
        ) : (
          <ChevronRight
            size={
              18
            }
            color={
              C.green
            }
          />
        )
      ) : (
        <Text
          style={
            styles.pending
          }>
          {status ||
            'Soon'}
        </Text>
      )}

    </Pressable>
  );
}

/*
 * ============================================
 * EXPANDED CARD
 * ============================================
 */

function ExpandedCard({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    styles,
  } =
    useSettingsTheme();

  return (
    <View
      style={
        styles.expanded
      }>
      {children}
    </View>
  );
}

/*
 * ============================================
 * DETAIL
 * ============================================
 */

function Detail({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  const {
    styles,
  } =
    useSettingsTheme();

  return (
    <View
      style={
        styles.detailRow
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
  );
}

/*
 * ============================================
 * DIVIDER
 * ============================================
 */

function Divider() {
  const {
    styles,
  } =
    useSettingsTheme();

  return (
    <View
      style={
        styles.divider
      }
    />
  );
}

/*
 * ============================================
 * STYLES
 * ============================================
 */

function createStyles(
  C:
    ReturnType<
      typeof buildPalette
    >,

  theme:
    AppTheme,
) {
  return StyleSheet.create({

    safe: {
      flex:
        1,

      backgroundColor:
        C.bg,
    },

    container: {
      flex:
        1,

      backgroundColor:
        C.bg,
    },

    content: {
      paddingHorizontal:
        18,

      paddingTop:
        18,

      paddingBottom:
        42,
    },

    header: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap:
        10,

      marginBottom:
        22,
    },

    headerText: {
      flex:
        1,
    },

    eyebrow: {
      color:
        C.green,

      fontSize:
        10,

      fontWeight:
        '900',

      letterSpacing:
        1.7,

      marginBottom:
        7,
    },

    title: {
      color:
        C.text,

      fontSize:
        30,

      lineHeight:
        36,

      fontWeight:
        '900',
    },

    subtitle: {
      color:
        C.muted,

      fontSize:
        12,

      lineHeight:
        19,

      marginTop:
        6,
    },

    refreshButton: {
      width:
        44,

      height:
        44,

      marginTop:
        18,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .greenDark,

      backgroundColor:
        C.greenSoft,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    studentCard: {
      minHeight:
        92,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        12,

      padding:
        15,

      marginBottom:
        24,

      borderRadius:
        22,

      borderWidth:
        1,

      borderColor:
        C.strongBorder,

      backgroundColor:
        C.card,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.05,

      shadowRadius:
        12,

      shadowOffset: {
        width:
          0,

        height:
          6,
      },

      elevation:
        3,
    },

    avatar: {
      width:
        52,

      height:
        52,

      borderRadius:
        17,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .greenDark,

      backgroundColor:
        C.greenSoft,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    avatarText: {
      color:
        C.green,

      fontSize:
        19,

      fontWeight:
        '900',
    },

    studentMain: {
      flex:
        1,

      minWidth:
        0,
    },

    studentName: {
      color:
        C.text,

      fontSize:
        14,

      fontWeight:
        '900',
    },

    studentEmail: {
      color:
        C.muted,

      fontSize:
        10,

      marginTop:
        5,
    },

    studentCourse: {
      color:
        C.orange,

      fontSize:
        10,

      fontWeight:
        '800',

      marginTop:
        6,
    },

    statusBadge: {
      maxWidth:
        90,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        5,

      paddingHorizontal:
        8,

      paddingVertical:
        6,

      borderRadius:
        999,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .greenDark,

      backgroundColor:
        C.greenSoft,
    },

    statusDot: {
      width:
        5,

      height:
        5,

      borderRadius:
        3,

      backgroundColor:
        C.green,
    },

    statusText: {
      flexShrink:
        1,

      color:
        C.green,

      fontSize:
        9,

      fontWeight:
        '800',
    },

    stateRow: {
      flex:
        1,

      minHeight:
        58,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        10,
    },

    stateText: {
      color:
        C.muted,

      fontSize:
        12,
    },

    errorBox: {
      flex:
        1,

      gap:
        6,
    },

    errorTitle: {
      color:
        C.text,

      fontSize:
        13,

      fontWeight:
        '800',
    },

    errorText: {
      color:
        C.muted,

      fontSize:
        11,

      lineHeight:
        17,
    },

    retryText: {
      color:
        C.orange,

      fontSize:
        11,

      fontWeight:
        '800',
    },

    sectionHeader: {
      marginTop:
        7,

      marginBottom:
        12,
    },

    sectionTitle: {
      color:
        C.text,

      fontSize:
        17,

      fontWeight:
        '900',
    },

    sectionSubtitle: {
      color:
        C.muted,

      fontSize:
        10,

      lineHeight:
        15,

      marginTop:
        4,
    },

    card: {
      paddingHorizontal:
        14,

      marginBottom:
        21,

      overflow:
        'hidden',

      borderRadius:
        20,

      borderWidth:
        1,

      borderColor:
        C.strongBorder,

      backgroundColor:
        C.card,
    },

    appearance: {
      paddingVertical:
        15,
    },

    row: {
      minHeight:
        58,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        11,
    },

    toggleArea: {
      marginTop:
        14,

      marginBottom:
        3,
    },

    settingRow: {
      minHeight:
        75,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        11,

      paddingVertical:
        13,
    },

    iconBox: {
      width:
        42,

      height:
        42,

      flexShrink:
        0,

      borderRadius:
        13,

      borderWidth:
        1,

      borderColor:
        C.border,

      backgroundColor:
        theme.colors
          .surfaceSoft,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    rowMain: {
      flex:
        1,

      minWidth:
        0,
    },

    rowTitle: {
      color:
        C.text,

      fontSize:
        12,

      lineHeight:
        17,

      fontWeight:
        '900',
    },

    rowSubtitle: {
      color:
        C.muted,

      fontSize:
        10,

      lineHeight:
        15,

      marginTop:
        4,
    },

    pending: {
      color:
        C.light,

      fontSize:
        9,

      fontWeight:
        '800',
    },

    divider: {
      height:
        1,

      backgroundColor:
        theme.colors
          .divider,
    },

    expanded: {
      paddingHorizontal:
        12,

      paddingVertical:
        6,

      marginBottom:
        12,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        C.border,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    detailRow: {
      minHeight:
        43,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        8,

      paddingVertical:
        8,
    },

    detailLabel: {
      flex:
        1,

      color:
        C.muted,

      fontSize:
        10,
    },

    detailValue: {
      flex:
        1.35,

      color:
        C.text,

      fontSize:
        10,

      fontWeight:
        '800',

      textAlign:
        'right',
    },

    note: {
      color:
        C.light,

      fontSize:
        10,

      lineHeight:
        16,

      marginTop:
        10,

      marginBottom:
        10,
    },

    infoCard: {
      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap:
        11,

      padding:
        14,

      marginTop:
        -8,

      marginBottom:
        18,

      borderRadius:
        16,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .primary,

      backgroundColor:
        theme.colors
          .primarySoft,
    },

    infoText: {
      flex:
        1,

      color:
        C.muted,

      fontSize:
        10,

      lineHeight:
        17,
    },

    versionRow: {
      minHeight:
        73,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        11,

      paddingVertical:
        13,
    },

    logout: {
      minHeight:
        70,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        12,

      paddingHorizontal:
        15,

      paddingVertical:
        12,

      marginTop:
        3,

      borderRadius:
        17,

      borderWidth:
        1,

      borderColor:
        theme.dark
          ? '#663030'
          : '#F0CACA',

      backgroundColor:
        theme.dark
          ? '#241516'
          : '#FFF4F4',
    },

    logoutMain: {
      flex:
        1,
    },

    logoutTitle: {
      color:
        C.red,

      fontSize:
        13,

      fontWeight:
        '900',
    },

    logoutSubtitle: {
      color:
        C.muted,

      fontSize:
        10,

      lineHeight:
        17,

      marginTop:
        4,
    },

    footer: {
      color:
        C.light,

      fontSize:
        10,

      textAlign:
        'center',

      marginTop:
        23,
    },

    pressed: {
      opacity:
        0.72,
    },

  });
}