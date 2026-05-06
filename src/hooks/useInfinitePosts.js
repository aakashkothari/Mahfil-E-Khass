import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export function useInfinitePosts(endpoint, params = {}, options = {}) {
  const { enabled = true, reloadKey = "default" } = options;
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const observerRef = useRef(null);
  const abortRef = useRef(null);
  const cursorRef = useRef(null);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const requestIdRef = useRef(0);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async ({ reset = false } = {}) => {
      if (!enabled) {
        return;
      }

      if ((!hasMoreRef.current && !reset) || (!reset && loadingRef.current)) {
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      loadingRef.current = true;

      if (reset) {
        abortRef.current?.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;

      setError("");
      if (reset) {
        setLoading(true);
        setLoadingMore(false);
        setItems([]);
        setCursor(null);
        setHasMore(true);
        cursorRef.current = null;
        hasMoreRef.current = true;
      } else {
        setLoadingMore(true);
      }

      try {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) {
            query.set(key, value);
          }
        });
        if (!reset && cursorRef.current) {
          query.set("cursor", cursorRef.current);
        }

        const response = await api(`${endpoint}?${query.toString()}`, {
          signal: controller.signal,
        });

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return;
        }

        const nextCursor = response.nextCursor ?? null;
        setItems((current) => {
          if (reset) {
            return response.posts;
          }

          const seen = new Set(current.map((entry) => entry.id));
          const nextItems = response.posts.filter((entry) => !seen.has(entry.id));
          return [...current, ...nextItems];
        });
        setCursor(nextCursor);
        setHasMore(Boolean(nextCursor));
        cursorRef.current = nextCursor;
        hasMoreRef.current = Boolean(nextCursor);
      } catch (loadError) {
        if (loadError.name === "AbortError") {
          return;
        }

        setError(loadError.message);
      } finally {
        if (requestId === requestIdRef.current) {
          loadingRef.current = false;
          setLoading(false);
          setLoadingMore(false);
          if (abortRef.current === controller) {
            abortRef.current = null;
          }
        }
      }
    },
    [enabled, endpoint, params, paramsKey, reloadKey],
  );

  useEffect(() => {
    if (!enabled) {
      abortRef.current?.abort();
      loadingRef.current = false;
      setItems([]);
      setCursor(null);
      setHasMore(true);
      setLoading(false);
      setLoadingMore(false);
      setError("");
      cursorRef.current = null;
      hasMoreRef.current = true;
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }

    load({ reset: true });
    return () => {
      abortRef.current?.abort();
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, load, reloadKey]);

  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          load();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [load],
  );

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    sentinelRef,
    reload: () => load({ reset: true }),
    setItems,
  };
}
