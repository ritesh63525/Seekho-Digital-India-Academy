import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme/theme';

type Props = {title: string; message: string; symbol?: string};

export default function EmptyState({title, message, symbol = 'âœ“'}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.symbol}><Text style={styles.symbolText}>{symbol}</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {padding: 28, alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border},
  symbol: {width: 50, height: 50, borderRadius: 16, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center'},
  symbolText: {fontSize: 22, color: theme.colors.primary, fontWeight: '900'},
  title: {fontSize: 17, color: theme.colors.text, fontWeight: '900', marginTop: 14},
  message: {fontSize: 12, lineHeight: 19, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 6},
});

