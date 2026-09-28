import React, {useMemo, useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
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
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {resetStudentPassword} from '../../services/authApi';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ResetPassword'
>;

function useResetPasswordTheme() {
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

export default function ResetPasswordScreen({
  navigation,
  route,
}: Props) {
  const {
    theme,
    styles,
  } = useResetPasswordTheme();

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const resetToken =
    route.params.resetToken;

  const canContinue =
    newPassword.length >= 8 &&
    confirmPassword.length >= 8 &&
    !loading;

  const handleResetPassword =
    async () => {
      if (!resetToken) {
        Alert.alert(
          'Reset session expired',
          'Please start the forgot password process again.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,

                  routes: [
                    {
                      name: 'ForgotPassword',
                    },
                  ],
                });
              },
            },
          ],
        );

        return;
      }

      if (
        !newPassword ||
        !confirmPassword
      ) {
        Alert.alert(
          'Missing details',
          'Please enter and confirm your new password.',
        );

        return;
      }

      if (
        newPassword.length < 8
      ) {
        Alert.alert(
          'Password too short',
          'New password must be at least 8 characters.',
        );

        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        Alert.alert(
          'Passwords do not match',
          'New password and confirm password must be the same.',
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await resetStudentPassword(
            resetToken,
            newPassword,
            confirmPassword,
          );

        Alert.alert(
          'Password reset',
          response.message ||
            'Password reset successfully.',
          [
            {
              text: 'Sign in',

              onPress: () => {
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
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to reset password. Please try again.';

        Alert.alert(
          'Reset failed',
          message,
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <SafeAreaView style={styles.safe}>
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

        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

          <Pressable
            onPress={() =>
              navigation.goBack()
            }
            disabled={loading}
            style={styles.backButton}
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

            <LockKeyhole
              size={30}
              color={theme.colors.black}
              strokeWidth={2.2}
            />

          </View>

          <Text style={styles.kicker}>
            CREATE NEW PASSWORD
          </Text>

          <Text style={styles.title}>
            Reset Password
          </Text>

          <Text style={styles.subtitle}>
            Create a new password for
            {' '}
            {route.params.portalEmail}.
          </Text>

          <View style={styles.infoBox}>

            <ShieldCheck
              size={20}
              color={theme.colors.primary}
              strokeWidth={2}
            />

            <Text style={styles.infoText}>
              Use at least 8 characters.
              After resetting your password,
              sign in again using your portal
              email and new password.
            </Text>

          </View>

          <View style={styles.form}>

            <Text style={styles.label}>
              New Password
            </Text>

            <View style={styles.inputBox}>

              <LockKeyhole
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
                strokeWidth={2}
              />

              <TextInput
                value={newPassword}
                onChangeText={
                  setNewPassword
                }
                placeholder="Minimum 8 characters"
                placeholderTextColor={
                  theme.colors.textLight
                }
                secureTextEntry={
                  !showNewPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                selectionColor={
                  theme.colors.primary
                }
                style={styles.input}
              />

              <Pressable
                disabled={loading}
                onPress={() =>
                  setShowNewPassword(
                    previous =>
                      !previous,
                  )
                }
                hitSlop={10}>

                {showNewPassword ? (
                  <EyeOff
                    size={20}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                ) : (
                  <Eye
                    size={20}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                )}

              </Pressable>

            </View>

            <Text style={styles.labelGap}>
              Confirm New Password
            </Text>

            <View style={styles.inputBox}>

              <LockKeyhole
                size={19}
                color={
                  theme.colors
                    .textSecondary
                }
                strokeWidth={2}
              />

              <TextInput
                value={confirmPassword}
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Enter new password again"
                placeholderTextColor={
                  theme.colors.textLight
                }
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
                selectionColor={
                  theme.colors.primary
                }
                style={styles.input}
              />

              <Pressable
                disabled={loading}
                onPress={() =>
                  setShowConfirmPassword(
                    previous =>
                      !previous,
                  )
                }
                hitSlop={10}>

                {showConfirmPassword ? (
                  <EyeOff
                    size={20}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                ) : (
                  <Eye
                    size={20}
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                )}

              </Pressable>

            </View>

            <Pressable
              disabled={!canContinue}
              onPress={
                handleResetPassword
              }
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
                  color={theme.colors.black}
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
                    Reset Password
                  </Text>

                  <ArrowRight
                    size={19}
                    color={
                      canContinue
                        ? '#07130B'
                        : theme.colors
                            .textLight
                    }
                    strokeWidth={2.4}
                  />
                </>
              )}

            </Pressable>

          </View>

        </ScrollView>

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

    scrollContent: {
      flexGrow: 1,

      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 35,
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

    labelGap: {
      marginTop: 18,
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

      marginTop: 30,

      flexDirection: 'row',

      alignItems: 'center',
      justifyContent: 'center',

      gap: 8,

      borderRadius: 17,

      backgroundColor:
        theme.colors.primary,

      borderWidth: 1,
      borderColor:
        theme.colors.primaryStrong,

      shadowColor:
        theme.colors.shadow,
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
        theme.colors.surfaceElevated,
      borderColor:
        theme.colors.borderStrong,
      elevation: 0,
      shadowOpacity: 0,
    },

    buttonPressed: {
      opacity: 0.86,
    },

    buttonText: {
      color: theme.colors.black,

      fontSize: 14,

      fontWeight: '900',
    },

    buttonTextDisabled: {
      color:
        theme.colors.textLight,
    },
  });