import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {useApp} from '../../state/AppContext';
import {theme} from '../../theme/theme';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'OTP'
>;

const OTP_LENGTH = 6;

type InputRef =
  React.ElementRef<typeof TextInput>;

export default function OtpScreen({
  navigation,
  route,
}: Props) {
  const {completeLogin} = useApp();

  const inputRef =
    useRef<InputRef>(null);

  const [otp, setOtp] =
    useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const openKeyboard = () => {
    inputRef.current?.blur();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleOtpChange = (
    value: string,
  ) => {
    const numbersOnly =
      value.replace(/[^0-9]/g, '');

    setOtp(
      numbersOnly.slice(
        0,
        OTP_LENGTH,
      ),
    );
  };

  const verifyOtp = () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert(
        'Enter OTP',
        'Please enter the complete 6-digit OTP.',
      );

      openKeyboard();

      return;
    }

    if (otp !== '123456') {
      Alert.alert(
        'Invalid OTP',
        'For demo login, please use OTP 123456.',
      );

      openKeyboard();

      return;
    }

    Keyboard.dismiss();

    completeLogin();

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Main',
        },
      ],
    });
  };

  const resendOtp = () => {
    setOtp('');

    Alert.alert(
      'OTP sent',
      'A new OTP has been sent. Demo OTP is 123456.',
    );

    setTimeout(() => {
      openKeyboard();
    }, 250);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="light-content"
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
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
            style={styles.backButton}>

            <ArrowLeft
              size={22}
              color={
                theme.colors.textPrimary
              }
              strokeWidth={2.2}
            />

          </Pressable>

          <View style={styles.content}>

            <View style={styles.iconBox}>
              <ShieldCheck
                size={30}
                color={
                  theme.colors.primary
                }
                strokeWidth={2}
              />
            </View>

            <Text style={styles.title}>
              Verify your number
            </Text>

            <Text style={styles.subtitle}>
              Enter the 6-digit OTP sent to
            </Text>

            <Text style={styles.phone}>
              {route.params.phone}
            </Text>

            {/* Real hidden input */}

            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={
                handleOtpChange
              }
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
              showSoftInputOnFocus
              caretHidden
              selectionColor={
                theme.colors.primary
              }
              style={styles.hiddenInput}
            />

            {/* OTP Boxes */}

            <Pressable
              onPress={openKeyboard}
              style={styles.otpRow}>

              {Array.from({
                length: OTP_LENGTH,
              }).map((_, index) => {
                const digit =
                  otp[index] ?? '';

                const isFilled =
                  digit !== '';

                const isActive =
                  otp.length === index &&
                  otp.length <
                    OTP_LENGTH;

                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,

                      isFilled &&
                        styles.otpBoxFilled,

                      isActive &&
                        styles.otpBoxActive,
                    ]}>

                    <Text
                      style={
                        styles.otpText
                      }>
                      {digit}
                    </Text>

                  </View>
                );
              })}

            </Pressable>

            <Text style={styles.hint}>
              Tap OTP boxes to open keypad
            </Text>

            <Pressable
              onPress={verifyOtp}
              style={({pressed}) => [
                styles.verifyButton,

                otp.length !==
                  OTP_LENGTH &&
                  styles.verifyButtonDisabled,

                pressed &&
                  otp.length ===
                    OTP_LENGTH &&
                  styles.buttonPressed,
              ]}>

              <Text
                style={[
                  styles.verifyText,

                  otp.length !==
                    OTP_LENGTH &&
                    styles.verifyTextDisabled,
                ]}>
                Verify OTP
              </Text>

            </Pressable>

            <View style={styles.resendRow}>

              <Text style={styles.resendText}>
                Didn't receive the OTP?
              </Text>

              <Pressable
                onPress={resendOtp}>

                <Text
                  style={
                    styles.resendButton
                  }>
                  Resend
                </Text>

              </Pressable>

            </View>

            <Text style={styles.demoText}>
              Demo OTP: 123456
            </Text>

          </View>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,

      backgroundColor:
        theme.colors.background,
    },

    keyboardView: {
      flex: 1,
    },

    container: {
      flex: 1,

      paddingHorizontal: 22,

      backgroundColor:
        theme.colors.background,
    },

    backButton: {
      marginTop: 8,

      width: 44,
      height: 44,

      borderRadius: 14,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.colors.surface,

      borderWidth: 1,

      borderColor:
        theme.colors.border,
    },

    content: {
      flex: 1,

      alignItems: 'center',

      paddingTop: 55,
    },

    iconBox: {
      width: 64,
      height: 64,

      borderRadius: 20,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.colors.primarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,
    },

    title: {
      marginTop: 24,

      color:
        theme.colors.textPrimary,

      fontSize: 28,

      fontWeight: '900',

      textAlign: 'center',
    },

    subtitle: {
      marginTop: 10,

      color:
        theme.colors.textSecondary,

      fontSize: 13,

      textAlign: 'center',
    },

    phone: {
      marginTop: 5,

      color:
        theme.colors.textPrimary,

      fontSize: 14,

      fontWeight: '800',
    },

    hiddenInput: {
      position: 'absolute',

      width: 1,
      height: 1,

      opacity: 0.01,
    },

    otpRow: {
      width: '100%',

      marginTop: 38,

      flexDirection: 'row',

      justifyContent:
        'space-between',

      alignItems: 'center',
    },

    otpBox: {
      width: 47,
      height: 57,

      borderRadius: 14,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.colors.surface,

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,
    },

    otpBoxActive: {
      borderColor:
        theme.colors.primary,

      borderWidth: 2,
    },

    otpBoxFilled: {
      backgroundColor:
        theme.colors.primarySoft,

      borderColor:
        theme.colors.primary,
    },

    otpText: {
      color:
        theme.colors.textPrimary,

      fontSize: 22,

      fontWeight: '900',
    },

    hint: {
      marginTop: 12,

      color:
        theme.colors.textLight,

      fontSize: 10,

      textAlign: 'center',
    },

    verifyButton: {
      width: '100%',
      height: 58,

      marginTop: 30,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        theme.colors.primary,
    },

    verifyButtonDisabled: {
      backgroundColor:
        theme.colors.surfaceElevated,
    },

    verifyText: {
      color: '#07130B',

      fontSize: 16,

      fontWeight: '900',
    },

    verifyTextDisabled: {
      color:
        theme.colors.textLight,
    },

    buttonPressed: {
      opacity: 0.85,
    },

    resendRow: {
      marginTop: 25,

      flexDirection: 'row',

      alignItems: 'center',
    },

    resendText: {
      color:
        theme.colors.textSecondary,

      fontSize: 12,
    },

    resendButton: {
      marginLeft: 6,

      color:
        theme.colors.primary,

      fontSize: 12,

      fontWeight: '800',
    },

    demoText: {
      marginTop: 20,

      color:
        theme.colors.textLight,

      fontSize: 10,
    },
  });