"use client";

// ============================================================
// Shared admin data: the events list and the portal config.
// ============================================================
//
// The navbar (attendance status) and the pages both need these, so they are
// loaded once here instead of in each page. Mutations go through this provider,
// so every screen sees the new state straight away.
//
// ============================================================

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { DbEvent, DbPortalConfig } from "@/types/certificate";

interface AdminPortalState {
  events: DbEvent[];
  portalConfig: DbPortalConfig | null;
  loading: boolean;
  refreshing: boolean;
  error: string;
  setError: (message: string) => void;
  /** Reloads events and portal config. `isRefresh` shows the "refreshed" toast and keeps the page visible. */
  refresh: (isRefresh?: boolean) => Promise<void>;
  /** Master switch for attendance collection. */
  setAttendanceEnabled: (enabled: boolean) => Promise<boolean>;
  setActiveEvent: (event: DbEvent) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminPortalContext = createContext<AdminPortalState | null>(null);

export function useAdminPortal(): AdminPortalState {
  const ctx = useContext(AdminPortalContext);
  if (!ctx) throw new Error("useAdminPortal must be used inside <AdminPortalProvider>");
  return ctx;
}

export function AdminPortalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [portalConfig, setPortalConfig] = useState<DbPortalConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(0); // ignore a slow response that arrives after a newer one

  const refresh = useCallback(async (isRefresh = false) => {
    const id = ++latest.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const [eventsRes, configRes] = await Promise.all([
        fetch("/api/admin/events", { cache: "no-store" }),
        fetch("/api/admin/portal-config", { cache: "no-store" }),
      ]);
      const eventsData = await eventsRes.json();
      const configData = await configRes.json();
      if (id !== latest.current) return;

      if (eventsData.success) setEvents((eventsData.data as DbEvent[]) || []);
      if (configData.success) setPortalConfig(configData.data || null);
      if (isRefresh) toast.success("Dashboard data refreshed");
    } catch (e: any) {
      if (id === latest.current) setError("Failed to load dashboard data: " + (e.message || "Unknown error"));
    } finally {
      if (id === latest.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setAttendanceEnabled = useCallback(
    async (enabled: boolean) => {
      try {
        const res = await fetch("/api/admin/portal-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendanceEnabled: enabled }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(enabled ? "Attendance collection enabled" : "Attendance collection disabled");
          await refresh();
          return true;
        }
        toast.error(json.error || "Failed to toggle attendance");
      } catch (e: any) {
        setError("Failed to toggle attendance: " + e.message);
      }
      return false;
    },
    [refresh]
  );

  const setActiveEvent = useCallback(
    async (event: DbEvent) => {
      try {
        const res = await fetch("/api/admin/portal-config", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activeEventId: event.id, attendanceEnabled: event.attendance_open }),
        });
        const json = await res.json();
        if (json.success) {
          toast.success(`"${event.name}" is now the active portal event`);
          await refresh();
          return true;
        }
        toast.error(json.error || "Failed to set active event");
      } catch (err: any) {
        toast.error(err.message || "Failed to update configuration");
      }
      return false;
    },
    [refresh]
  );

  const logout = useCallback(async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AdminPortalState>(
    () => ({ events, portalConfig, loading, refreshing, error, setError, refresh, setAttendanceEnabled, setActiveEvent, logout }),
    [events, portalConfig, loading, refreshing, error, refresh, setAttendanceEnabled, setActiveEvent, logout]
  );

  return <AdminPortalContext.Provider value={value}>{children}</AdminPortalContext.Provider>;
}
