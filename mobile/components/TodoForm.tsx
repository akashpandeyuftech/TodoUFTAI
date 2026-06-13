import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import type { CreateTodoPayload, OwnerType, Priority } from "@/lib/types";

interface Props {
  visible: boolean;
  defaultOwnerType?: OwnerType;
  onClose: () => void;
  onSubmit: (payload: CreateTodoPayload) => Promise<void>;
}

const PRIORITIES: Priority[] = ["low", "medium", "high"];
const PRIORITY_LABEL: Record<Priority, string> = { low: "Low", medium: "Medium", high: "High" };
const PRIORITY_COLOR: Record<Priority, string> = { low: "#22c55e", medium: "#f59e0b", high: "#ef4444" };

export function TodoForm({ visible, defaultOwnerType = "member", onClose, onSubmit }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [ownerType, setOwnerType] = useState<OwnerType>(defaultOwnerType);
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  function reset() {
    setTitle(""); setDescription(""); setPriority("medium");
    setOwnerType(defaultOwnerType); setDueDate("");
  }

  async function handleSubmit() {
    if (!title.trim()) { Alert.alert("Title required"); return; }
    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate.trim() || null,
        priority,
        owner_type: ownerType,
      });
      reset();
      onClose();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Task</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
            placeholderTextColor="#475569"
            autoFocus
            maxLength={200}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor="#475569"
            multiline
            numberOfLines={3}
            maxLength={1000}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.segmentRow}>
            {PRIORITIES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.segment, priority === p && { backgroundColor: PRIORITY_COLOR[p] + "33", borderColor: PRIORITY_COLOR[p] }]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.segmentText, priority === p && { color: PRIORITY_COLOR[p] }]}>
                  {PRIORITY_LABEL[p]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Assign to</Text>
          <View style={styles.segmentRow}>
            {(["member", "team"] as OwnerType[]).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.segment, ownerType === t && styles.segmentActive]}
                onPress={() => setOwnerType(t)}
              >
                <Text style={[styles.segmentText, ownerType === t && styles.segmentActiveText]}>
                  {t === "member" ? "Personal" : "Team"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="2026-12-31"
            placeholderTextColor="#475569"
            keyboardType="numbers-and-punctuation"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Create Task</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#f1f5f9" },
  closeBtn: { padding: 4 },
  closeTxt: { fontSize: 15, color: "#60a5fa" },
  form: { padding: 20, gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#94a3b8", marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: "#1e293b", borderRadius: 10, padding: 14, fontSize: 15, color: "#f1f5f9", borderWidth: 1, borderColor: "#334155" },
  textarea: { minHeight: 80, textAlignVertical: "top" },
  segmentRow: { flexDirection: "row", gap: 8 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  segmentText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
  segmentActive: { backgroundColor: "#1e40af22", borderColor: "#2563eb" },
  segmentActiveText: { color: "#60a5fa" },
  submitBtn: { backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: 24 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
