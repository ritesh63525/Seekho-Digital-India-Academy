import React, {
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import {RootStackParamList} from './navigationTypes';

import SplashScreen from '../screens/splash/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';

import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ForgotOtpScreen from '../screens/auth/ForgotOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

import MainTabNavigator from './MainTabNavigator';

import NotificationsScreen from '../screens/misc/NotificationsScreen';

import CourseDetailsScreen from '../screens/courses/CourseDetailsScreen';
import BookDemoScreen from '../screens/courses/BookDemoScreen';
import CourseLearningScreen from '../screens/learning/CourseLearningScreen';

import LessonScreen from '../screens/learning/LessonScreen';
import QuizScreen from '../screens/learning/QuizScreen';
import QuizResultScreen from '../screens/learning/QuizResultScreen';

import AssignmentsScreen from '../screens/learning/AssignmentsScreen';
import AssignmentDetailsScreen from '../screens/learning/AssignmentDetailsScreen';

import LiveClassesScreen from '../screens/learning/LiveClassesScreen';
import AttendanceScreen from '../screens/learning/AttendanceScreen';
import CertificatesScreen from '../screens/learning/CertificatesScreen';

import JobDetailsScreen from '../screens/placement/JobDetailsScreen';
import ApplicationsScreen from '../screens/placement/ApplicationsScreen';
import CareerToolsScreen from '../screens/placement/CareerToolsScreen';

import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

import SupportScreen from '../screens/misc/SupportScreen';
import AboutScreen from '../screens/misc/AboutScreen';
import CareerRoadmapScreen from '../screens/misc/CareerRoadmapScreen';
import LegalScreen from '../screens/misc/LegalScreen';

const Stack =
  createNativeStackNavigator<RootStackParamList>();

/*
 * Permanent per-install flag.
 *
 * It is NOT cleared on logout.
 * Therefore onboarding appears only once unless the
 * user clears app data or uninstalls the app.
 */
const ONBOARDING_STORAGE_KEY =
  '@seekho/onboarding_seen_v1';

type LoginEntryProps =
  NativeStackScreenProps<
    RootStackParamList,
    'Login'
  >;

function LoginEntry(
  props: LoginEntryProps,
) {
  const [
    onboardingReady,
    setOnboardingReady,
  ] = useState(false);

  const [
    showOnboarding,
    setShowOnboarding,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    const loadOnboardingState =
      async () => {
        try {
          const value =
            await AsyncStorage.getItem(
              ONBOARDING_STORAGE_KEY,
            );

          if (!active) {
            return;
          }

          setShowOnboarding(
            value !== '1',
          );
        } catch {
          /*
           * If storage cannot be read on a genuine first
           * run, showing onboarding is safer than silently
           * skipping it.
           */
          if (active) {
            setShowOnboarding(
              true,
            );
          }
        } finally {
          if (active) {
            setOnboardingReady(
              true,
            );
          }
        }
      };

    void loadOnboardingState();

    return () => {
      active = false;
    };
  }, []);

  const handleOnboardingFinish =
    () => {
      /*
       * Persist first, but do not block the UI while
       * storage completes.
       */
      void AsyncStorage.setItem(
        ONBOARDING_STORAGE_KEY,
        '1',
      );

      setShowOnboarding(
        false,
      );
    };

  if (!onboardingReady) {
    return (
      <View
        style={
          styles.entryLoader
        }>
        <ActivityIndicator
          size="small"
          color="#39D895"
        />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onFinish={
          handleOnboardingFinish
        }
      />
    );
  }

  return (
    <LoginScreen
      {...props}
    />
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}>

      {/* Splash */}

      <Stack.Screen
        name="Splash"
        component={SplashScreen}
      />

      {/* Authentication */}

      <Stack.Screen
        name="Login"
        component={LoginEntry}
      />

      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
      />

      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
      />

      <Stack.Screen
        name="ForgotOtp"
        component={ForgotOtpScreen}
      />

      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
      />

      {/* Main App */}

      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
      />

      {/* Notifications */}

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
      />

      {/* Courses */}

      <Stack.Screen
        name="CourseDetails"
        component={CourseDetailsScreen}
      />

      <Stack.Screen
        name="BookDemo"
        component={BookDemoScreen}
      />

      <Stack.Screen
        name="CourseLearning"
        component={CourseLearningScreen}
      />

      {/* Learning */}

      <Stack.Screen
        name="Lesson"
        component={LessonScreen}
      />

      <Stack.Screen
        name="Quiz"
        component={QuizScreen}
      />

      <Stack.Screen
        name="QuizResult"
        component={QuizResultScreen}
      />

      <Stack.Screen
        name="Assignments"
        component={AssignmentsScreen}
      />

      <Stack.Screen
        name="AssignmentDetails"
        component={AssignmentDetailsScreen}
      />

      <Stack.Screen
        name="LiveClasses"
        component={LiveClassesScreen}
      />

      <Stack.Screen
        name="Attendance"
        component={AttendanceScreen}
      />

      <Stack.Screen
        name="Certificates"
        component={CertificatesScreen}
      />

      {/* Placement */}

      <Stack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
      />

      <Stack.Screen
        name="Applications"
        component={ApplicationsScreen}
      />

      <Stack.Screen
        name="CareerTools"
        component={CareerToolsScreen}
      />

      {/* Profile */}

      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />

      <Stack.Screen
        name="Support"
        component={SupportScreen}
      />

      <Stack.Screen
        name="About"
        component={AboutScreen}
      />

      <Stack.Screen
        name="CareerRoadmap"
        component={CareerRoadmapScreen}
      />

      <Stack.Screen
        name="Legal"
        component={LegalScreen}
      />

    </Stack.Navigator>
  );
}

const styles =
  StyleSheet.create({
    entryLoader: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#030404',
    },
  });
