import React, {
  useCallback,
  useEffect,
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
  BookOpen,
  Check,
  Mail,
  MessageSquareText,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';

import {createEnquiry} from '../../services/enquiryApi';

import {
  CourseItem,
  getCourses,
  getStudentProfile,
} from '../../services/studentApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'BookDemo'
>;

function useBookDemoTheme() {
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

export default function BookDemoScreen({
  navigation,
  route,
}: Props) {
  const {theme, styles} =
    useBookDemoTheme();

  const {accessToken} = useApp();

  const routeCourseId =
    route.params?.courseId;

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [message, setMessage] =
    useState(
      'I would like to book a demo class and know more about this course.',
    );

  const [
    selectedCourseId,
    setSelectedCourseId,
  ] = useState(
    routeCourseId || '',
  );

  const [
    courses,
    setCourses,
  ] = useState<CourseItem[]>([]);

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const loadInitialData =
    useCallback(
      async () => {
        if (!accessToken) {
          setLoadingData(false);

          setError(
            'Student session not found. Please sign in again.',
          );

          return;
        }

        try {
          setLoadingData(true);

          setError(null);

          const [
            profileResponse,
            coursesResponse,
          ] = await Promise.all([
            getStudentProfile(
              accessToken,
            ),

            getCourses(
              accessToken,
            ),
          ]);

          const student =
            profileResponse.data.student;

          setName(
            student.name || '',
          );

          setPhone(
            student.phone || '',
          );

          setEmail(
            student.email || '',
          );

          setCourses(
            coursesResponse.items ||
              [],
          );

          /*
           * Agar route se courseId
           * nahi aaya aur sirf ek
           * course available hai,
           * automatically select.
           */
          if (
            !routeCourseId &&
            coursesResponse.items
              .length === 1
          ) {
            setSelectedCourseId(
              String(
                coursesResponse
                  .items[0].id,
              ),
            );
          }
        } catch (err) {
          const messageText =
            err instanceof Error
              ? err.message
              : 'Unable to prepare demo booking.';

          setError(
            messageText,
          );
        } finally {
          setLoadingData(false);
        }
      },
      [
        accessToken,
        routeCourseId,
      ],
    );

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const selectedCourse =
    courses.find(
      item =>
        String(item.id) ===
        selectedCourseId,
    );

  const canSubmit =
    name.trim().length > 1 &&
    phone.trim().length >= 8 &&
    email.includes('@') &&
    selectedCourseId.length > 0 &&
    message.trim().length > 2 &&
    !submitting;

  const handleSubmit =
    async () => {
      if (!accessToken) {
        Alert.alert(
          'Session expired',
          'Please sign in again.',
        );

        return;
      }

      if (!name.trim()) {
        Alert.alert(
          'Name required',
          'Please enter your name.',
        );

        return;
      }

      if (
        phone.trim().length < 8
      ) {
        Alert.alert(
          'Phone required',
          'Please enter a valid phone number.',
        );

        return;
      }

      if (!email.includes('@')) {
        Alert.alert(
          'Email required',
          'Please enter a valid email address.',
        );

        return;
      }

      if (!selectedCourseId) {
        Alert.alert(
          'Select course',
          'Please select the course for your demo class.',
        );

        return;
      }

      if (!message.trim()) {
        Alert.alert(
          'Message required',
          'Please enter a short message.',
        );

        return;
      }

      try {
        setSubmitting(true);

        const response =
          await createEnquiry(
            accessToken,
            {
              name:
                name.trim(),

              phone:
                phone.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              course_id:
                selectedCourseId,

              message:
                message.trim(),
            },
          );

        Alert.alert(
          'Demo request submitted',
          response.message ||
            'Your enquiry has been submitted successfully. The academy will contact you soon.',
          [
            {
              text: 'Done',

              onPress: () =>
                navigation.goBack(),
            },
          ],
        );
      } catch (err) {
        const messageText =
          err instanceof Error
            ? err.message
            : 'Unable to submit your demo request.';

        Alert.alert(
          'Submission failed',
          messageText,
        );
      } finally {
        setSubmitting(false);
      }
    };

  if (loadingData) {
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

        <View
          style={
            styles.centerState
          }>

          <ActivityIndicator
            size="large"
            color={
              theme.colors.primary
            }
          />

          <Text
            style={
              styles.loadingText
            }>
            Preparing demo booking...
          </Text>

        </View>
      </SafeAreaView>
    );
  }

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

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.scrollContent
          }>

          {/* TOP BAR */}

          <View
            style={styles.topBar}>

            <Pressable
              onPress={() =>
                navigation.goBack()
              }
              disabled={submitting}
              style={({pressed}) => [
                styles.backButton,
                pressed &&
                  !submitting &&
                  styles.buttonPressed,
              ]}>

              <ArrowLeft
                size={22}
                color={
                  theme.colors
                    .textPrimary
                }
              />

            </Pressable>

            <Text
              style={
                styles.topTitle
              }>
              Book Demo
            </Text>

            <View
              style={styles.topSpacer}
            />

          </View>

          {/* PREMIUM HEADING */}

          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <BookOpen
                  size={27}
                  color={
                    theme.colors.primary
                  }
                  strokeWidth={2.2}
                />
              </View>

              <Image
                source={require('../../assets/seekho-login-logo-transparent.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View style={styles.eyebrowRow}>
              <Sparkles
                size={13}
                color={
                  theme.colors.secondary
                }
                strokeWidth={2.3}
              />

              <Text style={styles.eyebrow}>
                PERSONAL GUIDANCE
              </Text>
            </View>

            <Text style={styles.title}>
              Book a Demo Class
            </Text>

            <Text style={styles.subtitle}>
              Submit your details and the
              academy team will contact you
              regarding the selected course.
            </Text>

            <View style={styles.trustRow}>
              <ShieldCheck
                size={15}
                color={
                  theme.colors.secondary
                }
                strokeWidth={2.2}
              />

              <Text style={styles.trustText}>
                Your request goes directly to
                the academy enquiry system.
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

          {!!error && (
            <View
              style={
                styles.errorCard
              }>

              <Text
                style={
                  styles.errorText
                }>
                {error}
              </Text>

              <Pressable
                onPress={
                  loadInitialData
                }>

                <Text
                  style={
                    styles.retryText
                  }>
                  Retry
                </Text>

              </Pressable>

            </View>
          )}

          {/* COURSE */}

          <Text
            style={
              styles.sectionTitle
            }>
            SELECT COURSE
          </Text>

          {courses.length === 0 ? (
            <View
              style={
                styles.emptyCourse
              }>

              <Text
                style={
                  styles.emptyText
                }>
                No course is available
                for demo booking right
                now.
              </Text>

            </View>
          ) : (
            <View
              style={
                styles.courseList
              }>

              {courses.map(
                course => {
                  const id =
                    String(
                      course.id,
                    );

                  const selected =
                    selectedCourseId ===
                    id;

                  return (
                    <Pressable
                      key={id}
                      disabled={
                        submitting
                      }
                      onPress={() =>
                        setSelectedCourseId(
                          id,
                        )
                      }
                      style={[
                        styles.courseItem,

                        selected &&
                          styles
                            .courseItemSelected,
                      ]}>

                      <View
                        style={
                          styles.courseLeft
                        }>

                        <View
                          style={[
                            styles
                              .courseRadio,

                            selected &&
                              styles
                                .courseRadioSelected,
                          ]}>

                          {selected && (
                            <Check
                              size={14}
                              color={theme.colors.black}
                              strokeWidth={
                                3
                              }
                            />
                          )}

                        </View>

                        <View
                          style={
                            styles
                              .courseTextArea
                          }>

                          <Text
                            style={
                              styles
                                .courseTitle
                            }>
                            {course.title ||
                              'Course'}
                          </Text>

                          {!!course
                            .short_description && (
                            <Text
                              numberOfLines={
                                2
                              }
                              style={
                                styles
                                  .courseDescription
                              }>
                              {
                                course.short_description
                              }
                            </Text>
                          )}

                        </View>

                      </View>

                    </Pressable>
                  );
                },
              )}

            </View>
          )}

          {!!selectedCourse && (
            <Text
              style={
                styles.selectedText
              }>
              Selected:{' '}
              {selectedCourse.title}
            </Text>
          )}

          {/* CONTACT DETAILS */}

          <Text
            style={
              styles.sectionTitle
            }>
            YOUR DETAILS
          </Text>

          <Text
            style={styles.label}>
            Name
          </Text>

          <View
            style={styles.inputBox}>

            <UserRound
              size={19}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <TextInput
              value={name}
              onChangeText={
                setName
              }
              editable={
                !submitting
              }
              placeholder="Your name"
              placeholderTextColor={
                theme.colors.textLight
              }
              style={styles.input}
              selectionColor={
                theme.colors.primary
              }
            />

          </View>

          <Text
            style={styles.labelGap}>
            Phone
          </Text>

          <View
            style={styles.inputBox}>

            <Phone
              size={19}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <TextInput
              value={phone}
              onChangeText={
                setPhone
              }
              editable={
                !submitting
              }
              placeholder="Phone number"
              placeholderTextColor={
                theme.colors.textLight
              }
              keyboardType="phone-pad"
              style={styles.input}
              selectionColor={
                theme.colors.primary
              }
            />

          </View>

          <Text
            style={styles.labelGap}>
            Email
          </Text>

          <View
            style={styles.inputBox}>

            <Mail
              size={19}
              color={
                theme.colors
                  .textSecondary
              }
            />

            <TextInput
              value={email}
              onChangeText={
                setEmail
              }
              editable={
                !submitting
              }
              placeholder="Email address"
              placeholderTextColor={
                theme.colors.textLight
              }
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              selectionColor={
                theme.colors.primary
              }
            />

          </View>

          <Text
            style={styles.labelGap}>
            Message
          </Text>

          <View
            style={
              styles.messageBox
            }>

            <MessageSquareText
              size={19}
              color={
                theme.colors
                  .textSecondary
              }
              style={
                styles.messageIcon
              }
            />

            <TextInput
              value={message}
              onChangeText={
                setMessage
              }
              editable={
                !submitting
              }
              placeholder="Tell us what you want to know"
              placeholderTextColor={
                theme.colors.textLight
              }
              multiline
              textAlignVertical="top"
              style={
                styles.messageInput
              }
              selectionColor={
                theme.colors.primary
              }
            />

          </View>

          {/* SUBMIT */}

          <Pressable
            disabled={
              !canSubmit
            }
            onPress={
              handleSubmit
            }
            style={({pressed}) => [
              styles.submitButton,

              !canSubmit &&
                styles
                  .submitButtonDisabled,

              pressed &&
                canSubmit &&
                styles
                  .buttonPressed,
            ]}>

            {submitting ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.black}
              />
            ) : (
              <>
                <Text
                  style={[
                    styles
                      .submitButtonText,

                    !canSubmit &&
                      styles
                        .submitButtonTextDisabled,
                  ]}>
                  Submit Demo Request
                </Text>

                <ArrowRight
                  size={19}
                  color={
                    canSubmit
                      ? theme.colors.black
                      : theme.colors
                          .textLight
                  }
                  strokeWidth={2.4}
                />
              </>
            )}

          </Pressable>

          <Text
            style={styles.note}>
            Submitting this form creates
            an enquiry for the selected
            course. It does not change
            your student profile.
          </Text>

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
      paddingHorizontal: 18,

      paddingTop: 14,

      paddingBottom: 40,
    },

    topBar: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius: 14,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        theme.colors.borderStrong,

      backgroundColor:
        theme.colors.surfaceSoft,
    },

    topTitle: {
      color:
        theme.colors.textPrimary,

      fontSize: 15,

      fontWeight: '900',
    },

    topSpacer: {
      width: 44,
    },

    hero: {
      overflow: 'hidden',
      marginTop: 22,
      padding: 18,
      borderRadius: 23,
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
        theme.dark ? 0.22 : 0.10,
      shadowRadius: 18,
      elevation: 4,
    },

    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    heroIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent:
        'center',
      backgroundColor:
        theme.colors.primarySoft,
    },

    logo: {
      width: 92,
      height: 38,
    },

    eyebrowRow: {
      marginTop: 17,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    eyebrow: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.2,
    },

    trustRow: {
      marginTop: 14,
      padding: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 13,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    trustText: {
      flex: 1,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 14,
      fontWeight: '700',
    },

    heroAccentRow: {
      height: 4,
      marginTop: 16,
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

    title: {
      marginTop: 17,

      color:
        theme.colors.textPrimary,

      fontSize: 27,

      fontWeight: '900',

      letterSpacing: -0.6,
    },

    subtitle: {
      marginTop: 8,

      maxWidth: 330,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      lineHeight: 18,
    },

    errorCard: {
      marginTop: 18,

      padding: 14,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      gap: 10,

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        theme.dark
          ? 'rgba(255,116,116,0.28)'
          : 'rgba(226,85,85,0.22)',

      backgroundColor:
        theme.dark
          ? 'rgba(255,116,116,0.08)'
          : '#FFF3F3',
    },

    errorText: {
      flex: 1,

      color: theme.colors.danger,

      fontSize: 10,

      lineHeight: 16,
    },

    retryText: {
      color:
        theme.colors.primary,

      fontSize: 10,

      fontWeight: '900',
    },

    sectionTitle: {
      marginTop: 27,

      marginBottom: 10,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '900',

      letterSpacing: 1.1,
    },

    courseList: {
      gap: 9,
    },

    courseItem: {
      padding: 14,

      borderRadius: 16,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    courseItemSelected: {
      borderColor:
        theme.colors.secondary,

      backgroundColor:
        theme.colors.secondarySoft,
    },

    courseLeft: {
      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,
    },

    courseRadio: {
      width: 25,

      height: 25,

      borderRadius: 8,

      alignItems: 'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    courseRadioSelected: {
      borderColor:
        theme.colors.secondary,

      backgroundColor:
        theme.colors.secondary,
    },

    courseTextArea: {
      flex: 1,
    },

    courseTitle: {
      color:
        theme.colors.textPrimary,

      fontSize: 12,

      fontWeight: '900',
    },

    courseDescription: {
      marginTop: 4,

      color:
        theme.colors
          .textSecondary,

      fontSize: 9,

      lineHeight: 15,
    },

    selectedText: {
      marginTop: 10,

      color:
        theme.colors.secondaryStrong,

      fontSize: 10,

      fontWeight: '800',
    },

    emptyCourse: {
      padding: 20,

      borderRadius: 15,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      backgroundColor:
        theme.colors.surface,
    },

    emptyText: {
      color:
        theme.colors
          .textSecondary,

      fontSize: 10,

      lineHeight: 16,

      textAlign: 'center',
    },

    label: {
      marginBottom: 9,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '700',
    },

    labelGap: {
      marginTop: 17,

      marginBottom: 9,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '700',
    },

    inputBox: {
      height: 58,

      flexDirection: 'row',

      alignItems: 'center',

      gap: 11,

      paddingHorizontal: 15,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius: 16,

      backgroundColor:
        theme.colors.surface,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity:
        theme.dark ? 0.10 : 0.04,
      shadowRadius: 6,
      elevation: 1,
    },

    input: {
      flex: 1,

      paddingVertical: 0,

      color:
        theme.colors.textPrimary,

      fontSize: 13,

      fontWeight: '600',
    },

    messageBox: {
      minHeight: 125,

      flexDirection: 'row',

      alignItems:
        'flex-start',

      gap: 11,

      paddingHorizontal: 15,

      paddingTop: 16,

      borderWidth: 1,

      borderColor:
        theme.colors
          .borderStrong,

      borderRadius: 16,

      backgroundColor:
        theme.colors.surface,
    },

    messageIcon: {
      marginTop: 2,
    },

    messageInput: {
      flex: 1,

      minHeight: 100,

      padding: 0,

      color:
        theme.colors.textPrimary,

      fontSize: 13,

      lineHeight: 19,

      fontWeight: '500',
    },

    submitButton: {
      height: 58,
      marginTop: 27,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      borderRadius: 17,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity:
        theme.dark ? 0.20 : 0.10,
      shadowRadius: 12,
      elevation: 3,
    },

    submitButtonDisabled: {
      backgroundColor:
        theme.colors
          .surfaceElevated,
    },

    submitButtonText: {
      color: theme.colors.black,

      fontSize: 13,

      fontWeight: '900',
    },

    submitButtonTextDisabled: {
      color:
        theme.colors.textLight,
    },

    buttonPressed: {
      opacity: 0.78,
    },

    note: {
      marginTop: 15,

      paddingHorizontal: 12,

      color:
        theme.colors.textLight,

      fontSize: 9,

      lineHeight: 15,

      textAlign: 'center',
    },

    centerState: {
      flex: 1,

      alignItems: 'center',

      justifyContent:
        'center',
    },

    loadingText: {
      marginTop: 14,

      color:
        theme.colors
          .textSecondary,

      fontSize: 11,

      fontWeight: '600',
    },
  });