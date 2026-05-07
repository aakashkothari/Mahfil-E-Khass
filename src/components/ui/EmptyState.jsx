export function EmptyState({ title, description }) {
  return (
    <div className="mahfil-card px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-surface-border bg-surface-soft text-primary">
        <span className="material-symbols-outlined">auto_stories</span>
      </div>
      <h3 className="font-poetry text-2xl text-text-main">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-text-soft">
        {description}
      </p>
    </div>
  );
}
