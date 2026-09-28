import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  FileQuestion,
  FileUser,
  GraduationCap,
  HelpCircle,
  Megaphone,
  Settings,
  UserRound,
} from 'lucide-react-native';

import {theme} from '../theme/theme';

export type FeatureIconName =
  | 'course'
  | 'assignment'
  | 'attendance'
  | 'quiz'
  | 'schedule'
  | 'placement'
  | 'certificate'
  | 'resume'
  | 'notification'
  | 'settings'
  | 'learning'
  | 'support'
  | 'announcement'
  | 'profile';

type Props = {
  name: FeatureIconName;
  size?: number;
  containerSize?: number;
};

export default function FeatureIcon({
  name,
  size = 19,
  containerSize = 42,
}: Props) {
  let Icon = BookOpen;

  let color: string =
    theme.colors.course;

  let backgroundColor: string =
    theme.colors.courseSoft;

  switch (name) {
    case 'course':
      Icon = BookOpen;
      color = theme.colors.course;
      backgroundColor =
        theme.colors.courseSoft;
      break;

    case 'assignment':
      Icon = ClipboardCheck;
      color = theme.colors.assignment;
      backgroundColor =
        theme.colors.assignmentSoft;
      break;

    case 'attendance':
      Icon = CalendarCheck;
      color = theme.colors.attendance;
      backgroundColor =
        theme.colors.attendanceSoft;
      break;

    case 'quiz':
      Icon = FileQuestion;
      color = theme.colors.quiz;
      backgroundColor =
        theme.colors.quizSoft;
      break;

    case 'schedule':
      Icon = CalendarClock;
      color = theme.colors.schedule;
      backgroundColor =
        theme.colors.scheduleSoft;
      break;

    case 'placement':
      Icon = Briefcase;
      color = theme.colors.placement;
      backgroundColor =
        theme.colors.placementSoft;
      break;

    case 'certificate':
      Icon = Award;
      color = theme.colors.amber;
      backgroundColor =
        theme.colors.amberSoft;
      break;

    case 'resume':
      Icon = FileUser;
      color = theme.colors.blue;
      backgroundColor =
        theme.colors.blueSoft;
      break;

    case 'notification':
      Icon = Bell;
      color = theme.colors.textSecondary;
      backgroundColor =
        theme.colors.surfaceElevated;
      break;

    case 'settings':
      Icon = Settings;
      color = theme.colors.textSecondary;
      backgroundColor =
        theme.colors.surfaceElevated;
      break;

    case 'learning':
      Icon = GraduationCap;
      color = theme.colors.quiz;
      backgroundColor =
        theme.colors.quizSoft;
      break;

    case 'support':
      Icon = HelpCircle;
      color = theme.colors.blue;
      backgroundColor =
        theme.colors.blueSoft;
      break;

    case 'announcement':
      Icon = Megaphone;
      color = theme.colors.amber;
      backgroundColor =
        theme.colors.amberSoft;
      break;

    case 'profile':
      Icon = UserRound;
      color = theme.colors.purple;
      backgroundColor =
        theme.colors.purpleSoft;
      break;
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius:
            Math.round(
              containerSize * 0.3,
            ),
          backgroundColor,
        },
      ]}>
      <Icon
        size={size}
        color={color}
        strokeWidth={2.2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor:
      theme.colors.border,
  },
});