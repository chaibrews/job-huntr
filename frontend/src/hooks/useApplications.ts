import { useState, useEffect, useCallback, useRef } from "react";
import type { Application, Status } from "../types";
import * as api from "../api/applications";
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../api/applications";

function cacheApplications(next: Application[]) {
  localStorage.setItem("huntr:applications", JSON.stringify(next));
}

export function useApplications() {
  const pendingDeletedIds = useRef(new Set<string>());
  const pendingCreatedApps = useRef(new Map<string, Application>());
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

  const withoutPendingDeletes = useCallback((apps: Application[]) => {
    return apps.filter((app) => !pendingDeletedIds.current.has(app.id));
  }, []);

  const withPendingCreates = useCallback((apps: Application[]) => {
    const appIds = new Set(apps.map((app) => app.id));

    for (const id of pendingCreatedApps.current.keys()) {
      if (appIds.has(id)) {
        pendingCreatedApps.current.delete(id);
      }
    }

    const pending = Array.from(pendingCreatedApps.current.values()).filter(
      (app) => !appIds.has(app.id),
    );

    return [...pending, ...apps];
  }, []);

  const reconcileApplications = useCallback(
    (apps: Application[]) => withPendingCreates(withoutPendingDeletes(apps)),
    [withPendingCreates, withoutPendingDeletes],
  );

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getApplications();
      const visible = reconcileApplications(data);
      setApplications(visible);
      cacheApplications(visible);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [reconcileApplications]);

  useEffect(() => {
    // loading is only true if we have no cached data
    if (applications.length === 0) setLoading(true);

    api
      .getApplications()
      .then((data) => {
        const visible = reconcileApplications(data);
        setApplications(visible);
        cacheApplications(visible);
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

    pendingCreatedApps.current.set(tempId, optimistic);
    setApplications((prev) => {
      const next = [optimistic, ...prev];
      cacheApplications(next);
      return next;
    });

    try {
      const created = await api.createApplication(data);
      pendingCreatedApps.current.delete(tempId);
      pendingCreatedApps.current.set(created.id, created);
      // Replace the temp entry with the real one
      setApplications((prev) => {
        const hasTemp = prev.some((a) => a.id === tempId);
        const next = hasTemp
          ? prev.map((a) => (a.id === tempId ? created : a))
          : [created, ...prev];
        cacheApplications(next);
        return next;
      });
      return created;
    } catch (err) {
      pendingCreatedApps.current.delete(tempId);
      // Remove the temp entry on failure
      setApplications((prev) => {
        const next = prev.filter((a) => a.id !== tempId);
        cacheApplications(next);
        return next;
      });
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
    let previous: Application[] = [];
    pendingDeletedIds.current.add(id);
    setApplications((prev) => {
      previous = prev;
      const next = prev.filter((a) => a.id !== id);
      cacheApplications(next);
      return next;
    });

    try {
      await api.deleteApplication(id);
    } catch (err) {
      pendingDeletedIds.current.delete(id);
      setApplications(previous);
      cacheApplications(previous);
      throw err;
    } finally {
      pendingDeletedIds.current.delete(id);
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
