
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Info,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';

import type {RootStackParamList} from '../../navigation/navigationTypes';

import {
  getPlacementJobDetails,
  type PlacementJob,
} from '../../services/placementApi';

import {useApp} from '../../state/AppContext';
import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'JobDetails'
>;

function getPalette(theme: AppTheme) {
  return {
    bg: theme.colors.background,
    card: theme.colors.surface,
    border: theme.colors.border,
    strongBorder: theme.colors.borderStrong,
    white: theme.colors.textPrimary,
    muted: theme.colors.textSecondary,
    light: theme.colors.textLight,
    green: theme.colors.secondary,
    orange: theme.colors.primary,
    black: theme.colors.black,
    red: theme.colors.danger,
  };
}

function useJobDetailsTheme() {
  const {theme} = useTheme();

  const C = useMemo(
    () => getPalette(theme),
    [theme],
  );

  const styles = useMemo(
    () => createStyles(theme, C),
    [theme, C],
  );

  return {
    theme,
    C,
    styles,
  };
}

function isValidWebUrl(url: string): boolean {
  return /^https?:\/\/\S+$/i.test(url.trim());
}

export default function JobDetailsScreen({
  navigation,
  route,
}: Props) {
  const {theme, C, styles} =
    useJobDetailsTheme();

  const {accessToken} = useApp();

  const jobId = route.params.jobId;

  const [job, setJob] =
    useState<PlacementJob | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [reload, setReload] =
    useState(0);

  /*
   * =====================================
   * LOAD REAL JOB DETAILS
   * =====================================
   */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        setError('');
        setJob(null);

        if (!accessToken) {
          if (active) {
            setError(
              'Student session not found. Please sign in again.',
            );

            setLoading(false);
          }

          return;
        }

        try {
          const result =
            await getPlacementJobDetails(
              accessToken,
              jobId,
            );

          if (!active) {
            return;
          }

          setJob(result);
        } catch (caughtError) {
          if (!active) {
            return;
          }

          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'Unable to load job details.',
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

      void load();

      return () => {
        active = false;
      };
    }, [accessToken, jobId, reload]),
  );

  const refresh = () => {
    setReload(value => value + 1);
  };

  /*
   * =====================================
   * OPEN APPLICATION LINK
   * =====================================
   */

  const openApplication = async () => {
    if (!job) {
      return;
    }

    const url = job.applyUrl.trim();

    if (!isValidWebUrl(url)) {
      Alert.alert(
        'Application unavailable',
        'The academy has not provided a valid application link for this job.',
      );

      return;
    }

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Unable to open link',
        'Please try again later or contact academy support.',
      );
    }
  };

  const skills = job?.skills
    ? job.skills
        .split(',')
        .map(item => item.trim())
        .filter(Boolean)
    : [];

  const canApply =
    job !== null &&
    job.isActive !== false &&
    isValidWebUrl(job.applyUrl);

  /*
   * =====================================
   * UI
   * =====================================
   */

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
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.backButton}>

          <ArrowLeft
            size={21}
            color={theme.colors.textPrimary}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>
            STUDENT CAREER PORTAL
          </Text>

          <Text style={styles.headerTitle}>
            Job Opportunity
          </Text>
        </View>

        <Pressable
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh job details"
          style={styles.refreshButton}>

          <RefreshCw
            size={19}
            color={C.green}
          />
        </Pressable>
      </View>

      {/* LOADING */}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator
            size="large"
            color={C.green}
          />

          <Text style={styles.stateTitle}>
            Loading job details...
          </Text>
        </View>
      ) : error || !job ? (
        /* ERROR */

        <View style={styles.centerState}>
          <BriefcaseBusiness
            size={38}
            color={C.green}
          />

          <Text style={styles.stateTitle}>
            Job details unavailable
          </Text>

          <Text style={styles.stateDescription}>
            {error || 'This job could not be found.'}
          </Text>

          <Pressable
            onPress={refresh}
            style={styles.retryButton}>

            <RefreshCw
              size={17}
              color={C.black}
            />

            <Text style={styles.retryText}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : (
        /* REAL JOB CONTENT */

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* JOB HEADER */}

          <View style={styles.jobCard}>
            <View style={styles.companyIcon}>
              <Building2
                size={25}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.jobHeaderContent}>
              <Text style={styles.jobTitle}>
                {job.title}
              </Text>

              {!!job.company && (
                <Text style={styles.companyName}>
                  {job.company}
                </Text>
              )}

              {!!job.type && (
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>
                    {job.type}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* QUICK DETAILS */}

          <View style={styles.metaGrid}>
            <MetaCard
              icon={<MapPin size={17} color={C.green} />}
              label="LOCATION"
              value={job.location}
            />

            <MetaCard
              icon={
                <BriefcaseBusiness
                  size={17}
                  color={C.orange}
                />
              }
              label="EXPERIENCE"
              value={job.experience}
            />

            <MetaCard
              icon={
                <GraduationCap
                  size={17}
                  color={C.green}
                />
              }
              label="QUALIFICATION"
              value={job.qualification}
            />

            <MetaCard
              icon={
                <CalendarDays
                  size={17}
                  color={C.orange}
                />
              }
              label="DEADLINE"
              value={job.deadline}
            />
          </View>

          {/* ADDITIONAL DETAILS */}

          {(!!job.salary ||
            !!job.workMode ||
            !!job.applicationType) && (
            <Section title="Opportunity Details">
              <View style={styles.detailsCard}>
                <DetailRow
                  label="Salary / Stipend"
                  value={job.salary}
                />

                <DetailRow
                  label="Work Mode"
                  value={job.workMode}
                />

                <DetailRow
                  label="Application Type"
                  value={job.applicationType}
                />
              </View>
            </Section>
          )}

          {/* DESCRIPTION */}

          {!!job.description && (
            <Section title="About the Role">
              <Text style={styles.bodyText}>
                {job.description}
              </Text>
            </Section>
          )}

          {/* SKILLS */}

          {skills.length > 0 && (
            <Section title="Required Skills">
              <View style={styles.skillsWrap}>
                {skills.map((skill, index) => (
                  <View
                    key={`${skill}-${index}`}
                    style={styles.skillBadge}>

                    <Text style={styles.skillText}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </Section>
          )}

          {/* APPLY */}

          <View style={styles.applySection}>
            {canApply ? (
              <Pressable
                onPress={() => void openApplication()}
                accessibilityRole="button"
                style={({pressed}) => [
                  styles.applyButton,
                  pressed && styles.pressed,
                ]}>

                <Text style={styles.applyButtonText}>
                  Open Application Link
                </Text>

                <ExternalLink
                  size={18}
                  color={C.black}
                />
              </Pressable>
            ) : (
              <View style={styles.unavailableBox}>
                <Info
                  size={19}
                  color={C.orange}
                />

                <Text style={styles.unavailableText}>
                  {job.isActive === false
                    ? 'This opportunity is not active.'
                    : 'An application link is not available for this opportunity.'}
                </Text>
              </View>
            )}

            <Text style={styles.applyNote}>
              Opening an application link does not
              automatically confirm submission.
              Application tracking requires the
              academy's student application API.
            </Text>
          </View>

          {/* APPLICATIONS NAVIGATION */}

          <Pressable
            onPress={() =>
              navigation.navigate('Applications')
            }
            style={({pressed}) => [
              styles.applicationsCard,
              pressed && styles.pressed,
            ]}>

            <View style={styles.applicationsIcon}>
              <FileUserIcon />
            </View>

            <View style={styles.applicationsText}>
              <Text style={styles.applicationsTitle}>
                My Applications
              </Text>

              <Text style={styles.applicationsSubtitle}>
                Open your application tracker
              </Text>
            </View>

            <ChevronRight
              size={19}
              color={C.green}
            />
          </Pressable>

          <Text style={styles.footer}>
            Seekho Digital India Academy
          </Text>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/*
 * =====================================
 * COMPONENTS
 * =====================================
 */

function FileUserIcon() {
  const {C} =
    useJobDetailsTheme();

  return (
    <BriefcaseBusiness
      size={19}
      color={C.green}
    />
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  const {styles} =
    useJobDetailsTheme();

  return (
    <View style={styles.metaCard}>
      <View style={styles.metaTop}>
        {icon}

        <Text style={styles.metaLabel}>
          {label}
        </Text>
      </View>

      <Text style={styles.metaValue}>
        {value || 'Not specified'}
      </Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const {styles} =
    useJobDetailsTheme();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}
    </View>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const {styles} =
    useJobDetailsTheme();

  if (!value) {
    return null;
  }

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text style={styles.detailValue}>
        {value}
      </Text>
    </View>
  );
}

/*
 * =====================================
 * STYLES
 * =====================================
 */

const createStyles = (
  theme: AppTheme,
  C: ReturnType<typeof getPalette>,
) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 13,
    paddingBottom: 15,
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: C.green,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },

  headerTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 3,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerState: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },

  stateDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.green,
    borderRadius: 12,
    paddingHorizontal: 19,
    paddingVertical: 12,
    marginTop: 20,
  },

  retryText: {
    color: C.black,
    fontSize: 11,
    fontWeight: '900',
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 19,
    paddingBottom: 42,
  },

  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.strongBorder,
    borderRadius: 19,
    padding: 15,
  },

  companyIcon: {
    width: 54,
    height: 54,
    borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  jobHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

  jobTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
  },

  companyName: {
    color: C.muted,
    fontSize: 11,
    marginTop: 5,
  },

  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 9,
  },

  typeText: {
    color: C.green,
    fontSize: 9,
    fontWeight: '900',
  },

  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  metaCard: {
    width: '48.5%',
    minHeight: 90,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
  },

  metaTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  metaLabel: {
    color: C.light,
    fontSize: 8,
    fontWeight: '900',
  },

  metaValue: {
    color: C.white,
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '800',
    marginTop: 10,
  },

  section: {
    marginTop: 24,
  },

  sectionTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 11,
  },

  detailsCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  detailRow: {
    marginBottom: 15,
  },

  detailLabel: {
    color: C.light,
    fontSize: 9,
    fontWeight: '900',
  },

  detailValue: {
    color: C.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 5,
  },

  bodyText: {
    color: C.muted,
    fontSize: 12,
    lineHeight: 20,
  },

  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  skillBadge: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },

  skillText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '800',
  },

  applySection: {
    marginTop: 26,
  },

  applyButton: {
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: C.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 14,
  },

  applyButtonText: {
    color: C.black,
    fontSize: 12,
    fontWeight: '900',
  },

  unavailableBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
  },

  unavailableText: {
    flex: 1,
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  applyNote: {
    color: C.light,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 10,
  },

  applicationsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 15,
    padding: 14,
    marginTop: 23,
  },

  applicationsIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: theme.colors.secondarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applicationsText: {
    flex: 1,
  },

  applicationsTitle: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },

  applicationsSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  footer: {
    color: C.light,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 25,
  },

  pressed: {
    opacity: 0.72,
  },
});