import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import {AppProvider} from './src/state/AppContext';
import {
  ThemeProvider,
  useTheme,
} from './src/theme/ThemeContext';

function AppContent() {
  const {theme} = useTheme();

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={
          theme.dark
            ? 'light-content'
            : 'dark-content'
        }
      />

      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
