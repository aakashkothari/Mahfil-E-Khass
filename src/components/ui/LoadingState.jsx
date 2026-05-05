export function LoadingState({ label = "Mehfil saj rahi hai..." }) {
  return (
    <div className="mahfil-card flex items-center gap-4 px-5 py-4 text-sm text-text-soft">
      <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
      <p>{label}</p>
    </div>
  );
}
