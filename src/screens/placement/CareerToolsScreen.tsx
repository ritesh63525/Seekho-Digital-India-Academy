import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  ArrowUpRight,
  BriefcaseBusiness,
  Compass,
  FileText,
  FileUser,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
  WandSparkles,
} from 'lucide-react-native';

import {
  getResumeTemplates,
  type ResumeTemplate,
} from '../../services/resumeTemplatesApi';

import {
  useApp,
} from '../../state/AppContext';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

function getPalette(
  theme: AppTheme,
) {
  return {
    bg:
      theme.colors.background,

    card:
      theme.colors.surface,

    border:
      theme.colors.border,

    strongBorder:
      theme.colors.borderStrong,

    white:
      theme.colors.textPrimary,

    muted:
      theme.colors.textSecondary,

    light:
      theme.colors.textLight,

    green:
      theme.colors.secondary,

    orange:
      theme.colors.primary,

    black:
      theme.colors.black,
  };
}

function useCareerToolsTheme() {
  const {theme} = useTheme();

  const C = useMemo(
    () => getPalette(theme),
    [theme],
  );

  const styles = useMemo(
    () => createStyles(
      theme,
      C,
    ),
    [theme, C],
  );

  return {
    theme,
    C,
    styles,
  };
}

export default function CareerToolsScreen() {
  const {
    theme,
    C,
    styles,
  } = useCareerToolsTheme();

  const {
    accessToken,
    refreshAccessToken,
  } = useApp();

  const [
    templates,
    setTemplates,
  ] =
    useState<ResumeTemplate[]>(
      [],
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    search,
    setSearch,
  ] =
    useState('');

  const loadTemplates =
    useCallback(
      async (
        pullToRefresh = false,
      ) => {
        const token =
          String(
            accessToken ?? '',
          ).trim();

        if (!token) {
          setTemplates([]);
          setError(
            'Student session not found. Please sign in again.',
          );
          setLoading(false);
          setRefreshing(false);
          return;
        }

        if (pullToRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        try {
          const result =
            await getResumeTemplates(
              token,
              refreshAccessToken,
            );

          setTemplates(
            result,
          );
        } catch (err) {
          setTemplates([]);

          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load resume templates.',
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        accessToken,
        refreshAccessToken,
      ],
    );

  React.useEffect(
    () => {
      void loadTemplates();
    },
    [loadTemplates],
  );

  const visibleTemplates =
    useMemo(
      () => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return templates;
        }

        return templates.filter(
          item => {
            const text = [
              item.title,
              item.description,
              item.category,
            ]
              .join(' ')
              .toLowerCase();

            return text.includes(
              query,
            );
          },
        );
      },
      [
        templates,
        search,
      ],
    );

  const openTemplate =
    async (
      template:
        ResumeTemplate,
    ) => {
      if (!template.fileUrl) {
        Alert.alert(
          'Template file unavailable',
          'This template does not include an open/download URL yet.',
        );

        return;
      }

      try {
        const supported =
          await Linking.canOpenURL(
            template.fileUrl,
          );

        if (!supported) {
          throw new Error(
            'This template link cannot be opened on this device.',
          );
        }

        await Linking.openURL(
          template.fileUrl,
        );
      } catch (err) {
        Alert.alert(
          'Unable to open template',
          err instanceof Error
            ? err.message
            : 'Please try again.',
        );
      }
    };

  return (
    <SafeAreaView
      style={
        styles.safeArea
      }>

      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <ScrollView
        style={
          styles.container
        }
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={() =>
              void loadTemplates(
                true,
              )
            }
            tintColor={
              C.green
            }
            colors={[
              C.green,
              C.orange,
            ]}
          />
        }>

        {/* HEADER */}
        <View
          style={
            styles.header
          }>

          <View
            style={
              styles.headerIcon
            }>
            <FileUser
              size={24}
              color={
                C.orange
              }
              strokeWidth={2}
            />
          </View>

          <Text
            style={
              styles.eyebrow
            }>
            CAREER TOOLS
          </Text>

          <Text
            style={
              styles.title
            }>
            Build Your{' '}
            <Text
              style={
                styles.titleAccent
              }>
              Career
            </Text>
          </Text>

          <Text
            style={
              styles.subtitle
            }>
            Use academy resume
            templates and practical
            career resources to
            prepare for your next
            opportunity.
          </Text>

        </View>

        {/* HERO */}
        <View
          style={
            styles.heroCard
          }>

          <View
            style={
              styles.heroTop
            }>

            <View
              style={
                styles.heroIcon
              }>
              <WandSparkles
                size={24}
                color={
                  C.green
                }
              />
            </View>

            <View
              style={
                styles.heroBadge
              }>
              <Sparkles
                size={13}
                color={
                  C.orange
                }
              />

              <Text
                style={
                  styles.heroBadgeText
                }>
                PREMIUM
              </Text>
            </View>

          </View>

          <Text
            style={
              styles.heroTitle
            }>
            Resume Template
            Library
          </Text>

          <Text
            style={
              styles.heroDescription
            }>
            Browse active resume
            templates published by
            the academy and choose a
            layout that suits your
            profile.
          </Text>

          <View
            style={
              styles.heroCountRow
            }>

            <Text
              style={
                styles.heroCount
              }>
              {loading
                ? '—'
                : templates.length}
            </Text>

            <Text
              style={
                styles.heroCountLabel
              }>
              ACTIVE TEMPLATES
            </Text>

          </View>

        </View>

        {/* OTHER CAREER TOOLS */}
        <View
          style={
            styles.sectionHeader
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Career Toolkit
          </Text>

          <Text
            style={
              styles.sectionSubtitle
            }>
            Essential tools for
            placement preparation.
          </Text>

        </View>

        <View
          style={
            styles.toolGrid
          }>

          <ToolCard
            icon={
              <FileText
                size={20}
                color={
                  C.green
                }
              />
            }
            title="Resume / CV"
            subtitle="Professional templates"
          />

          <ToolCard
            icon={
              <MessageSquareText
                size={20}
                color={
                  C.orange
                }
              />
            }
            title="Interview Prep"
            subtitle="Practice your answers"
          />

          <ToolCard
            icon={
              <Compass
                size={20}
                color={
                  theme.colors.info
                }
              />
            }
            title="Career Guidance"
            subtitle="Plan your direction"
          />

          <ToolCard
            icon={
              <BriefcaseBusiness
                size={20}
                color={
                  theme.colors.secondary
                }
              />
            }
            title="Placement Ready"
            subtitle="Prepare for hiring"
          />

        </View>

        {/* SEARCH */}
        <View
          style={
            styles.searchCard
          }>

          <View
            style={
              styles.searchBox
            }>

            <Search
              size={18}
              color={
                C.light
              }
            />

            <TextInput
              value={
                search
              }
              onChangeText={
                setSearch
              }
              placeholder="Search resume templates..."
              placeholderTextColor={
                C.light
              }
              selectionColor={
                C.green
              }
              style={
                styles.searchInput
              }
            />

          </View>

        </View>

        {/* TEMPLATE HEADER */}
        <View
          style={
            styles.templateHeading
          }>

          <View>
            <Text
              style={
                styles.sectionTitle
              }>
              Resume Templates
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }>
              Active templates from
              the academy
            </Text>
          </View>

          <Pressable
            onPress={() =>
              void loadTemplates()
            }
            disabled={
              loading
            }
            style={({pressed}) => [
              styles.refreshButton,
              pressed &&
                styles.pressed,
            ]}>

            <RefreshCw
              size={17}
              color={
                C.green
              }
            />

          </Pressable>

        </View>

        {/* STATES */}
        {loading ? (
          <StateCard
            loading
            title="Loading templates..."
            description="Fetching the latest resume templates."
          />
        ) : error ? (
          <StateCard
            title="Could not load templates"
            description={error}
            onRetry={() =>
              void loadTemplates()
            }
          />
        ) : visibleTemplates.length ===
          0 ? (
          <StateCard
            title={
              templates.length ===
              0
                ? 'No resume templates available'
                : 'No matching templates'
            }
            description={
              templates.length ===
              0
                ? 'Active resume templates will appear here when the academy publishes them.'
                : 'Try another search.'
            }
          />
        ) : (
          <View
            style={
              styles.templateList
            }>

            {visibleTemplates.map(
              template => (
                <TemplateCard
                  key={
                    template.id
                  }
                  template={
                    template
                  }
                  onOpen={() =>
                    void openTemplate(
                      template,
                    )
                  }
                />
              ),
            )}

          </View>
        )}

        {/* INFO */}
        <View
          style={
            styles.infoCard
          }>

          <View
            style={
              styles.infoIcon
            }>
            <Sparkles
              size={18}
              color={
                C.green
              }
            />
          </View>

          <View
            style={
              styles.infoContent
            }>
            <Text
              style={
                styles.infoTitle
              }>
              Academy-managed
              templates
            </Text>

            <Text
              style={
                styles.infoDescription
              }>
              Template availability
              is controlled from the
              academy admin panel.
              Pull down anytime to
              refresh the latest
              list.
            </Text>
          </View>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function ToolCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const {styles} =
    useCareerToolsTheme();

  return (
    <View
      style={
        styles.toolCard
      }>

      <View
        style={
          styles.toolIcon
        }>
        {icon}
      </View>

      <Text
        style={
          styles.toolTitle
        }>
        {title}
      </Text>

      <Text
        style={
          styles.toolSubtitle
        }>
        {subtitle}
      </Text>

    </View>
  );
}

