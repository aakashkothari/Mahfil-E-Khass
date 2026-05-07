import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { NAV_ITEMS } from "../../lib/constants";
import { getInitials } from "../../lib/utils";
import { Button } from "../ui/Button";

export function Header() {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const profilePenName =
    profile?.pen_name || user?.user_metadata?.pen_name || user?.email?.split("@")[0] || "";
  const profileInitials =
    profile?.avatar_initials || getInitials(profilePenName || user?.email || "Mehfil");

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/92 backdrop-blur-md">
      <div className="mx-auto flex h-[4.5rem] max-w-shell items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/diya.png" alt="Mahfil" className="h-8 w-8 object-contain opacity-90" />
          <span className="font-sans text-[1.8rem] font-medium tracking-[-0.03em] text-text-main">
            mah<span className="text-primary">fil</span>{" "}
            <span className="text-primary text-[1.45rem] align-middle">*</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "text-primary" : "text-text-soft hover:text-text-main"
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to={user && profilePenName ? `/u/${profilePenName}` : "/auth"}
            className={({ isActive }) =>
              isActive ? "text-primary" : "text-text-soft hover:text-text-main"
            }
          >
            Profile
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (profilePenName) {
                    navigate(`/u/${profilePenName}`);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-card text-sm font-semibold text-text-main shadow-indigo"
              >
                {profileInitials}
              </button>
              <Button type="button" variant="secondary" size="sm" onClick={handleSignOut}>
                Nikalna
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/auth")}>
              Mehfil Join Karein
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
