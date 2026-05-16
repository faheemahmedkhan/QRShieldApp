// components/Header.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { Colors, FontFamily, Radius } from '../constants/theme';

interface HeaderProps {
  isOnline?: boolean;
}

export default function Header({ isOnline = true }: HeaderProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.header}>
      <View style={styles.topLine} />
      <View style={styles.logoGroup}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logoImg}
          resizeMode="contain"
        />
        <View>
          <Text style={styles.logoText}>QRShield</Text>
          <Text style={styles.logoSub}>ENTERPRISE THREAT INTELLIGENCE</Text>
        </View>
      </View>
      <View style={styles.badge}>
        <Animated.View style={[styles.dot, { opacity: pulse, backgroundColor: isOnline ? Colors.success : Colors.danger }]} />
        <Text style={styles.badgeText}>{isOnline ? 'AI ONLINE' : 'OFFLINE'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: Radius.lg,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accent,
    opacity: 0.6,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImg: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  logoText: {
    fontFamily: FontFamily.heading,
    fontSize: 18,
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  logoSub: {
    fontFamily: FontFamily.sansBold,
    fontSize: 8,
    color: '#7a8faf',
    letterSpacing: 1.2,
    marginTop: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a253c',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 160, 0.35)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 1,
  },
});
