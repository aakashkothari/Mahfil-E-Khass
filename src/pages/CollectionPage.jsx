import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { supabase } from "../lib/supabase";

export function CollectionPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const { data: collectionRow } = await supabase
        .from("collections")
        .select("*, owner:users!collections_owner_id_fkey(*)")
        .eq("id", id)
        .maybeSingle();

      if (!active) {
        return;
      }

      setCollection(collectionRow);

      if (!collectionRow) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: collectionPosts } = await supabase
        .from("collection_posts")
        .select("post_id")
        .eq("collection_id", id);

      const ids = (collectionPosts ?? []).map((entry) => entry.post_id);
      if (!ids.length) {
        setPosts([]);
        setLoading(false);
        return;
      }

      const { data: postRows } = await supabase
        .from("posts")
        .select("*, author:users!posts_author_id_fkey(*)")
        .in("id", ids)
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      setPosts(postRows ?? []);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <LoadingState label="Diwan ke panne khul rahe hain..." />;
  }

  if (!collection) {
    return (
      <EmptyState
        title="Yeh diwan nahi mila"
        description="Shayad link purana hai, ya abhi collection saj rahi hai."
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

      {posts.length ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
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
