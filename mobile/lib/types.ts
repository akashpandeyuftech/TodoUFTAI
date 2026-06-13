export type Priority = "low" | "medium" | "high";
export type OwnerType = "member" | "team";

export interface User {
  id: string;
  email: string;
  displayName: string;
  teamId: string | null;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  memberCount: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  priority: Priority;
  ownerType: OwnerType;
  ownerId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creatorName: string | null;
  claimedByUserId: string | null;
  claimantDisplayName: string | null;
}

export interface Member {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface CreateTodoPayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority: Priority;
  owner_type: OwnerType;
}
