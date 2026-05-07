import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { hydratePosts } from "../lib/hydratePosts";
import { supabase } from "../lib/supabase";

export function CollectionPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [collection, setCollection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const { data: collectionRow, error: collectionError } = await supabase
          .from("collections")
          .select("*, owner:users!collections_owner_id_fkey(*)")
          .eq("id", id)
          .maybeSingle();

        if (collectionError) {
          throw collectionError;
        }

        if (!active) {
          return;
        }

        setCollection(collectionRow);

        if (!collectionRow) {
          setPosts([]);
          return;
        }

        const { data: collectionPosts, error: collectionPostsError } = await supabase
          .from("collection_posts")
          .select("post_id")
          .eq("collection_id", id);

        if (collectionPostsError) {
          throw collectionPostsError;
        }

        const ids = (collectionPosts ?? []).map((entry) => entry.post_id);
        if (!ids.length) {
          setPosts([]);
          return;
        }

        const { data: postRows, error: postsError } = await supabase
          .from("posts")
          .select("*, author:users!posts_author_id_fkey(*)")
          .in("id", ids)
          .order("created_at", { ascending: false });

        if (postsError) {
          throw postsError;
        }

        const hydrated = await hydratePosts(postRows ?? [], user?.id);

        if (!active) {
          return;
        }

        setPosts(hydrated);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setCollection(null);
        setPosts([]);
        setError(loadError.message ?? "Diwan load nahi ho paya.");
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
  }, [id, user?.id]);

  if (loading) {
    return <LoadingState label="Diwan ke panne khul rahe hain..." />;
  }

  if (!collection) {
    return (
      <EmptyState
        title={error ? "Diwan load nahi hua" : "Yeh diwan nahi mila"}
        description={error || "Shayad link purana hai, ya abhi collection saj rahi hai."}
      />
    );
  }

  return (
    <div className="mx-auto max-w-poetry space-y-8">
      <section className="mahfil-card px-6 py-6">
        <p className="mahfil-pill border-gold/25 bg-gold/10 text-gold">Diwan</p>
        <h1 className="mt-4 font-poetry text-4xl">{collection.title}</h1>
        <p className="mt-3 text-sm leading-7 text-text-soft">
          {collection.description || "Pasandeeda awaazon aur yaadon ka majmua."}
        </p>
        <p className="mt-4 text-xs uppercase tracking-[0.22em] text-text-soft">
          Curated by {collection.owner?.pen_name ?? "Mehfil"}
        </p>
      </section>

      {error ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {posts.length ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={(updated) =>
                setPosts((current) =>
                  current.map((entry) => (entry.id === updated.id ? updated : entry)),
                )
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Diwan abhi khaali hai"
          description="Is collection mein abhi tak koi post add nahi hui."
        />
      )}
    </div>
  );
}
