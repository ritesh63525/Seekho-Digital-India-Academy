import React, {
  useMemo,
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

import {
  ArrowLeft,
  ArrowRight,
  Mail,
  ShieldCheck,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  forgotStudentPassword,
} from '../../services/authApi';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'ForgotPassword'
  >;

function useForgotPasswordTheme() {
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

export default function ForgotPasswordScreen({
  navigation,
}: Props) {
  const {
    theme,
    styles,
  } = useForgotPasswordTheme();

  const [
    portalEmail,
    setPortalEmail,
  ] = useState('');

  const [
    loading,
    setLoading,
  ] = useState(false);

  const email =
    portalEmail
      .trim()
      .toLowerCase();

  const canContinue =
    email.length > 4 &&
    email.includes('@') &&
    !loading;

  const handleSendOtp =
    async () => {
      if (!email) {
        Alert.alert(
          'Portal email required',
          'Please enter your portal email.',
        );

        return;
      }

      if (!email.includes('@')) {
        Alert.alert(
          'Invalid email',
          'Please enter a valid portal email.',
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await forgotStudentPassword(
            email,
          );

        Alert.alert(
          'Verification code sent',
          response.message ||
            'A verification code has been sent.',
          [
            {
              text: 'Continue',

              onPress: () => {
                navigation.navigate(
                  'ForgotOtp',
                  {
                    portalEmail:
                      email,
                  },
                );
              },
            },
          ],
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to send verification code. Please try again.';

        Alert.alert(
          'Unable to continue',
          message,
        );
      } finally {
        setLoading(false);
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

        <View style={styles.container}>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
            style={({pressed}) => [
              styles.backButton,
              pressed &&
                styles.pressed,
            ]}
            hitSlop={10}>

            <ArrowLeft
              size={22}
              color={
                theme.colors.textPrimary
              }
              strokeWidth={2.2}
            />
          </Pressable>

          <View style={styles.iconBox}>
            <Mail
              size={30}
              color={
                theme.colors.black
              }
              strokeWidth={2.2}
            />
          </View>

          <Text style={styles.kicker}>
            ACCOUNT RECOVERY
          </Text>

          <Text style={styles.title}>
            Forgot Password?
          </Text>

          <Text style={styles.subtitle}>
            Enter your student portal email.
            If an active account exists,
            a verification code will be sent
            to your registered email address.
          </Text>

          <View style={styles.infoBox}>
            <View
              style={
                styles.infoIcon
              }>
              <ShieldCheck
                size={20}
                color={
                  theme.colors.secondary
                }
                strokeWidth={2}
              />
            </View>

            <Text
              style={
                styles.infoText
              }>
              Use the same portal email that
              was provided to you by the academy.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Portal Email
            </Text>

            <View style={styles.inputBox}>
              <Mail
                size={19}
                color={
                  theme.colors.textSecondary
                }
                strokeWidth={2}
              />

              <TextInput
                value={portalEmail}
                onChangeText={
                  setPortalEmail
                }
                placeholder="Enter portal email"
                placeholderTextColor={
                  theme.colors.textLight
                }
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                selectionColor={
                  theme.colors.primary
                }
                style={styles.input}
                onSubmitEditing={
                  handleSendOtp
                }
              />
            </View>

            <Pressable
              disabled={!canContinue}
              onPress={handleSendOtp}
              style={({pressed}) => [
                styles.button,

                !canContinue &&
                  styles.buttonDisabled,

                pressed &&
                  canContinue &&
                  styles.buttonPressed,
              ]}>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.colors.black
                  }
                />
              ) : (
                <>
                  <Text
                    style={[
                      styles.buttonText,

                      !canContinue &&
                        styles
                          .buttonTextDisabled,
                    ]}>
                    Send Verification Code
                  </Text>

                  <ArrowRight
                    size={19}
                    color={
                      canContinue
                        ? theme.colors.black
                        : theme.colors.textLight
                    }
                    strokeWidth={2.4}
                  />
                </>
              )}
            </Pressable>
          </View>
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
        theme.colors.background,
    },

    keyboard: {
      flex: 1,
    },

    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 18,
      backgroundColor:
        theme.colors.background,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    iconBox: {
      width: 58,
      height: 58,
      marginTop: 42,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity:
        theme.dark
          ? 0.20
          : 0.10,
      shadowRadius: 12,
      elevation: 3,
    },

    kicker: {
      marginTop: 25,
      color:
        theme.colors.primary,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.6,
    },

    title: {
      marginTop: 8,
      color:
        theme.colors.textPrimary,
      fontSize: 30,
      fontWeight: '900',
      letterSpacing: -0.8,
    },

    subtitle: {
      marginTop: 12,
      color:
        theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 21,
      fontWeight: '500',
    },

    infoBox: {
      marginTop: 25,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      borderRadius: 16,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    infoIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surface,
    },

    infoText: {
      flex: 1,
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 18,
    },

    form: {
      marginTop: 30,
    },

    label: {
      marginBottom: 9,
      color:
        theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },

    inputBox: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      borderRadius: 17,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    input: {
      flex: 1,
      paddingVertical: 0,
      color:
        theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: '600',
    },

    button: {
      height: 58,
      marginTop: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 17,
      borderWidth: 1,
      borderColor:
        theme.colors.primaryStrong,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity:
        theme.dark
          ? 0.20
          : 0.10,
      shadowRadius: 10,
      elevation: 3,
    },

    buttonDisabled: {
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceElevated,
      elevation: 0,
      shadowOpacity: 0,
    },

    buttonPressed: {
      opacity: 0.86,
    },

    buttonText: {
      color:
        theme.colors.black,
      fontSize: 14,
      fontWeight: '900',
    },

    buttonTextDisabled: {
      color:
        theme.colors.textLight,
    },

    pressed: {
      opacity: 0.78,
    },
  });
