import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PostCard } from "../components/posts/PostCard";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { useAuth } from "../contexts/AuthContext";
import { TIERS } from "../lib/constants";
import { hydratePosts } from "../lib/hydratePosts";
import { supabase } from "../lib/supabase";
import { getInitials } from "../lib/utils";

export function ProfilePage() {
  const navigate = useNavigate();
  const { penName } = useParams();
  const { user, refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    penName: "",
    bio: "",
  });

  const isOwnProfile = useMemo(() => user?.id && profile?.id === user.id, [profile?.id, user?.id]);

  useEffect(() => {
    if (!profile || !isOwnProfile) {
      setEditMode(false);
      setForm({ penName: "", bio: "" });
      return;
    }

    setForm({
      penName: profile.pen_name ?? "",
      bio: profile.bio ?? "",
    });
  }, [isOwnProfile, profile]);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      setNotice("");

      try {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("pen_name", penName)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (!active) {
          return;
        }

        setProfile(userProfile);

        if (!userProfile) {
          setPosts([]);
          setCollections([]);
          return;
        }

        const [
          { data: postRows, error: postsError },
          { data: collectionRows, error: collectionsError },
        ] = await Promise.all([
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

        if (postsError) {
          throw postsError;
        }

        if (collectionsError) {
          throw collectionsError;
        }

        const hydrated = await hydratePosts(postRows ?? [], user?.id);

        if (!active) {
          return;
        }

        setPosts(hydrated);
        setCollections(collectionRows ?? []);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setProfile(null);
        setPosts([]);
        setCollections([]);
        setError(loadError.message ?? "Profile load nahi ho paya.");
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
  }, [penName, user?.id]);

  async function toggleFollow() {
    if (!user || !profile || isOwnProfile) {
      return;
    }

    setFollowLoading(true);
    try {
      const { data: existing, error: existingError } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", profile.id)
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existing?.id) {
        const { error: deleteError } = await supabase.from("follows").delete().eq("id", existing.id);
        if (deleteError) {
          throw deleteError;
        }
      } else {
        const { error: insertError } = await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: profile.id,
        });
        if (insertError) {
          throw insertError;
        }
      }

      const { data: refreshed, error: refreshedError } = await supabase
        .from("users")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();

      if (refreshedError) {
        throw refreshedError;
      }

      setProfile(refreshed);
    } catch (followError) {
      setError(followError.message ?? "Follow update nahi ho paya.");
    } finally {
      setFollowLoading(false);
    }
  }

  function resetEditForm() {
    setForm({
      penName: profile?.pen_name ?? "",
      bio: profile?.bio ?? "",
    });
    setEditMode(false);
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    if (!user || !profile || !isOwnProfile) {
      return;
    }

    const nextPenName = form.penName.trim();
    const nextBio = form.bio.trim();

    if (!nextPenName) {
      setError("Pen name zaroori hai.");
      return;
    }

    setSaveLoading(true);
    setError("");
    setNotice("");

    try {
      const avatarInitials = getInitials(nextPenName) || "MH";
      const { data: updatedProfile, error: updateError } = await supabase
        .from("users")
        .update({
          pen_name: nextPenName,
          bio: nextBio,
          avatar_initials: avatarInitials,
        })
        .eq("id", user.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(updatedProfile);
      setPosts((current) =>
        current.map((post) => ({
          ...post,
          author: post.author
            ? {
                ...post.author,
                pen_name: updatedProfile.pen_name,
                avatar_initials: updatedProfile.avatar_initials,
                bio: updatedProfile.bio,
              }
            : post.author,
        })),
      );
      setForm({
        penName: updatedProfile.pen_name ?? "",
        bio: updatedProfile.bio ?? "",
      });
      setEditMode(false);
      setNotice("Profile update ho gaya.");
      await refreshProfile().catch(() => null);

      if (penName !== updatedProfile.pen_name) {
        navigate(`/u/${updatedProfile.pen_name}`, { replace: true });
      }
    } catch (saveError) {
      if (saveError.code === "23505") {
        setError("Yeh pen name pehle se liya ja chuka hai.");
      } else {
        setError(saveError.message ?? "Profile update nahi ho paya.");
      }
    } finally {
      setSaveLoading(false);
    }
  }

  if (loading) {
    return <LoadingState label="Shayar ki mehfil saj rahi hai..." />;
  }

  if (!profile) {
    return (
      <EmptyState
        title={error ? "Profile load nahi hua" : "Yeh shayar nahi mila"}
        description={error || "Pen name dobara check kijiye ya feed se kisi aur mehfil tak jaiye."}
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
          {isOwnProfile && editMode ? (
            <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-soft">
                  Pen Name
                </span>
                <input
                  required
                  maxLength={40}
                  className="surface-input"
                  value={form.penName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, penName: event.target.value }))
                  }
                  placeholder="Aapka pen name"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-text-soft">
                  Bio
                </span>
                <textarea
                  rows={4}
                  maxLength={240}
                  className="surface-input resize-none"
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bio: event.target.value }))
                  }
                  placeholder="Apni awaaz, andaaz, ya mehfil ke baare mein likhiye..."
                />
              </label>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={saveLoading}>
                  {saveLoading ? "Save ho raha hai..." : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={resetEditForm}
                  disabled={saveLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="mt-5 text-center">
              <h1 className="font-poetry text-3xl">{profile.pen_name}</h1>
              <p className="mt-2 text-sm leading-7 text-text-soft">
                {profile.bio || "Abhi bio khamosh hai, lekin sher bolte hain."}
              </p>
            </div>
          )}
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
          ) : !editMode ? (
            <Button className="mt-6 w-full" variant="secondary" onClick={() => setEditMode(true)}>
              Edit Profile
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
        {error ? (
          <div className="rounded-3xl border border-danger/20 bg-danger/10 px-5 py-4 text-sm text-danger">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-3xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm text-primary">
            {notice}
          </div>
        ) : null}

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
