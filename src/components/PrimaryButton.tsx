import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import {theme} from '../theme/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'dark' | 'outline' | 'soft';
  compact?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  compact = false,
}: Props) {
  const inactive = disabled || loading;

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.black;

      case 'dark':
        return theme.colors.textPrimary;

      case 'outline':
      case 'soft':
        return theme.colors.primary;

      default:
        return theme.colors.textPrimary;
    }
  };

  const textColor = getTextColor();

  return (
    <Pressable
      disabled={inactive}
      onPress={onPress}
      style={({pressed}) => [
        styles.base,

        compact && styles.compact,

        variant === 'primary' &&
          styles.primary,

        variant === 'dark' &&
          styles.dark,

        variant === 'outline' &&
          styles.outline,

        variant === 'soft' &&
          styles.soft,

        inactive &&
          styles.disabled,

        pressed &&
          !inactive &&
          styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={textColor}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: textColor,
            },
          ]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 15,
    paddingHorizontal: 20,

    alignItems: 'center',
    justifyContent: 'center',
  },

  compact: {
    height: 44,
    borderRadius: 13,
    paddingHorizontal: 16,
  },

  // Main bright green CTA
  primary: {
    backgroundColor: theme.colors.primary,

    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,

    elevation: 5,
  },

  // Dark secondary button
  dark: {
    backgroundColor:
      theme.colors.surfaceElevated,

    borderWidth: 1,
    borderColor:
      theme.colors.borderStrong,
  },

  // Transparent dark-theme outline
  outline: {
    backgroundColor:
      theme.colors.transparent,

    borderWidth: 1.5,
    borderColor:
      theme.colors.primary,
  },

  // Subtle green button
  soft: {
    backgroundColor:
      theme.colors.greenSoft,

    borderWidth: 1,
    borderColor:
      theme.colors.borderStrong,
  },

  disabled: {
    opacity: 0.42,
  },

  pressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.992,
      },
    ],
  },

  text: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.15,
  },
});