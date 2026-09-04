"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

// Matches DESIGN.md "Form Controls": white surface, warm oat-linen border,
// terracotta focus ring, 0.5rem radius.
const FIELD_CLASSES =
  "w-full rounded-lg border border-linen-border bg-surface-container-lowest px-4 py-2.5 text-ink font-body placeholder:text-ink-muted/70 outline-none transition-colors focus:border-primary focus:ring-3 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed";

const ERROR_CLASSES = "border-error focus:border-error focus:ring-error/20";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={`${FIELD_CLASSES} ${error ? ERROR_CLASSES : ""} ${className}`}
          {...rest}
        />
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, id, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`${FIELD_CLASSES} ${error ? ERROR_CLASSES : ""} ${className}`}
          {...rest}
        />
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  helperText?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, id, className = "", children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`${FIELD_CLASSES} ${error ? ERROR_CLASSES : ""} ${className}`}
          {...rest}
        >
          {children}
        </select>
        {error ? (
          <p className="text-sm text-error">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-ink-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Select.displayName = "Select";

export default Input;
