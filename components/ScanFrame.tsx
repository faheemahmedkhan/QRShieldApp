// components/ScanFrame.tsx
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors } from '../constants/theme';

const { width } = Dimensions.get('window');
const FRAME_SIZE = width * 0.72;
const ARM = FRAME_SIZE * 0.14;

interface ScanFrameProps {
  state: 'scanning' | 'found' | 'uploading';
}

export default function ScanFrame({ state }: ScanFrameProps) {
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === 'scanning') {
      const anim = Animated.loop(
        Animated.timing(scanLine, { toValue: 1, duration: 2000, useNativeDriver: true })
      );
      anim.start();
      return () => anim.stop();
    } else {
      scanLine.setValue(0);
    }
  }, [state]);

  const cornerColor = state === 'found' ? '#00ff88' : state === 'uploading' ? Colors.accent : '#ffffff';
  const frameBg = state === 'found' ? 'rgba(0, 255, 136, 0.07)' : state === 'uploading' ? 'rgba(61, 132, 255, 0.10)' : 'transparent';
  const scanLineY = scanLine.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME_SIZE] });

  return (
    <View style={[styles.frame, { backgroundColor: frameBg }]}>
      <View style={[styles.corner, styles.tl, { borderColor: cornerColor }]} />
      <View style={[styles.corner, styles.tr, { borderColor: cornerColor }]} />
      <View style={[styles.corner, styles.bl, { borderColor: cornerColor }]} />
      <View style={[styles.corner, styles.br, { borderColor: cornerColor }]} />
      {state === 'scanning' && (
        <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: FRAME_SIZE, height: FRAME_SIZE, overflow: 'hidden' },
  corner: { position: 'absolute', width: ARM, height: ARM, borderWidth: 4, borderRadius: 4 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: 'rgba(61, 132, 255, 0.75)' },
});

export { FRAME_SIZE };