function TemplateCard({
  template,
  onOpen,
}: {
  template:
    ResumeTemplate;

  onOpen:
    () => void;
}) {
  const {
    C,
    styles,
  } = useCareerToolsTheme();

  return (
    <View
      style={
        styles.templateCard
      }>

      <View
        style={
          styles.preview
        }>

        {template.imageUrl ? (
          <Image
            source={{
              uri:
                template.imageUrl,
            }}
            style={
              styles.previewImage
            }
            resizeMode="cover"
          />
        ) : (
          <View
            style={
              styles.previewFallback
            }>

            <FileText
              size={36}
              color={
                C.green
              }
            />

            <Text
              style={
                styles.previewFallbackText
              }>
              RESUME
            </Text>

          </View>
        )}

        {!!template.category && (
          <View
            style={
              styles.categoryBadge
            }>
            <Text
              style={
                styles.categoryText
              }>
              {template.category}
            </Text>
          </View>
        )}

      </View>

      <View
        style={
          styles.templateBody
        }>

        <Text
          style={
            styles.templateTitle
          }
          numberOfLines={2}>
          {template.title}
        </Text>

        <Text
          style={
            styles.templateDescription
          }
          numberOfLines={3}>
          {template.description ||
            'Professional resume template published by the academy.'}
        </Text>

        <Pressable
          onPress={
            onOpen
          }
          style={({pressed}) => [
            styles.openButton,
            !template.fileUrl &&
              styles.openButtonDisabled,
            pressed &&
              styles.pressed,
          ]}>

          <Text
            style={[
              styles.openButtonText,
              !template.fileUrl &&
                styles.openButtonTextDisabled,
            ]}>
            {template.fileUrl
              ? 'Open Template'
              : 'Template Available'}
          </Text>

          <ArrowUpRight
            size={17}
            color={
              template.fileUrl
                ? C.black
                : C.light
            }
          />

        </Pressable>

      </View>

    </View>
  );
}

