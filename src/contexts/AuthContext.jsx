import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { setCurrentAuthSession } from "../lib/authSession";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

function fallbackPenName(user) {
  return (
    user?.user_metadata?.pen_name?.trim() ||
    user?.email?.split("@")[0] ||
    "Mehfili"
  );
}

function fallbackProfile(user) {
  if (!user) {
    return null;
  }

  const penName = fallbackPenName(user);
  const avatarInitials = penName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "MH";

  return {
    id: user.id,
    pen_name: penName,
    email: user.email ?? "",
    avatar_initials: avatarInitials,
    bio: "",
    stars_total: 0,
    tier: "NAYA_SHAYAR",
    followers_count: 0,
    following_count: 0,
  };
}

async function loadProfile(userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncSession = (nextSession) => {
      setCurrentAuthSession(nextSession);

      if (!mounted) {
        return;
      }

      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
      }
      setLoading(false);
    };

    supabase.auth
      .getSession()
      .then(({ data: { session: activeSession } }) => {
        syncSession(activeSession);
      })
      .catch(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      syncSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function syncProfile() {
      if (!session?.user) {
        if (mounted) {
          setProfile(null);
        }
        return;
      }

      try {
        const userProfile = await loadProfile(session.user.id);
        if (mounted) {
          setProfile(userProfile ?? fallbackProfile(session.user));
        }
      } catch {
        if (mounted) {
          setProfile(fallbackProfile(session.user));
        }
      }
    }

    syncProfile();

    return () => {
      mounted = false;
    };
  }, [session?.user?.id]);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
        return data;
      },
      async signUp({ email, password, penName }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { pen_name: penName },
          },
        });

        if (error) {
          throw error;
        }
        return data;
      },
      async signOut() {
        setLoading(true);

        const { error } = await supabase.auth.signOut();
        if (error) {
          const { error: localError } = await supabase.auth.signOut({ scope: "local" });
          if (localError) {
            setLoading(false);
            throw error;
          }
        }

        setCurrentAuthSession(null);
        setSession(null);
        setProfile(null);
        setLoading(false);
      },
      async refreshProfile() {
        if (!session?.user?.id) {
          return null;
        }

        const userProfile = await loadProfile(session.user.id);
        setProfile(userProfile);
        return userProfile;
      },
    }),
    [loading, profile, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
