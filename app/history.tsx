// app/history.tsx — Recent Scans History Screen
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, Radius, StatusType, getStatusColors } from '../constants/theme';
import { getRecentScans, RecentScan } from '../services/api';

export default function HistoryScreen() {
  const [scans, setScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const loadScans = useCallback(async () => {
    try {
      setError(null);
      const data = await getRecentScans();
      setScans(data);
    } catch {
      setError('Could not load scan history. Check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadScans(); }, []);

  const renderItem = ({ item, index }: { item: RecentScan; index: number }) => {
    const status = (item.status ?? 'UNKNOWN') as StatusType;
    const theme = getStatusColors(status);
    return (
      <View style={[styles.row, { borderLeftColor: theme.color }]}>
        <View style={[styles.statusDot, { backgroundColor: theme.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="middle">{item.url}</Text>
          <Text style={[styles.statusText, { color: theme.color }]}>{item.status}</Text>
        </View>
        <Text style={styles.indexText}>#{index + 1}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadScans(); }} style={styles.refreshBtn}>
          <Text style={styles.refreshBtnText}>↻</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Last 30 scans from your backend database</Text>

      {scans.length > 0 && (
        <View style={styles.statsBar}>
          {(['SAFE', 'SUSPICIOUS', 'MALICIOUS'] as StatusType[]).map(s => {
            const count = scans.filter(sc => sc.status === s).length;
            const theme = getStatusColors(s);
            return (
              <View key={s} style={styles.statChip}>
                <Text style={[styles.statNum, { color: theme.color }]}>{count}</Text>
                <Text style={styles.statLabel}>{s}</Text>
              </View>
            );
          })}
        </View>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} size="large" />
          <Text style={styles.loadingText}>Loading scan history…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadScans} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : scans.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No scans yet.</Text>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.scanBtn}>
            <Text style={styles.scanBtnText}>📷 Scan Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadScans(); }} tintColor={Colors.accent} colors={[Colors.accent]} />}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, justifyContent: 'space-between' },
  backBtn: { backgroundColor: 'rgba(61,132,255,0.1)', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border2 },
  backBtnText: { fontFamily: FontFamily.sansSemiBold, fontSize: 13, color: Colors.accent2 },
  title: { fontFamily: FontFamily.heading, fontSize: 20, color: Colors.text, flex: 1, textAlign: 'center' },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.cardBg, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  refreshBtnText: { fontSize: 18, color: Colors.accent },
  subtitle: { fontFamily: FontFamily.sans, fontSize: 12, color: Colors.muted, textAlign: 'center', marginBottom: 16 },
  statsBar: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginHorizontal: 20, marginBottom: 16 },
  statChip: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, padding: 12, alignItems: 'center' },
  statNum: { fontFamily: FontFamily.heading, fontSize: 22 },
  statLabel: { fontFamily: FontFamily.sansBold, fontSize: 9, color: Colors.muted, letterSpacing: 1.2, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: Radius.md, padding: 14, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3, gap: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  urlText: { fontFamily: FontFamily.sans, fontSize: 13, color: Colors.text },
  statusText: { fontFamily: FontFamily.sansBold, fontSize: 10, letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
  indexText: { fontFamily: FontFamily.sans, fontSize: 11, color: Colors.muted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingHorizontal: 32 },
  loadingText: { fontFamily: FontFamily.sans, color: Colors.muted2, fontSize: 14 },
  errorText: { fontFamily: FontFamily.sans, color: Colors.danger, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  retryBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 12 },
  retryBtnText: { fontFamily: FontFamily.sansBold, color: '#fff', fontSize: 14 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontFamily: FontFamily.heading, fontSize: 18, color: Colors.text },
  scanBtn: { backgroundColor: Colors.accent, borderRadius: Radius.md, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  scanBtnText: { fontFamily: FontFamily.sansBold, color: '#fff', fontSize: 14 },
});