function StateCard({
  loading = false,
  title,
  description,
  onRetry,
}: {
  loading?: boolean;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  const {
    C,
    styles,
  } = useCareerToolsTheme();

  return (
    <View
      style={
        styles.stateCard
      }>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={
            C.green
          }
        />
      ) : (
        <View
          style={
            styles.stateIcon
          }>
          <FileText
            size={28}
            color={
              C.orange
            }
          />
        </View>
      )}

      <Text
        style={
          styles.stateTitle
        }>
        {title}
      </Text>

      <Text
        style={
          styles.stateDescription
        }>
        {description}
      </Text>

      {!!onRetry && (
        <Pressable
          onPress={
            onRetry
          }
          style={({pressed}) => [
            styles.retryButton,
            pressed &&
              styles.pressed,
          ]}>

          <RefreshCw
            size={16}
            color={
              C.black
            }
          />

          <Text
            style={
              styles.retryButtonText
            }>
            Try Again
          </Text>

        </Pressable>
      )}

    </View>
  );
}

const createStyles = (
  theme: AppTheme,
  C: ReturnType<
    typeof getPalette
  >,
) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        C.bg,
    },

    container: {
      flex: 1,
      backgroundColor:
        C.bg,
    },

    content: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 42,
    },

    header: {
      marginBottom: 21,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      marginBottom: 13,
    },

    eyebrow: {
      color:
        C.green,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 1.8,
    },

    title: {
      marginTop: 6,
      color:
        C.white,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: '900',
      letterSpacing: -0.7,
    },

    titleAccent: {
      color:
        C.orange,
    },

    subtitle: {
      marginTop: 7,
      maxWidth: 335,
      color:
        C.muted,
      fontSize: 12,
      lineHeight: 19,
      fontWeight: '500',
    },

    heroCard: {
      padding: 17,
      borderRadius: 21,
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.strongBorder,
      marginBottom: 23,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity:
        theme.dark
          ? 0.22
          : 0.10,
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
      width: 48,
      height: 48,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.secondarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    heroBadgeText: {
      color:
        C.orange,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.8,
    },

    heroTitle: {
      marginTop: 16,
      color:
        C.white,
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '900',
    },

    heroDescription: {
      marginTop: 7,
      color:
        C.muted,
      fontSize: 10,
      lineHeight: 17,
    },

    heroCountRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginTop: 18,
    },

    heroCount: {
      color:
        C.green,
      fontSize: 29,
      fontWeight: '900',
    },

    heroCountLabel: {
      marginLeft: 9,
      color:
        C.light,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 1,
    },

    sectionHeader: {
      marginBottom: 12,
    },

    sectionTitle: {
      color:
        C.white,
      fontSize: 17,
      fontWeight: '900',
    },

    sectionSubtitle: {
      marginTop: 4,
      color:
        C.muted,
      fontSize: 9,
      lineHeight: 14,
    },

    toolGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
      marginBottom: 17,
    },

    toolCard: {
      width: '48.5%',
      minHeight: 126,
      padding: 13,
      borderRadius: 17,
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.border,
      marginBottom: 10,
    },

    toolIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    toolTitle: {
      marginTop: 12,
      color:
        C.white,
      fontSize: 11,
      fontWeight: '900',
    },

    toolSubtitle: {
      marginTop: 4,
      color:
        C.muted,
      fontSize: 8,
      lineHeight: 13,
    },

    searchCard: {
      padding: 10,
      borderRadius: 17,
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.border,
      marginBottom: 22,
    },

    searchBox: {
      height: 48,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
      borderRadius: 13,
      backgroundColor:
        C.bg,
      borderWidth: 1,
      borderColor:
        C.border,
    },

    searchInput: {
      flex: 1,
      height: '100%',
      color:
        C.white,
      fontSize: 10,
    },

    templateHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      marginBottom: 12,
    },

    refreshButton: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.border,
    },

    stateCard: {
      minHeight: 250,
      paddingHorizontal: 28,
      paddingVertical: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.border,
    },

    stateIcon: {
      width: 60,
      height: 60,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.primarySoft,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    stateTitle: {
      marginTop: 15,
      color:
        C.white,
      fontSize: 16,
      fontWeight: '900',
      textAlign: 'center',
    },

    stateDescription: {
      marginTop: 7,
      maxWidth: 285,
      color:
        C.muted,
      fontSize: 10,
      lineHeight: 17,
      textAlign: 'center',
    },

    retryButton: {
      minHeight: 45,
      marginTop: 17,
      paddingHorizontal: 17,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        C.orange,
    },

    retryButtonText: {
      color:
        C.black,
      fontSize: 11,
      fontWeight: '900',
    },

    templateList: {
      gap: 13,
    },

    templateCard: {
      overflow: 'hidden',
      borderRadius: 20,
      backgroundColor:
        C.card,
      borderWidth: 1,
      borderColor:
        C.border,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity:
        theme.dark
          ? 0.16
          : 0.07,
      shadowRadius: 14,
      elevation: 2,
    },

    preview: {
      height: 178,
      backgroundColor:
        theme.colors.surfaceElevated,
      position: 'relative',
    },

    previewImage: {
      width: '100%',
      height: '100%',
    },

    previewFallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.backgroundAlt,
    },

    previewFallbackText: {
      marginTop: 8,
      color:
        C.light,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.5,
    },

    categoryBadge: {
      position: 'absolute',
      top: 11,
      right: 11,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor:
        theme.dark
          ? 'rgba(5,14,20,0.88)'
          : 'rgba(255,255,255,0.94)',
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    categoryText: {
      color:
        C.green,
      fontSize: 7,
      fontWeight: '900',
      letterSpacing: 0.6,
    },

    templateBody: {
      padding: 15,
    },

    templateTitle: {
      color:
        C.white,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '900',
    },

    templateDescription: {
      marginTop: 6,
      color:
        C.muted,
      fontSize: 9,
      lineHeight: 15,
    },

    openButton: {
      height: 48,
      marginTop: 14,
      borderRadius: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        theme.colors.primary,
      shadowColor:
        theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity:
        theme.dark
          ? 0.18
          : 0.09,
      shadowRadius: 10,
      elevation: 2,
    },

    openButtonDisabled: {
      backgroundColor:
        theme.colors.surfaceElevated,
      borderWidth: 1,
      borderColor:
        C.border,
    },

    openButtonText: {
      color:
        C.black,
      fontSize: 11,
      fontWeight: '900',
    },

    openButtonTextDisabled: {
      color:
        C.light,
    },

    infoCard: {
      marginTop: 17,
      padding: 15,
      borderRadius: 17,
      flexDirection: 'row',
      backgroundColor:
        theme.colors.backgroundAlt,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
    },

    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.secondarySoft,
    },

    infoContent: {
      flex: 1,
      marginLeft: 11,
    },

    infoTitle: {
      color:
        C.white,
      fontSize: 11,
      fontWeight: '900',
    },

    infoDescription: {
      marginTop: 4,
      color:
        C.muted,
      fontSize: 9,
      lineHeight: 15,
    },

    pressed: {
      opacity: 0.84,
    },
  });
