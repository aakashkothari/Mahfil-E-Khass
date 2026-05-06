import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { useAuth } from "../contexts/AuthContext";
import { FEED_SCOPES } from "../lib/constants";
import { moodOptions } from "../lib/moods";
import { useInfinitePosts } from "../hooks/useInfinitePosts";

export function FeedPage() {
  const { loading: authLoading, user } = useAuth();
  const [scope, setScope] = useState("latest");
  const [mood, setMood] = useState("");

  const params = useMemo(() => ({ scope, mood }), [mood, scope]);
  const { items, loading, loadingMore, hasMore, error, sentinelRef, setItems } =
    useInfinitePosts("feed", params, {
      enabled: !authLoading,
      reloadKey: user?.id ?? "guest",
    });
  const pageLoading = authLoading || loading;

  return (
    <div className="mx-auto max-w-poetry space-y-8">
      <section className="rounded-[1.75rem] border border-primary/20 bg-primary/10 px-5 py-5 shadow-indigo">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined mt-0.5 text-gold">stars</span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-primary">Weekly Spotlight</p>
            <p className="mt-2 font-poetry text-xl leading-8 text-text-main">
              Kuch alfaaz seedha dil tak jaate hain. Is hafte ki roshni unhi aawazon ke naam.
            </p>
            <Link to="/spotlight" className="mt-3 inline-block text-sm text-gold">
              Spotlight dekhne jaiye →
            </Link>
          </div>
        </div>
      </section>

      <section className="mahfil-card p-5">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface-elevated text-sm font-semibold text-text-main">
            ✦
          </div>
          <div className="flex-1">
            <Link
              to="/compose"
              className="block rounded-3xl border border-surface-border bg-surface-soft/70 px-4 py-4 text-text-soft transition hover:border-primary/35 hover:text-text-main"
            >
              Dil mein kya hai aaj?
            </Link>
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex gap-3 text-text-soft">
                <span className="material-symbols-outlined">temp_preferences_custom</span>
                <span className="material-symbols-outlined">chat_info</span>
              </div>
              <Link
                to="/compose"
                className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
              >
                Shayari Likhein
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl options={FEED_SCOPES} value={scope} onChange={setScope} />
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

      <div className="space-y-6">
        {pageLoading ? <LoadingState label="Ashaar jama kiye ja rahe hain..." /> : null}
        {!pageLoading && !items.length ? (
          <EmptyState
            title="Abhi mehfil khaali hai"
            description="Naye alfaaz likhiye ya mood filter hata kar aur awaazein dekhiye."
          />
        ) : null}
        {items.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onUpdate={(updated) =>
              setItems((current) =>
                current.map((entry) => (entry.id === updated.id ? updated : entry)),
              )
            }
          />
        ))}
      </div>

      {error ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {hasMore ? <div ref={sentinelRef} className="h-2" /> : null}
      {loadingMore ? <LoadingState label="Aur alfaaz aa rahe hain..." /> : null}
    </div>
  );
}
