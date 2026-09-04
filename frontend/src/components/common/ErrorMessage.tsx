type ErrorMessageProps = {
  message: string;
  className?: string;
};

// Matches DESIGN.md validation styling: coral-red stroke banner.
function ErrorMessage({ message, className = "" }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`rounded-lg border border-error/30 bg-error-container/60 px-4 py-3 font-body text-sm text-on-error-container ${className}`}
    >
      {message}
    </div>
  );
}

export default ErrorMessage;
