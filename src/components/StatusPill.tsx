import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme/theme';

type Props = {label: string; tone?: 'orange' | 'green' | 'blue' | 'red' | 'neutral'};

const tones = {
  orange: {bg: theme.colors.primarySoft, fg: theme.colors.primaryDark},
  green: {bg: theme.colors.greenSoft, fg: theme.colors.green},
  blue: {bg: theme.colors.blueSoft, fg: theme.colors.blue},
  red: {bg: theme.colors.redSoft, fg: theme.colors.red},
  neutral: {bg: theme.colors.surfaceMuted, fg: theme.colors.textSecondary},
};

export default function StatusPill({label, tone = 'neutral'}: Props) {
  const color = tones[tone];
  return <View style={[styles.wrap, {backgroundColor: color.bg}]}><Text style={[styles.text, {color: color.fg}]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  wrap: {paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, alignSelf: 'flex-start'},
  text: {fontSize: 10, fontWeight: '900'},
});

