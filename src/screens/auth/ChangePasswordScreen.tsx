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
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react-native';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  changeStudentPassword,
} from '../../services/authApi';

import {
  useApp,
} from '../../state/AppContext';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'ChangePassword'
  >;

function useChangePasswordTheme() {
  const {
    theme,
  } = useTheme();

  const styles =
    useMemo(
      () =>
        createStyles(
          theme,
        ),
      [
        theme,
      ],
    );

  return {
    theme,
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

export default function ChangePasswordScreen({
  navigation,
  route,
}: Props) {
  const {
    theme,
    styles,
  } =
    useChangePasswordTheme();

  const {
    accessToken,
    refreshAccessToken,
    completeLogin,
    logout,
    isAuthenticated,
  } =
    useApp();

  const [
    currentPassword,
    setCurrentPassword,
  ] =
    useState(
      '',
    );

  const [
    newPassword,
    setNewPassword,
  ] =
    useState(
      '',
    );

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState(
      '',
    );

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] =
    useState(
      false,
    );

  const [
    showNewPassword,
    setShowNewPassword,
  ] =
    useState(
      false,
    );

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(
      false,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      false,
    );

  /*
   * true:
   * user Settings se aaya hai.
   *
   * false:
   * first-login mandatory password
   * change flow ho sakta hai.
   */
  const openedFromApp =
    isAuthenticated;

  const portalEmail =
    String(
      route.params
        ?.portalEmail ??
        '',
    ).trim();

  /*
   * ============================================
   * PASSWORD CHANGE
   * ============================================
   */

  const handleChangePassword =
    async () => {
      const safeCurrentPassword =
        currentPassword.trim();

      const safeNewPassword =
        newPassword.trim();

      const safeConfirmPassword =
        confirmPassword.trim();

      /*
       * BASIC VALIDATION
       */

      if (
        !safeCurrentPassword ||
        !safeNewPassword ||
        !safeConfirmPassword
      ) {
        Alert.alert(
          'Missing details',
          'Please fill all password fields.',
        );

        return;
      }

      if (
        safeNewPassword.length <
        8
      ) {
        Alert.alert(
          'Password too short',
          'New password must be at least 8 characters.',
        );

        return;
      }

      if (
        safeNewPassword !==
        safeConfirmPassword
      ) {
        Alert.alert(
          'Passwords do not match',
          'New password and confirm password must be the same.',
        );

        return;
      }

      if (
        safeCurrentPassword ===
        safeNewPassword
      ) {
        Alert.alert(
          'Choose a new password',
          'New password must be different from your current password.',
        );

        return;
      }

      /*
       * SESSION CHECK
       */

      if (
        !accessToken
      ) {
        Alert.alert(
          'Session expired',
          'Please sign in again.',
          [
            {
              text:
                'OK',

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

        return;
      }

      try {
        setLoading(
          true,
        );

        /*
         * --------------------------------------------
         * FIRST TRY WITH CURRENT ACCESS TOKEN
         * --------------------------------------------
         */

        let response;

        try {
          response =
            await changeStudentPassword(
              accessToken,
              safeCurrentPassword,
              safeNewPassword,
            );
        } catch (
          firstError
        ) {
          /*
           * Normal backend errors jaise:
           * wrong current password,
           * validation etc.
           * unpe refresh nahi karenge.
           */

          if (
            !isUnauthorized(
              firstError,
            )
          ) {
            throw firstError;
          }

          /*
           * ------------------------------------------
           * TOKEN EXPIRED:
           * REFRESH + RETRY ONCE
           * ------------------------------------------
           */

          const freshToken =
            await refreshAccessToken();

          response =
            await changeStudentPassword(
              freshToken,
              safeCurrentPassword,
              safeNewPassword,
            );
        }

        /*
         * If this was first-login password change,
         * login now becomes fully completed.
         *
         * For already logged-in Settings user,
         * calling this is safe and keeps the
         * authenticated session persisted.
         */

        completeLogin();

        /*
         * Clear sensitive values from local state.
         */

        setCurrentPassword(
          '',
        );

        setNewPassword(
          '',
        );

        setConfirmPassword(
          '',
        );

        Alert.alert(
          'Password changed',
          response?.message ||
            'Password changed successfully.',
          [
            {
              text:
                'Done',

              onPress:
                () => {
                  /*
                   * SETTINGS FLOW:
                   * go back to Settings.
                   *
                   * FIRST LOGIN FLOW:
                   * enter Main application.
                   */

                  if (
                    openedFromApp &&
                    navigation.canGoBack()
                  ) {
                    navigation.goBack();

                    return;
                  }

                  navigation.reset(
                    {
                      index:
                        0,

                      routes:
                        [
                          {
                            name:
                              'Main',
                          },
                        ],
                    },
                  );
                },
            },
          ],
        );
      } catch (
        error
      ) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to change password. Please try again.';

        Alert.alert(
          'Password change failed',
          message,
        );
      } finally {
        setLoading(
          false,
        );
      }
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

      <KeyboardAvoidingView
        style={
          styles.keyboard
        }
        behavior={
          Platform.OS ===
          'ios'
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

          {/* ICON */}

          <View
            style={
              styles.iconBox
            }>

            <KeyRound
              size={
                30
              }
              color={
                theme.colors
                  .black
              }
              strokeWidth={
                2.3
              }
            />

          </View>

          {/* HEADING */}

          <Text
            style={
              styles.kicker
            }>
            STUDENT SECURITY
          </Text>

          <Text
            style={
              styles.title
            }>
            Change Your Password
          </Text>

          {openedFromApp ? (
            <Text
              style={
                styles.subtitle
              }>
              {portalEmail
                ? `Signed in as ${portalEmail}. `
                : ''}
              Enter your current password and choose a secure new
              password for your student portal account.
            </Text>
          ) : (
            <Text
              style={
                styles.subtitle
              }>
              {portalEmail
                ? `Welcome ${portalEmail}. `
                : ''}
              Before continuing, replace your temporary password with
              a secure password of your own.
            </Text>
          )}

          {/* REQUIREMENT CARD */}

          <View
            style={
              styles.requirementBox
            }>

            <ShieldCheck
              size={
                20
              }
              color={
                theme.colors
                  .primary
              }
              strokeWidth={
                2
              }
            />

            <View
              style={
                styles.requirementTextArea
              }>

              <Text
                style={
                  styles.requirementTitle
                }>
                Password requirements
              </Text>

              <Text
                style={
                  styles.requirementText
                }>
                Use at least 8 characters and choose a password
                different from your current password.
              </Text>

            </View>

          </View>

          {/* FORM */}

          <View
            style={
              styles.form
            }>

            {/* CURRENT PASSWORD */}

            <Text
              style={
                styles.label
              }>
              Current Password
            </Text>

            <View
              style={
                styles.inputBox
              }>

              <LockKeyhole
                size={
                  19
                }
                color={
                  theme.colors
                    .textSecondary
                }
                strokeWidth={
                  2
                }
              />

              <TextInput
                value={
                  currentPassword
                }
                onChangeText={
                  setCurrentPassword
                }
                placeholder="Enter current password"
                placeholderTextColor={
                  theme.colors
                    .textLight
                }
                secureTextEntry={
                  !showCurrentPassword
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                editable={
                  !loading
                }
                style={
                  styles.input
                }
                selectionColor={
                  theme.colors
                    .primary
                }
              />

              <Pressable
                onPress={() =>
                  setShowCurrentPassword(
                    previous =>
                      !previous,
                  )
                }
                disabled={
                  loading
                }
                hitSlop={
                  10
                }>

                {showCurrentPassword ? (
                  <EyeOff
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                ) : (
                  <Eye
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                )}

              </Pressable>

            </View>

            {/* NEW PASSWORD */}

            <Text
              style={
                styles.labelGap
              }>
              New Password
            </Text>

            <View
              style={
                styles.inputBox
              }>

              <LockKeyhole
                size={
                  19
                }
                color={
                  theme.colors
                    .textSecondary
                }
                strokeWidth={
                  2
                }
              />

              <TextInput
                value={
                  newPassword
                }
                onChangeText={
                  setNewPassword
                }
                placeholder="Minimum 8 characters"
                placeholderTextColor={
                  theme.colors
                    .textLight
                }
                secureTextEntry={
                  !showNewPassword
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                editable={
                  !loading
                }
                style={
                  styles.input
                }
                selectionColor={
                  theme.colors
                    .primary
                }
              />

              <Pressable
                onPress={() =>
                  setShowNewPassword(
                    previous =>
                      !previous,
                  )
                }
                disabled={
                  loading
                }
                hitSlop={
                  10
                }>

                {showNewPassword ? (
                  <EyeOff
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                ) : (
                  <Eye
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                )}

              </Pressable>

            </View>

            {/* CONFIRM PASSWORD */}

            <Text
              style={
                styles.labelGap
              }>
              Confirm New Password
            </Text>

            <View
              style={
                styles.inputBox
              }>

              <LockKeyhole
                size={
                  19
                }
                color={
                  theme.colors
                    .textSecondary
                }
                strokeWidth={
                  2
                }
              />

              <TextInput
                value={
                  confirmPassword
                }
                onChangeText={
                  setConfirmPassword
                }
                placeholder="Enter new password again"
                placeholderTextColor={
                  theme.colors
                    .textLight
                }
                secureTextEntry={
                  !showConfirmPassword
                }
                autoCapitalize="none"
                autoCorrect={
                  false
                }
                editable={
                  !loading
                }
                style={
                  styles.input
                }
                selectionColor={
                  theme.colors
                    .primary
                }
              />

              <Pressable
                onPress={() =>
                  setShowConfirmPassword(
                    previous =>
                      !previous,
                  )
                }
                disabled={
                  loading
                }
                hitSlop={
                  10
                }>

                {showConfirmPassword ? (
                  <EyeOff
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                ) : (
                  <Eye
                    size={
                      20
                    }
                    color={
                      theme.colors
                        .textSecondary
                    }
                  />
                )}

              </Pressable>

            </View>

            {/* SUBMIT */}

            <Pressable
              onPress={
                handleChangePassword
              }
              disabled={
                loading
              }
              style={({
                pressed,
              }) => [
                styles.button,

                loading &&
                  styles.buttonDisabled,

                pressed &&
                  !loading &&
                  styles.buttonPressed,
              ]}>

              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={
                    theme.colors
                      .black
                  }
                />
              ) : (
                <>

                  <Text
                    style={
                      styles.buttonText
                    }>
                    Change Password
                  </Text>

                  <ArrowRight
                    size={
                      19
                    }
                    color={
                      theme.colors
                        .black
                    }
                    strokeWidth={
                      2.4
                    }
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
  theme:
    AppTheme,
) =>
  StyleSheet.create({

    safe: {
      flex:
        1,

      backgroundColor:
        theme.colors
          .background,
    },

    keyboard: {
      flex:
        1,
    },

    scrollContent: {
      flexGrow:
        1,

      paddingHorizontal:
        24,

      paddingTop:
        45,

      paddingBottom:
        35,
    },

    iconBox: {
      width:
        58,

      height:
        58,

      borderRadius:
        18,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .primary,
    },

    kicker: {
      marginTop:
        26,

      color:
        theme.colors
          .primary,

      fontSize:
        11,

      fontWeight:
        '900',

      letterSpacing:
        1.7,
    },

    title: {
      marginTop:
        8,

      color:
        theme.colors
          .textPrimary,

      fontSize:
        30,

      fontWeight:
        '900',

      letterSpacing:
        -0.8,
    },

    subtitle: {
      marginTop:
        12,

      color:
        theme.colors
          .textSecondary,

      fontSize:
        13,

      lineHeight:
        21,

      fontWeight:
        '500',
    },

    requirementBox: {
      marginTop:
        25,

      flexDirection:
        'row',

      padding:
        16,

      gap:
        12,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        16,

      backgroundColor:
        theme.colors
          .primarySoft,
    },

    requirementTextArea: {
      flex:
        1,
    },

    requirementTitle: {
      color:
        theme.colors
          .primary,

      fontSize:
        13,

      fontWeight:
        '800',
    },

    requirementText: {
      marginTop:
        4,

      color:
        theme.colors
          .textSecondary,

      fontSize:
        11,

      lineHeight:
        18,
    },

    form: {
      marginTop:
        28,
    },

    label: {
      marginBottom:
        9,

      color:
        theme.colors
          .textSecondary,

      fontSize:
        12,

      fontWeight:
        '700',
    },

    labelGap: {
      marginTop:
        18,

      marginBottom:
        9,

      color:
        theme.colors
          .textSecondary,

      fontSize:
        12,

      fontWeight:
        '700',
    },

    inputBox: {
      height:
        60,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap:
        12,

      paddingHorizontal:
        16,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius:
        17,

      backgroundColor:
        theme.colors
          .surfaceSoft,
    },

    input: {
      flex:
        1,

      paddingVertical:
        0,

      color:
        theme.colors
          .textPrimary,

      fontSize:
        14,

      fontWeight:
        '600',
    },

    button: {
      height:
        58,

      marginTop:
        30,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        8,

      borderRadius:
        17,

      backgroundColor:
        theme.colors
          .primary,

      borderWidth:
        1,

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

      shadowRadius:
        10,

      shadowOffset: {
        width:
          0,

        height:
          5,
      },

      elevation:
        3,
    },

    buttonDisabled: {
      opacity:
        0.65,
    },

    buttonPressed: {
      opacity:
        0.86,
    },

    buttonText: {
      color:
        theme.colors
          .black,

      fontSize:
        14,

      fontWeight:
        '900',
    },

  });