import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

export function useInfinitePosts(endpoint, params = {}) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const observerRef = useRef(null);
  const paramsKey = JSON.stringify(params);

  const load = useCallback(
    async ({ reset = false } = {}) => {
      if ((!hasMore && !reset) || loadingMore) {
        return;
      }

      setError("");
      if (reset) {
        setLoading(true);
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
        if (!reset && cursor) {
          query.set("cursor", cursor);
        }

        const response = await api(`${endpoint}?${query.toString()}`);
        setItems((current) => (reset ? response.posts : [...current, ...response.posts]));
        setCursor(response.nextCursor ?? null);
        setHasMore(Boolean(response.nextCursor));
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [cursor, endpoint, hasMore, loadingMore, paramsKey],
  );

  useEffect(() => {
    setCursor(null);
    setHasMore(true);
    load({ reset: true });
  }, [endpoint, paramsKey]);

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
