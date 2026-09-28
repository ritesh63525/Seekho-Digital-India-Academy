import React from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Moon,
  Sun,
} from 'lucide-react-native';

import {
  useTheme,
} from '../theme/ThemeContext';

export default function ThemeToggle() {
  const {
    mode,
    theme,
    setThemeMode,
  } = useTheme();

  const colors =
    theme.colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.surfaceSoft,
          borderColor:
            colors.border,
        },
      ]}>

      <Pressable
        onPress={() =>
          setThemeMode('light')
        }
        style={[
          styles.option,
          mode === 'light' && {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.borderStrong,
          },
        ]}>

        <Sun
          size={17}
          strokeWidth={2.2}
          color={
            mode === 'light'
              ? colors.primary
              : colors.iconMuted
          }
        />

        <Text
          style={[
            styles.label,
            {
              color:
                mode === 'light'
                  ? colors.textPrimary
                  : colors.textSecondary,
            },
          ]}>
          Light
        </Text>
      </Pressable>

      <Pressable
        onPress={() =>
          setThemeMode('dark')
        }
        style={[
          styles.option,
          mode === 'dark' && {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.borderStrong,
          },
        ]}>

        <Moon
          size={17}
          strokeWidth={2.2}
          color={
            mode === 'dark'
              ? colors.secondary
              : colors.iconMuted
          }
        />

        <Text
          style={[
            styles.label,
            {
              color:
                mode === 'dark'
                  ? colors.textPrimary
                  : colors.textSecondary,
            },
          ]}>
          Dark
        </Text>
      </Pressable>

    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      borderWidth: 1,
      borderRadius: 16,
      padding: 4,
    },

    option: {
      flex: 1,
      minHeight: 45,
      borderWidth: 1,
      borderColor:
        'transparent',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
    },

    label: {
      fontSize: 12,
      fontWeight: '800',
      marginLeft: 7,
    },
  });
