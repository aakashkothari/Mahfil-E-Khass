import { cn } from "../../lib/utils";

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-full border border-surface-border bg-surface-soft/70 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
              active ? "bg-primary text-white" : "text-text-soft hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
