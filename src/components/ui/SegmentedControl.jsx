import { cn } from "../../lib/utils";

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-surface-border bg-surface-soft p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] transition",
              active
                ? "border border-primary/10 bg-surface-card text-primary shadow-indigo"
                : "text-text-soft hover:text-primary",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
