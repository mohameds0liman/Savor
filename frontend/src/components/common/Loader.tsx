type LoaderProps = {
  label?: string;
  className?: string;
};

// Matches DESIGN.md: inline centered terracotta spinner + optional label.
function Loader({ label = "Loading…", className = "" }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}>
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container/30 border-t-primary"
        aria-hidden="true"
      />
      {label && <p className="font-body text-sm text-ink-muted">{label}</p>}
    </div>
  );
}

export default Loader;
