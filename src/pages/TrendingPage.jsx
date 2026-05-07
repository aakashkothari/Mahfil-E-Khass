import { useMemo, useState } from "react";
import { PostCard } from "../components/posts/PostCard";
import { LoadingState } from "../components/ui/LoadingState";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { useAuth } from "../contexts/AuthContext";
import { moodOptions } from "../lib/moods";
import { useInfinitePosts } from "../hooks/useInfinitePosts";

const TRENDING_WINDOWS = [
  { value: "daily", label: "Rozana" },
  { value: "weekly", label: "Haftawaar" },
  { value: "all", label: "Hamesha" },
];

export function TrendingPage() {
  const { loading: authLoading, user } = useAuth();
  const [window, setWindow] = useState("daily");
  const [mood, setMood] = useState("");
  const params = useMemo(() => ({ window, mood }), [mood, window]);
  const { items, loading, error, sentinelRef, hasMore, loadingMore, setItems } =
    useInfinitePosts("trending", params, {
      enabled: !authLoading,
      reloadKey: user?.id ?? "guest",
    });
  const pageLoading = authLoading || loading;

  return (
    <div className="mx-auto max-w-poetry space-y-8">
      <section className="mahfil-card overflow-hidden">
        <div className="border-b border-surface-border px-6 py-6">
          <p className="mahfil-pill border-gold/25 bg-gold/10 text-gold">Muqabla</p>
          <h1 className="mt-4 font-poetry text-4xl">Jis sher mein aaj sabse zyada jaan hai.</h1>
          <p className="mt-3 text-sm leading-7 text-text-soft">
            Trending score likes, comments, aur freshness se banta hai. Har 15 minute mein naya
            rang.
          </p>
        </div>
        <div className="flex flex-col gap-4 px-6 py-5">
          <SegmentedControl options={TRENDING_WINDOWS} value={window} onChange={setWindow} />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMood("")}
              className={`mahfil-pill border ${
                mood ? "border-surface-border text-text-soft" : "border-primary/25 bg-primary/10 text-primary"
              }`}
            >
              Sab Rang
            </button>
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`mahfil-pill border ${option.bg} ${option.border} ${option.color}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-6">
        {pageLoading ? <LoadingState label="Aaj ka sabse tez nasha nikaala ja raha hai..." /> : null}
        {items.map((post, index) => (
          <div key={post.id} className="relative">
            <div className="absolute -left-2 -top-2 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-soft text-sm font-bold text-slate-950 shadow-lg">
              {index + 1}
            </div>
            <PostCard
              post={post}
              onUpdate={(updated) =>
                setItems((current) =>
                  current.map((entry) => (entry.id === updated.id ? updated : entry)),
                )
              }
            />
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {hasMore ? <div ref={sentinelRef} className="h-2" /> : null}
      {loadingMore ? <LoadingState compact label="Aur trending awaazein..." /> : null}
    </div>
  );
}
