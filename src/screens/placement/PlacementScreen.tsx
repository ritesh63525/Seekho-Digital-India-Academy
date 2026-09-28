
import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
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
import {useFocusEffect} from '@react-navigation/native';

import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  Award,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleHelp,
  Compass,
  FileUser,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';

import type {
  MainTabParamList,
  RootStackParamList,
} from '../../navigation/navigationTypes';

import FeatureIcon from '../../components/FeatureIcon';
import {useApp} from '../../state/AppContext';

import {
  getStudentLearningProfile,
  type StudentLearningProfile,
} from '../../services/learningApi';

import {
  getAcademyPlacements,
  getPlacementJobs,
  type AcademyPlacement,
  type PlacementJob,
} from '../../services/placementApi';

import {useTheme} from '../../theme/ThemeContext';
import type {AppTheme} from '../../theme/brandThemes';

type Props = BottomTabScreenProps<
  MainTabParamList,
  'Placement'
>;

type OpportunityFilter =
  | 'all'
  | 'jobs'
  | 'internships';

type PlacementPalette = {
  bg: string;
  card: string;
  border: string;
  strongBorder: string;
  white: string;
  muted: string;
  light: string;
  green: string;
  orange: string;
  black: string;
};

function makePlacementPalette(
  theme: AppTheme,
): PlacementPalette {
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
  };
}

