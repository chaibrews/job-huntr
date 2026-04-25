import { useState, useEffect, useCallback } from "react";
import type { Application, Status } from "../types";
import * as api from "../api/applications";
import type {
  CreateApplicationInput,
  UpdateApplicationInput,
} from "../api/applications";

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback memoizes the function so it doesn't get recreated
  // on every render — important because it's used in useEffect below
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

  // Fetch on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // After each mutation (create/update/delete) we update local state
  // directly instead of refetching everything — keeps the UI snappy

  async function create(data: CreateApplicationInput) {
    const app = await api.createApplication(data);
    setApplications((prev) => [app, ...prev]);
    return app;
  }

  async function update(id: string, data: UpdateApplicationInput) {
    const app = await api.updateApplication(id, data);
    setApplications((prev) => prev.map((a) => (a.id === id ? app : a)));
    return app;
  }

  async function changeStatus(id: string, status: Status) {
    const app = await api.updateApplicationStatus(id, status);
    setApplications((prev) => prev.map((a) => (a.id === id ? app : a)));
    return app;
  }

  async function remove(id: string) {
    await api.deleteApplication(id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  async function archive(id: string) {
    const app = await api.updateApplicationStatus(id, "ARCHIVED");
    setApplications((prev) => prev.map((a) => (a.id === id ? app : a)));
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
