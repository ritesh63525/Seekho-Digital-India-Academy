import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import BrandLogo from './BrandLogo';
import {theme} from '../theme/theme';

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  showBrand?: boolean;
  rightLabel?: string;
  onRightPress?: () => void;
};

export default function ScreenHeader({title, subtitle, back = false, showBrand = false, rightLabel, onRightPress}: Props) {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.row}>
        {back ? (
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
            <Text style={styles.backText}>â€¹</Text>
          </Pressable>
        ) : null}
        <View style={styles.center}>
          {showBrand ? <BrandLogo compact /> : null}
          {!showBrand && title ? <Text numberOfLines={1} style={styles.title}>{title}</Text> : null}
          {!showBrand && subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {rightLabel ? (
          <Pressable onPress={onRightPress} style={styles.rightButton}>
            <Text style={styles.rightText}>{rightLabel}</Text>
          </Pressable>
        ) : <View style={styles.rightSpacer} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {backgroundColor: theme.colors.surface},
  row: {minHeight: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border},
  backButton: {width: 40, height: 40, borderRadius: 13, backgroundColor: theme.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: 10},
  backText: {fontSize: 34, lineHeight: 34, color: theme.colors.navy, marginTop: -2},
  center: {flex: 1, justifyContent: 'center'},
  title: {fontSize: 18, color: theme.colors.text, fontWeight: '900'},
  subtitle: {fontSize: 12, marginTop: 2, color: theme.colors.textSecondary, fontWeight: '600'},
  rightButton: {minWidth: 42, height: 38, paddingHorizontal: 8, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  rightText: {fontSize: 12, color: theme.colors.primary, fontWeight: '900'},
  rightSpacer: {width: 42},
});

