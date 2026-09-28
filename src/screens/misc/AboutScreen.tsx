import React, {
  useMemo,
} from 'react';

import {
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Building2,
  ExternalLink,
  Globe2,
  Lightbulb,
  MapPin,
  Rocket,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react-native';

import ScreenHeader from '../../components/ScreenHeader';
import {academyStats} from '../../data/mockData';

import {
  useTheme,
} from '../../theme/ThemeContext';

import type {
  AppTheme,
} from '../../theme/brandThemes';

function useAboutTheme() {
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

export default function AboutScreen() {
  const {
    theme,
    styles,
  } = useAboutTheme();

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
        title="About the academy"
        subtitle="Build Future with AI & Technology"
      />

      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }>

        {/* HERO */}

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Sparkles
              size={24}
              color={
                theme.colors.primary
              }
              strokeWidth={2.3}
            />
          </View>

          <Text style={styles.heroKicker}>
            SEEKHO DIGITAL INDIA ACADEMY
          </Text>

          <Text style={styles.heroTitle}>
            Empowering India's future with
            world-class technology education.
          </Text>

          <Text style={styles.heroText}>
            Founded by industry professionals
            with a mission to bridge the gap
            between academic learning and
            job-ready technology skills.
          </Text>

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

        {/* STATS */}

        <View style={styles.stats}>
          {academyStats.map(
            item => (
              <View
                key={item.label}
                style={styles.stat}>
                <Text
                  style={
                    styles.statValue
                  }>
                  {item.value}
                </Text>

                <Text
                  style={
                    styles.statLabel
                  }>
                  {item.label}
                </Text>
              </View>
            ),
          )}
        </View>

        {/* STORY */}

        <Section
          title="Our story"
          icon={
            <Building2
              size={19}
              color={
                theme.colors.primary
              }
              strokeWidth={2.2}
            />
          }>
          <Text style={styles.body}>
            Seekho Digital India Academy was
            created around a simple idea:
            learners need more than theory.
            They need practical skills, real
            projects, mentorship and a clear
            path into industry. The academy
            focuses on AI, Machine Learning,
            Data Science, analytics,
            development and digital careers.
          </Text>
        </Section>

        {/* VISION */}

        <Section
          title="Our vision"
          icon={
            <Target
              size={19}
              color={
                theme.colors.secondary
              }
              strokeWidth={2.2}
            />
          }>
          <View style={styles.vision}>
            <View
              style={
                styles.visionIcon
              }>
              <Rocket
                size={20}
                color={
                  theme.colors.primary
                }
                strokeWidth={2.2}
              />
            </View>

            <Text
              style={
                styles.visionText
              }>
              To create a tech-driven India
              where every student has access
              to world-class AI and technology
              education.
            </Text>
          </View>
        </Section>

        {/* VALUES */}

        <Section
          title="What we value"
          icon={
            <Lightbulb
              size={19}
              color={
                theme.colors.primary
              }
              strokeWidth={2.2}
            />
          }>
          <Value
            title="Excellence"
            text="High standards in curriculum, teaching and student outcomes."
          />

          <Value
            title="Community"
            text="A supportive environment where learners grow together."
          />

          <Value
            title="Innovation"
            text="Curriculum that evolves with industry trends and tools."
          />

          <Value
            title="Career impact"
            text="Practical skills, portfolio projects and placement support."
          />
        </Section>

        {/* CONTACT */}

        <View style={styles.contact}>
          <View style={styles.contactTop}>
            <View
              style={
                styles.contactIcon
              }>
              <MapPin
                size={22}
                color={
                  theme.colors.secondary
                }
                strokeWidth={2.2}
              />
            </View>

            <View style={styles.contactHeading}>
              <Text
                style={
                  styles.contactKicker
                }>
                MOHALI, PUNJAB
              </Text>

              <Text
                style={
                  styles.contactTitle
                }>
                Visit or connect with the
                academy.
              </Text>
            </View>
          </View>

          <Text style={styles.contactText}>
            Plot F-204, First Floor, Phase 8B,
            Industrial Area, Sector 74,
            Mohali, Punjab 160055
          </Text>

          <Text style={styles.contactText}>
            +91 98055 81734 • +91 89885 68849
          </Text>

          <Text style={styles.contactText}>
            info@seekhodigitalindia.com
          </Text>

          <Pressable
            onPress={() =>
              Linking.openURL(
                'https://seekhodigitalindia.com/',
              )
            }
            accessibilityRole="button"
            style={({pressed}) => [
              styles.web,
              pressed &&
                styles.pressed,
            ]}>
            <Globe2
              size={17}
              color={
                theme.colors.black
              }
              strokeWidth={2.3}
            />

            <Text
              style={
                styles.webText
              }>
              Open academy website
            </Text>

            <ExternalLink
              size={15}
              color={
                theme.colors.black
              }
              strokeWidth={2.3}
            />
          </Pressable>
        </View>

        <View style={styles.footerBrand}>
          <UsersRound
            size={16}
            color={
              theme.colors.secondary
            }
            strokeWidth={2.2}
          />

          <Text style={styles.footerText}>
            Seekho Digital India Academy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const {
    styles,
  } = useAboutTheme();

  return (
    <View style={styles.section}>
      <View
        style={
          styles.sectionHeading
        }>
        <View
          style={
            styles.sectionIcon
          }>
          {icon}
        </View>

        <Text
          style={
            styles.sectionTitle
          }>
          {title}
        </Text>
      </View>

      <View
        style={
          styles.sectionBody
        }>
        {children}
      </View>
    </View>
  );
}

function Value({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const {
    theme,
    styles,
  } = useAboutTheme();

  return (
    <View style={styles.value}>
      <View
        style={
          styles.valueDotWrap
        }>
        <View
          style={[
            styles.valueDot,
            {
              backgroundColor:
                theme.colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.flex}>
        <Text
          style={
            styles.valueTitle
          }>
          {title}
        </Text>

        <Text
          style={
            styles.valueText
          }>
          {text}
        </Text>
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

    scroll: {
      padding: 18,
      paddingBottom: 36,
    },

    hero: {
      overflow: 'hidden',
      padding: 20,
      borderRadius: 24,
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
          ? 0.22
          : 0.10,
      shadowRadius: 18,
      elevation: 4,
    },

    heroIcon: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        theme.colors.primarySoft,
    },

    heroKicker: {
      marginTop: 15,
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1.05,
    },

    heroTitle: {
      marginTop: 9,
      color:
        theme.colors.textPrimary,
      fontSize: 23,
      lineHeight: 30,
      fontWeight: '900',
      letterSpacing: -0.3,
    },

    heroText: {
      marginTop: 9,
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 18,
      fontWeight: '600',
    },

    heroAccentRow: {
      height: 4,
      marginTop: 18,
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

    stats: {
      marginTop: 12,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'space-between',
    },

    stat: {
      width: '48.5%',
      marginBottom: 9,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    statValue: {
      color:
        theme.colors.primary,
      fontSize: 19,
      fontWeight: '900',
    },

    statLabel: {
      marginTop: 4,
      color:
        theme.colors.textSecondary,
      fontSize: 8,
      fontWeight: '800',
    },

    section: {
      marginTop: 24,
    },

    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    sectionIcon: {
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surfaceSoft,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
    },

    sectionTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },

    sectionBody: {
      marginTop: 11,
    },

    body: {
      color:
        theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 19,
      fontWeight: '600',
    },

    vision: {
      padding: 15,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      borderLeftWidth: 4,
      borderLeftColor:
        theme.colors.primary,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.primarySoft,
    },

    visionIcon: {
      width: 39,
      height: 39,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 12,
      backgroundColor:
        theme.colors.surface,
    },

    visionText: {
      flex: 1,
      color:
        theme.colors.textPrimary,
      fontSize: 12,
      lineHeight: 20,
      fontWeight: '800',
    },

    value: {
      marginBottom: 8,
      padding: 13,
      flexDirection: 'row',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        theme.colors.border,
      backgroundColor:
        theme.colors.surface,
    },

    valueDotWrap: {
      width: 24,
      paddingTop: 4,
      alignItems: 'center',
      marginRight: 6,
    },

    valueDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },

    flex: {
      flex: 1,
    },

    valueTitle: {
      color:
        theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: '900',
    },

    valueText: {
      marginTop: 3,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      fontWeight: '600',
    },

    contact: {
      marginTop: 24,
      padding: 18,
      borderRadius: 22,
      borderWidth: 1,
      borderColor:
        theme.colors.borderStrong,
      backgroundColor:
        theme.colors.surface,
    },

    contactTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
    },

    contactIcon: {
      width: 46,
      height: 46,
      alignItems: 'center',
      justifyContent:
        'center',
      borderRadius: 15,
      backgroundColor:
        theme.colors.secondarySoft,
    },

    contactHeading: {
      flex: 1,
    },

    contactKicker: {
      color:
        theme.colors.primary,
      fontSize: 8,
      fontWeight: '900',
      letterSpacing: 1,
    },

    contactTitle: {
      marginTop: 5,
      color:
        theme.colors.textPrimary,
      fontSize: 18,
      lineHeight: 23,
      fontWeight: '900',
    },

    contactText: {
      marginTop: 8,
      color:
        theme.colors.textSecondary,
      fontSize: 9,
      lineHeight: 15,
      fontWeight: '600',
    },

    web: {
      minHeight: 46,
      marginTop: 15,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
      borderRadius: 13,
      backgroundColor:
        theme.colors.primary,
    },

    webText: {
      color:
        theme.colors.black,
      fontSize: 10,
      fontWeight: '900',
    },

    footerBrand: {
      marginTop: 23,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
    },

    footerText: {
      color:
        theme.colors.textLight,
      fontSize: 9,
      fontWeight: '700',
    },

    pressed: {
      opacity: 0.76,
    },
  });
