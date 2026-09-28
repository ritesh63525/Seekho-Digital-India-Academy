import React, {
  useMemo,
} from 'react';

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  FileCheck2,
  Info,
  LockKeyhole,
  Scale,
  ShieldCheck,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import ScreenHeader from '../../components/ScreenHeader';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Legal'
  >;

const privacy = [
  [
    'Information we collect',
    'When real authentication and backend services are connected, the app may process account details, course activity, assignment submissions and placement-profile information needed to deliver student services.',
  ],
  [
    'How information is used',
    'Information is used to provide learning access, track progress, support student communication, improve services and enable placement-related workflows.',
  ],
  [
    'Data security',
    'Production integration should use encrypted transport, secure token storage, role-based access and backend retention controls appropriate to student data.',
  ],
  [
    'Your choices',
    'Students should be able to review profile information and request corrections or account-related support through the academy team.',
  ],
] as const;

const terms = [
  [
    'Using the app',
    'The app is intended for Seekho Digital India Academy learners and prospective students. Access to paid or enrolled content may depend on academy enrollment status.',
  ],
  [
    'Learning content',
    'Course materials, videos, notes, assignments and academy resources are for authorized educational use and should not be redistributed without permission.',
  ],
  [
    'Placement services',
    'Placement support improves job readiness and access to opportunities but does not guarantee a specific employer, salary or hiring outcome.',
  ],
  [
    'Demo build',
    'This build uses demo authentication and local sample workflow data. Production APIs, legal copy and account controls should be finalized before public release.',
  ],
] as const;

function useLegalTheme() {
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

export default function LegalScreen({
  route,
}: Props) {
  const {
    theme,
    styles,
  } = useLegalTheme();

  const isPrivacy =
    route.params.type ===
    'privacy';

  const items =
    isPrivacy
      ? privacy
      : terms;

  return (
    <View style={styles.safe}>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScreenHeader
        back
        title={
          isPrivacy
            ? 'Privacy Policy'
            : 'Terms of Use'
        }
        subtitle="Seekho Digital India Academy"
      />

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* HERO */}

        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View
              style={
                styles.heroIcon
              }>
              {isPrivacy ? (
                <ShieldCheck
                  size={24}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.3}
                />
              ) : (
                <Scale
                  size={24}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.3}
                />
              )}
            </View>

            <View
              style={
                styles.heroHeading
              }>
              <Text style={styles.kicker}>
                {isPrivacy
                  ? 'PRIVACY'
                  : 'TERMS'}
              </Text>

              <Text style={styles.title}>
                {isPrivacy
                  ? 'Your information and privacy.'
                  : 'Using the student app responsibly.'}
              </Text>
            </View>
          </View>

          <View
            style={
              styles.updatedRow
            }>
            <FileCheck2
              size={14}
              color={
                theme.colors.iconMuted
              }
              strokeWidth={2.2}
            />

            <Text
              style={
                styles.updated
              }>
              Draft app copy • Review before
              production release
            </Text>
          </View>

          <View style={styles.heroAccentRow}>
            <View
              style={
                styles.heroAccentOrange
              }
            />

            <View
              style={
                styles.heroAccentGreen
              }
            />
          </View>
        </View>

        {/* SECTIONS */}

        {items.map(
          (
            [
              sectionTitle,
              text,
            ],
            index,
          ) => (
            <View
              key={sectionTitle}
              style={styles.section}>

              <View
                style={
                  styles.sectionTop
                }>
                <View
                  style={[
                    styles.sectionNumber,
                    index % 2 === 0
                      ? styles.sectionNumberOrange
                      : styles.sectionNumberGreen,
                  ]}>
                  <Text
                    style={
                      styles.sectionNumberText
                    }>
                    {String(
                      index + 1,
                    ).padStart(
                      2,
                      '0',
                    )}
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }>
                  {sectionTitle}
                </Text>
              </View>

              <Text style={styles.body}>
                {text}
              </Text>
            </View>
          ),
        )}

        {/* PRODUCTION NOTE */}

        <View style={styles.note}>
          <View style={styles.noteIcon}>
            {isPrivacy ? (
              <LockKeyhole
                size={20}
                color={
                  theme.colors.warning
                }
                strokeWidth={2.2}
              />
            ) : (
              <Info
                size={20}
                color={
                  theme.colors.warning
                }
                strokeWidth={2.2}
              />
            )}
          </View>

          <View style={styles.noteContent}>
            <Text
              style={
                styles.noteTitle
              }>
              Production note
            </Text>

            <Text
              style={
                styles.noteText
              }>
              Before Play Store/App Store
              release, replace this draft
              with academy-approved legal
              text reviewed for your actual
              backend, analytics, payment,
              notification and
              data-retention practices.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    scroll: {
      padding: 18,
      paddingBottom: 36,
    },

    hero: {
      overflow: 'hidden',
      padding: 18,
      borderRadius: 22,
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
        theme.dark
          ? 0.22
          : 0.10,
      shadowRadius: 18,
      elevation: 4,
    },

    heroTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },

    heroIcon: {
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    heroHeading: {
      flex: 1,
    },

    kicker: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    title: {
      marginTop: 6,
      color:
        theme.colors.textPrimary,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: '900',
      letterSpacing: -0.2,
    },

    updatedRow: {
      marginTop: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },

    updated: {
      flex: 1,
      color:
        theme.colors.textLight,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: '700',
    },

    heroAccentRow: {
      height: 4,
      marginTop: 16,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
    },

    heroAccentOrange: {
      flex: 1.25,
      backgroundColor:
        theme.colors.primary,
    },

    heroAccentGreen: {
      flex: 1,
      backgroundColor:
        theme.colors.secondary,
    },

    section: {
      marginTop: 18,
      padding: 15,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    sectionTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    sectionNumber: {
      width: 34,
      height: 34,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 11,
    },

    sectionNumberOrange: {
      backgroundColor:
        theme.colors.primarySoft,
    },

    sectionNumberGreen: {
      backgroundColor:
        theme.colors.secondarySoft,
    },

    sectionNumberText: {
      color:
        theme.colors.textPrimary,
      fontSize: 9,
      fontWeight: '900',
    },

    sectionTitle: {
      flex: 1,
      color:
        theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: '900',
    },

    body: {
      marginTop: 10,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 18,
      fontWeight: '600',
    },

    note: {
      marginTop: 24,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.primarySoft,
    },

    noteIcon: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surface,
    },

    noteContent: {
      flex: 1,
    },

    noteTitle: {
      color:
        theme.colors.warning,
      fontSize: 11,
      fontWeight: '900',
    },

    noteText: {
      marginTop: 5,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      fontWeight: '600',
    },
  });
