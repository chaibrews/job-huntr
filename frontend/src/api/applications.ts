import type { Application, Status } from "../types";

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/applications`;

// Centralized header builder — every protected request needs this
function authHeaders(): HeadersInit {
  const token = localStorage.getItem("huntr:token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Defines a type for creating new applications
// Uses Omit to remove fields that the server generates automatically
export type CreateApplicationInput = Omit<
  Application,
  "id" | "createdAt" | "updatedAt" | "statusHistory"
>;

// Defines a type for updating applications
// Uses Partial so all fields are optional (PATCH requests don’t require every field)
export type UpdateApplicationInput = Partial<CreateApplicationInput>;

export async function getApplications(): Promise<Application[]> {
  const res = await fetch(BASE, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function createApplication(
  data: CreateApplicationInput,
): Promise<Application> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to create application");
  }
  return res.json();
}

export async function getApplicationById(id: string): Promise<Application> {
  const res = await fetch(`${BASE}/${id}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Application not found");
  return res.json();
}

export async function updateApplication(
  id: string,
  data: UpdateApplicationInput,
): Promise<Application> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Failed to update");
  }
  return res.json();
}

export async function updateApplicationStatus(
  id: string,
  status: Status,
): Promise<Application> {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

export async function deleteApplication(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete");
}
