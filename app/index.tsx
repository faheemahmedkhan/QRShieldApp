// app/index.tsx — Live Camera QR Scanner Screen
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Pressable,
  ActivityIndicator, Alert, Dimensions, ScrollView
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Radius } from '@/constants/theme';
import Header from '@/components/Header';
import ScanFrame from '@/components/ScanFrame';
import { scanQRImage } from '@/services/api';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type ScanState = 'idle' | 'found' | 'uploading' | 'error';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [hint, setHint] = useState('Point camera at a QR code');
  const [isOnline, setIsOnline] = useState(true);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isProcessing = useRef(false);

  // Check backend status on mount
  useEffect(() => {
    fetch('https://qrshield-backend-3.onrender.com/recent-scans')
      .then(r => setIsOnline(r.ok))
      .catch(() => setIsOnline(false));
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (isProcessing.current || scanState !== 'idle') return;
      setScanState('found');
      setHint('✅ QR detected — tap Capture!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [scanState]
  );

  const handleCapture = async () => {
    if (isProcessing.current || !cameraRef.current) return;
    isProcessing.current = true;

    try {
      setScanState('uploading');
      setHint('⬆ Uploading to AI server…');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.92,
        skipProcessing: false,
      });

      if (!photo?.uri) throw new Error('Failed to capture photo');

      // Resize to 1280×1280 for consistent processing
      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1280, height: 1280 } }],
        { compress: 0.92, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Send to backend
      const result = await scanQRImage(manipulated.uri);

      // Navigate to results
      router.push({
        pathname: '/results',
        params: { data: JSON.stringify(result) },
      });

    } catch (err: any) {
      setScanState('error');
      setHint('❌ ' + (err?.message ?? 'Upload failed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => {
        setScanState('idle');
        setHint('Point camera at a QR code');
        isProcessing.current = false;
      }, 3000);
      return;
    }

    isProcessing.current = false;
  };

  const resetScanner = () => {
    if (isProcessing.current) return;
    setScanState('idle');
    setHint('Point camera at a QR code');
    isProcessing.current = false;
  };

  // ── Permission not yet granted ────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header isOnline={isOnline} />
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Header isOnline={isOnline} />
        <View style={styles.center}>
          <Text style={styles.permTitle}>Camera Access Required</Text>
          <Text style={styles.permSub}>
            QRShield needs your camera to scan QR codes for threat analysis.
          </Text>
          <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>Grant Camera Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <Header isOnline={isOnline} />

      {/* Camera Section */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={
            scanState === 'idle' || scanState === 'found'
              ? handleBarcodeScanned
              : undefined
          }
        />

        {/* Dark overlay */}
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {/* Top dim */}
          <View style={styles.dimTop} />
          {/* Middle row */}
          <View style={styles.dimRow}>
            <View style={styles.dimSide} />
            {/* Clear frame area — ScanFrame fills this */}
            <ScanFrame
              state={
                scanState === 'uploading' ? 'uploading' :
                scanState === 'found' ? 'found' :
                'scanning'
              }
            />
            <View style={styles.dimSide} />
          </View>
          {/* Bottom dim */}
          <View style={styles.dimBottom} />
        </View>

        {/* Top bar inside camera */}
        <View style={[styles.camTopBar, { top: 12 }]}>
          <View style={styles.liveDot} />
          <Text style={styles.camTitle}>QRShield</Text>
          <View style={{ flex: 1 }} />
          {/* History button */}
          <TouchableOpacity
            style={styles.camNavBtn}
            onPress={() => router.push('/history')}
          >
            <Text style={styles.camNavBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.camNavBtn}
            onPress={() => router.push('/about')}
          >
            <Text style={styles.camNavBtnText}>About</Text>
          </TouchableOpacity>
        </View>

        {/* Guide label above frame */}
        <View style={styles.guideLabelWrap} pointerEvents="none">
          <Text style={[
            styles.guideLabel,
            scanState === 'found' && { color: '#00ff88' },
            scanState === 'uploading' && { color: Colors.accent },
          ]}>
            Align QR code inside the frame
          </Text>
        </View>

        {/* Bottom bar */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.bottomBar}
        >
          <Text style={[
            styles.hint,
            scanState === 'found' && { color: '#00ff88' },
            scanState === 'uploading' && { color: Colors.accent },
            scanState === 'error' && { color: Colors.danger },
          ]}>
            {hint}
          </Text>

          <View style={styles.btnRow}>
            {/* Cancel / Reset */}
            <TouchableOpacity style={styles.cancelBtn} onPress={resetScanner}>
              <Text style={styles.cancelBtnText}>✕ Reset</Text>
            </TouchableOpacity>

            {/* Shutter button */}
            <TouchableOpacity
              style={[
                styles.shutter,
                scanState === 'found' && styles.shutterReady,
                (scanState === 'uploading') && styles.shutterDisabled,
              ]}
              onPress={handleCapture}
              disabled={scanState === 'uploading'}
              activeOpacity={0.8}
            >
              {scanState === 'uploading' ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <View style={styles.shutterInner} />
              )}
            </TouchableOpacity>

            {/* About / spacer */}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.push('/history')}>
              <Text style={styles.cancelBtnText}>📋 Scans</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const FRAME_SIZE = width * 0.72;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  permTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 22,
    color: Colors.text,
    textAlign: 'center',
  },
  permSub: {
    fontFamily: FontFamily.sans,
    fontSize: 15,
    color: Colors.muted2,
    textAlign: 'center',
    lineHeight: 22,
  },
  permBtn: {
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 12,
  },
  permBtnText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 15,
    color: '#fff',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 0,
  },
  dimTop: {
    height: (height - FRAME_SIZE) / 2 - 40,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  dimRow: {
    flexDirection: 'row',
    height: FRAME_SIZE,
  },
  dimSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  dimBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  camTopBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 10,
    zIndex: 10,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#ff3b3b',
  },
  camTitle: {
    fontFamily: FontFamily.heading,
    fontSize: 16,
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  camNavBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  camNavBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: '#fff',
  },
  guideLabelWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: (height - FRAME_SIZE) / 2 - 76,
    alignItems: 'center',
    zIndex: 10,
  },
  guideLabel: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.4,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 48,
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  hint: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    minHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    width: '100%',
  },
  cancelBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: Radius.full,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
    color: '#fff',
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterReady: {
    borderColor: '#00ff88',
    shadowColor: '#00ff88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  shutterDisabled: {
    opacity: 0.5,
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#333',
  },
});
