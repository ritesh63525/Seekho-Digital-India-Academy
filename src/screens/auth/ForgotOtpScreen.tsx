import React, {
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  ShieldCheck,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {verifyStudentResetOtp} from '../../services/authApi';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ForgotOtp'
>;

function useForgotOtpTheme() {
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

export default function ForgotOtpScreen({
  navigation,
  route,
}: Props) {
  const {
    theme,
    styles,
  } = useForgotOtpTheme();

  const [otp, setOtp] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const inputRef =
    useRef<
      React.ElementRef<
        typeof TextInput
      >
    >(null);

  const email =
    route.params.portalEmail;

  const canContinue =
    otp.length === 6 &&
    !loading;

  const handleOtpChange = (
    value: string,
  ) => {
    const onlyNumbers =
      value.replace(
        /[^0-9]/g,
        '',
      );

    setOtp(
      onlyNumbers.slice(
        0,
        6,
      ),
    );
  };

  const handleVerifyOtp =
    async () => {
      if (otp.length !== 6) {
        Alert.alert(
          'Invalid code',
          'Please enter the 6 digit verification code.',
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await verifyStudentResetOtp(
            email,
            otp,
          );

        const resetToken =
          response.data
            .reset_token;

        navigation.navigate(
          'ResetPassword',
          {
            portalEmail:
              email,

            resetToken:
              resetToken,
          },
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to verify the code. Please try again.';

        Alert.alert(
          'Verification failed',
          message,
        );
      } finally {
        setLoading(false);
      }
    };

  const focusOtpInput = () => {
    if (!loading) {
      inputRef.current?.focus();
    }
  };

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

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <View
          style={styles.container}>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
            style={
              styles.backButton
            }
            hitSlop={10}>

            <ArrowLeft
              size={22}
              color={
                theme.colors
                  .textPrimary
              }
              strokeWidth={2.2}
            />

          </Pressable>

          <View
            style={styles.iconBox}>

            <KeyRound
              size={30}
              color={theme.colors.black}
              strokeWidth={2.2}
            />

          </View>

          <Text
            style={styles.kicker}>
            VERIFY YOUR EMAIL
          </Text>

          <Text
            style={styles.title}>
            Enter Verification Code
          </Text>

          <Text
            style={
              styles.subtitle
            }>
            Enter the 6 digit
            verification code sent
            for
            {' '}
            {email}.
          </Text>

          <View
            style={styles.infoBox}>

            <ShieldCheck
              size={20}
              color={
                theme.colors
                  .primary
              }
              strokeWidth={2}
            />

            <Text
              style={
                styles.infoText
              }>
              The verification code
              can expire. Use the
              latest code sent to
              your registered email.
            </Text>

          </View>

          <Pressable
            onPress={
              focusOtpInput
            }
            style={
              styles.otpArea
            }>

            {Array.from({
              length: 6,
            }).map(
              (_, index) => {

                const digit =
                  otp[index] ||
                  '';

                const active =
                  index ===
                  otp.length;

                return (
                  <View
                    key={
                      index
                    }
                    style={[
                      styles
                        .otpBox,

                      active &&
                        otp.length <
                          6 &&
                        styles
                          .otpBoxActive,
                    ]}>

                    <Text
                      style={
                        styles
                          .otpText
                      }>
                      {digit}
                    </Text>

                  </View>
                );
              },
            )}

          </Pressable>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={
              handleOtpChange
            }
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
            textContentType="oneTimeCode"
            style={
              styles.hiddenInput
            }
          />

          <Pressable
            disabled={
              !canContinue
            }
            onPress={
              handleVerifyOtp
            }
            style={({
              pressed,
            }) => [
              styles.button,

              !canContinue &&
                styles
                  .buttonDisabled,

              pressed &&
                canContinue &&
                styles
                  .buttonPressed,
            ]}>

            {loading ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.black}
              />
            ) : (
              <>
                <Text
                  style={[
                    styles
                      .buttonText,

                    !canContinue &&
                      styles
                        .buttonTextDisabled,
                  ]}>
                  Verify Code
                </Text>

                <ArrowRight
                  size={19}
                  color={
                    canContinue
                      ? '#07130B'
                      : theme
                          .colors
                          .textLight
                  }
                  strokeWidth={
                    2.4
                  }
                />
              </>
            )}

          </Pressable>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

    keyboard: {
      flex: 1,
    },

    container: {
      flex: 1,

      paddingHorizontal:
        24,

      paddingTop: 18,

      backgroundColor:
        theme.colors
          .background,
    },

    backButton: {
      width: 44,
      height: 44,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors
          .surface,
    },

    iconBox: {
      width: 58,
      height: 58,

      marginTop: 42,

      borderRadius: 18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .primary,
    },

    kicker: {
      marginTop: 25,

      color:
        theme.colors
          .primary,

      fontSize: 11,

      fontWeight:
        '900',

      letterSpacing: 1.6,
    },

    title: {
      marginTop: 8,

      color:
        theme.colors
          .textPrimary,

      fontSize: 30,

      fontWeight:
        '900',

      letterSpacing: -0.8,
    },

    subtitle: {
      marginTop: 12,

      color:
        theme.colors
          .textSecondary,

      fontSize: 13,

      lineHeight: 21,

      fontWeight:
        '500',
    },

    infoBox: {
      marginTop: 25,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap: 12,

      padding: 16,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius: 16,

      backgroundColor:
        theme.colors
          .secondarySoft,
    },

    infoText: {
      flex: 1,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    otpArea: {
      marginTop: 36,

      flexDirection:
        'row',

      justifyContent:
        'space-between',

      gap: 8,
    },

    otpBox: {
      flex: 1,

      maxWidth: 52,

      height: 58,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius: 15,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    otpBoxActive: {
      borderColor:
        theme.colors
          .primary,
      backgroundColor:
        theme.colors
          .primarySoft,
    },

    otpText: {
      color:
        theme.colors
          .textPrimary,

      fontSize: 20,

      fontWeight:
        '900',
    },

    hiddenInput: {
      position:
        'absolute',

      width: 1,
      height: 1,

      opacity: 0,
    },

    button: {
      height: 58,

      marginTop: 34,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,

      borderRadius: 17,

      backgroundColor:
        theme.colors
          .primary,

      borderWidth: 1,
      borderColor:
        theme.colors
          .primaryStrong,

      shadowColor:
        theme.colors
          .shadow,
      shadowOpacity:
        theme.dark
          ? 0.20
          : 0.10,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

    buttonDisabled: {
      backgroundColor:
        theme.colors
          .surfaceElevated,
      borderColor:
        theme.colors
          .borderStrong,
      elevation: 0,
      shadowOpacity: 0,
    },

    buttonPressed: {
      opacity: 0.86,
    },

    buttonText: {
      color: theme.colors.black,

      fontSize: 14,

      fontWeight:
        '900',
    },

    buttonTextDisabled: {
      color:
        theme.colors
          .textLight,
    },
  });