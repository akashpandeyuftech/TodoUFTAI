import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getTeams, joinTeam, createTeam } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { emailCanCreateTeams } from "@/lib/team-creators";
import type { Team } from "@/lib/types";

export default function JoinTeamScreen() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const { user, refresh, signOut } = useAuth();
  const router = useRouter();
  const canCreate = user ? emailCanCreateTeams(user.email) : false;

  const load = useCallback(async () => {
    try {
      setTeams(await getTeams());
    } catch {
      Alert.alert("Error loading teams");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleJoin(teamId: string) {
    setJoining(teamId);
    try {
      await joinTeam(teamId);
      await refresh();
      router.replace("/(tabs)/dashboard");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not join team");
    } finally {
      setJoining(null);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) { Alert.alert("Team name required"); return; }
    setCreating(true);
    try {
      await createTeam(newName.trim(), newDesc.trim() || null);
      await load();
      setShowCreate(false);
      setNewName(""); setNewDesc("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Could not create team");
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Join a Team</Text>
          <Text style={styles.subtitle}>Pick your team to get started</Text>
        </View>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {showCreate && canCreate ? (
        <View style={styles.createBox}>
          <Text style={styles.createTitle}>New Team</Text>
          <TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="Team name" placeholderTextColor="#475569" />
          <TextInput style={styles.input} value={newDesc} onChangeText={setNewDesc} placeholder="Description (optional)" placeholderTextColor="#475569" />
          <View style={styles.createBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleCreate} disabled={creating}>
              {creating ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Create</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      <FlatList
        data={teams}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563eb" />}
        renderItem={({ item }) => (
          <View style={styles.teamCard}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{item.name}</Text>
              {item.description ? <Text style={styles.teamDesc}>{item.description}</Text> : null}
              <Text style={styles.memberCount}>{item.memberCount} member{item.memberCount !== 1 ? "s" : ""}</Text>
            </View>
            <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.id)} disabled={joining === item.id}>
              {joining === item.id ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.joinBtnText}>Join</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No teams yet. {canCreate ? "Create one!" : "Ask an admin."}</Text>}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />

      {canCreate && !showCreate ? (
        <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)}>
          <Text style={styles.fabText}>+ Create team</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: "#f1f5f9" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 2 },
  signOutText: { color: "#ef4444", fontSize: 14 },
  createBox: { margin: 16, backgroundColor: "#1e293b", borderRadius: 12, padding: 16 },
  createTitle: { fontSize: 16, fontWeight: "700", color: "#f1f5f9", marginBottom: 12 },
  input: { backgroundColor: "#0f172a", borderRadius: 8, padding: 12, fontSize: 14, color: "#f1f5f9", borderWidth: 1, borderColor: "#334155", marginBottom: 10 },
  createBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn: { flex: 1, backgroundColor: "#334155", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { color: "#94a3b8", fontWeight: "600" },
  submitBtn: { flex: 1, backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "600" },
  teamCard: { backgroundColor: "#1e293b", borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  teamInfo: { flex: 1 },
  teamName: { fontSize: 16, fontWeight: "700", color: "#f1f5f9" },
  teamDesc: { fontSize: 13, color: "#94a3b8", marginTop: 2 },
  memberCount: { fontSize: 12, color: "#64748b", marginTop: 6 },
  joinBtn: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  joinBtnText: { color: "#fff", fontWeight: "600" },
  empty: { color: "#64748b", textAlign: "center", marginTop: 40, fontSize: 15 },
  fab: { position: "absolute", bottom: 30, right: 20, left: 20, backgroundColor: "#1e3a5f", borderRadius: 12, paddingVertical: 14, alignItems: "center", borderWidth: 1, borderColor: "#2563eb" },
  fabText: { color: "#60a5fa", fontWeight: "700", fontSize: 15 },
});
