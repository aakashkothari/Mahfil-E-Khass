import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { TIERS } from "../../lib/constants";
import { useAuth } from "../../contexts/AuthContext";
import { MOODS } from "../../lib/moods";
import { cn, formatCount, formatRelativeTime, getInitials } from "../../lib/utils";

function TierBadge({ tier }) {
  const value = TIERS[tier] ?? TIERS.NAYA_SHAYAR;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-gradient-to-r px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em]",
        value.className,
      )}
    >
      {value.label}
    </span>
  );
}

function MoodBadge({ mood }) {
  const item = MOODS[mood] ?? MOODS.umeed;
  return (
    <span className={cn("mahfil-pill border", item.bg, item.border, item.color)}>
      {item.label}
    </span>
  );
}

function CommentComposer({ postId, onAdd }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitComment(event) {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api("addComment", {
        method: "POST",
        body: JSON.stringify({ postId, body: value.trim() }),
      });
      onAdd(response.comment, response.commentsCount);
      setValue("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submitComment} className="mt-4 flex flex-col gap-3">
      <textarea
        rows={2}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="surface-input resize-none"
        placeholder="Apni baat bhi keh dijiye..."
      />
      <button
        disabled={loading}
        className="self-end rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white"
      >
        {loading ? "..." : "Bhejein"}
      </button>
    </form>
  );
}

export function PostCard({ post, onUpdate }) {
  const { user } = useAuth();
  const [showHindi, setShowHindi] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);

  const author = post.author ?? {};
  const initialComments = useMemo(() => post.comments_preview ?? [], [post.comments_preview]);
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments, post.id]);

  async function toggleLike() {
    if (!user || pendingLike) {
      return;
    }

    setPendingLike(true);
    try {
      const response = await api("toggleLike", {
        method: "POST",
        body: JSON.stringify({ postId: post.id }),
      });
      onUpdate?.({
        ...post,
        likes_count: response.likesCount,
        liked_by_me: response.liked,
      });
    } finally {
      setPendingLike(false);
    }
  }

  return (
    <article className="mahfil-card overflow-hidden">
      {post.is_spotlight ? (
        <div className="flex items-center gap-3 border-b border-surface-border bg-primary/10 px-5 py-3 text-xs uppercase tracking-[0.24em] text-primary">
          <span className="material-symbols-outlined text-base">stars</span>
          <span>Weekly Spotlight</span>
        </div>
      ) : null}

      <div className="space-y-6 p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface-elevated text-sm font-semibold">
              {author.avatar_initials || getInitials(author.pen_name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold text-text-main">{author.pen_name}</h3>
                <TierBadge tier={author.tier} />
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-soft">
                {formatRelativeTime(post.created_at)} - {post.language}
              </p>
            </div>
          </div>
          <MoodBadge mood={post.mood_tag} />
        </header>

        <div className="verse-lead">
          <p className="whitespace-pre-line font-poetry text-[1.45rem] leading-[2.2rem] text-text-main">
            {showHindi && post.content_hindi ? post.content_hindi : post.content_roman}
          </p>
          {post.content_transliterated && showHindi ? (
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-text-soft">
              {post.content_transliterated}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-surface-border pt-5">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleLike}
              disabled={!user || pendingLike}
              className={cn(
                "flex items-center gap-2 text-sm transition",
                post.liked_by_me ? "text-danger" : "text-text-soft hover:text-danger",
              )}
            >
              <span className="material-symbols-outlined">
                {post.liked_by_me ? "favorite" : "favorite_border"}
              </span>
              <span>{formatCount(post.likes_count)}</span>
            </button>

            <button
              onClick={() => setShowComments((current) => !current)}
              className="flex items-center gap-2 text-sm text-text-soft transition hover:text-primary"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span>{formatCount(post.comments_count)}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {post.content_hindi ? (
              <button
                onClick={() => setShowHindi((current) => !current)}
                className="rounded-full border border-primary/20 bg-primary/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary"
              >
                {showHindi ? "Roman" : "Hindi"}
              </button>
            ) : null}
            <button className="rounded-full border border-surface-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-text-soft">
              {post.trending_score?.toFixed?.(1) ?? "0.0"} score
            </button>
          </div>
        </div>

        {showComments ? (
          <section className="rounded-3xl border border-surface-border bg-surface-soft/70 p-4">
            <h4 className="text-xs uppercase tracking-[0.24em] text-text-soft">Guftagu</h4>
            <div className="mt-4 space-y-4">
              {comments.length ? (
                comments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-white/4 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-text-main">
                        {comment.author?.pen_name ?? "Mehfili"}
                      </span>
                      <span className="text-xs text-text-soft">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-text-soft">{comment.body}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-soft">
                  Abhi tak koi comment nahi. Mehfil aap se shuru ho sakti hai.
                </p>
              )}
            </div>

            {user ? (
              <CommentComposer
                postId={post.id}
                onAdd={(comment, commentsCount) => {
                  setComments((current) => [comment, ...current]);
                  onUpdate?.({
                    ...post,
                    comments_count: commentsCount,
                  });
                }}
              />
            ) : null}
          </section>
        ) : null}
      </div>
    </article>
  );
}
