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
      "border border-primary bg-primary text-white hover:bg-primary-deep hover:border-primary-deep active:scale-[0.98] shadow-indigo",
    secondary:
      "border border-surface-border bg-transparent text-primary hover:border-primary/40 hover:bg-primary/5",
    ghost: "text-text-soft hover:bg-primary/5 hover:text-primary",
    gold:
      "border border-white/50 bg-gradient-to-r from-gold to-gold-soft text-slate-950 hover:from-gold-soft hover:to-gold active:scale-[0.98]",
  };

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  return (
    <Component
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded font-semibold transition duration-200",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