function usePlacementTheme() {
  const {theme} = useTheme();

  const C = useMemo(
    () => makePlacementPalette(theme),
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

function getJobCategory(
  type: string,
): 'job' | 'internship' | 'other' {
  const value = type.toLowerCase();

  if (value.includes('intern')) {
    return 'internship';
  }

  if (value.includes('job')) {
    return 'job';
  }

  return 'other';
}

export default function PlacementScreen({
  navigation,
}: Props) {
  const {theme, C, styles} = usePlacementTheme();
  const {accessToken, refreshAccessToken} = useApp();

  const rootNavigation =
    navigation.getParent<
      NativeStackNavigationProp<RootStackParamList>
    >();

  const [profile, setProfile] =
    useState<StudentLearningProfile | null>(null);

  const [jobs, setJobs] =
    useState<PlacementJob[]>([]);

  const [placements, setPlacements] =
    useState<AcademyPlacement[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [jobsError, setJobsError] =
    useState('');

  const [placementsError, setPlacementsError] =
    useState('');

  const [profileError, setProfileError] =
    useState('');

  const [reload, setReload] =
    useState(0);

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<OpportunityFilter>('all');

  /*
   * =====================================
   * LOAD REAL STUDENT AND JOB DATA
   * =====================================
   */

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);

        setProfile(null);
        setJobs([]);
        setPlacements([]);

        setJobsError('');
        setPlacementsError('');
        setProfileError('');

        if (!accessToken) {
          if (active) {
            setJobsError(
              'No active student session. Please sign in again.',
            );

            setProfileError(
              'Student session not found.',
            );

            setLoading(false);
          }

          return;
        }

        const results = await Promise.allSettled([
          getPlacementJobs(
            accessToken,
            refreshAccessToken,
          ),
          getStudentLearningProfile(accessToken),
          getAcademyPlacements(),
        ]);

        if (!active) {
          return;
        }

        const jobsResult = results[0];

        if (jobsResult.status === 'fulfilled') {
          setJobs(jobsResult.value);
        } else {
          setJobsError(
            jobsResult.reason instanceof Error
              ? jobsResult.reason.message
              : 'Unable to load opportunities.',
          );
        }

        const profileResult = results[1];

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
        } else {
          setProfileError(
            profileResult.reason instanceof Error
              ? profileResult.reason.message
              : 'Unable to load student profile.',
          );
        }

        const placementsResult = results[2];

        if (placementsResult.status === 'fulfilled') {
          setPlacements(placementsResult.value);
        } else {
          setPlacementsError(
            placementsResult.reason instanceof Error
              ? placementsResult.reason.message
              : 'Unable to load student placements.',
          );
        }

        setLoading(false);
      };

      void load();

      return () => {
        active = false;
      };
    }, [accessToken, refreshAccessToken, reload]),
  );

  const refresh = () => {
    setReload(value => value + 1);
  };

  /*
   * =====================================
   * SEARCH AND FILTERS
   * =====================================
   */

  const visibleJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter(job => {
      const category = getJobCategory(job.type);

      if (
        activeFilter === 'jobs' &&
        category !== 'job'
      ) {
        return false;
      }

      if (
        activeFilter === 'internships' &&
        category !== 'internship'
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        job.title,
        job.company,
        job.location,
        job.type,
        job.skills,
        job.qualification,
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [jobs, search, activeFilter]);

  const jobCount = jobs.filter(
    job => getJobCategory(job.type) === 'job',
  ).length;

  const internshipCount = jobs.filter(
    job => getJobCategory(job.type) === 'internship',
  ).length;

  /*
   * =====================================
   * NAVIGATE TO REAL JOB DETAILS
   * =====================================
   */

  const openJobDetails = (job: PlacementJob) => {
    rootNavigation?.navigate('JobDetails', {
      jobId: job.id,
    });
  };

  const name =
    profile?.name?.trim() || '';

  const course =
    profile?.assignedCourseTitle?.trim() || '';

  const studentStatus =
    profile?.studentStatus?.trim() || '';

  /*
   * =====================================
   * UI
   * =====================================
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              STUDENT CAREER PORTAL
            </Text>

            <Text style={styles.title}>
              Jobs & Internships
            </Text>

            <Text style={styles.subtitle}>
              Explore available opportunities and
              manage your career journey.
            </Text>
          </View>

          <Pressable
            onPress={refresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh opportunities"
            style={styles.refreshButton}>

            <RefreshCw
              size={19}
              color={C.green}
            />

          </Pressable>
        </View>

        {/* COMPACT HERO */}

        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <FeatureIcon
              name="placement"
              size={21}
              containerSize={48}
            />

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                CAREER
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            Find Your Next Opportunity
          </Text>

          <Text style={styles.heroDescription}>
            Jobs and internships published by the academy.
          </Text>

          <View style={styles.statsGrid}>
            <StatBox
              label="LISTED"
              value={
                loading || jobsError
                  ? '—'
                  : String(jobs.length)
              }
              color={C.green}
            />

            <StatBox
              label="JOBS"
              value={
                loading || jobsError
                  ? '—'
                  : String(jobCount)
              }
              color={C.white}
            />

            <StatBox
              label="INTERNSHIPS"
              value={
                loading || jobsError
                  ? '—'
                  : String(internshipCount)
              }
              color={C.orange}
            />
          </View>
        </View>

        {/* STUDENT PLACEMENTS — REAL /api/v1/placements DATA */}

        <View style={styles.placementSectionHeader}>
          <View style={styles.placementSectionTitleRow}>
            <View style={styles.placementSectionIcon}>
              <Award
                size={19}
                color={C.orange}
              />
            </View>

            <View style={styles.placementSectionText}>
              <Text style={styles.sectionTitle}>
                Student Placements
              </Text>

              <Text style={styles.sectionSubtitle}>
                Real student transformations published by the academy.
              </Text>
            </View>
          </View>

          {!loading && !placementsError && (
            <View style={styles.placementCountBadge}>
              <Text style={styles.placementCountText}>
                {placements.length}
              </Text>
            </View>
          )}
        </View>

        {loading ? (
          <PlacementStateCard
            loading
            title="Loading placements..."
            description="Fetching latest student success stories."
          />
        ) : placementsError ? (
          <PlacementStateCard
            title="Could not load placements"
            description={placementsError}
            onRetry={refresh}
          />
        ) : placements.length === 0 ? (
          <PlacementStateCard
            title="No placements published yet"
            description="Active student placements will appear here when the academy publishes them."
          />
        ) : (
          <ScrollView
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.placementCarousel}>

            {placements.map(item => (
              <PlacementStoryCard
                key={item.id}
                item={item}
              />
            ))}

          </ScrollView>
        )}

        {/* REAL STUDENT PROFILE */}

        <SectionHeading
          title="Student Profile"
          subtitle="Your academy account"
        />

        <View style={styles.studentCard}>
          <FeatureIcon
            name="profile"
            size={19}
            containerSize={44}
          />

          <View style={styles.studentContent}>
            <Text style={styles.studentEyebrow}>
              PLACEMENT PROFILE
            </Text>

            {loading ? (
              <Text style={styles.studentName}>
                Loading student...
              </Text>
            ) : profileError ? (
              <>
                <Text style={styles.studentName}>
                  Profile unavailable
                </Text>

                <Text style={styles.profileError}>
                  {profileError}
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={styles.studentName}
                  numberOfLines={1}>
                  {name || 'Name not available'}
                </Text>

                <Text
                  style={styles.studentCourse}
                  numberOfLines={2}>
                  {course || 'Course not available'}
                </Text>

                {!!studentStatus && (
                  <Text style={styles.studentStatus}>
                    {studentStatus}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* CAREER QUICK ACTIONS */}

        <SectionHeading
          title="Career Dashboard"
          subtitle="Your career and application tools."
        />

        <View style={styles.quickGrid}>
          <QuickAction
            icon={
              <FileUser
                size={20}
                color={C.green}
              />
            }
            title="Resume / CV"
            subtitle="Build your professional resume"
            onPress={() =>
              rootNavigation?.navigate('CareerTools')
            }
          />

          <QuickAction
            icon={
              <Send
                size={19}
                color={C.orange}
              />
            }
            title="My Applications"
            subtitle="Open application tracker"
            onPress={() =>
              rootNavigation?.navigate('Applications')
            }
          />

          <QuickAction
            icon={
              <MessageSquareText
                size={20}
                color={theme.colors.info}
              />
            }
            title="Interview Prep"
            subtitle="Prepare technical and HR answers"
            onPress={() =>
              rootNavigation?.navigate('CareerTools')
            }
          />

          <QuickAction
            icon={
              <Compass
                size={20}
                color={theme.colors.primaryStrong}
              />
            }
            title="Career Guidance"
            subtitle="Explore career resources"
            onPress={() =>
              rootNavigation?.navigate('CareerTools')
            }
          />
        </View>

        {/* SEARCH AND FILTERS */}

        <SectionHeading
          title="Opportunities"
          subtitle="Find jobs and internships."
        />

        <View style={styles.searchCard}>
          <View style={styles.searchBox}>
            <Search
              size={18}
              color={C.light}
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search role, company or location..."
              placeholderTextColor={C.light}
              style={styles.searchInput}
              selectionColor={C.green}
            />
          </View>

          <View style={styles.filters}>
            <FilterButton
              title="All"
              active={activeFilter === 'all'}
              onPress={() => setActiveFilter('all')}
            />

            <FilterButton
              title="Jobs"
              active={activeFilter === 'jobs'}
              onPress={() => setActiveFilter('jobs')}
            />

            <FilterButton
              title="Internships"
              active={activeFilter === 'internships'}
              onPress={() =>
                setActiveFilter('internships')
              }
            />
          </View>
        </View>

        {/* OPPORTUNITIES HEADING */}

        <View style={styles.resultHeading}>
          <View style={styles.resultHeadingText}>
            <Text style={styles.sectionTitle}>
              Available Opportunities
            </Text>

            <Text style={styles.sectionSubtitle}>
              Latest listings from the academy
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {loading || jobsError
                ? '—'
                : visibleJobs.length}
            </Text>
          </View>
        </View>

        {/* JOB RESULTS */}

        {loading ? (
          <StateCard
            loading
            title="Loading opportunities..."
            description="Fetching academy jobs."
          />
        ) : jobsError ? (
          <StateCard
            title="Could not load opportunities"
            description={jobsError}
            onRetry={refresh}
          />
        ) : visibleJobs.length === 0 ? (
          <StateCard
            title={
              jobs.length === 0
                ? 'No opportunities available'
                : 'No matching opportunities'
            }
            description={
              jobs.length === 0
                ? 'No active job listings were returned by the API.'
                : 'Try another search or filter.'
            }
          />
        ) : (
          visibleJobs.map(job => (
            <View
              key={job.id}
              style={styles.opportunityCard}>

              <View style={styles.opportunityTop}>
                <View style={styles.companyIcon}>
                  <Building2
                    size={20}
                    color={theme.colors.secondary}
                  />
                </View>

                <View style={styles.opportunityContent}>
                  <Text style={styles.opportunityTitle}>
                    {job.title}
                  </Text>

                  {!!job.company && (
                    <Text style={styles.companyName}>
                      {job.company}
                    </Text>
                  )}
                </View>

                {!!job.type && (
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>
                      {job.type}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <MetaItem
                  label="LOCATION"
                  value={
                    job.location || 'Not specified'
                  }
                />

                <MetaItem
                  label="EXPERIENCE"
                  value={
                    job.experience || 'Not specified'
                  }
                />
              </View>

              {/* OPEN SEPARATE JOB DETAILS SCREEN */}

              <Pressable
                onPress={() => openJobDetails(job)}
                accessibilityRole="button"
                accessibilityLabel={`View ${job.title}`}
                style={({pressed}) => [
                  styles.viewButton,
                  pressed && styles.pressed,
                ]}>

                <Text style={styles.viewButtonText}>
                  View Opportunity
                </Text>

                <ChevronRight
                  size={17}
                  color={C.black}
                />
              </Pressable>
            </View>
          ))
        )}

        {/* PLACEMENT SUPPORT */}

        <SectionHeading
          title="Placement Support"
          subtitle="Need help preparing or applying?"
        />

        <Pressable
          onPress={() =>
            rootNavigation?.navigate('Support')
          }
          style={({pressed}) => [
            styles.supportCard,
            pressed && styles.pressed,
          ]}>

          <CircleHelp
            size={22}
            color={C.green}
          />

          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>
              Placement Help
            </Text>

            <Text style={styles.supportDescription}>
              Contact the academy support team.
            </Text>
          </View>

          <ChevronRight
            size={19}
            color={C.green}
          />
        </Pressable>

        <Text style={styles.footerText}>
          Seekho Digital India Academy
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

/*
 * =====================================
 * COMPONENTS
 * =====================================
 */

function PlacementStoryCard({
  item,
}: {
  item: AcademyPlacement;
}) {
  const {C, styles} = usePlacementTheme();

  const initials =
    item.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part =>
        part.charAt(0).toUpperCase(),
      )
      .join('') || 'SD';

  return (
    <View style={styles.placementStoryCard}>
      <View style={styles.placementStoryTop}>
        <View style={styles.placementAvatarWrap}>
          {item.imageUrl ? (
            <Image
              source={{
                uri: item.imageUrl,
              }}
              style={styles.placementAvatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placementAvatarFallback}>
              <Text style={styles.placementAvatarText}>
                {initials}
              </Text>
            </View>
          )}

          <View style={styles.placementVerified}>
            <Award
              size={12}
              color={C.black}
              strokeWidth={2.5}
            />
          </View>
        </View>

        {!!item.special && (
          <View style={styles.specialBadge}>
            <Sparkles
              size={12}
              color={C.orange}
            />

            <Text
              style={styles.specialBadgeText}
              numberOfLines={1}>
              {item.special}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={styles.placementName}
        numberOfLines={1}>
        {item.name}
      </Text>

      <Text
        style={styles.placementRole}
        numberOfLines={2}>
        {item.role || 'Placement Success'}
      </Text>

      <View style={styles.placementStoryDivider} />

      <View style={styles.transformationRow}>
        <View style={styles.transformationIcon}>
          <TrendingUp
            size={16}
            color={C.green}
          />
        </View>

        <Text
          style={styles.transformationText}
          numberOfLines={4}>
          {item.transformation ||
            'Career transformation through practical learning and placement support.'}
        </Text>
      </View>
    </View>
  );
}

function PlacementStateCard({
  title,
  description,
  loading,
  onRetry,
}: {
  title: string;
  description: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  const {C, styles} = usePlacementTheme();

  return (
    <View style={styles.placementStateCard}>
      <View style={styles.placementStateIcon}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={C.orange}
          />
        ) : (
          <Award
            size={25}
            color={C.orange}
          />
        )}
      </View>

      <Text style={styles.placementStateTitle}>
        {title}
      </Text>

      <Text style={styles.placementStateDescription}>
        {description}
      </Text>

      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          style={({pressed}) => [
            styles.placementRetryButton,
            pressed && styles.pressed,
          ]}>
          <RefreshCw
            size={14}
            color={C.orange}
          />

          <Text style={styles.placementRetryText}>
            Retry
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const {styles} = usePlacementTheme();

  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      <Text style={styles.sectionSubtitle}>
        {subtitle}
      </Text>
    </View>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const {styles} = usePlacementTheme();

  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={[styles.statValue, {color}]}>
        {value}
      </Text>
    </View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const {C, styles} = usePlacementTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.quickCard,
        pressed && styles.pressed,
      ]}>

      <View style={styles.quickIcon}>
        {icon}
      </View>

      <Text style={styles.quickTitle}>
        {title}
      </Text>

      <Text style={styles.quickSubtitle}>
        {subtitle}
      </Text>

      <ChevronRight
        size={17}
        color={C.light}
        style={styles.quickChevron}
      />
    </Pressable>
  );
}

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  const {styles} = usePlacementTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterButton,
        active && styles.filterActive,
      ]}>

      <Text
        style={[
          styles.filterText,
          active && styles.filterTextActive,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const {styles} = usePlacementTheme();

  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>
        {label}
      </Text>

      <Text style={styles.metaValue}>
        {value}
      </Text>
    </View>
  );
}

function StateCard({
  title,
  description,
  loading,
  onRetry,
}: {
  title: string;
  description: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  const {C, styles} = usePlacementTheme();

  return (
    <View style={styles.stateCard}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={C.green}
        />
      ) : (
        <BriefcaseBusiness
          size={25}
          color={C.green}
        />
      )}

      <Text style={styles.stateTitle}>
        {title}
      </Text>

      {!!description && (
        <Text style={styles.stateDescription}>
          {description}
        </Text>
      )}

      {!!onRetry && (
        <Pressable
          onPress={onRetry}
          style={styles.retryButton}>

          <RefreshCw
            size={14}
            color={C.green}
          />

          <Text style={styles.retryText}>
            Retry
          </Text>
        </Pressable>
      )}
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
  C: PlacementPalette,
) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 44,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 22,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    color: C.green,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 7,
  },

  title: {
    color: C.white,
    fontSize: 29,
    lineHeight: 36,
    fontWeight: '900',
  },

  subtitle: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  heroCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.strongBorder,
    borderRadius: 20,
    padding: 17,
    marginBottom: 22,
  },

  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  heroBadge: {
    backgroundColor: theme.colors.greenSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  heroBadgeText: {
    color: C.green,
    fontSize: 8,
    fontWeight: '900',
  },

  heroTitle: {
    color: C.white,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 15,
  },

  heroDescription: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 6,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },

  statBox: {
    width: '31.5%',
    minHeight: 78,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 13,
    padding: 10,
  },

  statLabel: {
    color: C.light,
    fontSize: 8,
    fontWeight: '900',
  },

  statValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 9,
  },

  sectionHeading: {
    marginTop: 5,
    marginBottom: 12,
  },

  sectionTitle: {
    color: C.white,
    fontSize: 17,
    fontWeight: '900',
  },

  sectionSubtitle: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  placementSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 12,
  },

  placementSectionTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  placementSectionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  placementSectionText: {
    flex: 1,
    marginLeft: 10,
  },

  placementCountBadge: {
    minWidth: 34,
    height: 30,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginLeft: 9,
  },

  placementCountText: {
    color: C.orange,
    fontSize: 10,
    fontWeight: '900',
  },

  placementCarousel: {
    paddingRight: 8,
    paddingBottom: 2,
  },

  placementStoryCard: {
    width: 274,
    minHeight: 235,
    padding: 15,
    marginRight: 12,
    marginBottom: 22,
    borderRadius: 20,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  placementStoryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  placementAvatarWrap: {
    width: 62,
    height: 62,
    position: 'relative',
  },

  placementAvatar: {
    width: 62,
    height: 62,
    borderRadius: 19,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.strongBorder,
  },

  placementAvatarFallback: {
    width: 62,
    height: 62,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.secondarySoft,
    borderWidth: 1,
    borderColor: C.strongBorder,
  },

  placementAvatarText: {
    color: C.green,
    fontSize: 18,
    fontWeight: '900',
  },

  placementVerified: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 23,
    height: 23,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.green,
    borderWidth: 2,
    borderColor: C.card,
  },

  specialBadge: {
    maxWidth: 135,
    minHeight: 29,
    paddingHorizontal: 9,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  specialBadgeText: {
    flexShrink: 1,
    color: C.orange,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.25,
  },

  placementName: {
    marginTop: 15,
    color: C.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
  },

  placementRole: {
    marginTop: 4,
    color: C.green,
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800',
  },

  placementStoryDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 13,
  },

  transformationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  transformationIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.greenSoft,
  },

  transformationText: {
    flex: 1,
    marginLeft: 9,
    color: C.muted,
    fontSize: 9,
    lineHeight: 15,
  },

  placementStateCard: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 22,
    borderRadius: 19,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  placementStateIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },

  placementStateTitle: {
    marginTop: 12,
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  placementStateDescription: {
    marginTop: 6,
    maxWidth: 290,
    color: C.muted,
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },

  placementRetryButton: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primarySoft,
  },

  placementRetryText: {
    color: C.orange,
    fontSize: 10,
    fontWeight: '900',
  },

  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    padding: 14,
    marginBottom: 21,
  },

  studentContent: {
    flex: 1,
    minWidth: 0,
  },

  studentEyebrow: {
    color: C.green,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  studentName: {
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },

  studentCourse: {
    color: C.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
  },

  studentStatus: {
    color: C.green,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 5,
  },

  profileError: {
    color: theme.colors.danger,
    fontSize: 10,
    lineHeight: 16,
    marginTop: 5,
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 19,
  },

  quickCard: {
    width: '48.5%',
    minHeight: 139,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
  },

  quickIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickTitle: {
    color: C.white,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 10,
  },

  quickSubtitle: {
    color: C.muted,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },

  quickChevron: {
    marginTop: 7,
  },

  searchCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 10,
    marginBottom: 21,
  },

  searchBox: {
    height: 47,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    color: C.white,
    fontSize: 11,
  },

  filters: {
    flexDirection: 'row',
    marginTop: 8,
  },

  filterButton: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterActive: {
    backgroundColor: C.green,
  },

  filterText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '800',
  },

  filterTextActive: {
    color: C.black,
  },

  resultHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  resultHeadingText: {
    flex: 1,
  },

  countBadge: {
    minWidth: 34,
    height: 29,
    borderRadius: 999,
    backgroundColor: theme.colors.greenSoft,
    borderWidth: 1,
    borderColor: theme.colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  countText: {
    color: C.green,
    fontSize: 10,
    fontWeight: '900',
  },

  stateCard: {
    minHeight: 170,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 22,
  },

  stateTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 11,
  },

  stateDescription: {
    color: C.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },

  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 10,
    marginTop: 9,
  },

  retryText: {
    color: C.green,
    fontSize: 11,
    fontWeight: '900',
  },

  opportunityCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 18,
    padding: 15,
    marginBottom: 11,
  },

  opportunityTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  companyIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: theme.colors.secondarySoft,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  opportunityContent: {
    flex: 1,
    minWidth: 0,
  },

  opportunityTitle: {
    color: C.white,
    fontSize: 13,
    fontWeight: '900',
  },

  companyName: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  typeBadge: {
    maxWidth: 82,
    borderRadius: 999,
    backgroundColor: theme.colors.greenSoft,
    paddingHorizontal: 7,
    paddingVertical: 6,
  },

  typeText: {
    color: C.green,
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 13,
  },

  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },

  metaItem: {
    flex: 1,
  },

  metaLabel: {
    color: C.light,
    fontSize: 8,
    fontWeight: '900',
  },

  metaValue: {
    color: C.white,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },

  viewButton: {
    height: 43,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  viewButtonText: {
    color: C.black,
    fontSize: 11,
    fontWeight: '900',
  },

  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    padding: 15,
    marginTop: 3,
  },

  supportContent: {
    flex: 1,
  },

  supportTitle: {
    color: C.white,
    fontSize: 12,
    fontWeight: '900',
  },

  supportDescription: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  footerText: {
    color: C.light,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 24,
  },

  pressed: {
    opacity: 0.72,
  },
});