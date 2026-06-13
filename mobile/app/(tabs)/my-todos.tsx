import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Alert, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/lib/auth-context";
import { getMyTodos, toggleTodo, deleteTodo, createTodo } from "@/lib/api";
import { TodoCard } from "@/components/TodoCard";
import { TodoForm } from "@/components/TodoForm";
import type { Todo, CreateTodoPayload } from "@/lib/types";

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Done" },
] as const;

export default function MyTodosScreen() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      setTodos(await getMyTodos(filter));
    } catch {
      Alert.alert("Failed to load tasks");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  async function handleToggle(id: string) {
    try {
      const { isCompleted } = await toggleTodo(id);
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, isCompleted } : t));
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to delete");
    }
  }

  async function handleCreate(payload: CreateTodoPayload) {
    await createTodo(payload);
    await load();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.label}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <TodoCard
              todo={item}
              currentUserId={user?.id ?? ""}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#2563eb" />}
          ListEmptyComponent={<Text style={styles.empty}>No tasks here.</Text>}
        />
      )}

      <TodoForm
        visible={showForm}
        defaultOwnerType="member"
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: "700", color: "#f1f5f9" },
  addBtn: { backgroundColor: "#2563eb", borderRadius: 10, padding: 8 },
  filterRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: "#1e293b" },
  filterBtnActive: { backgroundColor: "#1e40af" },
  filterText: { color: "#64748b", fontSize: 13, fontWeight: "500" },
  filterTextActive: { color: "#60a5fa" },
  list: { paddingHorizontal: 16, paddingBottom: 32 },
  empty: { color: "#64748b", textAlign: "center", marginTop: 60, fontSize: 15 },
});
