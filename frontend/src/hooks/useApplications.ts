import { useState, useEffect, useCallback } from "react";
import type { Application, Status } from "../types";
import * as api from "../api/applications";
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../api/applications";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>(() => {
    try {
      const cached = localStorage.getItem("huntr:applications");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    const cached = localStorage.getItem("huntr:applications");
    return !cached; // only show spinner on first ever load
  });
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getApplications();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // loading is only true if we have no cached data
    if (applications.length === 0) setLoading(true);

    api
      .getApplications()
      .then((data) => {
        setApplications(data);
        localStorage.setItem("huntr:applications", JSON.stringify(data));
      })
      .finally(() => setLoading(false));
  }, []);

  async function create(data: CreateApplicationInput) {
    // For create we don't have an ID yet, so we use a temp one
    const tempId = `temp-${Date.now()}`;
    const optimistic: Application = {
      ...data,
      id: tempId,
      companyId: "",
      companyNotes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          id: `temp-history-${Date.now()}`,
          from: data.status, // first entry — from and to are the same
          to: data.status,
          changedAt: new Date().toISOString(),
        },
      ],
      tags: data.tags?.map((t, i) => ({ ...t, id: `temp-tag-${i}` })) ?? [],
    };

    setApplications((prev) => [optimistic, ...prev]);

    try {
      const created = await api.createApplication(data);
      // Replace the temp entry with the real one
      setApplications((prev) =>
        prev.map((a) => (a.id === tempId ? created : a)),
      );
      return created;
    } catch (err) {
      // Remove the temp entry on failure
      setApplications((prev) => prev.filter((a) => a.id !== tempId));
      throw err;
    }
  }

  async function update(id: string, data: UpdateApplicationInput) {
    const previous = applications;
    setApplications((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const { tags, ...rest } = data;
        return {
          ...a,
          ...rest,
          // TagInput doesn't have id — keep existing tags optimistically
          // the real Tag[] comes back from the server response
          ...(tags
            ? { tags: tags.map((t, i) => ({ ...t, id: `temp-${i}` })) }
            : {}),
        } as Application;
      }),
    );
    try {
      const updated = await api.updateApplication(id, data);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setApplications(previous);
      throw err;
    }
  }

  async function changeStatus(id: string, status: Status) {
    const previous = applications;
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
    try {
      const updated = await api.updateApplicationStatus(id, status);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setApplications(previous);
      throw err;
    }
  }

  async function remove(id: string) {
    const previous = applications;
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await api.deleteApplication(id);
    } catch (err) {
      setApplications(previous);
      throw err;
    }
  }

  async function archive(id: string) {
    return changeStatus(id, "ARCHIVED");
  }

  return {
    applications,
    loading,
    error,
    create,
    update,
    changeStatus,
    remove,
    archive,
    refetch: fetchAll,
  };
}
