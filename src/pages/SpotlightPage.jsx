import { useEffect, useState } from "react";
import { PostCard } from "../components/posts/PostCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../lib/api";
import { hydratePosts } from "../lib/hydratePosts";
import { supabase } from "../lib/supabase";

export function SpotlightPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const { data, error: postsError } = await supabase
          .from("posts")
          .select("*, author:users!posts_author_id_fkey(*)")
          .eq("is_spotlight", true)
          .order("created_at", { ascending: false })
          .limit(10);

        if (postsError) {
          throw postsError;
        }

        const hydrated = await hydratePosts(data ?? [], user?.id);

        if (!active) {
          return;
        }

        setPosts(hydrated);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setPosts([]);
        setError(loadError.message ?? "Spotlight load nahi hui.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user?.id]);

  async function fetchNote(post) {
    if (notes[post.id]) {
      return;
    }

    try {
      const response = await api("ai-weekly-spotlight", {
        method: "POST",
        body: JSON.stringify({ text: post.content_roman }),
      });

      setNotes((current) => ({ ...current, [post.id]: response.note }));
    } catch (noteError) {
      setError(noteError.message ?? "AI daad abhi nahi mil payi.");
    }
  }

  return (
    <div className="mx-auto max-w-poetry space-y-8">
      <section className="mahfil-card px-6 py-6">
        <p className="mahfil-pill border-primary/20 bg-primary/10 text-primary">Weekly Spotlight</p>
        <h1 className="mt-4 font-poetry text-4xl">Jo alfaaz iss hafte sabse zyada chamke.</h1>
        <p className="mt-3 text-sm leading-7 text-text-soft">
          Spotlight posts ko extra stars milte hain, aur unke saath ek chhoti si AI daad bhi.
        </p>
      </section>

      {loading ? <LoadingState label="Spotlight jal rahi hai..." /> : null}

      {!loading && !posts.length ? (
        <EmptyState
          title={error ? "Spotlight load nahi hui" : "Is hafte abhi spotlight tay nahi hui"}
          description={error || "Scheduled curation chalegi, phir yahan se nayi roshni dikhegi."}
        />
      ) : null}

      {error && posts.length ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="space-y-3">
            <PostCard
              post={post}
              onUpdate={(updated) =>
                setPosts((current) =>
                  current.map((entry) => (entry.id === updated.id ? updated : entry)),
                )
              }
            />
            <div className="mahfil-card bg-primary/8 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-primary">AI Daad</p>
                  <p className="mt-2 font-poetry text-xl leading-8 text-text-main">
                    {notes[post.id] ?? "Is sher par ek narm si daad sunne ke liye click kijiye."}
                  </p>
                </div>
                <button
                  onClick={() => fetchNote(post)}
                  className="rounded-full border border-primary/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary"
                >
                  Daad Sunao
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
