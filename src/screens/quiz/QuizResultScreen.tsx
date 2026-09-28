import React from 'react';

import {
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  Award,
  CheckCircle2,
  RefreshCw,
  Trophy,
  XCircle,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {theme} from '../../theme/theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'QuizResult'
>;

export default function QuizResultScreen({
  navigation,
  route,
}: Props) {
  const score = Number(
    route.params.score || 0,
  );

  const total = Number(
    route.params.total || 0,
  );

  const percentage =
    total > 0
      ? Math.round(
          (score / total) * 100,
        )
      : 0;

  /*
   * Backend test model me
   * passing percentage available hai,
   * lekin current QuizResult route me
   * sirf score + total aa rahe hain.
   *
   * Abhi 40% default result threshold
   * use kar rahe hain.
   */
  const passingPercentage = 40;

  const passed =
    total > 0 &&
    percentage >=
      passingPercentage;

  const handleBackToTests = () => {
    navigation.replace('Quiz');
  };

  return (
    <SafeAreaView
      style={styles.safe}>
      <StatusBar
        barStyle="light-content"
      />

      <View
        style={styles.container}>

        {/* RESULT ICON */}

        <View
          style={[
            styles.resultCircle,

            passed
              ? styles.passCircle
              : styles.failCircle,
          ]}>

          {passed ? (
            <Trophy
              size={49}
              color={
                theme.colors.primary
              }
              strokeWidth={1.8}
            />
          ) : (
            <Award
              size={49}
              color="#FF7B7B"
              strokeWidth={1.8}
            />
          )}

        </View>

        {/* TITLE */}

        <Text
          style={
            styles.eyebrow
          }>
          TEST COMPLETED
        </Text>

        <Text
          style={
            styles.title
          }>
          {passed
            ? 'Well Done!'
            : 'Test Submitted'}
        </Text>

        <Text
          style={
            styles.subtitle
          }>
          {passed
            ? 'You successfully completed this test.'
            : 'Your test has been submitted. Keep learning and try again when another attempt is available.'}
        </Text>

        {/* SCORE */}

        <View
          style={
            styles.scoreCard
          }>

          <Text
            style={
              styles.scoreLabel
            }>
            YOUR SCORE
          </Text>

          <View
            style={
              styles.scoreRow
            }>

            <Text
              style={
                styles.score
              }>
              {formatNumber(score)}
            </Text>

            <Text
              style={
                styles.totalScore
              }>
              / {formatNumber(total)}
            </Text>

          </View>

          <View
            style={
              styles.progressTrack
            }>

            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    Math.max(
                      percentage,
                      0,
                    ),
                    100,
                  )}%`,
                },
              ]}
            />

          </View>

          <Text
            style={
              styles.percentage
            }>
            {percentage}%
          </Text>

        </View>

        {/* STATUS */}

        <View
          style={
            styles.statusCard
          }>

          <View
            style={
              styles.statusIcon
            }>

            {passed ? (
              <CheckCircle2
                size={23}
                color={
                  theme.colors
                    .primary
                }
              />
            ) : (
              <XCircle
                size={23}
                color="#FF7B7B"
              />
            )}

          </View>

          <View
            style={
              styles.statusContent
            }>

            <Text
              style={
                styles.statusLabel
              }>
              Result
            </Text>

            <Text
              style={[
                styles.statusValue,

                passed
                  ? styles.passText
                  : styles.failText,
              ]}>
              {passed
                ? 'Passed'
                : 'Not Passed'}
            </Text>

          </View>

          <View
            style={
              styles.passRequirement
            }>

            <Text
              style={
                styles.requirementLabel
              }>
              Pass
            </Text>

            <Text
              style={
                styles.requirementValue
              }>
              {passingPercentage}%
            </Text>

          </View>

        </View>

        {/* BUTTON */}

        <Pressable
          onPress={
            handleBackToTests
          }
          style={({pressed}) => [
            styles.button,

            pressed &&
              styles.pressed,
          ]}>

          <RefreshCw
            size={18}
            color="#07130B"
          />

          <Text
            style={
              styles.buttonText
            }>
            Back to Tests
          </Text>

        </Pressable>

        <Text
          style={
            styles.note
          }>
          Your final result is calculated
          from the score returned after
          submitting the test.
        </Text>

      </View>
    </SafeAreaView>
  );
}

function formatNumber(
  value: number,
) {
  if (
    Number.isInteger(value)
  ) {
    return String(value);
  }

  return value.toFixed(1);
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        theme.colors.background,
    },

    container: {
      flex: 1,

      paddingHorizontal: 22,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    resultCircle: {
      width: 104,

      height: 104,

      borderRadius: 52,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 1,
    },

    passCircle: {
      borderColor:
        'rgba(55,214,122,0.25)',

      backgroundColor:
        'rgba(55,214,122,0.08)',
    },

    failCircle: {
      borderColor:
        'rgba(255,123,123,0.25)',

      backgroundColor:
        'rgba(255,123,123,0.08)',
    },

    eyebrow: {
      marginTop: 26,

      color:
        theme.colors.primary,

      fontSize: 10,

      fontWeight: '900',

      letterSpacing: 1.5,
    },

    title: {
      marginTop: 7,

      color:
        theme.colors
          .textPrimary,

      fontSize: 29,

      fontWeight: '900',

      letterSpacing: -0.6,
    },

    subtitle: {
      marginTop: 8,

      maxWidth: 320,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,

      textAlign: 'center',
    },

    scoreCard: {
      width: '100%',

      marginTop: 27,

      padding: 20,

      alignItems: 'center',

      borderRadius: 21,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    scoreLabel: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      fontWeight: '900',

      letterSpacing: 1,
    },

    scoreRow: {
      marginTop: 9,

      flexDirection: 'row',

      alignItems: 'baseline',
    },

    score: {
      color:
        theme.colors.primary,

      fontSize: 43,

      fontWeight: '900',

      letterSpacing: -1,
    },

    totalScore: {
      marginLeft: 5,

      color:
        theme.colors
          .textSecondary,

      fontSize: 18,

      fontWeight: '800',
    },

    progressTrack: {
      width: '100%',

      height: 7,

      marginTop: 18,

      overflow: 'hidden',

      borderRadius: 10,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    progressFill: {
      height: 7,

      borderRadius: 10,

      backgroundColor:
        theme.colors.primary,
    },

    percentage: {
      marginTop: 9,

      color:
        theme.colors
          .textPrimary,

      fontSize: 11,

      fontWeight: '900',
    },

    statusCard: {
      width: '100%',

      marginTop: 12,

      padding: 15,

      flexDirection: 'row',

      alignItems: 'center',

      borderRadius: 17,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    statusIcon: {
      width: 43,

      height: 43,

      borderRadius: 13,

      alignItems: 'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    statusContent: {
      flex: 1,

      marginLeft: 11,
    },

    statusLabel: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 8,

      fontWeight: '700',
    },

    statusValue: {
      marginTop: 3,

      fontSize: 12,

      fontWeight: '900',
    },

    passText: {
      color:
        theme.colors.primary,
    },

    failText: {
      color: '#FF7B7B',
    },

    passRequirement: {
      alignItems: 'flex-end',
    },

    requirementLabel: {
      color:
        theme.colors.textLight,

      fontSize: 8,

      fontWeight: '700',
    },

    requirementValue: {
      marginTop: 2,

      color:
        theme.colors
          .textPrimary,

      fontSize: 11,

      fontWeight: '900',
    },

    button: {
      width: '100%',

      height: 57,

      marginTop: 25,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'center',

      gap: 8,

      borderRadius: 17,

      backgroundColor:
        theme.colors.primary,
    },

    buttonText: {
      color: '#07130B',

      fontSize: 13,

      fontWeight: '900',
    },

    note: {
      marginTop: 14,

      maxWidth: 300,

      color:
        theme.colors.textLight,

      fontSize: 8,

      lineHeight: 14,

      textAlign: 'center',
    },

    pressed: {
      opacity: 0.78,
    },
  });