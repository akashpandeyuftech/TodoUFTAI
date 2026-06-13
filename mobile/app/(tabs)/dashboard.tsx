import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { getMyTodos, getTeamTodos, getMembers } from "@/lib/api";

interface Stats {
  myTotal: number;
  myCompleted: number;
  teamTotal: number;
  teamCompleted: number;
  memberCount: number;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [myTodos, teamTodos, members] = await Promise.all([
        getMyTodos(),
        getTeamTodos(),
        getMembers(),
      ]);
      setStats({
        myTotal: myTodos.length,
        myCompleted: myTodos.filter((t) => t.isCompleted).length,
        teamTotal: teamTodos.length,
        teamCompleted: teamTodos.filter((t) => t.isCompleted).length,
        memberCount: members.length,
      });
    } catch {
      // silently fail, user sees stale data or empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563eb" />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.displayName?.split(" ")[0]} 👋</Text>
          <Text style={styles.subGreeting}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
      ) : stats ? (
        <>
          <Text style={styles.sectionTitle}>My Tasks</Text>
          <View style={styles.statsRow}>
            <StatCard label="Total" value={stats.myTotal} />
            <StatCard label="Done" value={stats.myCompleted} sub={`${stats.myTotal ? Math.round((stats.myCompleted / stats.myTotal) * 100) : 0}%`} />
            <StatCard label="Active" value={stats.myTotal - stats.myCompleted} />
          </View>

          <Text style={styles.sectionTitle}>Team</Text>
          <View style={styles.statsRow}>
            <StatCard label="Total" value={stats.teamTotal} />
            <StatCard label="Done" value={stats.teamCompleted} />
            <StatCard label="Members" value={stats.memberCount} />
          </View>
        </>
      ) : null}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(tabs)/my-todos")}>
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionText}>My Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(tabs)/team-todos")}>
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionText}>Team Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/(tabs)/members")}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionText}>Members</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 32 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  greeting: { fontSize: 22, fontWeight: "700", color: "#f1f5f9" },
  subGreeting: { fontSize: 13, color: "#64748b", marginTop: 2 },
  signOutBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#1e293b", borderRadius: 8 },
  signOutText: { color: "#ef4444", fontSize: 13 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12, marginTop: 8 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: "#1e293b", borderRadius: 12, padding: 16, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800", color: "#60a5fa" },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4 },
  statSub: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  actionsGrid: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  actionBtn: { flex: 1, minWidth: "30%", backgroundColor: "#1e293b", borderRadius: 12, padding: 18, alignItems: "center", borderWidth: 1, borderColor: "#334155" },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionText: { fontSize: 13, color: "#94a3b8", fontWeight: "600", textAlign: "center" },
});
