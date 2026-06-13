import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function handleLogin() {
    if (!email || !password) { Alert.alert("Fill in all fields"); return; }
    setLoading(true);
    try {
      const { teamId } = await login(email, password);
      await refresh();
      if (!teamId) {
        router.replace("/join-team");
      } else {
        router.replace("/(tabs)/dashboard");
      }
    } catch (e: unknown) {
      Alert.alert("Login failed", e instanceof Error ? e.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoBlock}>
          <Text style={styles.logo}>UFTech</Text>
          <Text style={styles.logoSub}>Tasks</Text>
        </View>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.subtitle}>@uftech.com accounts only</Text>

        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@uftech.com"
          placeholderTextColor="#475569"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#475569"
          secureTextEntry
          autoComplete="password"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Sign in</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.linkText}>No account? Register</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#0f172a" },
  container: { flexGrow: 1, justifyContent: "center", padding: 28 },
  logoBlock: { alignItems: "center", marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: "800", color: "#60a5fa", letterSpacing: -1 },
  logoSub: { fontSize: 16, color: "#94a3b8", marginTop: -4 },
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
  link: { alignItems: "center", marginTop: 20 },
  linkText: { color: "#60a5fa", fontSize: 14 },
});
