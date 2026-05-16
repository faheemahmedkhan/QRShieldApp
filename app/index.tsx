// app/index.tsx — Landing Page / Home Screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, FontFamily, Radius } from '../constants/theme';
import Header from '../components/Header';
import { scanQRImage } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch('https://qrshield-backend-3.onrender.com/recent-scans')
      .then(r => setIsOnline(r.ok))
      .catch(() => setIsOnline(false));
  }, []);

  const handleGallery = async () => {
    if (isUploading) return;
    try {
      setIsUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0].uri) {
        const manipulated = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [{ resize: { width: 1024, height: 1024 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        const res = await scanQRImage(manipulated.uri);
        router.push({ pathname: '/results', params: { data: JSON.stringify(res) } });
      }
    } catch (err: any) {
      alert(err?.message ?? 'Gallery upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Header isOnline={isOnline} />
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        
        {/* Hero Section */}
        <LinearGradient
          colors={['rgba(61,132,255,0.1)', 'rgba(10,16,28,0.88)', 'rgba(0,245,160,0.07)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroEyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.heroEyebrow}>SECURITY DASHBOARD</Text>
          </View>
          <Text style={styles.heroTitle}>Professional QR threat analysis with transparent AI insight</Text>
          <Text style={styles.heroDesc}>
            Scan QR codes, inspect shortened links, and review ML, DL, and SHAP results in a clean, executive-style interface.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>INPUT METHODS</Text>

        {/* Input Cards */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Detection</Text>
          <Text style={styles.cardDesc}>Use your device camera to scan and auto-crop QR codes in real-time.</Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/scanner')} disabled={isUploading}>
            <Text style={styles.btnPrimaryText}>📷 Use Camera</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Image File</Text>
          <Text style={styles.cardDesc}>Select a screenshot or image from your gallery to analyze.</Text>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleGallery} disabled={isUploading}>
            {isUploading ? <ActivityIndicator color={Colors.accent2} size="small" /> : <Text style={styles.btnSecondaryText}>🖼️ Upload Image File…</Text>}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DASHBOARD</Text>

        <View style={styles.cardRow}>
          <TouchableOpacity style={[styles.card, styles.halfCard]} onPress={() => router.push('/history')}>
            <Text style={styles.cardTitle}>History</Text>
            <Text style={styles.cardDesc}>View recent scans.</Text>
            <View style={styles.chip}><Text style={styles.chipText}>View ↗</Text></View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, styles.halfCard]} onPress={() => router.push('/about')}>
            <Text style={styles.cardTitle}>About</Text>
            <Text style={styles.cardDesc}>AI intelligence info.</Text>
            <View style={styles.chip}><Text style={styles.chipText}>View ↗</Text></View>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.footer}>© 2026 QRShield Pro Threat Intelligence.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  hero: { borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(61,132,255,0.2)', padding: 28, overflow: 'hidden', marginBottom: 8 },
  heroEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  eyebrowDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent2, shadowColor: Colors.accent2, shadowOpacity: 0.8, shadowRadius: 8 },
  heroEyebrow: { fontFamily: FontFamily.sansBold, fontSize: 10, color: Colors.accent2, letterSpacing: 2.5 },
  heroTitle: { fontFamily: FontFamily.heading, fontSize: 28, color: '#eaf2ff', lineHeight: 34, marginBottom: 14, letterSpacing: -0.5 },
  heroDesc: { fontFamily: FontFamily.sans, fontSize: 14, color: Colors.muted2, lineHeight: 22 },
  sectionLabel: { fontFamily: FontFamily.sansBold, fontSize: 10, color: Colors.accent2, letterSpacing: 2, marginTop: 12, marginBottom: 4, marginLeft: 2 },
  card: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 20 },
  cardTitle: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Colors.text, marginBottom: 6 },
  cardDesc: { fontFamily: FontFamily.sans, fontSize: 13, color: Colors.muted, lineHeight: 20, marginBottom: 16 },
  btnPrimary: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnPrimaryText: { fontFamily: FontFamily.sansBold, fontSize: 14, color: '#fff' },
  btnSecondary: { backgroundColor: 'rgba(16,26,44,0.9)', borderWidth: 1, borderColor: 'rgba(61,132,255,0.25)', borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  btnSecondaryText: { fontFamily: FontFamily.sansBold, fontSize: 14, color: Colors.text },
  cardRow: { flexDirection: 'row', gap: 12 },
  halfCard: { flex: 1, marginBottom: 0 },
  chip: { alignSelf: 'flex-start', backgroundColor: 'rgba(61,132,255,0.1)', borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border2 },
  chipText: { fontFamily: FontFamily.sansSemiBold, fontSize: 12, color: Colors.accent2 },
  footer: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.muted, textAlign: 'center', marginTop: 24 },
});
