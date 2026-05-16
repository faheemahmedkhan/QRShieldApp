// app/results.tsx — Results Screen
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, FontFamily, Radius, StatusType, getStatusColors } from '../constants/theme';
import { ScanResult } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ScoreBar from '../components/ScoreBar';

const shapNote = (item: any) => {
  const v = item.value;
  const dir = item.shap_value > 0 ? 'increases risk' : 'reduces risk';
  const notes: Record<string, string> = {
    url_length: `URL is ${v} chars — longer URLs ${item.shap_value > 0 ? 'are more suspicious' : 'are not unusual here'}.`,
    hostname_length: `Hostname is ${v} chars — ${item.shap_value > 0 ? 'abnormally long hostnames can mask phishing domains' : 'a normal hostname length'}.`,
    count_dot: `${v} dot(s) in URL — ${item.shap_value > 0 ? 'many dots may indicate subdomain abuse' : 'a normal number of dots'}.`,
    count_dash: `${v} dash(es) — ${item.shap_value > 0 ? 'dashes are common in brand-spoofing domains' : 'normal dash usage'}.`,
    count_at: `${v} @ symbol(s) — ${item.shap_value > 0 ? '@ can be used to hide the real URL destination' : 'no @ abuse'}.`,
    suspicious_words: v ? `Suspicious keywords found (e.g. "login", "verify") — ${dir}.` : `No suspicious keywords found — ${dir}.`,
    shortening_service: v ? `URL shortener detected — destination is hidden, ${dir}.` : `No URL shortener — ${dir}.`,
    domain_age_days: `Domain is ~${v} days old — ${item.shap_value > 0 ? 'very new domains are a top phishing indicator' : 'older domains are more likely legitimate'}.`,
    whois_available: v ? `WHOIS is public — legitimate transparency signal, ${dir}.` : `WHOIS is hidden — attackers often conceal registration, ${dir}.`,
    dns_resolves: v ? `Domain resolves in DNS — site is live, ${dir}.` : `Domain does not resolve — highly anomalous, ${dir}.`,
    num_ip_addresses: `${v} IP(s) resolved — ${item.shap_value > 0 ? 'single IPs can indicate a newly deployed server' : 'multiple IPs suggest established hosting'}.`,
    has_mx_record: v ? `MX record present — active mail setup, ${dir}.` : `No MX record — purpose-built domains often lack one, ${dir}.`,
    http_status_code: `HTTP status ${v} — ${item.shap_value > 0 ? 'error or unusual status is suspicious' : 'normal response code'}.`,
    redirect_count: `${v} redirect(s) — ${item.shap_value > 0 ? 'excessive redirects can evade security scanners' : 'minimal redirects are expected'}.`,
    ssl_valid: v ? `HTTPS valid — standard for legitimate sites, ${dir}.` : `No HTTPS — unencrypted connection, ${dir}.`,
    uses_https: v ? `Uses HTTPS — encrypted connection, ${dir}.` : `Uses HTTP — no encryption, ${dir}.`,
    checking_ip_address: v ? `Raw IP in URL — very strong phishing signal, ${dir}.` : `Domain name used (not raw IP) — ${dir}.`,
    count_special_chars: `${v} special char(s) — ${item.shap_value > 0 ? 'high count can indicate URL obfuscation' : 'normal level'}.`,
    digit_count: `${v} digit(s) in URL — ${item.shap_value > 0 ? 'many digits can indicate generated phishing domains' : 'normal digit count'}.`,
    abnormal_url: v ? `URL structure is abnormal — hostname mismatch is a spoofing sign, ${dir}.` : `URL structure is normal — ${dir}.`,
    find_dir: `${v} slash(es) (path depth) — ${item.shap_value > 0 ? 'deep paths can mimic legitimate structure' : 'normal path depth'}.`,
    count_per: `${v} percent-encoded char(s) — ${item.shap_value > 0 ? 'encoding can hide malicious strings from filters' : 'minimal encoding, normal'}.`,
    count_ques: `${v} question mark(s) — ${item.shap_value > 0 ? 'unusual query strings are sometimes used in phishing' : 'normal for parameterised URLs'}.`,
    count_equal: `${v} equal sign(s) — ${item.shap_value > 0 ? 'many parameters can hide phishing payloads' : 'typical for a legitimate URL with params'}.`,
    no_of_embed: `${v} embedded URL(s) — ${item.shap_value > 0 ? 'double-slash embedding can confuse parsers' : 'no embedded URL tricks'}.`,
    tld_length: `TLD is ${v} chars — ${item.shap_value > 0 ? 'unusual TLDs sometimes evade blocklists' : 'a common, recognised TLD'}.`,
    fd_length: `First path segment is ${v} chars — ${item.shap_value > 0 ? 'long segments can embed fake folder names' : 'a normal path length'}.`,
  };
  return notes[item.feature] || `Feature "${item.feature.replace(/_/g, ' ')}" = ${v} — ${dir}.`;
};

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
        if (parsed.status === 'SAFE') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else if (parsed.status === 'MALICIOUS') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch { setResult(null); }
    }
  }, [data]);

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
      <View style={[styles.heroBanner, { borderColor: theme.border, backgroundColor: theme.bg }]}>
        <View style={styles.heroTop}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backChip}>
            <Text style={styles.backChipText}>← Scan Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Share.share({ message: `QRShield: ${result.decoded_url ?? 'N/A'} — ${result.status}` })} style={styles.shareChip}>
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
        {result.fusion_mode ? <Text style={styles.fusionMode}>{result.fusion_mode}</Text> : null}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
        {result.decoded_url && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>DECODED URL</Text>
            <View style={styles.urlBox}>
              <Text style={styles.urlText} selectable>{result.decoded_url}</Text>
            </View>
            <TouchableOpacity style={styles.openUrlBtn} onPress={() => result.decoded_url && Linking.openURL(result.decoded_url)}>
              <Text style={styles.openUrlBtnText}>Open URL ↗</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>AI CONFIDENCE SCORES</Text>
          <ScoreBar label="ML Model (XGBoost)" value={result.ml_probability} type="ml" note="Feature-based URL classifier" />
          <ScoreBar label="DL Model (Neural Net)" value={result.dl_probability} type="dl" note="Visual QR image analysis" />
          <ScoreBar label="Fusion Score (Final)" value={result.fusion_score} type="fusion" note={result.fusion_mode ?? ''} />
        </View>

        {result.shap_explanation && result.shap_explanation.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>AI EXPLANATION (SHAP)</Text>
            {result.shap_explanation.slice(0, 6).map((item, i) => {
              const isPos = item.shap_value > 0;
              return (
                <View key={i} style={styles.shapRow}>
                  <View style={[styles.shapDot, { backgroundColor: isPos ? Colors.danger : Colors.success }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.shapFeature}>{item.feature}</Text>
                    <Text style={styles.shapValue}>{shapNote(item)}</Text>
                  </View>
                  <Text style={[styles.shapImpact, { color: isPos ? Colors.danger : Colors.success }]}>
                    {isPos ? '+' : ''}{item.shap_value.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {result.error && (
          <View style={[styles.card, { borderColor: Colors.danger }]}>
            <Text style={[styles.sectionLabel, { color: Colors.danger }]}>ERROR</Text>
            <Text style={{ color: Colors.muted2, fontSize: 12 }}>{result.error}</Text>
          </View>
        )}

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
  root: { flex: 1, backgroundColor: Colors.bg },
  errorText: { fontFamily: FontFamily.sans, color: Colors.muted2, textAlign: 'center', marginTop: 80, fontSize: 16 },
  heroBanner: { marginHorizontal: 16, marginBottom: 4, borderRadius: Radius.xl, borderWidth: 1, padding: 20, gap: 12 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between' },
  backChip: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, paddingVertical: 6 },
  backChipText: { fontFamily: FontFamily.sansSemiBold, fontSize: 12, color: Colors.text },
  shareChip: { backgroundColor: 'rgba(61,132,255,0.12)', borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, paddingVertical: 6 },
  shareChipText: { fontFamily: FontFamily.sansSemiBold, fontSize: 12, color: Colors.accent2 },
  heroEyebrow: { fontFamily: FontFamily.sansBold, fontSize: 9, color: Colors.accent2, letterSpacing: 2 },
  scoreCircleWrap: { alignItems: 'center', marginVertical: 8 },
  scoreCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  scoreCircleNum: { fontFamily: FontFamily.heading, fontSize: 26 },
  scoreCircleLabel: { fontFamily: FontFamily.sansBold, fontSize: 8, color: Colors.muted, letterSpacing: 1.4, marginTop: 2 },
  fusionMode: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.muted, textAlign: 'center' },
  scroll: { flex: 1 },
  card: { backgroundColor: Colors.cardBg, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 20, marginBottom: 12 },
  sectionLabel: { fontFamily: FontFamily.sansBold, fontSize: 10, color: Colors.accent2, letterSpacing: 2, marginBottom: 14 },
  urlBox: { backgroundColor: 'rgba(6,10,18,0.9)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(148,163,184,0.18)', padding: 14 },
  urlText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: Colors.text, lineHeight: 20 },
  openUrlBtn: { marginTop: 12, alignSelf: 'flex-start', backgroundColor: 'rgba(61,132,255,0.1)', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 16, paddingVertical: 8 },
  openUrlBtnText: { fontFamily: FontFamily.sansSemiBold, fontSize: 13, color: Colors.accent2 },
  shapRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  shapDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  shapFeature: { fontFamily: FontFamily.sansBold, fontSize: 13, color: Colors.text, marginBottom: 4 },
  shapValue: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted2, lineHeight: 18 },
  shapImpact: { fontFamily: FontFamily.mono, fontSize: 13, fontWeight: '700' },
  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  ctaPrimary: { flex: 1, backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  ctaPrimaryText: { fontFamily: FontFamily.sansBold, fontSize: 14, color: '#fff' },
  ctaSecondary: { backgroundColor: 'rgba(61,132,255,0.1)', borderRadius: Radius.md, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border2 },
  ctaSecondaryText: { fontFamily: FontFamily.sansBold, fontSize: 14, color: Colors.accent2 },
  backBtn: { marginTop: 24, alignSelf: 'center', padding: 14 },
  backBtnText: { fontFamily: FontFamily.sansSemiBold, color: Colors.accent, fontSize: 15 },
});
