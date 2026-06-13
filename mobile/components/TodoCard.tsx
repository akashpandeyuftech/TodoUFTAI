import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Todo } from "@/lib/types";

const PRIORITY_COLOR: Record<string, string> = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
};

interface Props {
  todo: Todo;
  currentUserId: string;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  onClaim?: (id: string) => void;
  onRelease?: (id: string) => void;
  showClaimButtons?: boolean;
}

export function TodoCard({ todo, currentUserId, onToggle, onDelete, onClaim, onRelease, showClaimButtons }: Props) {
  const isOverdue = todo.dueDate && !todo.isCompleted && new Date(todo.dueDate) < new Date();
  const isMine = todo.ownerType === "member" && todo.ownerId === currentUserId;
  const claimedByMe = todo.claimedByUserId === currentUserId;

  function handleDelete() {
    Alert.alert("Delete task", `Delete "${todo.title}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => onDelete?.(todo.id) },
    ]);
  }

  return (
    <View style={[styles.card, todo.isCompleted && styles.completed]}>
      <View style={[styles.priorityBar, { backgroundColor: PRIORITY_COLOR[todo.priority] }]} />
      <View style={styles.body}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.checkbox}>
            <Ionicons
              name={todo.isCompleted ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={todo.isCompleted ? "#22c55e" : "#94a3b8"}
            />
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, todo.isCompleted && styles.strikethrough]} numberOfLines={2}>
              {todo.title}
            </Text>
            {todo.description ? (
              <Text style={styles.desc} numberOfLines={2}>{todo.description}</Text>
            ) : null}
          </View>
          {(isMine || todo.ownerType === "team") && onDelete ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.meta}>
          <View style={[styles.badge, { backgroundColor: PRIORITY_COLOR[todo.priority] + "22" }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLOR[todo.priority] }]}>
              {todo.priority}
            </Text>
          </View>
          {todo.dueDate ? (
            <View style={[styles.badge, isOverdue ? styles.overdueBadge : styles.dueBadge]}>
              <Ionicons name="calendar-outline" size={11} color={isOverdue ? "#ef4444" : "#64748b"} />
              <Text style={[styles.badgeText, isOverdue && styles.overdueText]}>
                {" "}{new Date(todo.dueDate).toLocaleDateString()}
              </Text>
            </View>
          ) : null}
          {todo.ownerType === "team" && todo.claimantDisplayName ? (
            <View style={styles.badge}>
              <Ionicons name="person-outline" size={11} color="#64748b" />
              <Text style={styles.badgeText}> {todo.claimantDisplayName}</Text>
            </View>
          ) : null}
        </View>

        {showClaimButtons && todo.ownerType === "team" && !todo.isCompleted ? (
          <View style={styles.claimRow}>
            {claimedByMe ? (
              <TouchableOpacity style={[styles.claimBtn, styles.releaseBtn]} onPress={() => onRelease?.(todo.id)}>
                <Text style={styles.releaseBtnText}>Return task</Text>
              </TouchableOpacity>
            ) : !todo.claimedByUserId ? (
              <TouchableOpacity style={styles.claimBtn} onPress={() => onClaim?.(todo.id)}>
                <Text style={styles.claimBtnText}>Take task</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
  },
  completed: { opacity: 0.6 },
  priorityBar: { width: 4 },
  body: { flex: 1, padding: 14 },
  row: { flexDirection: "row", alignItems: "flex-start" },
  checkbox: { marginRight: 10, marginTop: 1 },
  titleBlock: { flex: 1 },
  title: { fontSize: 15, fontWeight: "600", color: "#f1f5f9" },
  strikethrough: { textDecorationLine: "line-through", color: "#64748b" },
  desc: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  deleteBtn: { padding: 4, marginLeft: 8 },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, color: "#94a3b8" },
  overdueBadge: { backgroundColor: "#fef2f2" },
  dueBadge: {},
  overdueText: { color: "#ef4444" },
  claimRow: { marginTop: 10 },
  claimBtn: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, alignSelf: "flex-start" },
  claimBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  releaseBtn: { backgroundColor: "#334155" },
  releaseBtnText: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
});
