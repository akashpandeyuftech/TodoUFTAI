import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/lib/auth-context";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/(auth)/login");
    } else if (!user.teamId) {
      router.replace("/join-team");
    } else {
      router.replace("/(tabs)/dashboard");
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f172a" }}>
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  );
}
