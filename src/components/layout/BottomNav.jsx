import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../../lib/constants";

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-surface-border bg-surface/95 px-2 py-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-[11px] transition ${
                isActive ? "bg-surface-card text-primary shadow-indigo" : "text-text-soft"
              }`
            }
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
