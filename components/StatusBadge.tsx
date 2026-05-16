// components/StatusBadge.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontFamily, Radius, StatusType, getStatusColors } from '@/constants/theme';

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const theme = getStatusColors(status);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'MALICIOUS') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.2, duration: 700, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [status]);

  const textSize = size === 'lg' ? 18 : size === 'sm' ? 11 : 14;
  const padH = size === 'lg' ? 24 : size === 'sm' ? 10 : 16;
  const padV = size === 'lg' ? 14 : size === 'sm' ? 6 : 10;
  const dotSize = size === 'lg' ? 12 : size === 'sm' ? 7 : 9;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
          paddingHorizontal: padH,
          paddingVertical: padV,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: theme.color,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            opacity: status === 'MALICIOUS' ? pulse : 1,
            shadowColor: theme.color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 6,
            elevation: 4,
          },
        ]}
      />
      <Text style={[styles.label, { color: theme.color, fontSize: textSize }]}>
        {theme.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {},
  label: {
    fontFamily: FontFamily.heading,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
