import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { register } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleRegister() {
    if (!email || !password || !displayName) { Alert.alert("Fill in all fields"); return; }
    setLoading(true);
    try {
      await register(email, password, displayName);
      await refresh();
      router.replace("/join-team");
    } catch (e: unknown) {
      Alert.alert("Registration failed", e instanceof Error ? e.message : "Try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Must be a @uftech.com email</Text>

        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#475569"
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@uftech.com"
          placeholderTextColor="#475569"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password (min 8 chars)"
          placeholderTextColor="#475569"
          secureTextEntry
        />

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create account</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0f172a" },
  container: { flexGrow: 1, justifyContent: "center", padding: 28 },
  back: { marginBottom: 30 },
  backText: { color: "#60a5fa", fontSize: 15 },
  title: { fontSize: 26, fontWeight: "700", color: "#f1f5f9", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#64748b", marginBottom: 28 },
  input: {
    backgroundColor: "#1e293b", borderRadius: 12, padding: 16,
    fontSize: 15, color: "#f1f5f9", borderWidth: 1, borderColor: "#334155", marginBottom: 14,
  },
  btn: {
    backgroundColor: "#2563eb", borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
