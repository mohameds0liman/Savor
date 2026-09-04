"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { HiBars3, HiXMark } from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/ui/Avatar";

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useIsMounted();

  const navLinkStyle = (href: string) => {
    const isSelected = pathname === href;
    return `
      font-body text-sm font-semibold transition-colors duration-200
      ${isSelected ? "text-primary" : "text-ink-muted hover:text-ink"}
    `;
  };

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
  }

  // Secondary UX nicety: prevents a render flash before useRequireAuth (M5)
  // redirects on the target page itself. This click-guard alone is NOT
  // sufficient route protection (direct URL entry bypasses it) — see M5.
  const PROTECTED_ROUTES = ["/favourites", "/my-recipes", "/create-recipe", "/profile"];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (PROTECTED_ROUTES.includes(href) && !isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
    setMobileOpen(false);
  };

  const links = [
    { href: "/", label: "Home" },
    { href: "/favourites", label: "Favourites" },
    { href: "/my-recipes", label: "My Recipes" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="glass-linen fixed top-0 left-0 right-0 z-50 border-b border-linen-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3.5 sm:px-10">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Savor"
            width={52}
            height={23}
            className="h-9 w-auto shrink-0 object-contain sm:h-10"
          />
          <div className="leading-tight">
            <p className="font-display text-xl font-bold text-ink sm:text-2xl">Savor</p>
            <p className="hidden text-[0.68rem] font-semibold uppercase tracking-wider text-ink-muted sm:block">
              Handcrafted Recipes
            </p>
          </div>
        </Link>

        {/* Center nav (desktop) */}
        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={navLinkStyle(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: auth area (desktop) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href={mounted && isAuthenticated ? "/create-recipe" : "/login"}>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-on-primary transition-colors hover:bg-[#8f2a0d]">
              + Create Recipe
            </span>
          </Link>

          {mounted && isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-container-high"
              >
                <Avatar name={user.name} size={32} className="text-sm" />
                <span className="text-left">
                  <span className="block font-body text-sm font-semibold text-ink">
                    {user.name}
                  </span>
                  <span className="block text-xs text-ink-muted">Account</span>
                </span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-linen-border bg-surface-container-lowest py-1 shadow-[var(--shadow-card-hover)]">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2 font-body text-sm text-ink transition-colors hover:bg-surface-container-high"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left font-body text-sm text-ink transition-colors hover:bg-surface-container-high"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border-[1.5px] border-ink px-4 py-2 font-body text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-linen"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg p-2 text-ink lg:hidden"
        >
          {mobileOpen ? <HiXMark className="h-6 w-6" /> : <HiBars3 className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-linen-border bg-surface-container-lowest px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={navLinkStyle(link.href)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={mounted && isAuthenticated ? "/create-recipe" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-body text-sm font-semibold text-on-primary"
            >
              + Create Recipe
            </Link>
            {mounted && isAuthenticated && user ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm font-semibold text-ink-muted hover:text-ink"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left font-body text-sm font-semibold text-ink-muted hover:text-ink"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="font-body text-sm font-semibold text-ink-muted hover:text-ink"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
