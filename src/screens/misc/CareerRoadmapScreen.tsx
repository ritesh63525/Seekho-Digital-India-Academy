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
  BriefcaseBusiness,
  Flag,
  Rocket,
  Sparkles,
  Target,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import {careerRoadmap} from '../../data/mockData';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

function useCareerRoadmapTheme() {
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

export default function CareerRoadmapScreen() {
  const {
    theme,
    styles,
  } = useCareerRoadmapTheme();

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
        title="Career roadmap"
        subtitle="Zero to industry-ready"
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
          <View style={styles.heroIcon}>
            <Rocket
              size={24}
              color={
                theme.colors.primary
              }
              strokeWidth={2.3}
            />
          </View>

          <Text style={styles.kicker}>
            YOUR AI JOURNEY
          </Text>

          <Text style={styles.heroTitle}>
            A structured path from
            foundation to career launch.
          </Text>

          <Text style={styles.heroText}>
            The roadmap mirrors the
            academy's practical learning
            journey and combines technical
            skills with career preparation.
          </Text>

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

        {/* TIMELINE */}

        <View style={styles.timeline}>
          {careerRoadmap.map(
            (
              item,
              index,
            ) => {
              const active =
                index < 2;

              const stage =
                index < 2
                  ? 'CURRENT LEARNING PATH'
                  : index === 2
                    ? 'NEXT MILESTONE'
                    : 'UPCOMING';

              return (
                <View
                  key={item.step}
                  style={styles.item}>

                  <View style={styles.left}>
                    <View
                      style={[
                        styles.circle,
                        active &&
                          styles.circleActive,
                      ]}>

                      <Text
                        style={[
                          styles.circleText,
                          active &&
                            styles.circleTextActive,
                        ]}>
                        {item.step}
                      </Text>
                    </View>

                    {index <
                    careerRoadmap.length -
                      1 ? (
                      <View
                        style={[
                          styles.line,
                          index < 1 &&
                            styles.lineActive,
                        ]}
                      />
                    ) : null}
                  </View>

                  <View style={styles.card}>
                    <View
                      style={
                        styles.cardTop
                      }>
                      <Text
                        style={
                          styles.title
                        }>
                        {item.title}
                      </Text>

                      <View
                        style={
                          styles.timeBadge
                        }>
                        <Text
                          style={
                            styles.time
                          }>
                          {item.time}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={
                        styles.detail
                      }>
                      {item.detail}
                    </Text>

                    <View
                      style={
                        styles.stageRow
                      }>
                      {active ? (
                        <Sparkles
                          size={13}
                          color={
                            theme.colors.secondary
                          }
                          strokeWidth={2.2}
                        />
                      ) : index === 2 ? (
                        <Target
                          size={13}
                          color={
                            theme.colors.primary
                          }
                          strokeWidth={2.2}
                        />
                      ) : (
                        <Flag
                          size={13}
                          color={
                            theme.colors.iconMuted
                          }
                          strokeWidth={2.2}
                        />
                      )}

                      <Text
                        style={[
                          styles.stage,
                          active &&
                            styles.stageActive,
                        ]}>
                        {stage}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            },
          )}
        </View>

        {/* CAREER END CARD */}

        <View style={styles.end}>
          <View style={styles.endIcon}>
            <BriefcaseBusiness
              size={21}
              color={
                theme.colors.secondary
              }
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.endContent}>
            <Text style={styles.endTitle}>
              Career launch is part of the
              learning plan.
            </Text>

            <Text style={styles.endText}>
              Portfolio, resume, interview
              preparation, job assistance
              and career counseling support
              the transition from course
              completion to opportunity.
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
      padding: 19,
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

    heroIcon: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        theme.colors.primarySoft,
    },

    kicker: {
      marginTop: 14,
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    heroTitle: {
      marginTop: 8,
      color:
        theme.colors.textPrimary,
      fontSize: 21,
      lineHeight: 28,
      fontWeight: '900',
      letterSpacing: -0.25,
    },

    heroText: {
      marginTop: 7,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      fontWeight: '600',
    },

    heroAccentRow: {
      height: 4,
      marginTop: 17,
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

    timeline: {
      marginTop: 20,
    },

    item: {
      flexDirection: 'row',
    },

    left: {
      width: 46,
      alignItems: 'center',
    },

    circle: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 18,
      borderWidth: 2,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    circleActive: {
      borderColor:
        theme.colors.primary,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.dark
          ? 0.20
          : 0.08,
      shadowRadius: 8,
      elevation: 2,
    },

    circleText: {
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      fontWeight: '900',
    },

    circleTextActive: {
      color:
        theme.colors.black,
    },

    line: {
      width: 2,
      flex: 1,
      minHeight: 72,
      backgroundColor:
        theme.colors.border,
    },

    lineActive: {
      backgroundColor:
        theme.colors.primary,
    },

    card: {
      flex: 1,
      marginBottom: 12,
      padding: 14,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
      gap: 10,
    },

    title: {
      flex: 1,
      color:
        theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: '900',
    },

    timeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius:
        theme.radius.pill,
      backgroundColor:
        theme.colors.primarySoft,
    },

    time: {
      color:
        theme.colors.primaryStrong,
      fontSize: 8,
      fontWeight: '900',
    },

    detail: {
      marginTop: 6,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      fontWeight: '600',
    },

    stageRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    stage: {
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.65,
    },

    stageActive: {
      color:
        theme.colors.secondaryStrong,
    },

    end: {
      marginTop: 10,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      borderRadius: 18,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    endIcon: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 13,
      backgroundColor:
        theme.colors.surface,
    },

    endContent: {
      flex: 1,
    },

    endTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '900',
    },

    endText: {
      marginTop: 5,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 16,
      fontWeight: '600',
    },
  });
