// app/results.tsx — Results Screen
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Share, Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, StatusType, getStatusColors } from '@/constants/theme';
import { ScanResult } from '@/services/api';
import StatusBadge from '@/components/StatusBadge';
import ScoreBar from '@/components/ScoreBar';

const { width } = Dimensions.get('window');

export default function ResultsScreen() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<ScanResult | null>(null);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data) as ScanResult;
        setResult(parsed);
        // Haptic feedback based on status
        if (parsed.status === 'SAFE') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else if (parsed.status === 'MALICIOUS') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      } catch {
        setResult(null);
      }
    }
  }, [data]);

  const handleOpenURL = () => {
    if (result?.decoded_url) {
      Linking.openURL(result.decoded_url).catch(() => {});
    }
  };

  const handleShare = () => {
    if (!result) return;
    Share.share({
      message: `QRShield Analysis\n\nURL: ${result.decoded_url ?? 'N/A'}\nStatus: ${result.status}\nFusion Score: ${Math.round(result.fusion_score * 100)}%\n\nAnalyzed by QRShield Pro`,
      title: 'QRShield Scan Result',
    });
  };

  if (!result) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No result data found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Scan Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = (result.status ?? 'UNKNOWN') as StatusType;
  const theme = getStatusColors(status);
  const pct = Math.round(result.fusion_score * 100);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Hero status banner */}
      <View style={[styles.heroBanner, { borderColor: theme.border, backgroundColor: theme.bg }]}>
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backChip}>
            <Text style={styles.backChipText}>← Scan Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.shareChip}>
            <Text style={styles.shareChipText}>Share ↗</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.heroEyebrow}>THREAT ANALYSIS COMPLETE</Text>
        <StatusBadge status={status} size="lg" />

        <View style={styles.scoreCircleWrap}>
          <View style={[styles.scoreCircle, { borderColor: theme.color }]}>
            <Text style={[styles.scoreCircleNum, { color: theme.color }]}>{pct}%</Text>
            <Text style={styles.scoreCircleLabel}>RISK SCORE</Text>
          </View>
        </View>

        {result.fusion_mode ? (
          <Text style={styles.fusionMode}>{result.fusion_mode}</Text>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Decoded URL */}
        {result.decoded_url && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>DECODED URL</Text>
            <View style={styles.urlBox}>
              <View style={styles.urlAccentLine} />
              <Text style={styles.urlText} selectable>{result.decoded_url}</Text>
            </View>
            {result.is_short_url && (
              <View style={styles.warningChip}>
                <Text style={styles.warningChipText}>⚠️ Short URL detected — destination unknown</Text>
              </View>
            )}
            <TouchableOpacity style={styles.openUrlBtn} onPress={handleOpenURL}>
              <Text style={styles.openUrlBtnText}>Open URL ↗</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Score Bars */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>AI CONFIDENCE SCORES</Text>
          <ScoreBar
            label="ML Model (XGBoost)"
            value={result.ml_probability}
            type="ml"
            note="Feature-based URL classifier"
          />
          <ScoreBar
            label="DL Model (Neural Net)"
            value={result.dl_probability}
            type="dl"
            note="Visual QR image analysis"
          />
          <ScoreBar
            label="Fusion Score (Final)"
            value={result.fusion_score}
            type="fusion"
            note={result.fusion_mode ?? 'Adaptive weighted combination'}
          />
        </View>

        {/* SHAP Explanation */}
        {result.shap_explanation && result.shap_explanation.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>AI EXPLANATION (SHAP)</Text>
            <Text style={styles.shapSubtitle}>Top features influencing this prediction:</Text>
            {result.shap_explanation.slice(0, 8).map((item, i) => {
              const isPositive = item.shap_value > 0;
              return (
                <View key={i} style={styles.shapRow}>
                  <View style={[styles.shapDot, { backgroundColor: isPositive ? Colors.danger : Colors.success }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shapFeature}>{item.feature}</Text>
                    <Text style={styles.shapValue}>
                      Value: {typeof item.value === 'number' ? item.value.toFixed(4) : item.value}
                      {'  '}|{'  '}
                      Impact: {isPositive ? '+' : ''}{item.shap_value.toFixed(4)}
                    </Text>
                  </View>
                  <View style={[styles.shapImpactBar, {
                    width: Math.min(48, Math.abs(item.shap_value) * 200),
                    backgroundColor: isPositive ? Colors.danger : Colors.success,
                    opacity: 0.7,
                  }]} />
                </View>
              );
            })}
          </View>
        )}

        {/* Note */}
        {result.note && (
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>ℹ️ {result.note}</Text>
          </View>
        )}

        {/* Error */}
        {result.error && (
          <View style={[styles.noteCard, { borderColor: Colors.danger, backgroundColor: 'rgba(255,61,107,0.07)' }]}>
            <Text style={[styles.noteText, { color: Colors.danger }]}>⚠️ {result.error}</Text>
          </View>
        )}

        {/* CTA Buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity style={styles.ctaPrimary} onPress={() => router.replace('/')}>
            <Text style={styles.ctaPrimaryText}>📷 Scan Another</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.ctaSecondary} onPress={() => router.push('/history')}>
            <Text style={styles.ctaSecondaryText}>📋 History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  errorText: {
    fontFamily: FontFamily.sans,
    color: Colors.muted2,
    textAlign: 'center',
    marginTop: 80,
    fontSize: 16,
  },
  heroBanner: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 16,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backChip: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  backChipText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: Colors.text,
  },
  shareChip: {
    backgroundColor: 'rgba(61,132,255,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  shareChipText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: Colors.accent2,
  },
  heroEyebrow: {
    fontFamily: FontFamily.sansBold,
    fontSize: 9,
    color: Colors.accent2,
    letterSpacing: 2,
  },
  scoreCircleWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  scoreCircleNum: {
    fontFamily: FontFamily.heading,
    fontSize: 26,
    fontWeight: '800',
  },
  scoreCircleLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: 8,
    color: Colors.muted,
    letterSpacing: 1.4,
    marginTop: 2,
  },
  fusionMode: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.muted,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: FontFamily.sansBold,
    fontSize: 10,
    color: Colors.accent2,
    letterSpacing: 2,
    marginBottom: 14,
  },
  urlBox: {
    backgroundColor: 'rgba(6, 10, 18, 0.9)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.18)',
    padding: 14,
    paddingLeft: 18,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  urlAccentLine: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  urlText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
    paddingLeft: 8,
  },
  warningChip: {
    marginTop: 10,
    backgroundColor: 'rgba(255,184,54,0.1)',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,184,54,0.3)',
    padding: 10,
  },
  warningChipText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.warn,
  },
  openUrlBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(61,132,255,0.1)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border2,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  openUrlBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 13,
    color: Colors.accent2,
  },
  shapSubtitle: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 12,
  },
  shapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  shapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  shapFeature: {
    fontFamily: FontFamily.sansSemiBold,
    fontSize: 12,
    color: Colors.text,
  },
  shapValue: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    color: Colors.muted,
    marginTop: 2,
  },
  shapImpactBar: {
    height: 6,
    borderRadius: 3,
    flexShrink: 0,
  },
  noteCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(61,132,255,0.05)',
    padding: 14,
  },
  noteText: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    color: Colors.muted2,
    lineHeight: 18,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  ctaPrimary: {
    flex: 1,
    backgroundColor: Colors.accent,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaPrimaryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 14,
    color: '#fff',
  },
  ctaSecondary: {
    backgroundColor: 'rgba(61,132,255,0.1)',
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border2,
  },
  ctaSecondaryText: {
    fontFamily: FontFamily.sansBold,
    fontSize: 14,
    color: Colors.accent2,
  },
  backBtn: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 14,
  },
  backBtnText: {
    fontFamily: FontFamily.sansSemiBold,
    color: Colors.accent,
    fontSize: 15,
  },
});
