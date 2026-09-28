import React from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

type Props = {
  compact?: boolean;
  inverse?: boolean;
};

export default function BrandLogo({
  compact = false,
}: Props) {
  return (
    <View
      style={[
        styles.container,
        compact && styles.containerCompact,
      ]}>
      <Image
        source={require('../assets/seekho-logo.png')}
        style={[
          styles.logo,
          compact && styles.logoCompact,
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 210,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },

  containerCompact: {
    width: 130,
    height: 75,
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  logoCompact: {
    width: '100%',
    height: '100%',
  },
});