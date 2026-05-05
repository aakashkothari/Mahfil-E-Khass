import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { TIERS } from "../lib/constants";
import { getInitials } from "../lib/utils";

export function ProfilePage() {
  const { penName } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = useMemo(() => user?.id && profile?.id === user.id, [profile?.id, user?.id]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const { data: userProfile } = await supabase
        .from("users")
        .select("*")
        .eq("pen_name", penName)
        .maybeSingle();

      if (!active) {
        return;
      }

      setProfile(userProfile);

      if (!userProfile) {
        setPosts([]);
        setCollections([]);
        setLoading(false);
        return;
      }

      const [{ data: postRows }, { data: collectionRows }] = await Promise.all([
        supabase
          .from("posts")
          .select("*, author:users!posts_author_id_fkey(*)")
          .eq("author_id", userProfile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("collections")
          .select("*")
          .eq("owner_id", userProfile.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!active) {
        return;
      }

      setPosts(postRows ?? []);
      setCollections(collectionRows ?? []);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [penName]);

  async function toggleFollow() {
    if (!user || !profile || isOwnProfile) {
      return;
    }

    setFollowLoading(true);
    try {
      const { data: existing } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("follows").delete().eq("id", existing.id);
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: profile.id,
        });
      }

      const { data: refreshed } = await supabase
        .from("users")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
      setProfile(refreshed);
    } finally {
      setFollowLoading(false);
    }
  }

  if (loading) {
    return <LoadingState label="Shayar ki mehfil saj rahi hai..." />;
  }

  if (!profile) {
    return (
      <EmptyState
        title="Yeh shayar nahi mila"
        description="Pen name dobara check kijiye ya feed se kisi aur mehfil tak jaiye."
      />
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
      <aside className="space-y-6">
        <section className="mahfil-card px-6 py-6">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-deep text-3xl font-bold text-white shadow-indigo">
            {profile.avatar_initials || getInitials(profile.pen_name)}
          </div>
          <div className="mt-5 text-center">
            <h1 className="font-poetry text-3xl">{profile.pen_name}</h1>
            <p className="mt-2 text-sm leading-7 text-text-soft">
              {profile.bio || "Abhi bio khamosh hai, lekin sher bolte hain."}
            </p>
          </div>
          <div
            className={`mx-auto mt-5 inline-flex rounded-full bg-gradient-to-r px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] ${
              (TIERS[profile.tier] ?? TIERS.NAYA_SHAYAR).className
            }`}
          >
            {(TIERS[profile.tier] ?? TIERS.NAYA_SHAYAR).label}
          </div>
          <div className="mt-6 grid grid-cols-3 rounded-3xl border border-surface-border bg-surface-soft/70 py-4 text-center">
            <div>
              <p className="text-lg font-semibold text-text-main">{posts.length}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-soft">Verses</p>
            </div>
            <div className="border-x border-surface-border">
              <p className="text-lg font-semibold text-text-main">{profile.stars_total ?? 0}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-soft">Stars</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-text-main">{profile.followers_count ?? 0}</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-text-soft">Sama'in</p>
            </div>
          </div>
          {!isOwnProfile ? (
            <Button className="mt-6 w-full" onClick={toggleFollow} disabled={followLoading}>
              {followLoading ? "..." : "Follow"}
            </Button>
          ) : null}
        </section>

        <section className="mahfil-card px-6 py-6">
          <p className="text-xs uppercase tracking-[0.24em] text-text-soft">Diwan</p>
          <div className="mt-4 space-y-3">
            {collections.length ? (
              collections.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/diwan/${collection.id}`}
                  className="block rounded-2xl border border-surface-border bg-surface-soft/60 px-4 py-4"
                >
                  <p className="font-semibold text-text-main">{collection.title}</p>
                  <p className="mt-1 text-sm text-text-soft">
                    {collection.description || "Apni pasandeeda awaazon ka ek chhota diwan."}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-text-soft">Abhi koi collection nahi bani.</p>
            )}
          </div>
        </section>
      </aside>

      <section className="space-y-6">
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onUpdate={(updated) =>
                setPosts((current) =>
                  current.map((entry) => (entry.id === updated.id ? updated : entry)),
                )
              }
            />
          ))
        ) : (
          <EmptyState
            title="Abhi tak koi sher nahi"
            description="Jab pehla sher aayega, yahin se mehfil roshan hogi."
          />
        )}
      </section>
    </div>
  );
}
