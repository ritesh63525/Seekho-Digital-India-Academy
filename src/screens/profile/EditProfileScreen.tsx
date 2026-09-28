import React, {
  useMemo,
  useState,
} from 'react';

import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-react-native';

import {
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import PrimaryButton from '../../components/PrimaryButton';
import ScreenHeader from '../../components/ScreenHeader';

import {
  RootStackParamList,
} from '../../navigation/navigationTypes';

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
    'EditProfile'
  >;

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (
    value: string,
  ) => void;
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'email-address';
  multiline?: boolean;
  icon:
    React.ReactNode;
};

function useEditProfileTheme() {
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

export default function EditProfileScreen({
  navigation,
}: Props) {
  const {
    theme,
    styles,
  } = useEditProfileTheme();

  const {
    profile,
    updateProfile,
  } = useApp();

  const [
    form,
    setForm,
  ] = useState({
    ...profile,
    skills:
      profile.skills.join(', '),
  });

  const set = (
    key: string,
    value: string,
  ) =>
    setForm(prev => ({
      ...prev,
      [key]: value,
    }));

  const save = () => {
    updateProfile({
      name: form.name,
      phone: form.phone,
      email: form.email,
      city: form.city,
      education:
        form.education,
      college: form.college,
      graduationYear:
        form.graduationYear,
      skills: form.skills
        .split(',')
        .map(item =>
          item.trim(),
        )
        .filter(Boolean),
    });

    Alert.alert(
      'Profile updated',
      'Changes are saved for this app session.',
      [
        {
          text: 'Done',
          onPress: () =>
            navigation.goBack(),
        },
      ],
    );
  };

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
        title="Edit profile"
        subtitle="Keep your career profile current"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }>

        <ScrollView
          contentContainerStyle={
            styles.scroll
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }>

          <View style={styles.intro}>
            <View style={styles.introTop}>
              <View
                style={
                  styles.introIcon
                }>
                <Sparkles
                  size={22}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.3}
                />
              </View>

              <View style={styles.introTextArea}>
                <Text
                  style={
                    styles.introEyebrow
                  }>
                  LEARNER PROFILE
                </Text>

                <Text
                  style={
                    styles.introTitle
                  }>
                  Your learner profile
                </Text>
              </View>
            </View>

            <Text
              style={
                styles.introText
              }>
              This information powers your
              student experience and can later
              be used for placement profile
              matching.
            </Text>

            <View
              style={
                styles.introAccentRow
              }>
              <View
                style={
                  styles.introAccentOrange
                }
              />

              <View
                style={
                  styles.introAccentGreen
                }
              />
            </View>
          </View>

          <View style={styles.card}>
            <Field
              label="Full name"
              value={form.name}
              onChangeText={value =>
                set(
                  'name',
                  value,
                )
              }
              icon={
                <UserRound
                  size={18}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="Mobile"
              value={form.phone}
              onChangeText={value =>
                set(
                  'phone',
                  value
                    .replace(
                      /[^0-9]/g,
                      '',
                    )
                    .slice(0, 10),
                )
              }
              keyboardType="number-pad"
              icon={
                <Phone
                  size={18}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="Email"
              value={form.email}
              onChangeText={value =>
                set(
                  'email',
                  value,
                )
              }
              keyboardType="email-address"
              icon={
                <Mail
                  size={18}
                  color={
                    theme.colors.info
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="City"
              value={form.city}
              onChangeText={value =>
                set(
                  'city',
                  value,
                )
              }
              icon={
                <MapPin
                  size={18}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="Education"
              value={form.education}
              onChangeText={value =>
                set(
                  'education',
                  value,
                )
              }
              icon={
                <GraduationCap
                  size={18}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="College / University"
              value={form.college}
              onChangeText={value =>
                set(
                  'college',
                  value,
                )
              }
              icon={
                <Building2
                  size={18}
                  color={
                    theme.colors.secondary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="Graduation year"
              value={
                form.graduationYear
              }
              onChangeText={value =>
                set(
                  'graduationYear',
                  value,
                )
              }
              keyboardType="number-pad"
              icon={
                <CalendarDays
                  size={18}
                  color={
                    theme.colors.info
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <Field
              label="Skills (comma separated)"
              value={form.skills}
              onChangeText={value =>
                set(
                  'skills',
                  value,
                )
              }
              multiline
              icon={
                <Wrench
                  size={18}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              }
            />

            <View
              style={
                styles.saveButtonWrap
              }>
              <PrimaryButton
                title="Save profile"
                onPress={save}
              />
            </View>
          </View>

          <Text style={styles.sessionNote}>
            Changes on this screen are stored
            only in the current app session.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
  icon,
}: FieldProps) {
  const {
    theme,
    styles,
  } = useEditProfileTheme();

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View
        style={[
          styles.inputShell,
          multiline &&
            styles.inputShellMultiline,
        ]}>

        <View
          style={
            styles.fieldIcon
          }>
          {icon}
        </View>

        <TextInput
          value={value}
          onChangeText={
            onChangeText
          }
          keyboardType={
            keyboardType ||
            'default'
          }
          multiline={multiline}
          style={[
            styles.input,
            multiline &&
              styles.multiline,
          ]}
          placeholderTextColor={
            theme.colors.textLight
          }
          selectionColor={
            theme.colors.primary
          }
          autoCapitalize={
            keyboardType ===
            'email-address'
              ? 'none'
              : 'sentences'
          }
          autoCorrect={
            keyboardType !==
            'email-address'
          }
        />
      </View>
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

    flex: {
      flex: 1,
    },

    scroll: {
      padding: 18,
      paddingBottom: 36,
    },

    intro: {
      overflow: 'hidden',
      marginBottom: 15,
      padding: 17,
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
        theme.dark
          ? 0.20
          : 0.08,
      shadowRadius: 16,
      elevation: 3,
    },

    introTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    introIcon: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 14,
      backgroundColor:
        theme.colors.primarySoft,
    },

    introTextArea: {
      flex: 1,
    },

    introEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.15,
    },

    introTitle: {
      marginTop: 4,
      fontSize: 20,
      color:
        theme.colors.textPrimary,
      fontWeight: '900',
    },

    introText: {
      marginTop: 11,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      fontWeight: '600',
    },

    introAccentRow: {
      height: 4,
      marginTop: 15,
      flexDirection: 'row',
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
    },

    introAccentOrange: {
      flex: 1.25,
      backgroundColor:
        theme.colors.primary,
    },

    introAccentGreen: {
      flex: 1,
      backgroundColor:
        theme.colors.secondary,
    },

    card: {
      padding: 17,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    field: {
      marginBottom: 14,
    },

    label: {
      marginBottom: 7,
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      fontWeight: '900',
    },

    inputShell: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    inputShellMultiline: {
      minHeight: 94,
      alignItems: 'flex-start',
    },

    fieldIcon: {
      width: 43,
      minHeight: 50,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    input: {
      flex: 1,
      minHeight: 50,
      paddingRight: 12,
      paddingVertical: 0,
      color:
        theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '700',
    },

    multiline: {
      minHeight: 90,
      paddingTop: 14,
      paddingBottom: 12,
      textAlignVertical: 'top',
    },

    saveButtonWrap: {
      marginTop: 4,
    },

    sessionNote: {
      marginTop: 13,
      paddingHorizontal: 10,
      color:
        theme.colors.textLight,
      fontSize: 9,
      lineHeight: 14,
      textAlign: 'center',
    },
  });
