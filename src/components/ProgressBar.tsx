import React from 'react';
import {StyleSheet, View} from 'react-native';
import {theme} from '../theme/theme';

type Props = {value: number; color?: string; height?: number};

export default function ProgressBar({value, color = theme.colors.primary, height = 8}: Props) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, {height}]}>
      <View style={[styles.fill, {width: `${safe}%`, backgroundColor: color}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {borderRadius: 999, overflow: 'hidden', backgroundColor: theme.colors.surfaceMuted},
  fill: {height: '100%', borderRadius: 999},
});

