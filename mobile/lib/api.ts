import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { Todo, User, Team, Member, CreateTodoPayload } from "./types";

const BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "http://localhost:3000";
const TOKEN_KEY = "uftech_token";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// Auth
export async function login(email: string, password: string): Promise<{ token: string; teamId: string | null }> {
  const data = await request<{ success: boolean; token: string; teamId: string | null }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await saveToken(data.token);
  return { token: data.token, teamId: data.teamId };
}

export async function register(email: string, password: string, display_name: string): Promise<{ token: string }> {
  const data = await request<{ success: boolean; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
  await saveToken(data.token);
  return { token: data.token };
}

export async function logout(): Promise<void> {
  await clearToken();
}

// Me
export function getMe(): Promise<User> {
  return request<User>("/api/mobile/me");
}

// Todos
export function getMyTodos(filter?: string, sort?: string): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (filter) params.set("filter", filter);
  if (sort) params.set("sort", sort);
  return request<Todo[]>(`/api/mobile/todos?${params}`);
}

export function getTeamTodos(filter?: string, sort?: string): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (filter) params.set("filter", filter);
  if (sort) params.set("sort", sort);
  return request<Todo[]>(`/api/mobile/todos/team?${params}`);
}

export function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  return request<Todo>("/api/mobile/todos", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTodo(id: string, payload: Partial<CreateTodoPayload>): Promise<Todo> {
  return request<Todo>(`/api/mobile/todos/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function deleteTodo(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/mobile/todos/${id}`, { method: "DELETE" });
}

export function toggleTodo(id: string): Promise<{ success: boolean; isCompleted: boolean }> {
  return request<{ success: boolean; isCompleted: boolean }>(`/api/mobile/todos/${id}/toggle`, { method: "POST" });
}

export function claimTodo(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/mobile/todos/${id}/claim`, { method: "POST" });
}

export function releaseTodo(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/api/mobile/todos/${id}/claim`, { method: "DELETE" });
}

// Members
export function getMembers(): Promise<Member[]> {
  return request<Member[]>("/api/mobile/members");
}

// Teams
export function getTeams(): Promise<Team[]> {
  return request<Team[]>("/api/mobile/teams");
}

export function createTeam(name: string, description?: string | null): Promise<Team> {
  return request<Team>("/api/mobile/teams", { method: "POST", body: JSON.stringify({ name, description }) });
}

export async function joinTeam(teamId: string): Promise<{ token: string; teamId: string }> {
  const data = await request<{ success: boolean; token: string; teamId: string }>(`/api/mobile/teams/${teamId}/join`, { method: "POST" });
  await saveToken(data.token);
  return { token: data.token, teamId: data.teamId };
}
