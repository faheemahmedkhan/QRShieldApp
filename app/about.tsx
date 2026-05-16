// app/about.tsx — About / Info Screen
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Radius } from '../constants/theme';

const LINKS = [
  { label: '🌐 Live Web App', url: 'https://qrshieldpro.com/' },
  { label: '🔒 Privacy Policy', url: 'https://qrshieldpro.com/privacy' },
  { label: '📋 Terms of Service', url: 'https://qrshieldpro.com/terms' },
  { label: '📬 Contact Us', url: 'https://qrshieldpro.com/contact' },
];

const FEATURES = [
  { icon: '🔍', title: 'Live QR Scanning', desc: 'Real-time camera detection with a precise viewfinder overlay.' },
  { icon: '🤖', title: 'Dual AI Models', desc: 'XGBoost ML + Neural Net DL models fused for superior accuracy.' },
  { icon: '📊', title: 'SHAP Explainability', desc: 'See exactly which features made the AI reach its verdict.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Cloud-powered analysis in under 2 seconds.' },
  { icon: '🛡️', title: 'Enterprise Grade', desc: 'The same intelligence engine used on qrshieldpro.com.' },
];

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>About QRShield</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>QRShield Pro</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.heroDesc}>Enterprise-grade QR threat intelligence powered by dual AI models (ML + DL) with transparent SHAP explanations.</Text>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>POWERED BY QRSHIELDPRO.COM</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>FEATURES</Text>
        {FEATURES.map((f, i) => (
          <View key={i} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.sectionLabel}>RISK SCALE</Text>
        <View style={styles.card}>
          {[
            { color: Colors.success, label: 'SAFE', desc: 'Fusion score < 30% — URL is benign.' },
            { color: Colors.warn, label: 'SUSPICIOUS', desc: 'Score 30–60% — Treat with caution.' },
            { color: Colors.danger, label: 'MALICIOUS', desc: 'Score > 60% — Do NOT open this URL.' },
          ].map((item, i) => (
            <View key={i} style={[styles.riskRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
              <View style={[styles.riskDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={[styles.riskLabel, { color: item.color }]}>{item.label}</Text>
                <Text style={styles.riskDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>LINKS</Text>
        {LINKS.map((link, i) => (
          <TouchableOpacity key={i} style={styles.linkRow} onPress={() => Linking.openURL(link.url)}>
            <Text style={styles.linkText}>{link.label}</Text>
            <Text style={styles.linkArrow}>↗</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.footer}>© 2025 QRShield Pro. All rights reserved.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(61,132,255,0.1)', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border2 },
  backBtnText: { fontFamily: FontFamily.sansSemiBold, fontSize: 13, color: Colors.accent2 },
  title: { fontFamily: FontFamily.heading, fontSize: 20, color: Colors.text },
  content: { paddingHorizontal: 16, paddingTop: 4, gap: 8 },
  heroCard: { backgroundColor: Colors.cardBg, borderRadius: Radius.xl, borderWidth: 1, borderColor: Colors.border, padding: 28, alignItems: 'center', marginBottom: 8, gap: 10 },
  logo: { width: 80, height: 80, borderRadius: 20, marginBottom: 4 },
  appName: { fontFamily: FontFamily.heading, fontSize: 26, color: Colors.text, letterSpacing: -0.5 },
  appVersion: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted, backgroundColor: Colors.cardBg, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 4 },
  heroDesc: { fontFamily: FontFamily.sans, fontSize: 14, color: Colors.muted2, textAlign: 'center', lineHeight: 22, marginTop: 4 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  eyebrowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent2 },
  eyebrowText: { fontFamily: FontFamily.sansBold, fontSize: 9, color: Colors.accent2, letterSpacing: 1.5 },
  sectionLabel: { fontFamily: FontFamily.sansBold, fontSize: 10, color: Colors.accent2, letterSpacing: 2, marginTop: 12, marginBottom: 8, marginLeft: 2 },
  featureRow: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 16, gap: 14, alignItems: 'flex-start', marginBottom: 6 },
  featureIcon: { fontSize: 22 },
  featureTitle: { fontFamily: FontFamily.sansBold, fontSize: 14, color: Colors.text, marginBottom: 4 },
  featureDesc: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted, lineHeight: 18 },
  card: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 8 },
  riskRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  riskDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  riskLabel: { fontFamily: FontFamily.sansBold, fontSize: 13, letterSpacing: 1, marginBottom: 2 },
  riskDesc: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted, lineHeight: 18 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.cardBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 6 },
  linkText: { fontFamily: FontFamily.sansSemiBold, fontSize: 14, color: Colors.text },
  linkArrow: { fontFamily: FontFamily.sansBold, fontSize: 16, color: Colors.accent },
  footer: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.muted, textAlign: 'center', lineHeight: 18, marginTop: 20 },
});
