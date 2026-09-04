"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { HiOutlineBookmark, HiOutlineAcademicCap, HiOutlineHeart } from "react-icons/hi2";

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

// Matches image-login.png reference: split-screen layout with left editorial hero card
// and right warm clean form panel.
export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left decorative split panel (desktop) */}
      <div className="hidden flex-1 flex-col justify-between border-r border-linen-border bg-surface-container-low p-12 lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Savor"
            width={56}
            height={25}
            className="h-11 w-auto shrink-0 object-contain"
          />
          <span className="font-display text-2xl font-bold text-ink">Savor</span>
        </Link>

        <div className="my-auto max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 font-body text-xs font-semibold uppercase tracking-wider text-on-secondary-container">
            Culinary Community
          </span>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink">
            A space for home cooks who appreciate the details.
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-ink-muted">
            Save seasonal recipes, share family classics, and build your digital kitchen notebook.
          </p>

          <div className="mt-8 flex flex-col gap-4">
            <FeatureRow
              icon={<HiOutlineBookmark />}
              title="Personal Recipe Box"
              desc="Keep all your favourite meals organized in one place."
            />
            <FeatureRow
              icon={<HiOutlineAcademicCap />}
              title="Tested Instructions"
              desc="Step-by-step guidance designed for stress-free cooking."
            />
            <FeatureRow
              icon={<HiOutlineHeart />}
              title="Share With Friends"
              desc="Publish your own culinary creations for the community."
            />
          </div>
        </div>

        <p className="font-body text-xs text-ink-muted">
          © {new Date().getFullYear()} Savor. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-between p-6 sm:p-12">
        <div className="lg:hidden">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Savor"
              width={48}
              height={21}
              className="h-9 w-auto shrink-0 object-contain"
            />
            <span className="font-display text-2xl font-bold text-ink">Savor</span>
          </Link>
        </div>

        <div className="mx-auto my-auto w-full max-w-md py-8">
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
          <p className="mt-2 font-body text-sm text-ink-muted">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        <div className="text-center font-body text-xs text-ink-muted lg:hidden">
          © {new Date().getFullYear()} Savor. All rights reserved.
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
        {icon}
      </div>
      <div>
        <h4 className="font-body text-sm font-semibold text-ink">{title}</h4>
        <p className="font-body text-xs text-ink-muted">{desc}</p>
      </div>
    </div>
  );
}
