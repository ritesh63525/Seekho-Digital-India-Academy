import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {Course} from '../types/models';
import {theme} from '../theme/theme';

type Props = {
  course: Course;
  onPress: () => void;
  compact?: boolean;
};

export default function CourseCard({
  course,
  onPress,
  compact = false,
}: Props) {
  const visibleTools = compact ? 2 : 3;

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.card,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}>

      {/* TOP / HERO */}

      <View style={styles.hero}>
        <View
          style={[
            styles.accentLine,
            {
              backgroundColor: course.accent,
            },
          ]}
        />

        <View
          style={[
            styles.codeBox,
            {
              borderColor: course.accent,
            },
          ]}>
          <Text
            style={[
              styles.code,
              {
                color: course.accent,
              },
            ]}>
            {course.shortCode}
          </Text>
        </View>

        <View style={styles.heroMeta}>
          <View style={styles.categoryRow}>
            <View
              style={[
                styles.categoryDot,
                {
                  backgroundColor:
                    course.accent,
                },
              ]}
            />

            <Text
              style={[
                styles.category,
                {
                  color: course.accent,
                },
              ]}>
              {course.category.toUpperCase()}
            </Text>
          </View>

          <View style={styles.durationBadge}>
            <Text style={styles.duration}>
              {course.duration}
            </Text>
          </View>
        </View>
      </View>

      {/* BODY */}

      <View style={styles.body}>
        <Text
          numberOfLines={1}
          style={styles.title}>
          {course.title}
        </Text>

        <Text
          numberOfLines={compact ? 2 : 3}
          style={styles.desc}>
          {course.description}
        </Text>

        {/* TOOLS */}

        <View style={styles.tagsRow}>
          {course.tools
            .slice(0, visibleTools)
            .map(tool => (
              <View
                key={tool}
                style={styles.tag}>
                <Text style={styles.tagText}>
                  {tool}
                </Text>
              </View>
            ))}

          {course.tools.length >
          visibleTools ? (
            <View style={styles.moreTag}>
              <Text style={styles.more}>
                +
                {course.tools.length -
                  visibleTools}
              </Text>
            </View>
          ) : null}
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <View style={styles.levelRow}>
            <View
              style={[
                styles.levelDot,
                {
                  backgroundColor:
                    course.accent,
                },
              ]}
            />

            <Text style={styles.level}>
              {course.level}
            </Text>
          </View>

          <View style={styles.exploreRow}>
            <Text
              style={[
                styles.learnMore,
                {
                  color: course.accent,
                },
              ]}>
              Explore
            </Text>

            <Text
              style={[
                styles.arrow,
                {
                  color: course.accent,
                },
              ]}>
              →
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      theme.colors.surface,

    borderRadius: 20,

    marginBottom: 14,

    overflow: 'hidden',

    borderWidth: 1,
    borderColor:
      theme.colors.border,

    ...theme.shadow,
  },

  compact: {
    width: 298,
    marginRight: 14,
    marginBottom: 4,
  },

  pressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  // HERO

  hero: {
    minHeight: 88,

    paddingHorizontal: 15,
    paddingVertical: 15,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',

    backgroundColor:
      theme.colors.surfaceAlt,

    borderBottomWidth: 1,
    borderBottomColor:
      theme.colors.divider,

    position: 'relative',
  },

  accentLine: {
    position: 'absolute',

    left: 0,
    top: 0,
    bottom: 0,

    width: 3,
  },

  codeBox: {
    width: 52,
    height: 52,

    borderRadius: 16,

    backgroundColor:
      theme.colors.surfaceElevated,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  code: {
    fontSize: 15,

    fontWeight: '900',

    letterSpacing: 0.5,
  },

  heroMeta: {
    alignItems: 'flex-end',
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    marginRight: 6,
  },

  category: {
    fontSize: 9,

    fontWeight: '900',

    letterSpacing: 1.1,
  },

  durationBadge: {
    marginTop: 8,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius:
      theme.radius.round,

    backgroundColor:
      theme.colors.surfaceElevated,

    borderWidth: 1,
    borderColor:
      theme.colors.border,
  },

  duration: {
    fontSize: 9,

    color:
      theme.colors.textSecondary,

    fontWeight: '800',
  },

  // BODY

  body: {
    padding: 16,
  },

  title: {
    fontSize: 17,

    color:
      theme.colors.textPrimary,

    fontWeight: '900',
  },

  desc: {
    marginTop: 7,

    fontSize: 12,
    lineHeight: 19,

    color:
      theme.colors.textSecondary,

    fontWeight: '500',
  },

  // TAGS

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    marginTop: 13,
  },

  tag: {
    backgroundColor:
      theme.colors.surfaceAlt,

    borderWidth: 1,
    borderColor:
      theme.colors.border,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius:
      theme.radius.round,

    marginRight: 6,
    marginBottom: 5,
  },

  tagText: {
    fontSize: 9,

    color:
      theme.colors.textSecondary,

    fontWeight: '800',
  },

  moreTag: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  more: {
    fontSize: 9,

    color:
      theme.colors.textLight,

    fontWeight: '900',
  },

  // FOOTER

  footer: {
    marginTop: 13,
    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor:
      theme.colors.divider,

    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  levelDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginRight: 7,
  },

  level: {
    fontSize: 10,

    color:
      theme.colors.textSecondary,

    fontWeight: '700',
  },

  exploreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  learnMore: {
    fontSize: 11,

    fontWeight: '900',
  },

  arrow: {
    marginLeft: 6,

    fontSize: 15,

    fontWeight: '900',
  },
});