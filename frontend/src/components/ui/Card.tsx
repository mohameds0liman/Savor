import { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

// Generic content panel per DESIGN.md "Elevation & Depth" §Cards & Tiles:
// pure white surface, warm hairline border, ambient diffused shadow.
function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-linen-border bg-surface-container-lowest shadow-[var(--shadow-card)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
