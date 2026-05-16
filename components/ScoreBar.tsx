// components/ScoreBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontFamily } from '../constants/theme';

interface ScoreBarProps {
  label: string;
  value: number;
  type: 'ml' | 'dl' | 'fusion';
  note?: string;
}

const BAR_COLORS = {
  ml:     '#a855f7',
  dl:     '#f43f5e',
  fusion: '#00f5a0',
};

export default function ScoreBar({ label, value, type, note }: ScoreBarProps) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value,
      duration: 900,
      delay: 150,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const pct = Math.round(value * 100);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{pct}%</Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[styles.fill, { backgroundColor: BAR_COLORS[type], width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
      </View>
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  label: { fontFamily: FontFamily.sansBold, fontSize: 11, color: Colors.muted2, letterSpacing: 1.4, textTransform: 'uppercase' },
  value: { fontFamily: FontFamily.heading, fontSize: 15, color: Colors.text },
  track: { height: 10, backgroundColor: 'rgba(4, 8, 16, 0.95)', borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(61, 132, 255, 0.1)' },
  fill: { height: '100%', borderRadius: 999 },
  note: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted, marginTop: 7, lineHeight: 18 },
});
