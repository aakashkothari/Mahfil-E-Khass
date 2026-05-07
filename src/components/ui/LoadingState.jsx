import { useEffect, useMemo, useState } from "react";
import { LOADER_SHAYARIS } from "../../lib/loaderShayaris";

function randomIndex(except = -1) {
  if (LOADER_SHAYARIS.length <= 1) {
    return 0;
  }

  let next = except;
  while (next === except) {
    next = Math.floor(Math.random() * LOADER_SHAYARIS.length);
  }
  return next;
}

export function LoadingState({ label = "Mehfil saj rahi hai...", compact = false }) {
  const [shayariIndex, setShayariIndex] = useState(() => randomIndex());
  const shayari = useMemo(() => LOADER_SHAYARIS[shayariIndex], [shayariIndex]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setShayariIndex((current) => randomIndex(current));
    }, 3200);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div
      className={`mahfil-card overflow-hidden ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <div className={`flex items-start gap-4 ${compact ? "text-xs" : "text-sm"} text-text-soft`}>
        <div className="relative mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/12 text-primary">
          <span className="material-symbols-outlined loader-glow text-base">auto_awesome</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-primary/90">{label}</p>
          <p className={`mt-2 font-poetry text-text-main ${compact ? "text-lg leading-7" : "text-xl leading-8"}`}>
            {shayari.roman}
          </p>
          <p className={`mt-1 text-text-soft/80 ${compact ? "text-xs leading-6" : "text-sm leading-7"}`}>
            {shayari.hindi}
          </p>
        </div>
      </div>
    </div>
  );
}
