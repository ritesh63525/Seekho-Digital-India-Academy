import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {theme} from '../theme/theme';

type Props = {title: string; subtitle?: string; action?: string; onAction?: () => void};

export default function SectionHeader({title, subtitle, action, onAction}: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action ? <Pressable onPress={onAction}><Text style={styles.action}>{action}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14},
  textWrap: {flex: 1, paddingRight: 12},
  title: {fontSize: 20, lineHeight: 26, fontWeight: '900', color: theme.colors.text},
  subtitle: {fontSize: 12, lineHeight: 18, marginTop: 3, color: theme.colors.textSecondary, fontWeight: '600'},
  action: {fontSize: 12, fontWeight: '900', color: theme.colors.primary},
});

