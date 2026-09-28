import React, {useMemo, useState} from 'react';

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
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
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  Database,
  FileText,
  Info,
  NotebookPen,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react-native';

import {RootStackParamList} from '../../navigation/navigationTypes';
import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Lesson'
>;

function useLessonTheme() {
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

const LessonScreen = ({
  navigation,
  route,
}: Props) => {
  const {theme, styles} = useLessonTheme();

  const {
    markLessonComplete,
    completedLessonIds,
  } = useApp();

  const [notes, setNotes] = useState('');
  const [playing, setPlaying] = useState(false);

  const {
    lessonId,
    title,
    type,
    duration,
  } = route.params;

  const done =
    completedLessonIds.includes(lessonId);

  const complete = () => {
    markLessonComplete(lessonId);

    Alert.alert(
      'Lesson completed',
      'Nice work. Your progress is updated for this app session.',
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      {/* HEADER */}

      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({pressed}) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}>
          <ArrowLeft
            size={20}
            color={theme.colors.primary}
            strokeWidth={2.4}
          />
        </Pressable>

        <View style={styles.headerContent}>
          <View style={styles.headerEyebrowRow}>
            <Sparkles
              size={12}
              color={theme.colors.primary}
              strokeWidth={2.3}
            />

            <Text style={styles.headerEyebrow}>
              LEARNING
            </Text>
          </View>

          <Text style={styles.headerTitle}>
            Lesson
          </Text>

          <Text style={styles.headerSubtitle}>
            {type}
          </Text>
        </View>

        <Image
          source={require('../../assets/seekho-login-logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* VIDEO / PREVIEW */}

        <View style={styles.videoCard}>
          <View style={styles.videoTop}>
            <View style={styles.videoTopText}>
              <Text style={styles.videoLabel}>
                LEARNING VIDEO
              </Text>

              <Text style={styles.videoType}>
                {type}
              </Text>
            </View>

            <View style={styles.durationBadge}>
              <Clock3
                size={13}
                color={theme.colors.secondary}
                strokeWidth={2.2}
              />

              <Text style={styles.duration}>
                {duration}
              </Text>
            </View>
          </View>

          <View style={styles.playerArea}>
            <View style={styles.playerGlow} />

            <Pressable
              onPress={() =>
                setPlaying(previous => !previous)
              }
              style={({pressed}) => [
                styles.playButton,
                playing && styles.pauseButton,
                pressed && styles.pressed,
              ]}>
              {playing ? (
                <Pause
                  size={27}
                  color={theme.colors.black}
                  fill={theme.colors.black}
                  strokeWidth={2.2}
                />
              ) : (
                <Play
                  size={27}
                  color={theme.colors.black}
                  fill={theme.colors.black}
                  strokeWidth={2.2}
                />
              )}
            </Pressable>

            <Text style={styles.videoHint}>
              {playing
                ? 'Demo playback active'
                : 'Tap to preview lesson player'}
            </Text>
          </View>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: playing
                    ? '46%'
                    : '18%',
                },
              ]}
            />
          </View>

          <View style={styles.videoFooter}>
            <Text style={styles.videoFooterText}>
              Lesson preview
            </Text>

            <Text style={styles.videoFooterText}>
              {playing ? 'Playing' : 'Paused'}
            </Text>
          </View>
        </View>

        {/* LESSON INFO */}

        <View style={styles.lessonInfo}>
          <View style={styles.lessonInfoTop}>
            <View style={styles.courseBadge}>
              <BookOpenCheck
                size={13}
                color={theme.colors.secondary}
                strokeWidth={2.2}
              />

              <Text style={styles.courseBadgeText}>
                DATA ANALYTICS
              </Text>
            </View>

            <Text style={styles.meta}>
              {type}
            </Text>
          </View>

          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.body}>
            In this lesson, you will learn the
            concept through a practical workflow,
            understand when to use it, and apply it
            to an industry-style example.
          </Text>
        </View>

        {/* OBJECTIVES */}

        <View style={styles.objectivesCard}>
          <View style={styles.objectiveHeader}>
            <View style={styles.objectiveIcon}>
              <CircleCheckBig
                size={21}
                color={theme.colors.secondary}
                strokeWidth={2.2}
              />
            </View>

            <View style={styles.objectiveHeaderText}>
              <Text style={styles.objectiveTitle}>
                Learning objectives
              </Text>

              <Text style={styles.objectiveSubtitle}>
                What you will learn in this lesson
              </Text>
            </View>
          </View>

          {[
            'Understand the core concept and terminology',
            'Follow a practical implementation workflow',
            'Recognize common mistakes and evaluation steps',
            'Apply the lesson in a portfolio project',
          ].map(item => (
            <View
              key={item}
              style={styles.objectiveRow}>
              <View style={styles.objectiveBullet}>
                <CheckCircle2
                  size={14}
                  color={theme.colors.secondary}
                  strokeWidth={2.2}
                />
              </View>

              <Text style={styles.objectiveText}>
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* RESOURCES */}

        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionEyebrow}>
              MATERIALS
            </Text>

            <Text style={styles.sectionTitle}>
              Lesson Resources
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <FileText
              size={18}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          </View>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.resource,
            pressed && styles.pressed,
          ]}>
          <View
            style={[
              styles.resourceIcon,
              {
                backgroundColor:
                  theme.colors.primarySoft,
              },
            ]}>
            <FileText
              size={20}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.resourceTitle}>
              Lesson notes & cheat sheet
            </Text>

            <Text style={styles.resourceMeta}>
              PDF • 1.8 MB
            </Text>
          </View>

          <View style={styles.resourceAction}>
            <Text style={styles.resourceActionText}>
              View
            </Text>

            <ChevronRight
              size={16}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          </View>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.resource,
            pressed && styles.pressed,
          ]}>
          <View
            style={[
              styles.resourceIcon,
              {
                backgroundColor:
                  theme.colors.secondarySoft,
              },
            ]}>
            <Database
              size={20}
              color={theme.colors.secondary}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.flex}>
            <Text style={styles.resourceTitle}>
              Practice dataset
            </Text>

            <Text style={styles.resourceMeta}>
              CSV • Practice file
            </Text>
          </View>

          <View style={styles.resourceAction}>
            <Text style={styles.resourceActionText}>
              Open
            </Text>

            <ChevronRight
              size={16}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          </View>
        </Pressable>

        {/* NOTES */}

        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionEyebrow}>
              PERSONAL
            </Text>

            <Text style={styles.sectionTitle}>
              My Notes
            </Text>
          </View>

          <View style={styles.sectionIcon}>
            <NotebookPen
              size={18}
              color={theme.colors.secondary}
              strokeWidth={2.2}
            />
          </View>
        </View>

        <View style={styles.notesCard}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Write key takeaways from this lesson..."
            placeholderTextColor={
              theme.colors.textLight
            }
            selectionColor={
              theme.colors.primary
            }
            style={styles.notes}
            textAlignVertical="top"
          />

          <View style={styles.noteFooter}>
            <View style={styles.noteHintRow}>
              <Info
                size={12}
                color={theme.colors.iconMuted}
                strokeWidth={2.2}
              />

              <Text style={styles.noteHint}>
                Saved for this app session
              </Text>
            </View>

            <Text style={styles.noteCount}>
              {notes.length}
            </Text>
          </View>
        </View>

        {/* PROGRESS */}

        <View style={styles.sectionHeadingRow}>
          <View>
            <Text style={styles.sectionEyebrow}>
              PROGRESS
            </Text>

            <Text style={styles.sectionTitle}>
              Lesson Progress
            </Text>
          </View>

          {done && (
            <View style={styles.completedBadge}>
              <CheckCircle2
                size={13}
                color={theme.colors.secondary}
                strokeWidth={2.3}
              />

              <Text style={styles.completedBadgeText}>
                Completed
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View
              style={[
                styles.progressIcon,
                done &&
                  styles.progressIconDone,
              ]}>
              {done ? (
                <CheckCircle2
                  size={23}
                  color={theme.colors.secondary}
                  strokeWidth={2.3}
                />
              ) : (
                <Play
                  size={22}
                  color={theme.colors.primary}
                  fill={theme.colors.primary}
                  strokeWidth={2.2}
                />
              )}
            </View>

            <View style={styles.progressContent}>
              <Text style={styles.progressTitle}>
                {done
                  ? 'Lesson completed'
                  : 'Complete this lesson'}
              </Text>

              <Text style={styles.progressSubtitle}>
                {done
                  ? 'Your lesson progress has been updated.'
                  : 'Mark the lesson complete when you finish studying.'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={complete}
            disabled={done}
            style={({pressed}) => [
              styles.completeButton,
              done &&
                styles.completeButtonDone,
              pressed &&
                !done &&
                styles.pressed,
            ]}>
            <CheckCircle2
              size={17}
              color={
                done
                  ? theme.colors.secondary
                  : theme.colors.black
              }
              strokeWidth={2.3}
            />

            <Text
              style={[
                styles.completeButtonText,
                done &&
                  styles.completeButtonTextDone,
              ]}>
              {done
                ? 'Completed'
                : 'Mark Lesson Complete'}
            </Text>
          </Pressable>
        </View>

        {/* QUIZ */}

        <Pressable
          onPress={() =>
            navigation.navigate('Quiz')
          }
          style={({pressed}) => [
            styles.quizCard,
            pressed && styles.pressed,
          ]}>
          <View style={styles.quizIcon}>
            <BookOpenCheck
              size={22}
              color={theme.colors.primary}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.quizContent}>
            <Text style={styles.quizEyebrow}>
              PRACTICE
            </Text>

            <Text style={styles.quizTitle}>
              Test your understanding
            </Text>

            <Text style={styles.quizSubtitle}>
              Continue with a quick quiz based on
              your learning.
            </Text>
          </View>

          <View style={styles.quizArrow}>
            <ChevronRight
              size={20}
              color={theme.colors.primary}
              strokeWidth={2.4}
            />
          </View>
        </Pressable>

        {/* API STATUS / CURRENT IMPLEMENTATION */}

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Info
              size={18}
              color={theme.colors.info}
              strokeWidth={2.2}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Learning content
            </Text>

            <Text style={styles.infoDescription}>
              Video playback, lesson resources,
              notes and lesson completion are
              currently app-session features.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (
  theme: AppTheme,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        theme.colors.background,
    },

    header: {
      minHeight: 76,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor:
        theme.colors.divider,
      backgroundColor:
        theme.colors.surface,
    },

    backButton: {
      width: 42,
      height: 42,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    headerContent: {
      flex: 1,
    },

    headerEyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    headerEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1.2,
    },

    headerTitle: {
      marginTop: 2,
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },

    headerSubtitle: {
      marginTop: 2,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '700',
    },

    logo: {
      width: 72,
      height: 32,
      marginLeft: 8,
    },

    scroll: {
      padding: 18,
      paddingBottom: 44,
    },

    videoCard: {
      minHeight: 245,
      padding: 17,
      overflow: 'hidden',
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

    videoTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    videoTopText: {
      flex: 1,
    },

    videoLabel: {
      color:
        theme.colors.textLight,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    videoType: {
      marginTop: 4,
      color:
        theme.colors.primary,
      fontSize: 10,
      fontWeight: '900',
    },

    durationBadge: {
      minHeight: 32,
      paddingHorizontal: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius:
        theme.radius.pill,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    duration: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 8,
      fontWeight: '900',
    },

    playerArea: {
      flex: 1,
      minHeight: 130,
      alignItems: 'center',
      justifyContent: 'center',
    },

    playerGlow: {
      position: 'absolute',
      width: 126,
      height: 126,
      borderRadius: 126,
      backgroundColor:
        theme.colors.primarySoft,
    },

    playButton: {
      width: 68,
      height: 68,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 34,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity:
        theme.dark ? 0.24 : 0.13,
      shadowRadius: 10,
      elevation: 3,
    },

    pauseButton: {
      backgroundColor:
        theme.colors.secondary,
    },

    videoHint: {
      marginTop: 13,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '800',
      textAlign: 'center',
    },

    track: {
      height: 5,
      overflow: 'hidden',
      borderRadius:
        theme.radius.pill,
      backgroundColor:
        theme.colors.surfaceSoft,
    },

    fill: {
      height: '100%',
      borderRadius:
        theme.radius.pill,
      backgroundColor:
        theme.colors.primary,
    },

    videoFooter: {
      marginTop: 8,
      flexDirection: 'row',
      justifyContent:
        'space-between',
    },

    videoFooterText: {
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '700',
    },

    lessonInfo: {
      marginTop: 20,
    },

    lessonInfoTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    courseBadge: {
      minHeight: 29,
      paddingHorizontal: 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius:
        theme.radius.pill,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    courseBadgeText: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.65,
    },

    meta: {
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '800',
    },

    title: {
      marginTop: 12,
      color:
        theme.colors.textPrimary,
      fontSize: 24,
      lineHeight: 31,
      fontWeight: '900',
      letterSpacing: -0.35,
    },

    body: {
      marginTop: 9,
      color:
        theme.colors.textSecondary,
      fontSize: 10,
      lineHeight: 17,
      fontWeight: '600',
    },

    objectivesCard: {
      marginTop: 18,
      padding: 16,
      borderRadius: 19,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    objectiveHeader: {
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
    },

    objectiveIcon: {
      width: 39,
      height: 39,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    objectiveHeaderText: {
      flex: 1,
    },

    objectiveTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: '900',
    },

    objectiveSubtitle: {
      marginTop: 2,
      color:
        theme.colors.textSecondary,
      fontSize: 7,
    },

    objectiveRow: {
      marginTop: 9,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    objectiveBullet: {
      width: 25,
      height: 25,
      marginRight: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    objectiveText: {
      flex: 1,
      paddingTop: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 16,
      fontWeight: '600',
    },

    sectionHeadingRow: {
      marginTop: 25,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    sectionEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1,
    },

    sectionTitle: {
      marginTop: 2,
      color:
        theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: '900',
    },

    sectionIcon: {
      width: 37,
      height: 37,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    resource: {
      marginBottom: 8,
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      borderRadius: 16,
      backgroundColor:
        theme.colors.surface,
    },

    resourceIcon: {
      width: 42,
      height: 42,
      marginRight: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 13,
    },

    flex: {
      flex: 1,
    },

    resourceTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      fontWeight: '900',
    },

    resourceMeta: {
      marginTop: 3,
      color:
        theme.colors.textLight,
      fontSize: 8,
      fontWeight: '600',
    },

    resourceAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },

    resourceActionText: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
    },

    notesCard: {
      padding: 12,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      borderRadius: 17,
      backgroundColor:
        theme.colors.surface,
    },

    notes: {
      minHeight: 105,
      color:
        theme.colors.textPrimary,
      fontSize: 10,
      lineHeight: 17,
    },

    noteFooter: {
      marginTop: 5,
      paddingTop: 9,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      borderTopWidth: 1,
      borderTopColor:
        theme.colors.divider,
    },

    noteHintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    noteHint: {
      color:
        theme.colors.textLight,
      fontSize: 7,
    },

    noteCount: {
      color:
        theme.colors.textLight,
      fontSize: 7,
      fontWeight: '800',
    },

    completedBadge: {
      minHeight: 30,
      paddingHorizontal: 9,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderRadius:
        theme.radius.pill,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    completedBadgeText: {
      color:
        theme.colors.secondaryStrong,
      fontSize: 7,
      fontWeight: '900',
    },

    progressCard: {
      padding: 15,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      borderRadius: 18,
      backgroundColor:
        theme.colors.surface,
    },

    progressTop: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    progressIcon: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor:
        theme.colors.primarySoft,
    },

    progressIconDone: {
      backgroundColor:
        theme.colors.secondarySoft,
    },

    progressContent: {
      flex: 1,
      marginLeft: 11,
    },

    progressTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    progressSubtitle: {
      marginTop: 3,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      lineHeight: 13,
    },

    completeButton: {
      height: 48,
      marginTop: 15,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      borderRadius: 13,
      backgroundColor:
        theme.colors.primary,
    },

    completeButtonDone: {
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    completeButtonText: {
      color:
        theme.colors.black,
      fontSize: 9,
      fontWeight: '900',
    },

    completeButtonTextDone: {
      color:
        theme.colors.secondaryStrong,
    },

    quizCard: {
      marginTop: 16,
      padding: 15,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      borderRadius: 18,
      backgroundColor:
        theme.colors.surface,
    },

    quizIcon: {
      width: 45,
      height: 45,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 14,
      backgroundColor:
        theme.colors.primarySoft,
    },

    quizContent: {
      flex: 1,
      marginLeft: 11,
    },

    quizEyebrow: {
      color:
        theme.colors.primary,
      fontSize: 6,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    quizTitle: {
      marginTop: 3,
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    quizSubtitle: {
      marginTop: 3,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      lineHeight: 13,
    },

    quizArrow: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
      backgroundColor:
        theme.colors.primarySoft,
    },

    infoCard: {
      marginTop: 17,
      padding: 15,
      flexDirection: 'row',
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      borderRadius: 17,
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    infoIcon: {
      width: 37,
      height: 37,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surface,
    },

    infoContent: {
      flex: 1,
      marginLeft: 11,
    },

    infoTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    infoDescription: {
      marginTop: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
    },

    pressed: {
      opacity: 0.76,
    },
  });

export default LessonScreen;
