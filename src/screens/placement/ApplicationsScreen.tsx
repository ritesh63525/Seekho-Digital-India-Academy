import React, {useMemo} from 'react';

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Search,
  Sparkles,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import StatusPill from '../../components/StatusPill';

import {jobs} from '../../data/mockData';
import {useApp} from '../../state/AppContext';

import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

function useApplicationsTheme() {
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

export default function ApplicationsScreen() {
  const {theme, styles} =
    useApplicationsTheme();

  const {appliedJobIds} = useApp();

  const applied = jobs.filter(job =>
    appliedJobIds.includes(job.id),
  );

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
        title="My applications"
        subtitle="Track placement opportunities"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>

        {/* SUMMARY */}

        <View style={styles.summary}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryHeading}>
              <Sparkles
                size={13}
                color={theme.colors.primary}
                strokeWidth={2.3}
              />

              <Text style={styles.summaryEyebrow}>
                APPLICATION TRACKER
              </Text>
            </View>

            <BriefcaseBusiness
              size={21}
              color={theme.colors.secondary}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryValue}>
                {applied.length}
              </Text>

              <Text style={styles.summaryLabel}>
                Applications submitted
              </Text>
            </View>

            <View style={styles.summaryLine} />

            <View style={styles.summaryBlock}>
              <Text style={styles.summaryValue}>
                0
              </Text>

              <Text style={styles.summaryLabel}>
                Interviews scheduled
              </Text>
            </View>
          </View>

          <View style={styles.summaryAccentRow}>
            <View style={styles.summaryAccentOrange} />
            <View style={styles.summaryAccentGreen} />
          </View>
        </View>

        {/* EMPTY STATE */}

        {applied.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Search
                size={30}
                color={theme.colors.secondary}
                strokeWidth={2.2}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No applications yet
            </Text>

            <Text style={styles.emptyText}>
              Explore the Placement tab and apply to
              roles that match your skills.
            </Text>

            <View style={styles.emptyNote}>
              <Clock3
                size={14}
                color={theme.colors.iconMuted}
                strokeWidth={2.2}
              />

              <Text style={styles.emptyNoteText}>
                Application tracking will update here
                once a backend application API is available.
              </Text>
            </View>
          </View>
        ) : (
          applied.map(job => (
            <View
              key={job.id}
              style={styles.card}>

              <View style={styles.top}>
                <View style={styles.logo}>
                  <Text style={styles.logoText}>
                    {job.company.slice(0, 1)}
                  </Text>
                </View>

                <View style={styles.flex}>
                  <Text style={styles.title}>
                    {job.title}
                  </Text>

                  <Text style={styles.company}>
                    {job.company}
                  </Text>
                </View>

                <StatusPill
                  label="Applied"
                  tone="green"
                />
              </View>

              <View style={styles.timeline}>
                <Step
                  active
                  label="Applied"
                />

                <Line />

                <Step label="Review" />

                <Line />

                <Step label="Interview" />

                <Line />

                <Step label="Decision" />
              </View>

              <View style={styles.noteBox}>
                <CheckCircle2
                  size={15}
                  color={theme.colors.secondary}
                  strokeWidth={2.2}
                />

                <Text style={styles.note}>
                  Application received. Status will
                  update here when connected to the
                  placement backend.
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Step({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
  const {theme, styles} =
    useApplicationsTheme();

  return (
    <View style={styles.step}>
      <View
        style={[
          styles.stepDot,
          active &&
            styles.stepDotActive,
        ]}>
        {active && (
          <View
            style={
              styles.stepDotInner
            }
          />
        )}
      </View>

      <Text
        style={[
          styles.stepText,
          active &&
            styles.stepTextActive,
        ]}>
        {label}
      </Text>
    </View>
  );
}

function Line() {
  const {styles} =
    useApplicationsTheme();

  return (
    <View style={styles.line} />
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

    summary: {
      overflow: 'hidden',
      padding: 17,
      marginBottom: 14,
      borderRadius: 21,
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

    summaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 16,
    },

    summaryHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    summaryEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    summaryStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-around',
    },

    summaryBlock: {
      flex: 1,
      alignItems: 'center',
    },

    summaryValue: {
      fontSize: 24,
      color:
        theme.colors.textPrimary,
      fontWeight: '900',
      textAlign: 'center',
    },

    summaryLabel: {
      marginTop: 4,
      maxWidth: 120,
      fontSize: 8,
      color:
        theme.colors.textSecondary,
      fontWeight: '800',
      textAlign: 'center',
    },

    summaryLine: {
      width: 1,
      height: 40,
      marginHorizontal: 12,
      backgroundColor:
        theme.colors.divider,
    },

    summaryAccentRow: {
      height: 4,
      marginTop: 17,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
    },

    summaryAccentOrange: {
      flex: 1.25,
      backgroundColor:
        theme.colors.primary,
    },

    summaryAccentGreen: {
      flex: 1,
      backgroundColor:
        theme.colors.secondary,
    },

    emptyCard: {
      minHeight: 270,
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    emptyIcon: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    emptyTitle: {
      marginTop: 16,
      color:
        theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
      textAlign: 'center',
    },

    emptyText: {
      marginTop: 7,
      maxWidth: 280,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    emptyNote: {
      marginTop: 17,
      padding: 11,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      borderRadius: 13,
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    emptyNoteText: {
      flex: 1,
      color:
        theme.colors.textLight,
      fontSize: 8,
      lineHeight: 14,
    },

    card: {
      marginBottom: 11,
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    top: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    logo: {
      width: 44,
      height: 44,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    logoText: {
      fontSize: 15,
      color:
        theme.colors.primary,
      fontWeight: '900',
    },

    flex: {
      flex: 1,
    },

    title: {
      fontSize: 13,
      color:
        theme.colors.textPrimary,
      fontWeight: '900',
    },

    company: {
      marginTop: 3,
      fontSize: 9,
      color:
        theme.colors.textSecondary,
      fontWeight: '700',
    },

    timeline: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginTop: 19,
    },

    step: {
      width: 50,
      alignItems: 'center',
    },

    stepDot: {
      width: 12,
      height: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      borderWidth: 2,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    stepDotActive: {
      borderColor:
        theme.colors.secondary,
      backgroundColor:
        theme.colors.secondary,
    },

    stepDotInner: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        theme.colors.white,
    },

    stepText: {
      marginTop: 5,
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '800',
    },

    stepTextActive: {
      color:
        theme.colors.secondaryStrong,
    },

    line: {
      flex: 1,
      height: 2,
      marginTop: 5,
      backgroundColor:
        theme.colors.border,
    },

    noteBox: {
      marginTop: 14,
      paddingTop: 11,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor:
        theme.colors.divider,
    },

    note: {
      flex: 1,
      fontSize: 9,
      lineHeight: 15,
      color:
        theme.colors.textSecondary,
      fontWeight: '600',
    },
  });
