"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica" },
  cover: { textAlign: "center", marginTop: 200 },
  coverTitle: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  coverSub: { fontSize: 14, color: "#64748b", marginBottom: 6 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#1e293b", borderBottom: "1 solid #e2e8f0", paddingBottom: 6 },
  todoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottom: "0.5 solid #f1f5f9" },
  checkbox: { width: 12, height: 12, border: "1 solid #94a3b8", marginRight: 8, borderRadius: 2 },
  checkboxChecked: { width: 12, height: 12, border: "1 solid #2563eb", backgroundColor: "#2563eb", marginRight: 8, borderRadius: 2 },
  todoTitle: { flex: 1, fontSize: 10 },
  todoTitleDone: { flex: 1, fontSize: 10, textDecoration: "line-through", color: "#94a3b8" },
  badge: { fontSize: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  badgeHigh: { backgroundColor: "#fef2f2", color: "#dc2626" },
  badgeMedium: { backgroundColor: "#fffbeb", color: "#d97706" },
  badgeLow: { backgroundColor: "#f0fdf4", color: "#16a34a" },
  meta: { fontSize: 8, color: "#94a3b8" },
  historyRow: { paddingVertical: 4, borderBottom: "0.5 solid #f1f5f9" },
  historyAction: { fontSize: 9, fontWeight: "bold" },
  historyDetail: { fontSize: 8, color: "#64748b", marginTop: 2 },
});

interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: string;
  dueDate: string | Date | null;
  creatorName?: string | null;
}

interface HistoryEntry {
  action: string;
  changedByName: string | null;
  todoTitle: string | null;
  changedAt: string | Date;
}

interface PDFProps {
  teamName: string;
  userName: string;
  date: string;
  myTodos?: Todo[];
  teamTodos?: Todo[];
  memberTodos?: { memberName: string; todos: Todo[] }[];
  historyEntries?: HistoryEntry[];
}

const priorityStyle = (p: string) => {
  if (p === "high") return [styles.badge, styles.badgeHigh];
  if (p === "medium") return [styles.badge, styles.badgeMedium];
  return [styles.badge, styles.badgeLow];
};

function TodoSection({ title, todos }: { title: string; todos: Todo[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {todos.map((todo) => (
        <View key={todo.id} style={styles.todoRow}>
          <View style={todo.isCompleted ? styles.checkboxChecked : styles.checkbox} />
          <Text style={todo.isCompleted ? styles.todoTitleDone : styles.todoTitle}>
            {todo.title}
          </Text>
          <Text style={priorityStyle(todo.priority)}>{todo.priority}</Text>
          {todo.dueDate && (
            <Text style={styles.meta}>
              {new Date(todo.dueDate).toLocaleDateString()}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
}

export function TodoPDFDocument({
  teamName,
  userName,
  date,
  myTodos,
  teamTodos,
  memberTodos,
  historyEntries,
}: PDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.coverTitle}>UFTech Tasks Export</Text>
          <Text style={styles.coverSub}>{teamName}</Text>
          <Text style={styles.coverSub}>Exported by {userName}</Text>
          <Text style={styles.coverSub}>{date}</Text>
        </View>
      </Page>

      {myTodos && myTodos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <TodoSection title="My Todos" todos={myTodos} />
        </Page>
      )}

      {teamTodos && teamTodos.length > 0 && (
        <Page size="A4" style={styles.page}>
          <TodoSection title="Team Todos" todos={teamTodos} />
        </Page>
      )}

      {memberTodos?.map((group) => (
        <Page key={group.memberName} size="A4" style={styles.page}>
          <TodoSection
            title={`${group.memberName}'s Todos`}
            todos={group.todos}
          />
        </Page>
      ))}

      {historyEntries && historyEntries.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History Log</Text>
            {historyEntries.map((entry, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyAction}>
                  [{entry.action}] {entry.todoTitle ?? "Deleted todo"}
                </Text>
                <Text style={styles.historyDetail}>
                  by {entry.changedByName ?? "Unknown"} at{" "}
                  {new Date(entry.changedAt).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </Page>
      )}
    </Document>
  );
}
