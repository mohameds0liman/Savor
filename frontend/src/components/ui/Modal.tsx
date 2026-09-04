"use client";

import { ReactNode, useEffect } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

// Matches DESIGN.md "Elevation & Depth" / "Modal": centered, radius-lg
// (1rem), warm cream surface, backdrop dim, fade+scale-in.
function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(34,28,25,0.45)] px-4 animate-[fadeIn_200ms_ease-out]"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-linen-border bg-surface-container-lowest p-6 shadow-[0_24px_48px_-12px_rgba(34,28,25,0.25)] animate-[scaleIn_200ms_cubic-bezier(0.16,1,0.3,1)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-ink-muted hover:bg-surface-container-high"
          >
            <HiOutlineXMark className="h-5 w-5" />
          </button>
        </div>
        <div className="font-body text-on-surface-variant">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

export default Modal;
