import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0f172a", borderTopColor: "#1e293b", paddingBottom: 8, height: 60 },
        tabBarActiveTintColor: "#60a5fa",
        tabBarInactiveTintColor: "#475569",
        tabBarLabelStyle: { fontSize: 11, marginTop: -2 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="my-todos"
        options={{
          title: "My Tasks",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="team-todos"
        options={{
          title: "Team Tasks",
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
