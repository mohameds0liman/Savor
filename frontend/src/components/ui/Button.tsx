"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
};

// Matches DESIGN.md "Buttons" section: terracotta primary, ink outline
// secondary, muted ghost, error-toned danger, circular icon button.
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-[#8f2a0d] active:bg-[#7a2409] rounded-lg px-5 py-2.5 shadow-[0_1px_2px_rgba(34,28,25,0.08)]",
  secondary:
    "bg-surface-container-lowest text-ink border-[1.5px] border-ink hover:bg-ink hover:text-linen rounded-lg px-5 py-2.5",
  ghost: "text-ink-muted hover:bg-[rgba(34,28,25,0.05)] hover:text-ink rounded-lg px-4 py-2",
  danger: "bg-error text-on-error hover:bg-[#93000a] rounded-lg px-5 py-2.5",
  icon: "rounded-full p-2.5 text-ink-muted hover:bg-surface-container-high hover:text-ink",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", isLoading = false, disabled, className = "", children, ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center gap-2 font-body
          text-[0.9375rem] font-semibold
          transition-all duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25
          disabled:opacity-50 disabled:cursor-not-allowed
          ${VARIANT_CLASSES[variant]}
          ${className}
        `}
        {...rest}
      >
        {isLoading && (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
