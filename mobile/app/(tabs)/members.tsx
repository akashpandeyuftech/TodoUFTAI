import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMembers } from "@/lib/api";
import type { Member } from "@/lib/types";

export default function MembersScreen() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setMembers(await getMembers());
    } catch {
      Alert.alert("Failed to load members");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Members</Text>
        <Text style={styles.count}>{members.length} total</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.displayName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.displayName}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.joinedBadge}>
                <Ionicons name="calendar-outline" size={11} color="#64748b" />
                <Text style={styles.joinedText}>
                  {" "}{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563eb" />}
          ListEmptyComponent={<Text style={styles.empty}>No members yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: "#f1f5f9" },
  count: { fontSize: 14, color: "#64748b" },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  card: { backgroundColor: "#1e293b", borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#1e3a5f", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#60a5fa", fontWeight: "700", fontSize: 15 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#f1f5f9" },
  email: { fontSize: 12, color: "#64748b", marginTop: 2 },
  joinedBadge: { flexDirection: "row", alignItems: "center" },
  joinedText: { fontSize: 11, color: "#64748b" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 60, fontSize: 15 },
});
