import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  darkTheme,
  getTheme,
} from './brandThemes';

import type {
  AppTheme,
  AppThemeMode,
} from './brandThemes';

const THEME_STORAGE_KEY =
  '@seekho/theme_mode_v1';

type ThemeContextValue = {
  mode: AppThemeMode;
  theme: AppTheme;
  isThemeReady: boolean;

  setThemeMode: (
    mode: AppThemeMode,
  ) => void;

  toggleTheme: () => void;
};

const ThemeContext =
  createContext<
    ThemeContextValue | undefined
  >(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    mode,
    setMode,
  ] =
    useState<AppThemeMode>(
      'dark',
    );

  const [
    isThemeReady,
    setIsThemeReady,
  ] = useState(false);

  useEffect(() => {
    let active = true;

    const restoreTheme =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              THEME_STORAGE_KEY,
            );

          if (!active) {
            return;
          }

          if (
            stored === 'light' ||
            stored === 'dark'
          ) {
            setMode(stored);
          }
        } catch {
          // Theme storage failure is non-critical.
        } finally {
          if (active) {
            setIsThemeReady(true);
          }
        }
      };

    void restoreTheme();

    return () => {
      active = false;
    };
  }, []);

  const setThemeMode =
    useCallback(
      (
        nextMode:
          AppThemeMode,
      ) => {
        setMode(nextMode);

        void AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          nextMode,
        ).catch(() => {
          // Non-critical.
        });
      },
      [],
    );

  const toggleTheme =
    useCallback(() => {
      setMode(
        (
          current:
            AppThemeMode,
        ) => {
          const next:
            AppThemeMode =
            current === 'dark'
              ? 'light'
              : 'dark';

          void AsyncStorage.setItem(
            THEME_STORAGE_KEY,
            next,
          ).catch(() => {
            // Non-critical.
          });

          return next;
        },
      );
    }, []);

  const theme =
    useMemo<AppTheme>(
      () => getTheme(mode),
      [mode],
    );

  const value =
    useMemo<ThemeContextValue>(
      () => ({
        mode,
        theme,
        isThemeReady,
        setThemeMode,
        toggleTheme,
      }),
      [
        mode,
        theme,
        isThemeReady,
        setThemeMode,
        toggleTheme,
      ],
    );

  return (
    <ThemeContext.Provider
      value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme():
  ThemeContextValue {
  const context =
    useContext(
      ThemeContext,
    );

  if (!context) {
    throw new Error(
      'useTheme must be used inside ThemeProvider',
    );
  }

  return context;
}

export const defaultTheme:
  AppTheme =
  darkTheme;
