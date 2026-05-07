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

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src="/diya.png" alt="Mahfil" className="h-8 w-8 object-contain" />
          <span className="font-poetry text-2xl text-text-main">
            mah<span className="text-primary">fil *</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
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
                onClick={() => {
                  if (profilePenName) {
                    navigate(`/u/${profilePenName}`);
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-surface-border bg-surface-elevated text-sm font-semibold text-text-main"
              >
                {profileInitials}
              </button>
              <Button variant="secondary" size="sm" onClick={() => signOut()}>
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
