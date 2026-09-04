"use client";

import * as React from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  updatedAt: number | null;
  refresh: () => void;
}

export function useApi<T>(url: string, intervalMs = 0, enabled = true): ApiState<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState<boolean>(enabled);
  const [error, setError] = React.useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = React.useState<number | null>(null);
  const [tick, setTick] = React.useState(0);

  const refresh = React.useCallback(() => setTick((t) => t + 1), []);

  React.useEffect(() => {
    if (!enabled) return;
    let active = true;
    setLoading(true);
    fetch(url)
      .then((r) => r.json())
      .then((json) => {
        if (!active) return;
        setData(json);
        setError(json?.ok === false && json.error ? String(json.error) : null);
        setUpdatedAt(Date.now());
      })
      .catch((e) => {
        if (!active) return;
        setError(String(e));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, tick, enabled]);

  React.useEffect(() => {
    if (!enabled || intervalMs <= 0) return;
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);

  return { data, loading, error, updatedAt, refresh };
}
