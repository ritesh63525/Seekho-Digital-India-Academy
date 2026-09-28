import React, {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
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
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react-native';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

import {
  loginStudent,
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
    'Login'
  >;

function useLoginTheme() {
  const {
    theme,
  } = useTheme();

  const styles =
    useMemo(
      () =>
        createStyles(
          theme,
        ),
      [theme],
    );

  return {
    theme,
    styles,
  };
}

export default function LoginScreen({
  navigation,
}: Props) {
  const {
    theme,
    styles,
  } = useLoginTheme();

  const {
    saveAuthSession,
    completeLogin,
  } = useApp();

  const [
    portalEmail,
    setPortalEmail,
  ] = useState('');

  const [
    password,
    setPassword,
  ] = useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * Safe email normalization.
   */
  const email =
    String(
      portalEmail ?? '',
    )
      .trim()
      .toLowerCase();

  const safePassword =
    String(
      password ?? '',
    );

  const canContinue =
    email.length > 4 &&
    email.includes('@') &&
    safePassword.length >
      0 &&
    !loading;

  /*
   * =====================================================
   * LOGIN
   * =====================================================
   */

  const handleLogin =
    async () => {
      if (loading) {
        return;
      }

      if (!email) {
        Alert.alert(
          'Portal email required',
          'Please enter your portal email.',
        );

        return;
      }

      if (
        !email.includes('@')
      ) {
        Alert.alert(
          'Invalid email',
          'Please enter a valid portal email.',
        );

        return;
      }

      if (
        !safePassword.trim()
      ) {
        Alert.alert(
          'Password required',
          'Please enter your password.',
        );

        return;
      }

      try {
        setLoading(true);

        const rawResponse:
          any =
          await loginStudent(
            email,
            safePassword,
          );

        /*
         * Backend currently returns:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {
         *     role: "student",
         *     access_token: "...",
         *     refresh_token: "...",
         *     token_type: "bearer",
         *     user_id: "...",
         *     email: "...",
         *     cvengine_student_id: "...",
         *     must_change_password: false
         *   }
         * }
         *
         * Flat response support bhi
         * preserve rakha hai.
         */
        const response =
          rawResponse?.data &&
          typeof rawResponse
            .data ===
            'object'
            ? rawResponse.data
            : rawResponse;

        /*
         * ACCESS TOKEN
         */
        const accessToken =
          String(
            response
              ?.access_token ??
              '',
          ).trim();

        /*
         * REFRESH TOKEN
         *
         * Ye long-time reopen
         * issue ka important part hai.
         */
        const refreshToken =
          String(
            response
              ?.refresh_token ??
              '',
          ).trim();

        /*
         * TOKEN TYPE
         */
        const tokenType =
          String(
            response
              ?.token_type ??
              'bearer',
          ).trim();

        /*
         * Platform login response
         * user_id return karta hai.
         *
         * Old account_id support bhi
         * compatibility ke liye rakhi hai.
         */
        const accountId =
          String(
            response
              ?.account_id ??
              response
                ?.user_id ??
              '',
          ).trim();

        /*
         * CVEngine student ID
         */
        const studentId =
          String(
            response
              ?.cvengine_student_id ??
              '',
          ).trim();

        /*
         * Student email
         */
        const responseEmail =
          String(
            response
              ?.email ??
              email,
          )
            .trim()
            .toLowerCase();

        /*
         * First-login password flow
         */
        const mustChangePassword =
          Boolean(
            response
              ?.must_change_password,
          );

        /*
         * Do not continue unless
         * access token exists.
         */
        if (!accessToken) {
          throw new Error(
            'Login response did not contain an access token.',
          );
        }

        /*
         * Refresh token is now
         * compulsory for persistent
         * login/session refresh.
         */
        if (!refreshToken) {
          throw new Error(
            'Login response did not contain a refresh token.',
          );
        }

        if (!responseEmail) {
          throw new Error(
            'Login response did not contain a student email.',
          );
        }

        /*
         * SAVE SESSION
         *
         * AppContext now stores:
         *
         * accessToken
         * refreshToken
         * tokenType
         * accountId
         * studentId
         */
        saveAuthSession({
          portalEmail:
            responseEmail,

          accessToken,

          refreshToken,

          tokenType:
            tokenType ||
            'bearer',

          accountId,

          studentId,
        });

        /*
         * FIRST LOGIN:
         * Password change required.
         */
        if (
          mustChangePassword
        ) {
          navigation.navigate(
            'ChangePassword',
            {
              portalEmail:
                responseEmail,
            },
          );

          return;
        }

        /*
         * NORMAL LOGIN
         *
         * This persists the
         * authenticated session.
         */
        completeLogin();

        navigation.reset({
          index: 0,

          routes: [
            {
              name: 'Main',
            },
          ],
        });
      } catch (error) {
        const message =
          error instanceof
          Error
            ? error.message
            : 'Unable to sign in. Please try again.';

        Alert.alert(
          'Login failed',
          message,
        );
      } finally {
        setLoading(false);
      }
    };

  /*
   * =====================================================
   * FORGOT PASSWORD
   * =====================================================
   */

  const handleForgotPassword =
    () => {
      if (loading) {
        return;
      }

      navigation.navigate(
        'ForgotPassword',
      );
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
        style={
          styles.keyboardView
        }
        behavior={
          Platform.OS ===
          'ios'
            ? 'padding'
            : undefined
        }>

        <View
          style={
            styles.container
          }>

          {/* LOGO */}

          <View
            style={
              styles.logoArea
            }>

            <Image
              source={require('../../assets/seekho-login-logo-transparent.png')}
              style={
                styles.logo
              }
              resizeMode="contain"
            />

          </View>

          {/* PREMIUM PORTAL PANEL */}

          <View
            style={
              styles.portalPanel
            }>

            {/* BRAND ACCENT */}

            <View
              style={
                styles.panelAccentRow
              }>

              <View
                style={
                  styles.panelAccentOrange
                }
              />

              <View
                style={
                  styles.panelAccentGreen
                }
              />

            </View>

            {/* HEADING */}

            <View
              style={
                styles.headingArea
              }>

              <Text
                style={
                  styles.eyebrow
                }>
                SECURE STUDENT ACCESS
              </Text>

              <Text
                style={
                  styles.title
                }>
                Student{' '}

                <Text
                  style={
                    styles.titleAccent
                  }>
                  Portal
                </Text>

              </Text>

              <Text
                style={
                  styles.subtitle
                }>
                Sign in using the portal email and password
                provided by Seekho Digital India Academy.
              </Text>

            </View>

            {/* FORM */}

            <View
              style={
                styles.form
              }>

              <Text
                style={
                  styles.label
                }>
                Portal Email
              </Text>

              <View
                style={
                  styles.inputBox
                }>

                <View
                  style={
                    styles.inputIconBox
                  }>

                  <Mail
                    size={18}
                    color={
                      theme
                        .colors
                        .secondary
                    }
                    strokeWidth={
                      2
                    }
                  />

                </View>

                <TextInput
                  value={
                    String(
                      portalEmail ??
                        '',
                    )
                  }
                  onChangeText={
                    value =>
                      setPortalEmail(
                        String(
                          value ??
                            '',
                        ),
                      )
                  }
                  placeholder="Enter portal email"
                  placeholderTextColor={
                    theme
                      .colors
                      .textLight
                  }
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
                  }
                  selectionColor={
                    theme
                      .colors
                      .primary
                  }
                  style={
                    styles.input
                  }
                  returnKeyType="next"
                />

              </View>

              <Text
                style={
                  styles.passwordLabel
                }>
                Password
              </Text>

              <View
                style={
                  styles.inputBox
                }>

                <View
                  style={
                    styles.inputIconBox
                  }>

                  <LockKeyhole
                    size={18}
                    color={
                      theme
                        .colors
                        .primary
                    }
                    strokeWidth={
                      2
                    }
                  />

                </View>

                <TextInput
                  value={
                    String(
                      password ??
                        '',
                    )
                  }
                  onChangeText={
                    value =>
                      setPassword(
                        String(
                          value ??
                            '',
                        ),
                      )
                  }
                  placeholder="Enter password"
                  placeholderTextColor={
                    theme
                      .colors
                      .textLight
                  }
                  secureTextEntry={
                    !showPassword
                  }
                  autoCapitalize="none"
                  autoCorrect={
                    false
                  }
                  editable={
                    !loading
                  }
                  selectionColor={
                    theme
                      .colors
                      .primary
                  }
                  style={
                    styles.input
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    handleLogin
                  }
                />

                <Pressable
                  disabled={
                    loading
                  }
                  onPress={() =>
                    setShowPassword(
                      previous =>
                        !previous,
                    )
                  }
                  hitSlop={10}
                  style={
                    styles.eyeButton
                  }>

                  {showPassword ? (
                    <EyeOff
                      size={
                        20
                      }
                      color={
                        theme
                          .colors
                          .textSecondary
                      }
                      strokeWidth={
                        2
                      }
                    />
                  ) : (
                    <Eye
                      size={
                        20
                      }
                      color={
                        theme
                          .colors
                          .textSecondary
                      }
                      strokeWidth={
                        2
                      }
                    />
                  )}

                </Pressable>

              </View>

              {/* FORGOT PASSWORD */}

              <Pressable
                disabled={
                  loading
                }
                onPress={
                  handleForgotPassword
                }
                style={
                  styles
                    .forgotButton
                }>

                <Text
                  style={
                    styles
                      .forgotText
                  }>
                  Forgot password?
                </Text>

              </Pressable>

              {/* SIGN IN BUTTON */}

              <Pressable
                disabled={
                  !canContinue
                }
                onPress={
                  handleLogin
                }
                style={({
                  pressed,
                }) => [
                  styles
                    .loginButton,

                  !canContinue &&
                    styles
                      .loginButtonDisabled,

                  pressed &&
                    canContinue &&
                    styles
                      .loginButtonPressed,
                ]}>

                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color={
                      theme
                        .colors
                        .black
                    }
                  />
                ) : (
                  <>
                    <Text
                      style={[
                        styles
                          .loginButtonText,

                        !canContinue &&
                          styles
                            .loginButtonTextDisabled,
                      ]}>
                      Sign In
                    </Text>

                    <View
                      style={[
                        styles
                          .ctaArrowBubble,

                        !canContinue &&
                          styles
                            .ctaArrowBubbleDisabled,
                      ]}>

                      <ArrowRight
                        size={
                          18
                        }
                        strokeWidth={
                          2.5
                        }
                        color={
                          canContinue
                            ? '#FFFFFF'
                            : 'rgba(255,255,255,0.45)'
                        }
                      />

                    </View>
                  </>
                )}

              </Pressable>

              {/* FIRST LOGIN INFO */}

              <View
                style={
                  styles.infoBox
                }>

                <View
                  style={
                    styles.infoDot
                  }
                />

                <Text
                  style={
                    styles.info
                  }>
                  First time signing in? Use the temporary password
                  provided by the academy. You will be asked to create
                  your own password if required.
                </Text>

              </View>

            </View>

            {/* FOOTER */}

            <View
              style={
                styles.footer
              }>

              <View
                style={
                  styles.footerLine
                }
              />

              <Text
                style={
                  styles.footerText
                }>
                SEEKHO DIGITAL INDIA ACADEMY
              </Text>

            </View>

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
        theme.colors
          .background,
    },

    keyboardView: {
      flex: 1,
    },

    container: {
      flex: 1,

      backgroundColor:
        theme.colors
          .background,
    },

    /*
     * Logo stays on the original
     * page background.
     */
    logoArea: {
      height: 250,

      marginTop: 4,

      paddingHorizontal:
        24,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    logo: {
      width:
        '100%',

      height: 230,

      transform: [
        {
          scale:
            1.18,
        },
      ],
    },

    /*
     * Premium panel:
     * rounded only at top.
     */
    portalPanel: {
      flex: 1,

      width:
        '100%',

      marginTop:
        -2,

      paddingHorizontal:
        24,

      paddingTop:
        20,

      backgroundColor:
        theme.colors
          .surface,

      borderTopLeftRadius:
        34,

      borderTopRightRadius:
        34,

      borderTopWidth:
        1,

      borderLeftWidth:
        1,

      borderRightWidth:
        1,

      borderTopColor:
        theme.colors
          .borderStrong,

      borderLeftColor:
        theme.colors
          .border,

      borderRightColor:
        theme.colors
          .border,

      overflow:
        'hidden',
    },

    panelAccentRow: {
      alignSelf:
        'center',

      flexDirection:
        'row',

      alignItems:
        'center',

      width:
        82,

      height:
        4,

      marginBottom:
        18,

      borderRadius:
        999,

      overflow:
        'hidden',
    },

    panelAccentOrange: {
      flex:
        1.25,

      height:
        '100%',

      backgroundColor:
        theme.colors
          .primary,
    },

    panelAccentGreen: {
      flex:
        0.75,

      height:
        '100%',

      backgroundColor:
        theme.colors
          .secondary,
    },

    headingArea: {
      width:
        '100%',

      alignItems:
        'center',
    },

    eyebrow: {
      color:
        theme.colors
          .secondary,

      fontSize:
        9,

      fontWeight:
        '900',

      letterSpacing:
        1.8,

      textAlign:
        'center',

      marginBottom:
        8,
    },

    title: {
      color:
        theme.colors
          .textPrimary,

      fontSize:
        31,

      lineHeight:
        38,

      fontWeight:
        '900',

      letterSpacing:
        -0.8,

      textAlign:
        'center',
    },

    titleAccent: {
      color:
        theme.colors
          .primary,
    },

    subtitle: {
      marginTop:
        9,

      maxWidth:
        330,

      color:
        theme.colors
          .textSecondary,

      fontSize:
        12,

      lineHeight:
        19,

      fontWeight:
        '500',

      textAlign:
        'center',
    },

    form: {
      marginTop:
        27,
    },

    label: {
      marginBottom:
        9,

      color:
        theme.colors
          .textPrimary,

      fontSize:
        12,

      fontWeight:
        '800',
    },

    passwordLabel: {
      marginTop:
        17,

      marginBottom:
        9,

      color:
        theme.colors
          .textPrimary,

      fontSize:
        12,

      fontWeight:
        '800',
    },

    inputBox: {
      height:
        60,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal:
        13,

      gap:
        11,

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

    inputIconBox: {
      width:
        34,

      height:
        34,

      borderRadius:
        11,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .secondarySoft,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .borderStrong,
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

    eyeButton: {
      minWidth:
        32,

      minHeight:
        32,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    forgotButton: {
      alignSelf:
        'flex-end',

      paddingTop:
        13,

      paddingBottom:
        14,
    },

    forgotText: {
      color:
        theme.colors
          .secondary,

      fontSize:
        12,

      fontWeight:
        '900',
    },

    loginButton: {
      height:
        60,

      borderRadius:
        18,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap:
        11,

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
        0.20,

      shadowRadius:
        12,

      shadowOffset: {
        width:
          0,

        height:
          6,
      },

      elevation:
        5,
    },

    loginButtonDisabled: {
      backgroundColor:
        theme.colors
          .primarySoft,

      borderColor:
        theme.colors
          .borderStrong,

      elevation:
        0,
    },

    loginButtonPressed: {
      opacity:
        0.90,

      transform: [
        {
          scale:
            0.992,
        },
      ],
    },

    loginButtonText: {
      color:
        theme.colors
          .black,

      fontSize:
        15,

      fontWeight:
        '900',

      letterSpacing:
        0.2,
    },

    loginButtonTextDisabled: {
      color:
        theme.colors
          .textLight,
    },

    ctaArrowBubble: {
      width:
        30,

      height:
        30,

      borderRadius:
        15,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        theme.colors
          .secondaryStrong,
    },

    ctaArrowBubbleDisabled: {
      backgroundColor:
        theme.colors
          .secondarySoft,
    },

    infoBox: {
      marginTop:
        18,

      flexDirection:
        'row',

      alignItems:
        'flex-start',

      gap:
        9,

      paddingHorizontal:
        13,

      paddingVertical:
        12,

      borderRadius:
        14,

      borderWidth:
        1,

      borderColor:
        theme.colors
          .border,

      backgroundColor:
        theme.colors
          .secondarySoft,
    },

    infoDot: {
      width:
        6,

      height:
        6,

      marginTop:
        5,

      borderRadius:
        3,

      backgroundColor:
        theme.colors
          .secondary,
    },

    info: {
      flex:
        1,

      color:
        theme.colors
          .textLight,

      fontSize:
        10,

      lineHeight:
        16,

      textAlign:
        'left',
    },

    footer: {
      flex:
        1,

      minHeight:
        56,

      justifyContent:
        'flex-end',

      alignItems:
        'center',

      paddingBottom:
        18,
    },

    footerLine: {
      width:
        34,

      height:
        2,

      marginBottom:
        10,

      borderRadius:
        999,

      backgroundColor:
        theme.colors
          .primary,
    },

    footerText: {
      color:
        theme.colors
          .textLight,

      fontSize:
        7,

      fontWeight:
        '900',

      letterSpacing:
        1.5,
    },
  });