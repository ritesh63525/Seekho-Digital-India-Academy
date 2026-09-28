import React, {useMemo} from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  BookOpen,
  Briefcase,
  GraduationCap,
  Home,
  UserRound,
} from 'lucide-react-native';

import {MainTabParamList} from './navigationTypes';

import {
  useTheme,
} from '../theme/ThemeContext';

import type {
  AppTheme,
} from '../theme/brandThemes';

import HomeScreen from '../screens/home/HomeScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import LearningScreen from '../screens/learning/LearningScreen';
import PlacementScreen from '../screens/placement/PlacementScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab =
  createBottomTabNavigator<MainTabParamList>();

type IconProps = {
  focused: boolean;
  type:
    | 'home'
    | 'courses'
    | 'learning'
    | 'placement'
    | 'profile';
};

function BottomIcon({
  focused,
  type,
}: IconProps) {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  const color = focused
    ? theme.colors.primary
    : theme.colors.iconMuted;

  const size = 20;

  let Icon = Home;

  switch (type) {
    case 'home':
      Icon = Home;
      break;

    case 'courses':
      Icon = BookOpen;
      break;

    case 'learning':
      Icon = GraduationCap;
      break;

    case 'placement':
      Icon = Briefcase;
      break;

    case 'profile':
      Icon = UserRound;
      break;
  }

  return (
    <View
      style={[
        styles.iconContainer,
        focused &&
          styles.iconContainerActive,
      ]}>
      <Icon
        size={size}
        color={color}
        strokeWidth={
          focused ? 2.6 : 2
        }
      />

      {focused && (
        <View
          style={
            styles.activeIndicator
          }
        />
      )}
    </View>
  );
}

export default function MainTabNavigator() {
  const {theme} = useTheme();

  const styles = useMemo(
    () => createStyles(theme),
    [theme],
  );

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,

        tabBarHideOnKeyboard: true,

        tabBarActiveTintColor:
          theme.colors.primary,

        tabBarInactiveTintColor:
          theme.colors.iconMuted,

        tabBarStyle:
          styles.tabBar,

        tabBarItemStyle:
          styles.tabItem,

        tabBarLabelStyle:
          styles.tabLabel,
      }}>

      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',

          tabBarIcon: ({
            focused,
          }) => (
            <BottomIcon
              type="home"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Courses"
        component={CoursesScreen}
        options={{
          tabBarLabel: 'Courses',

          tabBarIcon: ({
            focused,
          }) => (
            <BottomIcon
              type="courses"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Learning"
        component={LearningScreen}
        options={{
          tabBarLabel: 'Learning',

          tabBarIcon: ({
            focused,
          }) => (
            <BottomIcon
              type="learning"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Placement"
        component={PlacementScreen}
        options={{
          tabBarLabel: 'Placement',

          tabBarIcon: ({
            focused,
          }) => (
            <BottomIcon
              type="placement"
              focused={focused}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',

          tabBarIcon: ({
            focused,
          }) => (
            <BottomIcon
              type="profile"
              focused={focused}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    tabBar: {
      height: 76,

      paddingTop: 8,
      paddingBottom: 8,

      backgroundColor:
        theme.colors.surface,

      borderTopWidth: 1,

      borderTopColor:
        theme.colors
          .borderStrong,

      elevation: 18,

      shadowColor:
        theme.colors.shadow,

      shadowOffset: {
        width: 0,
        height: -5,
      },

      shadowOpacity:
        theme.dark
          ? 0.34
          : 0.10,

      shadowRadius: 14,
    },

    tabItem: {
      paddingTop: 1,

      paddingHorizontal: 2,
    },

    tabLabel: {
      fontSize: 9,

      lineHeight: 12,

      fontWeight: '900',

      letterSpacing: 0.15,

      marginTop: 3,
    },

    iconContainer: {
      width: 38,
      height: 34,

      borderRadius: 12,

      alignItems: 'center',
      justifyContent: 'center',

      position: 'relative',

      backgroundColor:
        'transparent',
    },

    iconContainerActive: {
      backgroundColor:
        theme.colors.primarySoft,

      borderWidth: 1,

      borderColor:
        theme.colors.primary,

      shadowColor:
        theme.colors.shadow,

      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.05,

      shadowRadius: 7,

      shadowOffset: {
        width: 0,
        height: 3,
      },

      elevation: 2,
    },

    activeIndicator: {
      position: 'absolute',

      bottom: -5,

      width: 14,
      height: 3,

      borderRadius: 999,

      backgroundColor:
        theme.colors.primary,
    },
  });
