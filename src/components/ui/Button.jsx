import { cn } from "../../lib/utils";

export function Button({
  as: Component = "button",
  className,
  variant = "primary",
  size = "md",
  ...props
}) {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary/90 active:scale-[0.98] shadow-indigo",
    secondary:
      "border border-surface-border bg-surface-elevated text-text-main hover:border-primary/40 hover:text-white",
    ghost: "text-text-soft hover:bg-white/5 hover:text-white",
    gold: "bg-gold text-slate-950 hover:bg-gold-soft active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
