import React, {useMemo} from 'react';

import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'QuizResult'
>;

function useQuizResultTheme() {
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

export default function QuizResultScreen({
  navigation,
  route,
}: Props) {
  const {theme, styles} =
    useQuizResultTheme();

  const pct = Math.round(
    (route.params.score /
      route.params.total) *
      100,
  );

  const passed = pct >= 60;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }>

        {/* BRAND HEADER */}

        <View style={styles.brandRow}>
          <View style={styles.brandPill}>
            <Sparkles
              size={14}
              color={theme.colors.primary}
              strokeWidth={2.3}
            />

            <Text style={styles.brandText}>
              ASSESSMENT RESULT
            </Text>
          </View>

          <View style={styles.brandSeal}>
            <Trophy
              size={18}
              color={theme.colors.secondary}
              strokeWidth={2.3}
            />
          </View>
        </View>

        {/* RESULT HERO */}

        <View
          style={[
            styles.heroCard,
            passed
              ? styles.heroCardPassed
              : styles.heroCardRetry,
          ]}>

          <View
            style={[
              styles.resultIcon,
              passed
                ? styles.passIcon
                : styles.retryIcon,
            ]}>
            {passed ? (
              <CheckCircle2
                size={35}
                color={
                  theme.colors.secondary
                }
                strokeWidth={2.25}
              />
            ) : (
              <RotateCcw
                size={34}
                color={
                  theme.colors.warning
                }
                strokeWidth={2.2}
              />
            )}
          </View>

          <Text style={styles.kicker}>
            {passed
              ? 'QUIZ COMPLETED'
              : 'KEEP PRACTICING'}
          </Text>

          <Text style={styles.title}>
            {passed
              ? 'Strong work!'
              : 'Almost there.'}
          </Text>

          <Text style={styles.subtitle}>
            {passed
              ? 'You have demonstrated a solid understanding of this practice set.'
              : 'Review the lesson and try again to strengthen the concepts.'}
          </Text>

          <View
            style={[
              styles.resultPill,
              passed
                ? styles.resultPillPassed
                : styles.resultPillRetry,
            ]}>
            {passed ? (
              <Trophy
                size={14}
                color={
                  theme.colors.secondaryStrong
                }
                strokeWidth={2.3}
              />
            ) : (
              <Target
                size={14}
                color={
                  theme.colors.warning
                }
                strokeWidth={2.3}
              />
            )}

            <Text
              style={[
                styles.resultPillText,
                {
                  color: passed
                    ? theme.colors.secondaryStrong
                    : theme.colors.warning,
                },
              ]}>
              {passed
                ? 'Pass mark achieved'
                : '60% required to pass'}
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

        {/* SCORE */}

        <View style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreIconBox}>
              <BookOpenCheck
                size={21}
                color={
                  theme.colors.primary
                }
                strokeWidth={2.2}
              />
            </View>

            <View style={styles.scoreHeaderText}>
              <Text style={styles.scoreEyebrow}>
                YOUR SCORE
              </Text>

              <Text style={styles.scoreTitle}>
                Performance Summary
              </Text>
            </View>
          </View>

          <View style={styles.scoreCircleWrap}>
            <View
              style={[
                styles.scoreCircle,
                {
                  borderColor: passed
                    ? theme.colors.secondary
                    : theme.colors.warning,
                },
              ]}>
              <Text
                style={[
                  styles.score,
                  {
                    color: passed
                      ? theme.colors.secondary
                      : theme.colors.warning,
                  },
                ]}>
                {pct}%
              </Text>
            </View>
          </View>

          <Text style={styles.scoreLabel}>
            {route.params.score} correct out of{' '}
            {route.params.total}
          </Text>

          <View style={styles.metrics}>
            <Metric
              label="Correct"
              value={String(
                route.params.score,
              )}
              icon={CheckCircle2}
              color={
                theme.colors.secondary
              }
              softColor={
                theme.colors.secondarySoft
              }
            />

            <Metric
              label="Incorrect"
              value={String(
                route.params.total -
                  route.params.score,
              )}
              icon={XCircle}
              color={theme.colors.danger}
              softColor={
                theme.dark
                  ? 'rgba(255, 116, 116, 0.10)'
                  : '#FDEFEF'
              }
            />

            <Metric
              label="Pass mark"
              value="60%"
              icon={Target}
              color={theme.colors.info}
              softColor={
                theme.dark
                  ? 'rgba(120, 182, 255, 0.10)'
                  : '#EEF5FD'
              }
            />
          </View>
        </View>

        {/* ACTIONS */}

        <Pressable
          onPress={() =>
            navigation.popToTop()
          }
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}>
          <ArrowLeft
            size={18}
            color={theme.colors.black}
            strokeWidth={2.4}
          />

          <Text
            style={
              styles.primaryButtonText
            }>
            Back to learning
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            navigation.replace('Quiz')
          }
          style={({pressed}) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}>
          <RotateCcw
            size={17}
            color={theme.colors.primary}
            strokeWidth={2.35}
          />

          <Text
            style={
              styles.secondaryButtonText
            }>
            Try quiz again
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  color,
  softColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
  softColor: string;
}) {
  const {styles} =
    useQuizResultTheme();

  return (
    <View style={styles.metric}>
      <View
        style={[
          styles.metricIconBox,
          {
            backgroundColor:
              softColor,
          },
        ]}>
        <Icon
          size={16}
          color={color}
          strokeWidth={2.25}
        />
      </View>

      <Text
        style={[
          styles.metricValue,
          {color},
        ]}>
        {value}
      </Text>

      <Text style={styles.metricLabel}>
        {label}
      </Text>
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

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 30,
      justifyContent: 'center',
    },

    brandRow: {
      minHeight: 42,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    brandPill: {
      minHeight: 33,
      paddingHorizontal: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      borderRadius:
        theme.radius.pill,
      borderWidth: 1,
      borderColor:
        theme.colors.primary,
      backgroundColor:
        theme.colors.primarySoft,
    },

    brandText: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.1,
    },

    brandSeal: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.colors.greenDark,
      backgroundColor:
        theme.colors.secondarySoft,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity:
        theme.dark ? 0.14 : 0.04,
      shadowRadius: 7,
      elevation: 2,
    },

    heroCard: {
      overflow: 'hidden',
      alignItems: 'center',
      paddingHorizontal: 23,
      paddingTop: 26,
      paddingBottom: 23,
      borderWidth: 1,
      borderRadius: 27,
      backgroundColor:
        theme.colors.surface,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity:
        theme.dark ? 0.22 : 0.08,
      shadowRadius: 18,
      elevation: 4,
    },

    heroCardPassed: {
      borderColor:
        theme.colors.borderStrong,
    },

    heroCardRetry: {
      borderColor:
        theme.colors.borderStrong,
    },

    resultIcon: {
      width: 80,
      height: 80,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 26,
      borderWidth: 1,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.dark ? 0.14 : 0.04,
      shadowRadius: 8,
      elevation: 2,
    },

    passIcon: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    retryIcon: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    kicker: {
      marginTop: 18,
      color:
        theme.colors.primary,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.3,
      textAlign: 'center',
    },

    title: {
      marginTop: 6,
      color:
        theme.colors.textPrimary,
      fontSize: 29,
      lineHeight: 35,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'center',
    },

    subtitle: {
      maxWidth: 315,
      marginTop: 7,
      paddingHorizontal: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 18,
      fontWeight: '600',
      textAlign: 'center',
    },

    resultPill: {
      minHeight: 36,
      marginTop: 16,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 1,
      borderRadius:
        theme.radius.pill,
    },

    resultPillPassed: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    resultPillRetry: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    resultPillText: {
      fontSize: 9,
      fontWeight: '900',
    },

    heroAccentRow: {
      width: '100%',
      height: 4,
      marginTop: 20,
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

    scoreCard: {
      marginTop: 17,
      padding: 19,
      borderRadius: 24,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surface,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity:
        theme.dark ? 0.14 : 0.04,
      shadowRadius: 10,
      elevation: 2,
    },

    scoreHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    scoreIconBox: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        theme.colors.primary,
      backgroundColor:
        theme.colors.primarySoft,
    },

    scoreHeaderText: {
      flex: 1,
    },

    scoreEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    scoreTitle: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '900',
    },

    scoreCircleWrap: {
      marginTop: 20,
      alignItems: 'center',
    },

    scoreCircle: {
      width: 118,
      height: 118,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 59,
      borderWidth: 7,
      backgroundColor:
        theme.colors.surfaceSoft,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.dark ? 0.12 : 0.03,
      shadowRadius: 8,
      elevation: 1,
    },

    score: {
      fontSize: 37,
      fontWeight: '900',
      letterSpacing: -1,
    },

    scoreLabel: {
      marginTop: 10,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },

    metrics: {
      marginTop: 20,
      paddingTop: 17,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor:
        theme.colors.divider,
    },

    metric: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 3,
    },

    metricIconBox: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    metricValue: {
      marginTop: 8,
      fontSize: 16,
      fontWeight: '900',
    },

    metricLabel: {
      marginTop: 3,
      color:
        theme.colors.textLight,
      fontSize: 8,
      fontWeight: '800',
      textAlign: 'center',
    },

    primaryButton: {
      minHeight: 58,
      marginTop: 19,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 18,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity:
        theme.dark ? 0.18 : 0.08,
      shadowRadius: 12,
      elevation: 3,
    },

    primaryButtonText: {
      color:
        theme.colors.black,
      fontSize: 12,
      fontWeight: '900',
    },

    secondaryButton: {
      minHeight: 54,
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.primary,
      backgroundColor:
        theme.colors.surface,
    },

    secondaryButtonText: {
      color:
        theme.colors.primary,
      fontSize: 11,
      fontWeight: '900',
    },

    pressed: {
      opacity: 0.82,
    },
  });
